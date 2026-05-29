const apiKey = process.env.ANTHROPIC_API_KEY;
const model = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';

function extractJson(text) {
  const fullJson = text.trim();
  try {
    return JSON.parse(fullJson);
  } catch (firstError) {
    const match = fullJson.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (secondError) {
        throw new Error('Unable to parse JSON response from Claude');
      }
    }
    throw new Error('No JSON object found in Claude response');
  }
}

async function analyzeTrend(trendName, mentions) {
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const systemMessage = `You are a concise fitness trend analyst. When given a trend name and mention count, respond only with a JSON object (no surrounding text) containing the fields: longevity_days (integer 7-365), sentiment (one of positive|neutral|negative), and content_ideas (array of 3 short strings).`;
  const userMessage = `Trend: ${trendName}\nMentions: ${mentions}\n\nRespond ONLY with valid JSON, no other text.`;

  // Retry logic with exponential backoff for transient errors
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          max_tokens: 500,
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userMessage }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        const err = new Error(`Claude API error: ${response.status} ${errorText}`);
        // Retry on 429 or 5xx
        if ((response.status === 429 || response.status >= 500) && attempt < 2) {
          const waitMs = (attempt + 1) * 1000;
          await new Promise((r) => setTimeout(r, waitMs));
          continue;
        }
        throw err;
      }

      const result = await response.json();

      // Robust extraction of text content from various Anthropic response shapes
      let content = '';
      if (result?.completion?.message?.content && Array.isArray(result.completion.message.content)) {
        const out = result.completion.message.content.find((c) => c.type === 'output_text');
        content = out?.text || '';
      }
      if (!content && typeof result?.output?.text === 'string') content = result.output.text;
      if (!content && typeof result?.content === 'string') content = result.content;

      if (!content) {
        throw new Error('No content in Claude response');
      }

      const parsed = extractJson(content);

      return {
        longevity_days: (() => {
          const n = Number(parsed.longevity_days);
          return Number.isFinite(n) ? Math.max(7, Math.min(365, n)) : 90;
        })(),
        sentiment: String(parsed.sentiment || 'neutral').toLowerCase(),
        content_ideas: Array.isArray(parsed.content_ideas) ? parsed.content_ideas.slice(0, 3) : []
      };
    } catch (error) {
      console.error(`Error analyzing trend "${trendName}" (attempt ${attempt + 1}):`, error.message);
      if (attempt < 2) {
        // Backoff before retry
        await new Promise((r) => setTimeout(r, (attempt + 1) * 1000));
        continue;
      }
      // Return fallback data if all retries fail
      return {
        longevity_days: 90,
        sentiment: 'positive',
        content_ideas: [
          `${trendName} for beginners`,
          `Advanced ${trendName} techniques`,
          `${trendName} transformation stories`
        ]
      };
    }
  }
}

module.exports = { analyzeTrend };
