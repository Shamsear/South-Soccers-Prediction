# South Soccers Prediction League

A full-stack FIFA World Cup 2026 prediction competition platform built with Next.js 14, Supabase, and TypeScript.

## Features

- ⚽ **Match Predictions**: Predict scores for all 104 World Cup 2026 matches
- 🏆 **Live Leaderboard**: Real-time rankings with pagination
- 📊 **User Stats**: Track your prediction accuracy and total points
- ⏱️ **Countdown Timers**: Know exactly when predictions lock
- 🔴 **Live Match Banner**: See ongoing matches at a glance
- 👤 **Profile Management**: Upload avatars and customize settings
- 👑 **Admin Dashboard**: Score matches and manage the competition
- 🎨 **FIFA-Themed UI**: Beautiful dark theme with official FIFA colors
- 📱 **Fully Responsive**: Optimized for mobile, tablet, and desktop
- ♿ **Accessible**: WCAG AA compliant with semantic HTML

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS v4
- **External API**: football-data.org
- **Deployment**: Vercel (recommended)

## Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)
- A football-data.org API key (free tier: 10 requests/minute)
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ssprediction
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your project URL and anon/service role keys

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Football Data API
FOOTBALL_DATA_API_KEY=your_football_data_api_key

# ImageKit Configuration
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id

# App URL (for emails and links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Required Environment Variables

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin) | Supabase Dashboard > Settings > API |
| `FOOTBALL_DATA_API_KEY` | football-data.org API key | [Register here](https://www.football-data.org/client/register) |
| `NEXT_PUBLIC_APP_URL` | Your app's public URL | `http://localhost:3000` (dev) or your production domain |
| `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY` | ImageKit public key | ImageKit Dashboard > Developer > API Keys |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key (server-only) | ImageKit Dashboard > Developer > API Keys |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint | ImageKit Dashboard > URL-endpoint |

### 5. Run Database Migrations

Execute the SQL migrations in the `supabase/migrations/` folder in order:

1. Navigate to your Supabase Dashboard > SQL Editor
2. Run each migration file in order:
   - `001_create_profiles_table.sql`
   - `002_create_matches_table.sql`
   - `003_create_predictions_table.sql`
   - `004_create_leaderboard_materialized_view.sql`
   - `005_add_profile_fields.sql` (NEW - adds full_name and phone_number)
   - `006_update_leaderboard_view.sql` (NEW - updates leaderboard with full_name)

Or use the Supabase CLI:

```bash
supabase db push
```

### 6. Set Up ImageKit for Avatar Storage

1. Create a free account at [ImageKit.io](https://imagekit.io/)
2. Go to Dashboard > Developer > API Keys
3. Copy your:
   - Public Key
   - Private Key
   - URL-endpoint
4. Add these to your `.env.local` file (see Step 4 above)

**ImageKit Configuration:**
- The app is configured to use the `/avatars` folder
- Images are automatically resized to max 500x500 pixels
- Unique filenames are generated to prevent conflicts

### 7. Create Supabase Storage Bucket (Optional - No longer used)

> **Note:** We now use ImageKit for avatar storage, so Supabase Storage is optional.
> If you still want to set it up for other purposes:

1. Go to Supabase Dashboard > Storage
2. Create a new public bucket named `avatars`
3. Set policies to allow:
   - Public read access
   - Authenticated users can upload (with RLS)

### 8. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Tables

- **profiles**: User profiles with stats (total_points, correct_predictions, role)
- **matches**: World Cup 2026 matches (104 total)
- **predictions**: User predictions for matches
- **leaderboard**: Materialized view for optimized leaderboard queries

### Key Features

- **Row Level Security (RLS)**: All tables have RLS policies
- **Triggers**: Automatic profile creation on signup, kickoff validation
- **Materialized View**: Optimized leaderboard with ranking

## Project Structure

```
├── app/
│   ├── actions/          # Server actions
│   ├── api/              # API routes
│   ├── admin/            # Admin dashboard pages
│   ├── matches/          # Match pages
│   ├── leaderboard/      # Leaderboard page
│   ├── my-predictions/   # User predictions page
│   ├── profile/          # Profile page
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   └── page.tsx          # Landing page
├── components/           # Reusable components
├── lib/                  # Utilities
│   ├── supabase/        # Supabase clients
│   ├── parsers/         # API response parsers
│   ├── scoring.ts       # Points calculation
│   └── football-api.ts  # External API client
├── supabase/
│   └── migrations/      # Database migrations
└── types/
    └── database.ts      # TypeScript types
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy!

### Environment Variables for Production

Make sure to set all environment variables in your Vercel project:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FOOTBALL_DATA_API_KEY`
- `NEXT_PUBLIC_APP_URL` (your production domain)

### Post-Deployment Checklist

- [ ] Database migrations applied
- [ ] Storage bucket created and configured
- [ ] Environment variables set
- [ ] Create first admin user (manually update `role` in database)
- [ ] Test match sync functionality
- [ ] Test user registration and login
- [ ] Test prediction submission
- [ ] Test admin scoring functionality

## Admin Setup

To make a user an admin:

1. Register a user account normally
2. Go to Supabase Dashboard > Table Editor > profiles
3. Find the user and change their `role` from `'user'` to `'admin'`
4. The user will now have access to `/admin` routes

## API Rate Limits

**football-data.org Free Tier:**
- 10 requests per minute
- This app implements intelligent rate limiting (5-minute throttle)
- Only syncs when there are live or imminent matches

## Features Roadmap

- [x] User authentication
- [x] Match predictions
- [x] Live match banner
- [x] Leaderboard with pagination
- [x] Admin dashboard
- [x] Profile management with avatar upload
- [x] Responsive design
- [x] Accessibility compliance
- [ ] Email notifications (optional)
- [ ] Social sharing
- [ ] Mobile app

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for your own prediction competitions!

## Support

For issues and questions:
- Check the [Issues](../../issues) page
- Review the database migration instructions in `supabase/migrations/`
- Ensure all environment variables are correctly set

## Credits

Built with ❤️ for FIFA World Cup 2026

- **Framework**: Next.js by Vercel
- **Database**: Supabase
- **Match Data**: football-data.org
- **UI Components**: shadcn/ui
- **Icons**: Unicode emoji ⚽🏆🔴

---

**South Soccers Prediction League** - Predict. Compete. Win Glory. 🏆
