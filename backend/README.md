# Turning on the Wedly backend

The site works with no backend at all. These three pieces are optional and independent. Do them in order; each is about ten minutes. When you finish one, paste the value into `config.js` and push.

## 1. Cloud sync and helper replies (Supabase, free)

What it gives you: short share links, the plan opens on any device, and when Mom taps "yes" or ticks a task on her link it shows up on your dashboard.

1. Go to https://supabase.com, sign up, click **New project**. Any name, any region, pick a database password and keep it somewhere.
2. Wait for it to finish setting up (about a minute).
3. Left sidebar, **SQL Editor**, **New query**. Open `backend/supabase.sql` from this repo, paste the whole thing in, click **Run**. It should say "Success. No rows returned."
4. Left sidebar, **Project Settings** (gear), **API**. Copy two things: **Project URL** and the **anon public** key.
5. Open `config.js` and fill in `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
6. Push to GitHub. On the dashboard you will see a "Sync to the cloud" button. Click it once. From then on it saves itself.

The anon key is designed to be public. The SQL file locks the tables so the key can only call the four functions, and only the private edit key can change a plan.

## 2. Pinterest import (Cloudflare Worker, free)

What it gives you: paste any public board link on the Inspiration page and the real pins come in, priced by their titles, and vendors get matched to the board's style.

1. Go to https://dash.cloudflare.com, sign up. Left sidebar, **Workers & Pages**, **Create**, **Create Worker**. Name it `wedly-pins`, click **Deploy**.
2. Click **Edit code**. Delete everything in the editor, paste in `backend/pinterest-worker.js`, click **Deploy**.
3. Copy the worker URL and add `/pins` to the end, like `https://wedly-pins.yourname.workers.dev/pins`.
4. Put it in `config.js` as `PINTEREST_PROXY`. Push.

Test it in the browser first: `https://wedly-pins.yourname.workers.dev/pins?board=https://www.pinterest.com/pinterest/official-news/` should show JSON with pins.

## 3. Deposits (Stripe test mode, free)

What it gives you: the "Reserve with 20% deposit" button on My picks opens a real checkout page. Test mode only; no real money moves.

1. Go to https://stripe.com, sign up. Stay in **Test mode** (toggle at the top right).
2. Left sidebar, **Payment Links**, **New**. Choose **Customers choose what to pay**. Name it "Wedly vendor deposit". Click **Create link**.
3. Copy the link (starts with `https://buy.stripe.com/test_...`). Put it in `config.js` as `STRIPE_DEPOSIT_LINK`. Push.
4. On the checkout page use card number `4242 4242 4242 4242`, any future date, any CVC.

Real money, vendor payouts and holding deposits need Stripe Connect and a business account. That is a later step.

## Pushing changes

```
cd ~/Desktop/wedding-budget-app
git add -A
git commit -m "Add backend keys"
git push
```

GitHub Pages updates in about a minute.
