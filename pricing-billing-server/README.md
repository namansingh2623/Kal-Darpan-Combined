# Kaal Darpan optional billing API scaffold

The combined site's Pro flow is a browser-local **demo**. This server is an optional Stripe/SMTP API scaffold and is not used by that demo checkout. Its PaymentIntent creates a one-time payment, not an automatically renewing annual subscription. Do not describe a successful demo order as a paid subscription.

The site includes a separate demo payment page and a green demo-order screen. The API routes in this folder can create a Stripe PaymentIntent and send an email after a real confirmed one-time payment when valid credentials and a production checkout client are supplied.

## Important: setup required for real payments and email

This project is a complete integration scaffold, but it cannot charge a card or send an email until you configure your own Stripe account and SMTP/transactional email provider. Never put secret keys in frontend JavaScript or commit your `.env` file.

### 1. Install Node.js

Install a current Node.js LTS version from https://nodejs.org/.

### 2. Configure keys

In this folder, copy `.env.example` to `.env` and fill in:

- `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` from Stripe Dashboard. Start with **test mode** keys.
- `STRIPE_WEBHOOK_SECRET` from a Stripe webhook endpoint pointing to `https://YOUR_DOMAIN/api/stripe-webhook` and listening for `payment_intent.succeeded`.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `EMAIL_FROM` from your email/transactional email provider.

### 3. Install and run

```bash
npm install
npm start
```

Open http://localhost:8000. The pricing page opens `payment.html` in a new tab when the Pro plan is chosen.

### 4. Test safely

Use Stripe test mode and Stripe's documented test card details only. Do not test with real card details until you have completed the provider's production setup, business verification, tax/renewal terms, and security review. To test Stripe webhooks locally, use the Stripe CLI to forward events to `localhost:8000/api/stripe-webhook` and copy its webhook signing secret into `.env`.

## Confirmation email text

Subject: `Kaal Darpan Pro — Order successfully placed!`

Order successfully placed!

Dear [name entered on payment page], your order of Kaal Darpan Pro is successfully placed. Thank you for engaging with us.

The green success screen appears only after Stripe confirms the payment succeeded. Email is sent by the server after checking the payment status; if SMTP is not configured, the screen will explain that email delivery is not configured.

## Security notes

- Full card details are collected by Stripe Elements, not by this website's server.
- Payment is confirmed through Stripe's API; the server does not trust a browser-only success flag.
- The example uses Stripe PaymentIntents for a $20 payment. A true automatically renewing annual subscription should be implemented with Stripe Billing/Subscriptions and clear recurring-billing disclosures before production launch.
- For production, use a persistent idempotency store for email delivery and monitor webhook retries.
