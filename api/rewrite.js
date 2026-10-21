const MODEL = "inclusionai/ling-3.0-flash-sante-free";
const GATEWAY = "https://ai-gateway.vercel.sh/v1/chat/completions";

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

async function generate(prompt, token) {
  const response = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: "You are an exceptional advertising copywriter and creative director. Output only finished copy, without explanation or quotation marks." },
        { role: "user", content: prompt }
      ],
      temperature: 0.85,
      max_tokens: 700
    }),
    signal: AbortSignal.timeout(45000)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data?.error?.message || data?.message || ("Gateway returned " + response.status);
    const err = new Error(detail);
    err.status = response.status;
    throw err;
  }
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("The model returned an empty answer.");
  return text;
}

module.exports = async (req, res) => {
  if (req.method === "GET") {
    const ready = Boolean(process.env.VERCEL_OIDC_TOKEN || process.env.AI_GATEWAY_API_KEY);
    return json(res, 200, {
      ready,
      model: MODEL,
      message: ready
        ? "Hosted AI is configured."
        : "AI Gateway authentication is not available. Enable Vercel OIDC for this project or set AI_GATEWAY_API_KEY."
    });
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return json(res, 405, { error: "Method not allowed." });
  }
  const token = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;
  if (!token) {
    return json(res, 503, {
      error: "The app is deployed, but hosted AI authentication is not configured yet. Enable Vercel OIDC for the project or add AI_GATEWAY_API_KEY in Vercel Environment Variables."
    });
  }
  const body = req.body || {};
  const source = typeof body.source === "string" ? body.source.trim() : "";
  const mainPrompt = typeof body.mainPrompt === "string" ? body.mainPrompt : "";
  const prompts = Array.isArray(body.prompts) ? body.prompts : [];
  if (!source || !mainPrompt || source.length > 12000 || mainPrompt.length > 20000 || prompts.length !== 3 || prompts.some(p => typeof p !== "string" || p.length > 20000)) {
    return json(res, 400, { error: "Please provide copy under 12,000 characters and three valid rewrite directions." });
  }
  try {
    const [main, ...variants] = await Promise.all([
      generate(mainPrompt, token),
      ...prompts.map(p => generate(p, token))
    ]);
    return json(res, 200, { main, variants, model: MODEL });
  } catch (error) {
    console.error("Copy Rite model error:", error.message);
    const status = error.status === 429 ? 429 : 502;
    return json(res, status, {
      error: error.status === 429
        ? "The free model is temporarily rate-limited. Wait a moment and try again."
        : "The hosted model could not complete this rewrite. " + error.message
    });
  }
};