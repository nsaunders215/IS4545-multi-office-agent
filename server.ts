import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client utility with User-Agent header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

/**
 * Server-side unified LLM caller function.
 * Put all AI calls in one server-side function, callLLM(prompt, data),
 * so the AI provider can be changed later in one place.
 * Uses Gemini with gemini-3.8-flash as default, with automatic retries and fallback.
 */
export async function callLLM(prompt: string, data: any): Promise<any> {
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please check your environment variables.');
  }

  const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  const dataString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const contents = `${prompt}\n\nINPUT DATA:\n${dataString}\n\nCRITICAL: Return ONLY valid JSON meeting the requested format without markdown fences or extraneous commentary.`;

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = (response.text ?? '').trim();
      const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();

      try {
        return JSON.parse(cleaned);
      } catch (parseErr) {
        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
        }
        throw new Error(`Failed to parse agent JSON output: ${text}`);
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} failed, trying next model:`, err?.message || err);
      // Brief pause before trying fallback model
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
  }

  throw new Error(`Agent call failed: ${lastError?.message || lastError}`);
}

app.post('/api/agent/run', async (req, res) => {
  try {
    const { agentId, prompt, data } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Missing prompt' });
    }
    const result = await callLLM(prompt, data);
    res.json({ success: true, result, agentId });
  } catch (err: any) {
    console.error(`Agent call error [${req.body.agentId}]:`, err);
    res.status(500).json({ success: false, error: err.message || 'Internal AI Error' });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey),
    timestamp: new Date().toISOString()
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Hospital Intelligence System server running on http://0.0.0.0:${port}`);
  });
}

startServer();
