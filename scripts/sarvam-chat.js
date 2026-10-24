import { SarvamAIClient } from 'sarvamai';

try {
  process.loadEnvFile('.env.local');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const apiKey = process.env.SARVAM_API_KEY;
if (!apiKey) {
  throw new Error('Set SARVAM_API_KEY in the environment or .env.local file before running this script.');
}

const client = new SarvamAIClient({ apiSubscriptionKey: apiKey });
const response = await client.chat.completions({
  model: 'sarvam-105b-conversations',
  messages: [{ role: 'user', content: 'Say hello in English and Hindi.' }],
});

const reply = response.choices?.[0]?.message?.content;
if (typeof reply !== 'string' || !reply.trim()) {
  throw new Error('Sarvam returned no chat reply.');
}

console.log(reply);
