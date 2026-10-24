require('dotenv').config();
const express = require('express');
const path = require('path');
const Stripe = require('stripe');
const nodemailer = require('nodemailer');
const app = express();
const PORT = Number(process.env.PORT || 8000);
const ROOT = __dirname;
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const sentEmails = new Set();

function emailTransport() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

async function sendOrderConfirmation(paymentIntent) {
  if (!paymentIntent || paymentIntent.status !== 'succeeded') throw new Error('Payment is not confirmed as successful.');
  const name = String(paymentIntent.metadata?.customer_name || 'Customer').slice(0, 90);
  const email = String(paymentIntent.metadata?.customer_email || paymentIntent.receipt_email || '').slice(0, 160);
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new Error('A valid customer email is missing from the paid order.');
  if (sentEmails.has(paymentIntent.id)) return { emailSent: true, alreadySent: true };
  const transport = emailTransport();
  if (!transport || !process.env.EMAIL_FROM) return { emailSent: false, reason: 'SMTP is not configured on the server.' };
  const body = `Order successfully placed!\n\nDear ${name}, your order of Kaal Darpan Pro is successfully placed. Thank you for engaging with us.`;
  await transport.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Kaal Darpan Pro — Order successfully placed!',
    text: body,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.7;color:#222"><h2>Order successfully placed!</h2><p>Dear ${escapeHtml(name)}, your order of Kaal Darpan Pro is successfully placed. Thank you for engaging with us.</p></div>`
  });
  sentEmails.add(paymentIntent.id);
  return { emailSent: true };
}
function escapeHtml(value) { return value.replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch])); }

// Stripe requires the raw request body for webhook signature verification.
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return res.status(503).send('Stripe webhook is not configured.');
  let event;
  try { event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET); }
  catch (err) { return res.status(400).send(`Webhook signature error: ${err.message}`); }
  if (event.type === 'payment_intent.succeeded') {
    try { await sendOrderConfirmation(event.data.object); }
    catch (err) { console.error('Order confirmation email failed:', err.message); return res.status(500).send('Email delivery failed; Stripe will retry this webhook.'); }
  }
  res.json({ received: true });
});

app.use(express.json({ limit: '20kb' }));
app.use(express.static(ROOT));
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, stripeConfigured: Boolean(stripe && process.env.STRIPE_PUBLISHABLE_KEY), emailConfigured: Boolean(emailTransport() && process.env.EMAIL_FROM) });
});
app.get('/api/config', (_req, res) => {
  if (!process.env.STRIPE_PUBLISHABLE_KEY || !stripe) return res.status(503).json({ error: 'Stripe is not configured on the server.' });
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    if (!stripe) return res.status(503).json({ error: 'Stripe is not configured. Add STRIPE_SECRET_KEY to your .env file.' });
    const name = String(req.body?.name || '').trim().slice(0, 90);
    const email = String(req.body?.email || '').trim().slice(0, 160);
    if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Enter a valid name and email address.' });
    const intent = await stripe.paymentIntents.create({
      amount: 2000,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      receipt_email: email,
      description: 'Kaal Darpan Pro one-time payment',
      metadata: { customer_name: name, customer_email: email, product: 'Kaal Darpan Pro', billing: 'one-time' }
    }, { idempotencyKey: undefined });
    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    console.error('Create PaymentIntent failed:', err.message);
    res.status(500).json({ error: 'Could not start the payment. Please try again.' });
  }
});
app.post('/api/order-confirmation-status', async (req, res) => {
  try {
    if (!stripe) return res.status(503).json({ emailSent: false, error: 'Stripe is not configured.' });
    const id = String(req.body?.paymentIntentId || '');
    if (!/^pi_[A-Za-z0-9]+$/.test(id)) return res.status(400).json({ emailSent: false, error: 'Invalid payment reference.' });
    const intent = await stripe.paymentIntents.retrieve(id);
    if (intent.status !== 'succeeded' || intent.metadata?.product !== 'Kaal Darpan Pro') return res.status(400).json({ emailSent: false, error: 'Payment is not confirmed.' });
    const result = await sendOrderConfirmation(intent);
    res.json(result);
  } catch (err) {
    console.error('Order confirmation failed:', err.message);
    res.status(500).json({ emailSent: false, error: 'Payment succeeded, but the confirmation email could not be sent yet.' });
  }
});
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(ROOT, 'index.html'));
});
app.listen(PORT, () => console.log(`Kaal Darpan pricing website running at http://localhost:${PORT}`));
