# GitHub Upload Instructions

Follow these steps to upload your LaunchAI Coming Soon project to GitHub:

## 1. Create a new repository on GitHub

First, create a new repository on GitHub:
- Go to https://github.com/new
- Name: `launchai-coming-soon`
- Description: `Modern coming soon page for LaunchAI with Supabase integration`
- Visibility: Public (or Private if you prefer)
- Do NOT initialize with README, .gitignore, or license

## 2. Connect your local repository

Run these commands in your terminal (from the project root):

```bash
# Navigate to your project folder (if not already there)
cd /c:/Users/omarw/OneDrive/Desktop/Business\ Compaion/coming-soon-vercel

# Initialize Git (if not already done)
git init

# Add all files
git add .

# Commit the files
git commit -m "Initial commit: LaunchAI Coming Soon Page"

# Link to your GitHub repository
git remote add origin https://github.com/omarwazaney12/launchai-coming-soon.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 3. Verify

After running these commands, refresh your GitHub repository page to see the uploaded files.

## 4. Set Up for Vercel Deployment

1. Log in to Vercel: https://vercel.com
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy! 