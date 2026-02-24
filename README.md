# Voice Energy Trainer 🎙️

A professional voice energy practice application for Vietnamese/English pronunciation training. Record sentences and receive AI-powered feedback on 5 key speech metrics with real-time visual feedback and device-independent calibration.

![Tech Stack](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7-purple?logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)

---

## 🌟 Features

### Core Functionality
- **Real-time Voice Analysis** - AI-powered speech metric scoring using Web Audio API and VAD (Voice Activity Detection)
- **5 Speech Metrics**:
  - 📢 **Energy (Volume)** - Average loudness in dB with LUFS normalization
  - ⚡ **Pace (Speech Rate)** - Words per minute (WPM) with multiple detection methods
  - 🌊 **Tonality (Acceleration)** - Variation in speed and volume dynamics
  - ⏱️ **Response Time** - Time to start speaking after prompt
  - 🎯 **Filler Words (Pause Management)** - Effective use of pauses

### Advanced Features
- **Device Calibration** - Automatic microphone calibration for consistent scoring across devices
- **Face Tracking** - MediaPipe-powered eye contact, hand gestures, and blink rate detection
- **Progress Tracking** - Comprehensive analytics with streak tracking and week-over-week improvement
- **Multi-language Support** - Vietnamese and English speech recognition
- **Custom Metric Weights** - Personalize scoring weights per metric (when enabled)
- **Admin Dashboard** - Full management for lessons, learners, and metric configurations

### User Experience
- **Minimal Recording UI** - Tap or press Spacebar to record with real-time waveform visualization
- **Instant Feedback** - Detailed results view with per-metric breakdown
- **Practice History** - Session history with category filtering and performance trends

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18, TypeScript 5.8 |
| **Build Tool** | Vite 7 with SWC plugin |
| **Styling** | Tailwind CSS 3, shadcn/ui, Radix UI |
| **State Management** | TanStack React Query, React Hooks |
| **Routing** | React Router DOM 6 |
| **Backend** | Supabase (PostgreSQL, Auth, Storage) |
| **Audio/ML** | Web Audio API, Silero VAD, TensorFlow.js, MediaPipe |
| **Forms** | React Hook Form + Zod |
| **Testing** | Vitest + Testing Library |
| **Animations** | Framer Motion |

---

## 📦 Installation

### Prerequisites
- Node.js 18+ (recommended via [nvm](https://github.com/nvm-sh/nvm))
- npm or bun package manager

### Quick Start

```bash
# 1. Clone the repository
git clone <YOUR_GIT_URL>
cd voice-energy-trainer

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env

# 4. Start development server
npm run dev
```

The app will open at `http://localhost:8080`

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_URL="your-supabase-url"
VITE_DEEPGRAM_API_KEY="your-deepgram-key"
```

> ⚠️ **Security Note**: Never commit `.env` files. The project includes `.gitignore` to prevent accidental commits.

---

## 📁 Project Structure

```
voice-energy-trainer/
├── src/
│   ├── pages/              # Route components
│   │   ├── Index.tsx       # Main practice dashboard
│   │   ├── Auth.tsx        # Authentication
│   │   ├── Settings.tsx    # Metric customization
│   │   ├── Progress.tsx    # Analytics dashboard
│   │   └── Admin.tsx       # Admin panel
│   ├── components/         # Feature components
│   │   ├── admin/          # Admin-specific components
│   │   ├── ui/             # shadcn/ui primitives
│   │   ├── CameraFeed.tsx
│   │   ├── ResultsView.tsx
│   │   ├── CalibrationWizard.tsx
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useEnhancedAudioRecorder.ts
│   │   ├── useFaceTracking.ts
│   │   └── ...
│   ├── lib/                # Core business logic
│   │   ├── audioAnalysis.ts
│   │   ├── lufsNormalization.ts
│   │   ├── deepgramService.ts
│   │   └── ...
│   └── integrations/       # Supabase client & types
├── docs/                   # Technical documentation
├── .env.example            # Environment template
└── package.json
```

---

## 🎯 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 8080) |
| `npm run build` | Production build to `dist/` |
| `npm run build:dev` | Development build |
| `npm run lint` | ESLint code check |
| `npm run test` | Run tests (Vitest) |
| `npm run test:watch` | Test watch mode |
| `npm run preview` | Preview production build |

---

## 🎤 How It Works

### Recording Flow

1. **Idle State** - User sees a practice sentence (Vietnamese → English translation)
2. **Recording** - Tap camera or press Spacebar to start; real-time waveform displays audio level
3. **Processing** - Audio is analyzed using VAD, LUFS normalization, and speech recognition
4. **Results** - Detailed breakdown of all 5 metrics with scores and improvement suggestions

### Audio Analysis Pipeline

```
MediaRecorder → VAD (Silero) → LUFS Normalization → Metric Scoring → Database Storage
```

### Metric Scoring

Each metric uses configurable thresholds (min/ideal/max) loaded from:
1. User's custom settings (`user_metric_settings` table)
2. Global admin defaults (`metric_settings` table)
3. LocalStorage fallback

---

## 📊 Database Schema

Key Supabase tables:

- `profiles` - User profiles with display names
- `sentences` - Practice sentences with categories (greeting, daily, business, etc.)
- `practice_results` - Recording sessions with all metric scores
- `metric_settings` - Global metric configuration (admin-managed)
- `user_metric_settings` - Per-user metric customization
- `display_settings` - UI preferences
- `user_roles` - Role-based access control

---

## 🔐 Authentication & Authorization

- **Authentication**: Supabase Auth (email/password, magic links)
- **User Roles**: `admin`, `user` (controlled via `user_roles` table)
- **Protected Routes**: `/progress`, `/settings`, `/admin` require authentication
- **Admin Features**: Restricted to users with `admin` role

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# Watch mode for development
npm run test:watch
```

Tests use Vitest with jsdom and Testing Library for React component testing.

---

## 📚 Documentation

Detailed technical documentation is available in the `docs/` folder:

- [`PRD.md`](docs/PRD.md) - Product requirements and metric definitions
- [`CURRENT-FEATURES.md`](docs/CURRENT-FEATURES.md) - Feature list and architecture
- [`LUFS-IMPLEMENTATION.md`](docs/LUFS-IMPLEMENTATION.md) - Audio normalization details
- [`AUTO-RECALIBRATION.md`](docs/AUTO-RECALIBRATION.md) - Calibration system docs

---

## 🌐 Deployment

### Via Lovable (Recommended)

1. Open your project at [Lovable](https://lovable.dev)
2. Click **Share** → **Publish**
3. Changes made via Lovable are auto-committed

### Manual Deployment

```bash
# Build for production
npm run build

# Deploy dist/ folder to your hosting provider
# (Vercel, Netlify, Cloudflare Pages, etc.)
```

### Custom Domain

Connect a custom domain via:
1. Lovable: Project → Settings → Domains → Connect Domain
2. Or configure directly with your hosting provider

[Read more about custom domains](https://docs.lovable.dev/features/custom-domain)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Conventions

- **Path alias**: Use `@/` for `src/` imports
- **Components**: PascalCase filenames and exports
- **Hooks**: `use` prefix (e.g., `useAuth`, `useEnhancedAudioRecorder`)
- **Constants**: UPPER_SNAKE_CASE
- **Styling**: Tailwind utility classes with `cn()` for conditionals
- **Notifications**: Use `sonner` toast for user-facing messages

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 🆘 Support

For issues or questions:
- Check the [documentation](docs/) folder
- Review existing issues in the repository
- Contact the development team

---

**Built with ❤️ using React, TypeScript, and Supabase**
