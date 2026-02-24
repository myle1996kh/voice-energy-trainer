-- Set default metric setup: Energy 50% + Fluency 50% (Deepgram), customization enabled

UPDATE public.metric_settings
SET
  weight = CASE
    WHEN metric_id = 'volume' THEN 50
    WHEN metric_id = 'speechRate' THEN 50
    ELSE 0
  END,
  method = CASE
    WHEN metric_id = 'speechRate' THEN 'deepgram-stt'
    ELSE method
  END,
  updated_at = now();

INSERT INTO public.app_settings (key, value)
VALUES ('allow_user_metrics_customization', 'true'::jsonb)
ON CONFLICT (key)
DO UPDATE SET value = EXCLUDED.value;
