import { SYSTEM_PROMPT } from "./epitaphPrompt";

export type Intention = { what: string; progress: string; when: string; why: string };
export type Epitaph = { deceased: string; lived: string; epitaph: string; cause: string };
export type Result = { best: Epitaph; others: Epitaph[]; source: "ai" | "fallback"; note: string };

const clean = (s: string, max: number) =>
  (s ?? "")
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "")
    .replace(/(\+?91[\s-]?)?\b\d{5}[\s-]?\d{5}\b/g, "")
    .replace(/[<>{}`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

// Mockery / second-person guard. Any candidate matching this is rejected.
const BAD = /\b(lazy|quitter|loser|stupid|dumb|pathetic|useless|idiot|procrastinat\w*|you|your|yours|you're)\b/i;

function valid(e?: Epitaph): boolean {
  if (!e) return false;
  const { deceased, lived, epitaph, cause } = e;
  if (![deceased, lived, epitaph, cause].every((s) => typeof s === "string" && s.length > 0)) return false;
  if (epitaph.length < 40 || epitaph.length > 300) return false;
  if (deceased.length > 70 || lived.length > 70 || cause.length > 60) return false;
  return !BAD.test(`${deceased} ${lived} ${epitaph} ${cause}`);
}

const E = {
  type: "OBJECT",
  properties: {
    deceased: { type: "STRING" }, lived: { type: "STRING" },
    epitaph: { type: "STRING" }, cause: { type: "STRING" },
  },
  required: ["deceased", "lived", "epitaph", "cause"],
};
const SCHEMA = {
  type: "OBJECT",
  properties: { candidates: { type: "ARRAY", items: E }, best: { type: "INTEGER" } },
  required: ["candidates", "best"],
};

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function callGemini(userText: string) {
  const models = [process.env.GEMINI_MODEL, process.env.GEMINI_FALLBACK_MODEL].filter(Boolean) as string[];
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ parts: [{ text: userText }] }],
    generationConfig: {
      temperature: 1, maxOutputTokens: 8192,
      responseMimeType: "application/json", responseSchema: SCHEMA,
    },
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
          signal: AbortSignal.timeout(15000),
        });
        if (r.ok) {
          const j = await r.json();
          const parts: { text?: string }[] = j.candidates?.[0]?.content?.parts ?? [];
          try {
            return JSON.parse(parts.map((p) => p.text ?? "").join(""));
          } catch {
            last = `${model} bad JSON (finish: ${j.candidates?.[0]?.finishReason})`;
            continue;
          }
        }
        last = `${model} ${r.status}: ${(await r.text()).replace(/\s+/g, " ").slice(0, 160)}`;
        if (r.status === 429 || ![500, 503].includes(r.status)) break; // don't wait on quota errors
      } catch {
        last = `${model} timed out or network error`;
      }
      await sleep(2000);
    }
  }
  throw new Error(last);
}

const FALLBACKS: ((i: Intention) => string)[] = [
  (i) => `Reached ${i.progress} by ${i.when}, and was never heard from again. Reported cause: ${i.why}. The bookmark remains.`,
  (i) => `Carried great ambitions, ${i.progress} of them realised. Death came ${i.when}. Cause: ${i.why}. The intention itself is not confirmed dead.`,
  (i) => `Began with enthusiasm and ended at ${i.progress}. Final status as of ${i.when}: paused indefinitely. Reason on file: ${i.why}.`,
  (i) => `Survived until ${i.progress}. Mourned by one browser tab. Cause on record: ${i.why}.`,
];

function fallback(i: Intention): Epitaph {
  const f = { what: i.what || "An Unnamed Intention", progress: i.progress || "the first page", when: i.when || "some time ago", why: i.why || "unknown causes" };
  return {
    deceased: f.what.slice(0, 60),
    lived: `Died ${f.when} · ${f.progress}`.slice(0, 60),
    epitaph: FALLBACKS[(f.what.length + f.why.length) % FALLBACKS.length](f),
    cause: f.why.slice(0, 50),
  };
}

export async function generateEpitaph(raw: Intention): Promise<Result> {
  const i: Intention = {
    what: clean(raw.what, 120), progress: clean(raw.progress, 80),
    when: clean(raw.when, 40), why: clean(raw.why, 120),
  };
  const today = new Date().toISOString().slice(0, 10);
  const userText = `Today's date: ${today}\n<intention>\nwhat=${i.what}\nprogress=${i.progress}\nwhen=${i.when}\nwhy=${i.why}\n</intention>\nWrite 3 candidates and pick the best.`;
  try {
    const out = await callGemini(userText);
    const cands: Epitaph[] = (out.candidates ?? []).map((c: Epitaph) => ({
      deceased: String(c.deceased ?? "").trim(), lived: String(c.lived ?? "").trim(),
      epitaph: String(c.epitaph ?? "").trim(), cause: String(c.cause ?? "").trim(),
    }));
    const ok = cands.filter(valid);
    if (!ok.length) throw new Error("no candidate passed checks");
    const pick = valid(cands[out.best]) ? cands[out.best] : ok[0];
    return { best: pick, others: ok.filter((c) => c !== pick), source: "ai", note: `${ok.length}/${cands.length} passed checks` };
  } catch (e) {
    return { best: fallback(i), others: [], source: "fallback", note: String(e) };
  }
}