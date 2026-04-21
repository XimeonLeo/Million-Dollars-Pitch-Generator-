# Persuasion Outreach Generator

An AI-powered cold outreach message generator that applies 8 psychological persuasion laws to create high-converting first messages.

## Features
- 8 toggleable persuasion laws (Herd Mentality, Reciprocity, Scarcity, Authority Bias, etc.)
- 10 context fields for deep message personalisation
- Direct Anthropic API integration (your key, stored locally)
- Copy-to-clipboard output
- Mobile responsive

## Deploy to Vercel (3 minutes)

### Option A — GitHub + Vercel (recommended)

1. **Create a GitHub repo**
   - Go to github.com → New repository
   - Name it `persuasion-outreach-generator`
   - Upload all these files (drag & drop the folder)

2. **Deploy on Vercel**
   - Go to vercel.com → Add New → Project
   - Import your GitHub repo
   - Framework: **Vite** (auto-detected)
   - Click **Deploy**
   - Done — you'll get a live URL like `your-app.vercel.app`

### Option B — Vercel CLI

```bash
npm install -g vercel
npm install
vercel
```

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Usage

1. Enter your Anthropic API key (get one at console.anthropic.com)
2. Toggle which persuasion laws to apply
3. Fill in your target context (industry, pain point, offer, social proof, etc.)
4. Hit Generate
5. Copy the message

Your API key is stored only in your browser's localStorage — it never leaves your device except to call the Anthropic API directly.
