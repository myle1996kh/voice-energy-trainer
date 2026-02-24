import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AnalysisResult } from '@/lib/audioAnalysis';
import { FaceTrackingMetrics } from '@/hooks/useFaceTracking';

export interface PracticeResult {
  id: string;
  sentence_id: string | null;
  display_name: string | null;
  score: number;
  duration_seconds: number;
  energy_score: number | null;
  clarity_score: number | null;
  pace_score: number | null;
  acceleration_score: number | null;
  response_time_score: number | null;
  volume_avg: number | null;
  speech_ratio: number | null;
  response_time_ms: number | null;
  words_per_minute: number | null;
  eye_contact_score: number | null;
  hand_movement_score: number | null;
  blink_rate: number | null;
  created_at: string;
  sentence_category: string | null;
  sentence_english: string | null;
}

export interface VideoMetrics {
  eyeContactScore?: number;
  handMovementScore?: number;
  blinkRate?: number;
}

export interface PracticeStats {
  totalSessions: number;
  avgScore: number;
  bestScore: number;
  totalPracticeSeconds: number;
  firstSessionAt: string | null;
  lastSessionAt: string | null;
}

const initialStats: PracticeStats = {
  totalSessions: 0,
  avgScore: 0,
  bestScore: 0,
  totalPracticeSeconds: 0,
  firstSessionAt: null,
  lastSessionAt: null,
};

const deriveStats = (rows: PracticeResult[]): PracticeStats => {
  if (rows.length === 0) return initialStats;

  const totalSessions = rows.length;
  const totalScore = rows.reduce((sum, row) => sum + row.score, 0);
  const bestScore = rows.reduce((best, row) => Math.max(best, row.score), 0);
  const totalPracticeSeconds = rows.reduce((sum, row) => sum + Number(row.duration_seconds ?? 0), 0);

  const timestamps = rows
    .map((row) => new Date(row.created_at).getTime())
    .filter((value) => !Number.isNaN(value));

  const firstSessionAt = timestamps.length
    ? new Date(Math.min(...timestamps)).toISOString()
    : null;
  const lastSessionAt = timestamps.length
    ? new Date(Math.max(...timestamps)).toISOString()
    : null;

  return {
    totalSessions,
    avgScore: totalSessions > 0 ? Math.round(totalScore / totalSessions) : 0,
    bestScore,
    totalPracticeSeconds,
    firstSessionAt,
    lastSessionAt,
  };
};

export function usePracticeResults() {
  const [results, setResults] = useState<PracticeResult[]>([]);
  const [stats, setStats] = useState<PracticeStats>(initialStats);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveResult = useCallback(
    async (
      displayName: string | null | undefined,
      analysisResult: AnalysisResult,
      sentenceId: string | null,
      durationSeconds: number,
      videoMetrics?: VideoMetrics
    ) => {
      setError(null);

      if (!displayName?.trim()) {
        console.log('Skipping practice save because display name is empty');
        return { data: null, error: null };
      }

      const { data, error: insertError } = await supabase
        .from('practice_results')
        .insert({
          display_name: displayName.trim(),
          sentence_id: sentenceId,
          score: Math.round(analysisResult.overallScore),
          duration_seconds: durationSeconds,
          energy_score: analysisResult.volume?.score ?? null,
          clarity_score: analysisResult.speechRate?.score ?? null,
          pace_score: analysisResult.pauses?.score ?? null,
          acceleration_score: analysisResult.acceleration?.score ?? null,
          response_time_score: analysisResult.responseTime?.score ?? null,
          volume_avg: analysisResult.volume?.averageDb ?? null,
          speech_ratio: analysisResult.pauses?.pauseRatio ?? null,
          response_time_ms: analysisResult.responseTime?.responseTimeMs ?? null,
          words_per_minute: analysisResult.speechRate?.wordsPerMinute ?? null,
          eye_contact_score: videoMetrics?.eyeContactScore ?? null,
          hand_movement_score: videoMetrics?.handMovementScore ?? null,
          blink_rate: videoMetrics?.blinkRate ?? null,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Failed to save practice result:', insertError);
        setError(insertError.message);
        return { data: null, error: insertError };
      }

      return { data, error: null };
    },
    []
  );

  const fetchResults = useCallback(
    async (limit = 20) => {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('practice_results')
        .select('*, sentences(category, english)')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) {
        console.error('Failed to fetch practice results:', fetchError);
        setError(fetchError.message);
      } else {
        const mapped: PracticeResult[] = (data || []).map((row: any) => ({
          ...row,
          sentence_category: row.sentences?.category ?? null,
          sentence_english: row.sentences?.english ?? null,
          sentences: undefined,
        }));
        setResults(mapped);
        setStats(deriveStats(mapped));
      }

      setIsLoading(false);
      return { data, error: fetchError };
    },
    []
  );

  return {
    results,
    stats,
    isLoading,
    error,
    saveResult,
    fetchResults,
  };
}
