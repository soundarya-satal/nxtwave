const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function askGemini(system: string, user: string, schema: object) {
  const models = [process.env.GEMINI_MODEL, process.env.GEMINI_FALLBACK_MODEL].filter(Boolean) as string[];
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ parts: [{ text: user }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 8192, responseMimeType: "application/json", responseSchema: schema },
  });
  let last = "";
  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    for (let n = 0; n < 2; n++) {
      try {
        const r = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY! },
          body,
          signal: AbortSignal.timeout(25000),
        });
        if (r.ok) {
          const j = await r.json();
          const parts: { text?: string }[] = j.candidates?.[0]?.content?.parts ?? [];
          try { return JSON.parse(parts.map((p) => p.text ?? "").join("")); }
          catch { last = `${model} bad JSON`; continue; }
        }
        last = `${model} ${r.status}`;
        if (r.status === 429 || ![500, 503].includes(r.status)) break;
      } catch {
        last = `${model} timeout`;
      }
      await sleep(2000);
    }
  }
  throw new Error(last);
}