# GaganDrishti: Antigravity to GitHub Automatic Synchronization Guide

This guide describes how the local GaganDrishti codebase synchronizes with the remote GitHub repository:
`https://github.com/meoxx009/GaganDrishti.git`

---

## 1. Quick Automated Sync (One Click)

We have created automated synchronization scripts inside the `scripts/` directory:

### On Windows PowerShell:
```powershell
.\scripts\sync-github.ps1
```
Or with a custom commit message:
```powershell
.\scripts\sync-github.ps1 -CommitMessage "feat: updated crop stages and weather caching"
```

### On Windows Command Prompt (Batch):
Double-click `scripts\sync-github.bat` or run:
```cmd
scripts\sync-github.bat "feat: sync changes to GitHub"
```

---

## 2. Manual Git Commands Workflow

If you prefer executing git commands manually:

```bash
# 1. Check current repository status
git status

# 2. Stage all modifications and newly created files
git add .

# 3. Create a descriptive commit
git commit -m "feat: complete pre-launch checklist and documentation"

# 4. Pull latest changes from GitHub (with rebase)
git pull --rebase origin main

# 5. Push local commits to GitHub
git push -u origin main
```

---

## 3. GitHub Authentication (First-Time Setup)

When pushing to GitHub, you may be prompted for authentication. GitHub requires a **Personal Access Token (PAT)** or **SSH key** instead of an account password.

### Option A: Personal Access Token (PAT) — Recommended
1. Log in to your GitHub account: [https://github.com](https://github.com)
2. Go to **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**.
3. Click **Generate new token (classic)**.
4. Set Note: `GaganDrishti-Antigravity-Sync`.
5. Select scopes:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
6. Click **Generate token** and copy the token string (`ghp_...`).
7. When Git asks for password in the terminal, paste this token.

To remember credentials on Windows:
```bash
git config --global credential.helper wincred
```

### Option B: SSH Key (Secure & Passwordless)
1. Generate an SSH key:
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```
2. Copy your public key:
   ```powershell
   Get-Content ~/.ssh/id_ed25519.pub | Set-Clipboard
   ```
3. Add to GitHub: **Settings** → **SSH and GPG keys** → **New SSH key**.
4. Switch git remote to SSH:
   ```bash
   git remote set-url origin git@github.com:meoxx009/GaganDrishti.git
   ```

---

## 4. Continuous Integration & Deployment (GitHub Actions)

Every push to `main` triggers automated CI workflows located in `.github/workflows/`:
1. **`.github/workflows/ci.yml`**:
   - Runs `npm install`
   - Runs static TypeScript verification: `npx tsc --noEmit`
   - Runs Turbopack production build: `npm run build`
2. **`.github/workflows/deploy.yml`**:
   - Deploys production bundle to Vercel upon successful CI check.
