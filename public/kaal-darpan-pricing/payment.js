const subscriptionKey = 'kaal-darpan-pro-subscription';
const form = document.getElementById('payment-form');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const name = document.getElementById('full-name').value.trim();
  if (!name) return;

  const notice = document.getElementById('demo-order-notice');
  notice.textContent = '';
  try {
    localStorage.setItem(subscriptionKey, 'active');
  } catch (error) {
    console.error('Unable to save the demo subscription.', error);
    notice.textContent = 'Could not save demo access in this browser. Enable browser storage and try again.';
    return;
  }

  document.getElementById('checkout-area').classList.add('hidden');
  document.getElementById('success-greeting').textContent =
    `Dear ${name}, your Kaal Darpan Pro demo order is successfully placed. Thank you for engaging with us.`;
  document.getElementById('success-screen').classList.remove('hidden');
  document.getElementById('success-screen').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
