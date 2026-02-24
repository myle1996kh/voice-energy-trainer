-- Reset Voice Energy Trainer schema so the client can run without auth-based tables
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.get_user_practice_stats(uuid);
DROP FUNCTION IF EXISTS public.get_all_learner_stats();

DROP TABLE IF EXISTS public.user_metric_settings CASCADE;
DROP TABLE IF EXISTS public.app_settings CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.practice_results CASCADE;
DROP TABLE IF EXISTS public.metric_settings CASCADE;
DROP TABLE IF EXISTS public.display_settings CASCADE;
DROP TABLE IF EXISTS public.sentences CASCADE;

DROP TYPE IF EXISTS public.app_role;

CREATE TABLE public.sentences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vietnamese text NOT NULL,
  english text NOT NULL,
  category text NOT NULL CHECK (category IN ('greeting','daily','business','expression','question')),
  difficulty integer DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.sentences (vietnamese, english, category, difficulty) VALUES
  ('Tôi rất vui được gặp bạn', 'I am very happy to meet you', 'greeting', 1),
  ('Chào buổi sáng! Hôm nay bạn thế nào?', 'Good morning! How are you today?', 'greeting', 1),
  ('Cảm ơn bạn rất nhiều', 'Thank you very much', 'greeting', 1),
  ('Hôm nay là một ngày tuyệt vời', 'Today is a wonderful day', 'daily', 1),
  ('Tôi đang học tiếng Anh mỗi ngày', 'I am learning English every day', 'daily', 2),
  ('Thời tiết hôm nay rất đẹp', 'The weather is beautiful today', 'daily', 1),
  ('Tôi thích uống cà phê vào buổi sáng', 'I like drinking coffee in the morning', 'daily', 2),
  ('Tôi có thể giúp gì cho bạn?', 'How can I help you?', 'business', 2),
  ('Chúng tôi sẽ liên hệ lại với bạn sớm', 'We will contact you soon', 'business', 3),
  ('Xin lỗi, bạn có thể nhắc lại được không?', 'Sorry, could you repeat that please?', 'business', 2),
  ('Tôi hiểu ý bạn rồi', 'I understand what you mean', 'business', 2),
  ('Đừng lo lắng, mọi thứ sẽ ổn thôi', 'Don''t worry, everything will be fine', 'expression', 2),
  ('Tôi tin bạn có thể làm được', 'I believe you can do it', 'expression', 2),
  ('Chúng ta hãy bắt đầu ngay bây giờ', 'Let''s start right now', 'expression', 2),
  ('Đây là cơ hội tuyệt vời', 'This is a great opportunity', 'expression', 2),
  ('Bạn đến từ đâu?', 'Where are you from?', 'question', 1),
  ('Bạn làm nghề gì?', 'What do you do for a living?', 'question', 2),
  ('Bạn có thể giải thích thêm được không?', 'Could you explain more?', 'question', 2),
  ('Khi nào chúng ta gặp nhau?', 'When shall we meet?', 'question', 2),
  ('Bạn nghĩ sao về điều này?', 'What do you think about this?', 'question', 2),
  ('Tôi rất hào hứng về dự án này', 'I am very excited about this project', 'expression', 3),
  ('Hãy làm việc cùng nhau', 'Let''s work together', 'expression', 2),
  ('Tôi đồng ý với bạn hoàn toàn', 'I completely agree with you', 'expression', 2),
  ('Chúng ta có thể thảo luận về điều này', 'We can discuss this', 'business', 2),
  ('Cảm ơn vì đã lắng nghe', 'Thank you for listening', 'greeting', 1);

CREATE TABLE public.metric_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_id text NOT NULL UNIQUE,
  weight integer NOT NULL DEFAULT 20 CHECK (weight >= 0 AND weight <= 100),
  min_threshold numeric NOT NULL,
  ideal_threshold numeric NOT NULL,
  max_threshold numeric NOT NULL,
  method text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.metric_settings (metric_id, weight, min_threshold, ideal_threshold, max_threshold, method) VALUES
  ('volume', 40, -35, -15, 0, NULL),
  ('speechRate', 40, 90, 150, 220, 'energy-peaks'),
  ('acceleration', 5, 0, 50, 100, NULL),
  ('responseTime', 5, 2000, 200, 0, NULL),
  ('pauseManagement', 10, 0, 0, 2.71, NULL),
  ('eyeContact', 0, 0, 80, 100, 'percentage'),
  ('handMovement', 0, 0, 60, 100, NULL),
  ('blinkRate', 0, 10, 15, 25, 'count_per_minute');

CREATE TABLE public.display_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  quiet_threshold numeric NOT NULL DEFAULT 0.3,
  good_threshold numeric NOT NULL DEFAULT 0.6,
  powerful_threshold numeric NOT NULL DEFAULT 0.8,
  sensitivity numeric NOT NULL DEFAULT 2.5,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.display_settings (setting_key, quiet_threshold, good_threshold, powerful_threshold, sensitivity)
VALUES ('energy_display', 0.3, 0.6, 0.8, 2.5);

CREATE TABLE public.practice_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL DEFAULT gen_random_uuid(),
  display_name text,
  sentence_id uuid REFERENCES public.sentences(id) ON DELETE SET NULL,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  duration_seconds numeric NOT NULL,
  energy_score numeric,
  clarity_score numeric,
  pace_score numeric,
  acceleration_score numeric,
  response_time_score numeric,
  response_time_ms numeric,
  volume_avg numeric,
  speech_ratio numeric,
  words_per_minute numeric,
  eye_contact_score numeric,
  hand_movement_score numeric,
  blink_rate numeric,
  device_id text,
  device_label text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_practice_results_sentence ON public.practice_results(sentence_id);
CREATE INDEX IF NOT EXISTS idx_practice_results_display_name ON public.practice_results(display_name);
