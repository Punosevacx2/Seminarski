// src/scripts/translateOpenAI.ts
import OpenAI from "openai";
import pLimit from "p-limit";
import dotenv from "dotenv";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY nije podešen u okruženju.");
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// smanji konkurentnost da ne dobijaš 429
const CONCURRENCY = 3;

// jednostavan retry za 429/5xx
async function withRetry<T>(fn: () => Promise<T>, tries = 4): Promise<T> {
  let lastErr: any;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e: any) {
      lastErr = e;
      const status = e?.status || e?.response?.status || "";
      // 429 i 5xx backoff
      if (status === 429 || (status >= 500 && status < 600)) {
        const delay = 500 * Math.pow(2, i); // 0.5s, 1s, 2s, 4s
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}

export async function translateBatchOpenAI(texts: string[]): Promise<string[]> {
  const limit = pLimit(CONCURRENCY);

  const jobs = texts.map((q, idx) =>
    limit(async () => {
      if (!q) return "";
      try {
        const resp = await withRetry(() =>
          openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0,
            messages: [
              {
                role: "system",
                content:
                  "You are a precise culinary translator. Translate into Serbian Latin (sr-Latn). Keep measurements, numbers, units, and ingredient names consistent; prefer common Serbian cooking terms. Return ONLY the translated text, no quotes or extra text.",
              },
              { role: "user", content: q },
            ],
          })
        );

        const out = resp.choices?.[0]?.message?.content?.trim() ?? "";
        if (!out) {
          console.warn(`[OpenAI] Prazan odgovor za item ${idx}. Vraćam original.`);
          return q;
        }
        return out;
      } catch (err: any) {
        const code = err?.code || err?.response?.status || "ERR";
        console.warn(`[OpenAI] Greška (${code}) za item ${idx}. Vraćam original.`);
        return q;
      }
    })
  );

  return Promise.all(jobs);
}
