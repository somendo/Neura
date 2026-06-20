# Neura — Real AI Healthcare Companion MVP

Neura is a deployable full-stack MVP for a Bangladesh-first AI health companion.

It includes:

- Liquid-glass mobile PWA UI.
- User sign up/sign in.
- Manual subscription payment approval: **৳499/month** or **৳5990/year**.
- Admin-only control panel.
- Gemini-powered AI consultant behind Neura branding.
- Prescription/report upload and AI OCR analysis.
- Medication extraction and user-confirmed reminders.
- PWA push notifications for medication times.
- Specialist suggestion and Bangladesh-first doctor/facility search.
- Patient memory rules: only registered patient context is stored.
- Consent-based support/admin details approach.

## Important medical positioning

Neura is not a doctor and must not be marketed as a doctor replacement. It is a health companion that organizes prescriptions, explains reports, tracks reminders, and suggests suitable specialist categories/clinics. It must not prescribe, stop, or change medication.

## Why Vercel, not GitHub Pages?

GitHub Pages can only host static files. Neura needs backend APIs for auth, AI, admin approval, OCR and push reminders. Use **Vercel free tier** for this MVP.

---

# Mobile-only deployment instructions

You can do this from an Android phone using Chrome.

## 1. Create accounts

Create these free accounts:

1. GitHub — https://github.com
2. Vercel — https://vercel.com
3. Supabase — https://supabase.com
4. Google AI Studio — https://aistudio.google.com

---

# 2. Supabase setup

## Create project

1. Open Supabase.
2. Create a new project.
3. Save your database password somewhere private.
4. Wait for the project to finish setup.

## Run database SQL

1. Go to Supabase dashboard.
2. Open **SQL Editor**.
3. Open this project file:

```text
sql/schema.sql
```

4. Copy all SQL.
5. Paste into Supabase SQL Editor.
6. Tap **Run**.

## Get Supabase keys

In Supabase:

```text
Project Settings → API
```

Copy:

```text
Project URL
anon public key
service_role key
```

Keep the `service_role` key secret. Never put it in frontend code.

---

# 3. Google Gemini API key

1. Open Google AI Studio.
2. Create API key.
3. Copy it.

This project uses Gemini from the backend only. Users see only Neura.

---

# 4. Upload project to GitHub from Android

Recommended easiest method:

1. Create a new GitHub repository named:

```text
neura-healthcare-mvp
```

2. Upload all files from this folder into the repository.
3. Make sure the repository root contains:

```text
index.html
package.json
vercel.json
api/
sql/
manifest.webmanifest
sw.js
icon.svg
```

---

# 5. Deploy on Vercel

1. Open Vercel.
2. Tap **Add New Project**.
3. Import your GitHub repo.
4. Framework preset: **Other**.
5. Add environment variables before deploying.

## Required Vercel environment variables

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
ADMIN_EMAIL=your_admin_email@example.com
CRON_SECRET=choose_a_random_secret_text
VAPID_PUBLIC_KEY=BFvkuH7vmz2z_ze_tPHPTdwcxhqaeC5mgIcG-NA9yYtx7h6iBByzfsdaS-6TXqTo1Ed_UpfhH2UzBh44pGWDvnA
VAPID_PRIVATE_KEY=FbJ19pwWlM4g-o_xrXKSRz7XKJEfq44NHRMKPAcVfi0
VAPID_EMAIL=mailto:your_admin_email@example.com
```

The included VAPID keys are starter keys so the app can work. Later you should replace them with your own generated keys.

6. Tap **Deploy**.

---

# 6. Create admin account

Very important:

1. Open your deployed Neura URL.
2. Sign up using the exact email you placed in:

```text
ADMIN_EMAIL
```

That account automatically becomes admin and active.

Normal users must submit payment first and wait for admin approval.

---

# 7. User subscription flow

Normal user flow:

1. User signs up.
2. User sees payment screen.
3. User selects:

```text
৳499/month
৳5990/year
```

4. User enters manual payment details:

```text
payment method
transaction ID
sender phone
note
```

5. Admin opens hidden admin panel.
6. Admin approves or rejects payment.
7. If approved, the user gets app access.

---

# 8. Admin panel

The admin panel is not shown to normal users.

Admin route is inside the app and visible only if:

```text
profile.role = admin
```

Admin can see:

- users overview
- pending payments
- approved revenue
- AI usage logs
- risk events count
- doctor directory controls
- verified doctor/facility additions

Normal users cannot access admin APIs. Backend checks admin role.

---

# 9. Medication reminder setup

User flow:

1. Upload prescription.
2. Neura AI extracts medicines and possible times.
3. User confirms/corrects times.
4. Reminders are created.
5. User taps bell icon on dashboard.
6. User allows notifications.
7. Neura sends web push reminders via Vercel cron.

## PWA notification limitations

PWA push notifications work well on Android when:

- the app is installed
- notifications are allowed
- phone has internet
- browser permits background push

A PWA cannot guarantee exact offline alarms if phone is fully offline or the OS kills the browser. Neura includes in-app reminder recovery when users reopen the app.

---

# 10. How to install as mobile app

On Android Chrome:

1. Open deployed Neura URL.
2. Tap browser menu.
3. Tap **Add to Home screen** or **Install app**.
4. Open Neura from home screen.
5. Tap 🔔 and allow notifications.

---

# 11. What is fully functional after environment setup?

After you deploy and add keys, these work:

- sign up/sign in
- admin role by `ADMIN_EMAIL`
- manual payment request
- admin approval/rejection
- paid-user gating
- AI chat through Gemini
- prescription/report image analysis
- medication extraction
- medicine confirmation
- reminder event generation
- web push subscriptions
- Vercel cron reminder sending
- admin overview/revenue/pending payments
- specialist and facility search
- PWA install

---

# 12. What you still must provide yourself

These cannot be created by me without your private accounts:

- Supabase project
- Gemini API key
- Vercel project
- GitHub repository
- actual manual payment receiving number/account
- legal privacy policy/terms final review
- medical/legal approval for public launch

---

# 13. Production warnings

Before real public marketing:

- Do not claim Neura diagnoses or treats disease.
- Do not claim it replaces a doctor.
- Keep emergency guidance always visible.
- Add your official privacy policy and terms.
- Verify doctor/clinic listings manually.
- Review all healthcare claims with a qualified clinician/legal advisor.

---

# 14. Suggested public positioning

Use this wording:

> Neura is an AI health companion that helps users organize prescriptions, understand reports, remember medicines, track daily health, and find the right specialist to consult.

Avoid this wording:

> Neura is an AI doctor that diagnoses and treats you.
