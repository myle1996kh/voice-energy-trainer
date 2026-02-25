import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Save, ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { MetricSettingsCard, MetricSetting } from '@/components/MetricSettingsCard';
import { CalibrationWizard } from '@/components/CalibrationWizard';
import { CalibrationTest } from '@/components/CalibrationTest';
import { rebalanceWeights } from '@/lib/metricsUtils';
import { useAuth } from '@/hooks/useAuth';
import { useDisplayName } from '@/hooks/useDisplayName';
import { trackEvent } from '@/lib/analytics';

const METRIC_LABELS: Record<string, { name: string; description: string; unit: string; color: string; category: 'audio' | 'video' }> = {
  // Audio metrics
  volume: { name: 'Energy (Volume)', description: 'Average loudness in dB', unit: 'dB', color: 'bg-blue-500', category: 'audio' },
  speechRate: { name: 'Fluency (Speech Rate)', description: 'Speed in words per minute', unit: 'WPM', color: 'bg-green-500', category: 'audio' },
  acceleration: { name: 'Tonality (Acceleration)', description: 'Variation in speed and volume', unit: 'Score', color: 'bg-purple-500', category: 'audio' },
  responseTime: { name: 'Response Time', description: 'Time to start speaking', unit: 'ms', color: 'bg-yellow-500', category: 'audio' },
  pauseManagement: { name: 'Filler Words (Pauses)', description: 'Effective use of pauses', unit: 'Ratio', color: 'bg-orange-500', category: 'audio' },
  // Video-based metrics
  eyeContact: { name: 'Eye Contact', description: 'Maintaining eye contact', unit: '%', color: 'bg-cyan-500', category: 'video' },
  handMovement: { name: 'Hand Gestures', description: 'Use of hand movements', unit: 'Score', color: 'bg-pink-500', category: 'video' },
  blinkRate: { name: 'Blink Rate', description: 'Natural blink frequency', unit: 'bpm', color: 'bg-indigo-500', category: 'video' },
};

