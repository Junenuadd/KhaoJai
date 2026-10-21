# Accounts and saved progress (Supabase)

KhaoJai uses **Supabase** for sign-up, sign-in and saving each learner's progress to their account.
The project belongs to KhaoJai's own account (**sataporn.yodp@gmail.com**). Never use a PNC/Boom account for KhaoJai.

## What is set up now
| Item | Value / status |
|---|---|
| Supabase account | sataporn.yodp@gmail.com (organization "Junenuadd") |
| Project | **KaoJai** · region ap-northeast-2 (Seoul) |
| Project URL | `https://pymcvjgdeceocfqychik.supabase.co` (in `src/config.js`) |
| Key used by the website | the **publishable** key (in `src/config.js`) — public by design |
| Table | `public.progress` (one row per learner) with Row Level Security ✅ |
| Site URL | `https://junenuadd.github.io/KhaoJai/` ✅ |
| Redirect URLs | `https://junenuadd.github.io/KhaoJai/**` ✅ |
| Email + password sign-in | ✅ on, with email confirmation |
| Google sign-in | ⏳ off — the button stays hidden until it is switched on (steps below) |

**Never** put the `secret` / `service_role` key in the website or in GitHub. It bypasses all security.

## How it works
- Sign up → Supabase emails a confirmation link → the link opens KhaoJai and signs the learner in.
- Progress (lessons, test results, skills, letter reviews, settings) is saved to `progress.data` a moment after each change, and loaded again when the learner signs in on any device.
- A guest who creates an account keeps the progress they already made on that device.
- Sign out removes progress from the device; it stays in the account.
- Forgot password → email link → "Choose a new password" screen.
- Each learner can only read and write their own row (Row Level Security policies below).

## The database table (already created)
```sql
create table if not exists public.progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.progress enable row level security;
create policy "read own progress" on public.progress for select to authenticated using (auth.uid() = user_id);
create policy "insert own progress" on public.progress for insert to authenticated with check (auth.uid() = user_id);
create policy "update own progress" on public.progress for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update on public.progress to authenticated;
```

## Before a public launch
1. **Email sending.** Supabase's built-in email service only sends a few emails per hour and is meant for testing. Before real users arrive, add a custom SMTP sender (Authentication → Emails → SMTP settings), e.g. Resend, Brevo or Amazon SES — signed up with KhaoJai's email.
2. **Email templates.** Authentication → Emails: change the confirmation and reset emails to KhaoJai wording.
3. **Google sign-in (optional).**
   - In Google Cloud Console (with KhaoJai's Google account) create an OAuth client of type "Web application".
   - Authorised redirect URI: `https://pymcvjgdeceocfqychik.supabase.co/auth/v1/callback`
   - In Supabase: Authentication → Sign In / Providers → Google → paste the Client ID and Client secret → enable.
   - The "Continue with Google" button appears automatically once it is enabled.
4. **Own domain.** If KhaoJai moves to its own domain (e.g. khaojai.app), update Site URL and Redirect URLs.

## Turning accounts off
Empty `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `src/config.js`. The app then runs in guest mode and says plainly that accounts are not switched on.

## 6-digit email codes (v0.5.1)
Sign-up is three steps: name, email and optional mobile number → password → a 6-digit code sent by email.
Signing in can also use a code instead of a password ("Email me a code instead").

For the code to appear in the emails, edit **Supabase → Authentication → Emails (templates)**:
- **Confirm signup**: add `Your KhaoJai code: {{ .Token }}` to the message.
- **Magic Link**: add `Your KhaoJai sign-in code: {{ .Token }}`.

Supabase's built-in email sender is only for testing (very few emails per hour, and it may only deliver to the project's team members).
Before real learners sign up, connect your own email sender under **Authentication → SMTP Settings** (for example Resend, created with KhaoJai's own email).

## Mobile numbers
The mobile number is optional and saved with the account profile (`user_metadata.phone`). It is **not** verified.
Verifying phone numbers by SMS needs a paid SMS provider (Twilio, Vonage, MessageBird) connected in **Authentication → Providers → Phone**.

## More sign-in options
Google, Apple and Facebook buttons show "soon" until the provider is switched on in **Authentication → Providers**; then they work without code changes.
Apple needs a paid Apple Developer account.
