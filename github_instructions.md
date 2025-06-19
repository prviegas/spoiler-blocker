# How to Push Your Spoiler Blocker Extension to GitHub

## Step 1: Create a New Repository on GitHub
1. Go to https://github.com/new
2. Repository name: `spoiler-blocker`
3. Description: `A Chrome extension that hides comments on YouTube videos to prevent spoilers`
4. Choose "Public" or "Private" based on your preference
5. Click "Create repository"

## Step 2: Push Your Local Repository to GitHub
Once your GitHub repository is created, follow these terminal commands:

```powershell
# Make sure you're in your project directory
cd c:\Users\Usuario\Desktop\spoilerblocker

# Connect your local repository to GitHub
git remote add origin https://github.com/prviegas/spoiler-blocker.git

# Rename your branch to main (if not already named main)
git branch -M main

# Push your code to GitHub
git push -u origin main
```

You may be prompted to authenticate with GitHub. Follow the authentication instructions that appear.

## Step 3: Verify Your Repository
After pushing, visit https://github.com/prviegas/spoiler-blocker to ensure all your files were uploaded correctly.

## Step 4: Additional GitHub Setup (Optional)
Consider adding:
- A detailed description in the repository settings
- Topics/tags for better discoverability
- A license if you plan to share your extension

## Troubleshooting
If you encounter authentication issues, you might need to:
1. Set up a Personal Access Token (PAT) on GitHub
2. Use the token when prompted for a password
3. Or set up SSH keys for more secure access

For more information, visit: https://docs.github.com/en/authentication