export default function Settings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');
  const [isAllowed, setIsAllowed] = useState(false);
  const [metrics, setMetrics] = useState<MetricSetting[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { profile, updateProfile } = useAuth();
  const { displayName, setDisplayName } = useDisplayName();

  useEffect(() => {
    const current = profile?.display_name?.trim() || displayName.trim();
    setNicknameInput(current);
  }, [profile?.display_name, displayName]);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);

      // 1. Check if customization is allowed
      const { data: appSettings, error: appSettingsError } = await (supabase as any)
        .from('app_settings')
        .select('value')
        .eq('key', 'allow_user_metrics_customization')
        .single();

      const allowed = appSettings?.value === true;
      setIsAllowed(allowed);

      if (!allowed) {
        setIsLoading(false);
        return;
      }

      // 2. Fetch user's existing settings
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Error', description: 'You must be logged in.' });
        return;
      }

      const { data: userSettings, error: userSettingsError } = await (supabase as any)
        .from('user_metric_settings')
        .select('*')
        .eq('user_id', user.id);

      if (userSettingsError) throw userSettingsError;

      // 3. If user has settings, load them. Else load global defaults to start with.
      if (userSettings && userSettings.length > 0) {
        // Map to our state structure
        const mappedSettings = userSettings.map((s: any) => ({
          ...s,
          enabled: s.weight > 0 // Logic: if weight > 0, it's enabled
        }));
        setMetrics(mappedSettings);
        console.log('Loaded user custom settings:', mappedSettings);
      } else {
        // Load defaults from valid metric_settings (admin config)
        const { data: adminSettings, error: adminError } = await supabase
          .from('metric_settings')
          .select('*');

        if (adminError) throw adminError;

        if (adminSettings) {
          const defaults = adminSettings.map((s: any) => ({
            ...s,
            id: '', // New rows will be created
            metric_id: s.metric_id, // Ensure metric_id is preserved
            enabled: s.weight > 0
          }));
          setMetrics(defaults);
          console.log('Loaded admin settings as defaults:', defaults);
        }
      }

    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast({
        variant: 'destructive',
        title: 'Error loading settings',
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleWeightChange = (index: number, newWeight: number) => {
    const updated = [...metrics];
    updated[index].weight = newWeight;
    setMetrics(updated);
    setHasChanges(true);
  };

  const toggleMetric = (index: number, enabled: boolean) => {
    const updated = [...metrics];
    updated[index].enabled = enabled;
    // If enabling, restore weight if it was 0, or keep 0 if it was manually set to 0?
    // Let's set a default small weight if it was 0 when enabling
    if (enabled && updated[index].weight === 0) {
      updated[index].weight = 10;
    }
    setMetrics(updated);
    setHasChanges(true);
  };

  const handleThresholdChange = (index: number, field: 'min' | 'ideal' | 'max', value: number) => {
    const updated = [...metrics];
    const fieldMap = {
      min: 'min_threshold',
      ideal: 'ideal_threshold',
      max: 'max_threshold'
    };
    (updated[index] as any)[fieldMap[field]] = value;
    setMetrics(updated);
    setHasChanges(true);
  };

  const handleMethodChange = (index: number, method: string) => {
    const updated = [...metrics];
    updated[index].method = method;
    setMetrics(updated);
    setHasChanges(true);
  };

  const handleRebalance = () => {
    setMetrics(prev => rebalanceWeights(prev));
    setHasChanges(true);
  };

  const handleReset = async () => {
    setIsLoading(true);
    try {
      // Fetch global defaults from metric_settings
      const { data: adminSettings, error: adminError } = await supabase
        .from('metric_settings')
        .select('*');

      if (adminError) throw adminError;

      if (adminSettings) {
        const defaults = adminSettings.map((s: any) => ({
          ...s,
          id: '',
          metric_id: s.metric_id,
          enabled: s.weight > 0
        }));
        setMetrics(defaults);
        setHasChanges(true);
        toast({ title: 'Reset', description: 'Metrics reset to system defaults. Click Save to apply.' });
      }
    } catch (error: any) {
      console.error('Error resetting:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to reset settings' });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Auto-rebalance weights to 100% before saving
      const rebalanced = rebalanceWeights(metrics);
      setMetrics(rebalanced);

      // Upsert into user_metric_settings
      const updates = rebalanced.map(m => ({
        user_id: user.id,
        metric_id: m.metric_id,
        weight: m.enabled ? m.weight : 0,
        enabled: m.enabled,
        min_threshold: m.min_threshold,
        ideal_threshold: m.ideal_threshold,
        max_threshold: m.max_threshold,
        method: m.method
      }));

      const { error } = await (supabase as any)
        .from('user_metric_settings')
        .upsert(updates, { onConflict: 'user_id,metric_id' });

      if (error) throw error;

      // Update localStorage to reflect new user settings immediately
      const localConfig = rebalanced.map(m => ({
        id: m.metric_id,
        weight: m.enabled ? m.weight : 0,
        enabled: m.enabled,
        thresholds: {
          min: m.min_threshold,
          ideal: m.ideal_threshold,
          max: m.max_threshold,
        },
        method: m.method,
      }));
      localStorage.setItem('metricConfig', JSON.stringify(localConfig));
      console.log('💾 Saved user settings to localStorage metricConfig');

      toast({ title: 'Success', description: 'Settings saved successfully.' });
      setHasChanges(false);
      // Re-fetch to get IDs
      fetchSettings();

    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        variant: 'destructive',
        title: 'Error saving settings',
        description: error.message
      });
    } finally {
      setIsSaving(false);
    }
  };

  const saveNickname = async () => {
    try {
      const trimmed = nicknameInput.trim();
      if (!trimmed) {
        toast({
          variant: 'destructive',
          title: 'Nickname required',
          description: 'Please enter a nickname.',
        });
        return;
      }

      const { error } = await updateProfile({ display_name: trimmed });
      if (error) throw error;

      setDisplayName(trimmed);
      toast({
        title: 'Nickname saved',
        description: `Updated to "${trimmed}".`,
      });
      trackEvent('nickname_saved');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to save nickname',
        description: error.message || 'Please try again.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <h1 className="text-2xl font-bold mb-2">Settings Locked</h1>
        <p className="text-muted-foreground mb-4">Metrics customization is currently managed by administrators.</p>
        <Button onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  // Calculate total weight for UI
  const enabledMetrics = metrics.filter(m => m.enabled);
  const totalWeight = enabledMetrics.reduce((sum, m) => sum + m.weight, 0);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Metrics Settings</h1>
              <p className="text-muted-foreground">Customize your personal speech scoring model.</p>
            </div>
          </div>
          {/* Top Save Action is redundant if we have bottom actions, but good for mobile? 
                Actually, let's keep the main actions near the visualization like Admin panel 
            */}
        </div>

        {/* Nickname Settings */}
        <div className="bg-card border rounded-lg p-4 space-y-3">
          <div>
            <h2 className="text-base font-semibold">Your Nickname</h2>
            <p className="text-sm text-muted-foreground">
              This name is used to label your training progress.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="nickname">Nickname</Label>
              <Input
                id="nickname"
                value={nicknameInput}
                maxLength={30}
                placeholder="Enter your nickname"
                onChange={(e) => setNicknameInput(e.target.value)}
              />
            </div>
            <Button onClick={saveNickname}>Save Nickname</Button>
          </div>
        </div>

        {/* Device Calibration */}
        <CalibrationWizard />

        {/* Test Calibration */}
        <CalibrationTest />

        {/* Weight score controls hidden by request */}
      </div>
    </div>
  );
}
