const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a security analyst assistant. You will receive a JSON array of raw supply-chain security findings from an automated scanner. For each finding, generate a plain-English explanation and a concrete remediation step.

Respond with ONLY a valid JSON array, no preamble, no markdown code fences, no explanation outside the JSON. Each object in your response array must have exactly these fields:
- "dependencyName": string (copy from the input)
- "plainEnglishExplanation": string (2-3 sentences, understandable by a non-security engineer)
- "remediationSteps": string (1-2 concrete, actionable steps)

Return the objects in the same order as the input findings.`;

async function enrichFindingsWithAI(findings) {
  if (findings.length === 0) {
    return [];
  }

  const userMessage = JSON.stringify(
    findings.map((f) => ({
      type: f.type,
      dependencyName: f.dependencyName,
      severity: f.severity,
      riskScore: f.riskScore,
      reason: f.reason,
    }))
  );

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const rawText = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");

    const cleanedText = rawText.replace(/```json|```/g, "").trim();
    const aiExplanations = JSON.parse(cleanedText);

    return findings.map((finding) => {
      const aiMatch = aiExplanations.find(
        (ai) => ai.dependencyName === finding.dependencyName
      );

      return {
        ...finding,
        plainEnglishExplanation: aiMatch?.plainEnglishExplanation || null,
        remediationSteps: aiMatch?.remediationSteps || null,
      };
    });
  } catch (err) {
    console.error("Claude API enrichment failed:", err.message);

    return findings.map((finding) => ({
      ...finding,
      plainEnglishExplanation: null,
      remediationSteps: null,
    }));
  }
}

module.exports = { enrichFindingsWithAI };