import { SarvamAIClient } from 'sarvamai';

const maxBodyBytes = 32 * 1024;
const maxTextLength = 1000;
const supportedLanguages = new Set(['hi-IN', 'ta-IN']);

function sendJson(response, status, body) {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(body));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let bytes = 0;
    let tooLarge = false;

    request.on('data', (chunk) => {
      bytes += chunk.length;
      if (bytes > maxBodyBytes) {
        tooLarge = true;
        chunks.length = 0;
        return;
      }
      if (!tooLarge) chunks.push(chunk);
    });
    request.on('end', () => {
      if (tooLarge) {
        reject(Object.assign(new Error('Request is too large.'), { status: 413 }));
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(Object.assign(new Error('Request body must be valid JSON.'), { status: 400 }));
      }
    });
    request.on('error', reject);
  });
}

function isSameOriginRequest(request) {
  const origin = request.headers.origin;
  const host = request.headers.host;
  if (typeof origin !== 'string' || typeof host !== 'string') return false;

  try {
    const parsed = new URL(origin);
    const protocol = request.socket?.encrypted ? 'https:' : 'http:';
    return parsed.origin === origin && parsed.protocol === protocol && parsed.host === host;
  } catch {
    return false;
  }
}

function createHandler({ sarvamApiKey }) {
  const sarvam = sarvamApiKey ? new SarvamAIClient({ apiSubscriptionKey: sarvamApiKey }) : null;

  return async (request, response) => {
    if (request.method !== 'POST') {
      response.setHeader('Allow', 'POST');
      sendJson(response, 405, { error: 'Use POST to generate Hindi or Tamil narration.' });
      return;
    }
    if (!isSameOriginRequest(request)) {
      sendJson(response, 403, { error: 'Narration requests must come from this site.' });
      return;
    }
    if (request.headers['content-type']?.split(';', 1)[0].trim().toLowerCase() !== 'application/json') {
      sendJson(response, 415, { error: 'Narration requests must use application/json.' });
      return;
    }
    if (!sarvam) {
      sendJson(response, 503, { error: 'Hindi and Tamil narration are not configured. Add SARVAM_API_KEY to .env.local and restart the server.' });
      return;
    }

    let body;
    try {
      body = await readJson(request);
    } catch (error) {
      sendJson(response, error.status || 400, { error: error.status ? error.message : 'Could not read the request body.' });
      return;
    }

    const text = typeof body?.text === 'string' ? body.text.trim() : '';
    const rate = body?.rate === undefined ? 1 : body.rate;
    const language = body?.language;
    if (!supportedLanguages.has(language) || Object.hasOwn(body || {}, 'voiceId') || !text ||
        text.length > maxTextLength || !Number.isFinite(rate) || rate < 0.7 || rate > 1.2) {
      sendJson(response, 400, { error: `Hindi and Tamil narration support text up to ${maxTextLength} characters and a speed from 0.7 to 1.2.` });
      return;
    }

    try {
      const translation = await sarvam.text.translate({
        input: text,
        source_language_code: 'en-IN',
        target_language_code: language,
        model: 'mayura:v1',
      });
      const translatedText = translation.translated_text?.trim();
      if (!translatedText) {
        sendJson(response, 502, { error: `Sarvam returned no ${language === 'hi-IN' ? 'Hindi' : 'Tamil'} translation for this narration.` });
        return;
      }
      const result = await sarvam.textToSpeech.convert({
        text: translatedText,
        language_code: language,
        model: 'bulbul:v3',
        pace: rate,
        output_audio_codec: 'mp3',
      });
      const audio = Buffer.from(result.audios?.[0] || '', 'base64');
      if (!audio.length) {
        sendJson(response, 502, { error: 'Sarvam returned no narration audio.' });
        return;
      }
      response.statusCode = 200;
      response.setHeader('Content-Type', 'audio/mpeg');
      response.setHeader('Cache-Control', 'no-store');
      response.end(audio);
    } catch (error) {
      const status = Number.isInteger(error.statusCode) ? error.statusCode : 502;
      const message = status === 401 || status === 403
        ? 'Sarvam could not authenticate. Check the API key and its access.'
        : status === 402
          ? 'The Sarvam account has no credits remaining. Add credits or use a key from an account with credits, then try again.'
        : status === 429
          ? 'Sarvam is at its current usage limit. Please wait and try again.'
          : 'Sarvam could not translate or generate narration. Check API access and try again.';
      sendJson(response, status >= 500 ? 502 : status, { error: message });
    }
  };
}

export default function sarvamNarration(config) {
  const handler = createHandler(config);
  return {
    name: 'kaal-darpan-sarvam-narration',
    configureServer(server) {
      server.middlewares.use('/api/narration', handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/narration', handler);
    },
  };
}
