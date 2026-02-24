# Voice Energy Trainer

Voice Energy Trainer is a browser-based coaching suite that helps you practice energetic speech, see live visual feedback, and track session history without forcing you through a login wall. The experience now saves results when you enter a display name, reuses the entire existing chunked audio/visual analysis stack, and relies on a fresh Supabase project for persistence.

## Features

- Tap or press Space to start/stop live voice energy recording with audio + face tracking.
- Optional display name lets you persist practice results without traditional authentication.
- Metrics settings, calibration flows, and progress charts are all open for you to tweak.
- Supabase Edge Functions (Deepgram transcription) are bundled alongside the UI and can be hosted with the project-specific `.env` file.
- Firebase Hosting is the recommended destination for deploying the static build.

## Local development

1. Clone the repo and install dependencies:

   ```bash
   git clone <YOUR_REPO_URL>
   cd voice-energy-trainer
   npm install
   ```

2. Copy the example env file and fill in the values for your Supabase + Deepgram project:

   ```bash
   cp .env.example .env
   ```

   Then enter your Supabase project URL, anon key, and Deepgram API key (see the `.env.example` for the required keys).

3. Start the dev server:

   ```bash
   npm run dev
   ```

   The app will open in your browser with instant hot reload, and you can begin practicing immediately.

## Supabase setup

Voice Energy Trainer uses Supabase for storing sentences, metric configuration, and practice history. The repository already ships with a migration that creates the required tables, seeds the sentence bank + default metrics, and simplifies the schema so `practice_results` can be inserted with just a display name.

To create the backend:

1. Install the Supabase CLI and login (`supabase login`).
2. Create a fresh Supabase project via the dashboard or CLI.
3. Update `supabase/config.toml` with the new `project_id` if you plan to deploy from this repo.
4. Push the schema + seed data:

   ```bash
   supabase db push
   ```

   This will run all migrations, including the reset migration that drops the old auth-backed tables and recreates the lightweight schema.

5. Deploy the transcription edge function:

   ```bash
   supabase functions deploy transcribe
   ```

6. Use the new project credentials when filling out `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in your `.env` file.

## Firebase hosting

The UI is built with Vite and is perfect for static hosting. To deploy to Firebase Hosting:

1. Install the Firebase CLI and log in (`firebase login`).
2. Initialize hosting once (if you have not) with `firebase init hosting` and point it at the `dist` folder.
3. Build the production bundle:
   ```bash
   npm run build
   ```
4. Deploy the `dist` outputs to Firebase:
   ```bash
   firebase deploy --only hosting --project your-firebase-project-id
   ```

   Replace `your-firebase-project-id` with the slug of your Firebase project and ensure the Firebase config is wired into the `public` folder if you need runtime config.

## Behavior changes in this fork

- The login screen has been removed. Users are given full access to the dashboard immediately.
- A persistent display name (stored in localStorage) is now the only thing required to save practices to Supabase.
- Metric customization updates the shared `metric_settings` table directly, so the settings page is always available.
- Progress charts load aggregated data across all sessions, and every session now records the optional display name + device metadata.

Enjoy building on top of the Voice Energy Trainer experience, and reach out if you need help wiring your Supabase + Firebase projects together.
