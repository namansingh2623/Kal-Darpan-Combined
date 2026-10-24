const plans = {
  free: { name: 'KAAL DARPAN FREE', detail: 'Free access', cycle: 'No billing', total: '$0.00' },
  pro: { name: 'KAAL DARPAN PRO', detail: 'Annual subscription', cycle: 'Yearly', total: '$20.00' },
};
let selectedPlan = 'pro';
let demoCode = '';
const $ = (id) => document.getElementById(id);
const checkout = $('checkout');
const verification = $('verification');
const paymentForm = $('payment-form');
const verifyForm = $('verify-form');

function selectPlan(plan) {
  selectedPlan = plan;
  document.querySelectorAll('[data-plan-card]').forEach(card => card.classList.toggle('is-selected', card.dataset.planCard === plan));
  document.querySelectorAll('[data-choose]').forEach(button => {
    const active = button.dataset.choose === plan;
    button.innerHTML = active ? 'SELECTED <span>✓</span>' : `SELECT ${button.dataset.choose.toUpperCase()} <span>→</span>`;
  });
  $('selection-copy').textContent = plan === 'pro' ? 'KAAL DARPAN PRO demo selected · no charge' : 'KAAL DARPAN FREE selected · $0 forever';
  $('selection-actions').classList.remove('hidden');
}
function openCheckout() {
  const plan = selectedPlan;
  const data = plans[plan];
  $('summary-plan').textContent = data.name;
  $('summary-plan-detail').textContent = data.detail;
  $('summary-cycle').textContent = data.cycle;
  $('summary-total').textContent = data.total;
  checkout.classList.remove('hidden');
  verification.classList.add('hidden');
  $('plans').classList.add('hidden');
  $('selection-actions').classList.add('hidden');
  document.querySelector('.secure-caption').classList.add('hidden');
  $('checkout-heading').textContent = plan === 'pro' ? 'PAYMENT DETAILS' : 'FREE PLAN CONFIRMATION';
  document.querySelector('.card-section-title').classList.toggle('hidden', plan === 'free');
  ['card-number','expiry','cvc'].forEach(id => {
    const field = $(id); const label = document.querySelector(`label[for="${id}"]`);
    field.classList.toggle('hidden', plan === 'free'); if (label) label.classList.toggle('hidden', plan === 'free'); field.required = plan !== 'free';
  });
  document.querySelector('.demo-warning').classList.toggle('hidden', plan === 'free');
  $('terms').checked = false;
  $('form-error').textContent = '';
  $('payment-form').querySelector('.order-button').innerHTML = plan === 'pro' ? 'ORDER NOW <span>→</span>' : 'CONFIRM FREE PLAN <span>→</span>';
  checkout.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.querySelectorAll('[data-choose]').forEach(button => button.addEventListener('click', () => {
  if (button.dataset.choose === 'pro') {
    // Open the dedicated payment screen in a separate browser tab.
    window.location.href = './payment.html';
    return;
  }
  selectPlan('free');
}));
$('continue-selected').addEventListener('click', openCheckout);
$('back-to-plans').addEventListener('click', () => {
  checkout.classList.add('hidden'); $('plans').classList.remove('hidden'); $('selection-actions').classList.remove('hidden'); document.querySelector('.secure-caption').classList.remove('hidden'); $('plans').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
$('card-number').addEventListener('input', (event) => {
  const digits = event.target.value.replace(/\D/g, '').slice(0, 19);
  event.target.value = digits.replace(/(.{4})/g, '$1 ').trim();
});
$('expiry').addEventListener('input', (event) => {
  const digits = event.target.value.replace(/\D/g, '').slice(0, 4);
  event.target.value = digits.length > 2 ? `${digits.slice(0,2)} / ${digits.slice(2)}` : digits;
});
$('cvc').addEventListener('input', (event) => { event.target.value = event.target.value.replace(/\D/g, '').slice(0, 4); });

paymentForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const error = $('form-error'); error.textContent = '';
  if (!$('full-name').value.trim() || !$('email').validity.valid || !$('terms').checked) {
    error.textContent = 'Enter your name and a valid email, then confirm that this is a demo checkout.'; return;
  }
  if (selectedPlan === 'pro') {
    const digits = $('card-number').value.replace(/\D/g, '');
    if (digits.length < 12 || digits.length > 19 || !/^\d{2}\s*\/\s*\d{2}$/.test($('expiry').value) || $('cvc').value.length < 3) {
      error.textContent = 'For this demo, enter sample card details with a 12–19 digit number, MM / YY expiry, and 3–4 digit CVC. Never use a real card.'; return;
    }
  }
  // Do not persist or transmit card fields. Clear them immediately after local validation.
  $('card-number').value = ''; $('expiry').value = ''; $('cvc').value = '';
  checkout.classList.add('hidden'); verification.classList.remove('hidden');
  $('verify-form').classList.add('hidden'); $('verified-state').classList.add('hidden'); $('send-code').classList.remove('hidden');
  verification.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

$('send-code').addEventListener('click', () => {
  // Local-only simulated verification code. In production, use an identity/payment provider.
  demoCode = String(Math.floor(100000 + Math.random() * 900000));
  const method = document.querySelector('input[name="verification-method"]:checked').value;
  $('demo-code-hint').textContent = `Demo ${method === 'email' ? 'email' : 'SMS'} code: ${demoCode}. This code is generated locally; no message was sent.`;
  $('demo-code-hint').classList.remove('hidden');
  verifyForm.classList.remove('hidden'); $('send-code').classList.add('hidden'); $('verification-code').focus();
});
verifyForm.addEventListener('submit', (event) => {
  event.preventDefault(); $('verify-error').textContent = '';
  if ($('verification-code').value.trim() !== demoCode) { $('verify-error').textContent = 'That code does not match. Use the demo code shown above.'; return; }
  verifyForm.classList.add('hidden'); $('verified-state').classList.remove('hidden');
});
$('restart-checkout').addEventListener('click', () => {
  verification.classList.add('hidden'); checkout.classList.remove('hidden'); checkout.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
