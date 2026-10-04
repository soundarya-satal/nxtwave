export async function GET() {
  const out: Record<string, string> = {};

  try {
    const key = process.env.SUPABASE_SERVICE_KEY!;
    const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    out.supabase = r.ok ? "OK" : `FAIL ${r.status}`;
  } catch (e) {
    out.supabase = "FAIL " + String(e);
  }

  try {
    const r = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY!,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Reply with the single word: OK" }] }],
        }),
      }
    );
    const j = await r.json();
    out.gemini = r.ok
      ? "OK: " + j.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      : `FAIL ${r.status} ${j.error?.message}`;
  } catch (e) {
    out.gemini = "FAIL " + String(e);
  }

  return Response.json(out);
}