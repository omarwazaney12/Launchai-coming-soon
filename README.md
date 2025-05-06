# LaunchAI Coming Soon Page

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

A modern, responsive coming soon page for LaunchAI with Supabase integration for early access subscriptions and job applications.

![LaunchAI Preview](https://via.placeholder.com/800x400?text=LaunchAI+Coming+Soon)

## Features

- 🎨 Modern, responsive design with animated background
- 📝 Early access sign-up form with Supabase integration
- 👥 Job application system with resume upload functionality
- 🔒 Form validation and error handling
- 🚀 Ready for deployment on Vercel

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Supabase (Database, Authentication, Storage)
- **Deployment**: Vercel

## Prerequisites

- Node.js 16+ and npm/yarn
- Supabase account
- Vercel account (for deployment)

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/omarwazaney12/launchai-coming-soon.git
cd launchai-coming-soon
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up Supabase

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)
2. Run the SQL from `supabase_schema.sql` in the Supabase SQL Editor
3. Run the SQL from `direct-permissions.sql` to set up necessary permissions
4. Get your Supabase URL and anon key from the project settings

### 4. Set up environment variables

1. Create a `.env.local` file in the project root (copy from `.env.local.example`)
2. Add your Supabase URL and anon key:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Run the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the coming soon page.

## Project Structure

```
coming-soon-vercel/
├── components/         # React components
├── pages/              # Next.js pages
│   ├── api/            # API routes
│   └── index.js        # Homepage
├── public/             # Static assets
├── styles/             # CSS styles
├── utils/              # Utility functions
├── supabase_schema.sql # Database schema
├── direct-permissions.sql # Permissions setup
└── ... configuration files
```

## Deployment to Vercel

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Add the environment variables in the Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Additional Configuration

### Storage Bucket for Resumes

For the job application system to work fully, make sure your Supabase storage is configured:

1. Go to your Supabase Dashboard
2. Navigate to Storage > Buckets
3. Verify the "resumes" bucket exists
4. Check the access policies match those in `direct-permissions.sql`

### Viewing Submitted Applications

To view submitted applications and resumes:

1. Log in to your Supabase dashboard
2. Go to the Table Editor and view the `job_applications` table
3. To view resumes, go to Storage > "resumes" bucket

## Troubleshooting

If you encounter issues with form submissions:
- Check the browser console for errors
- Verify your Supabase credentials in `.env.local`
- Make sure the permissions SQL has been run in Supabase

## License

MIT

## Contact

Created by [@omarwazaney12](https://github.com/omarwazaney12) 