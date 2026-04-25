# Cipher — Password Analyzer

A 5-screen browser-based password security toolkit. No backend, no data collection.

## Live Demo
[https://cipher-snowy-tau.vercel.app](https://cipher-snowy-tau.vercel.app)

## Features
- Real-time password strength scoring using entropy calculation
- Cryptographically secure password generation (`crypto.getRandomValues`)
- HaveIBeenPwned breach detection via k-anonymity — password never leaves your device
- Password history stored in localStorage (max 50 entries)
- Security dashboard with strength distribution and statistics

## Tech Stack
- Next.js 16 (App Router), React 19, CSS Modules
- Security headers: CSP, HSTS, X-Frame-Options, Permissions-Policy
- Zero external UI libraries

## Setup
```bash
npm install
npm run dev
```
Open http://localhost:3000

## Team
| Member | Role |
|--------|------|
| Name | Team Lead — Architecture, Security, Deployment |
| Name | UI/UX — Design System, Generator page |
| Name | API Integration — Breach Checker, Financial Analysis |
| Name | Scrum Master — Jira, History & Dashboard pages |
