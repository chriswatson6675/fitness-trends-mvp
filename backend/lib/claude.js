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

async function analyzetrend(trendName, mentions) {
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const systemMessage = `You are a concise fitness trend analyst. When given a trend name and mention count, respond only with a JSON object (no surrounding text) containing the fields: longevity_days (integer 7-365), sentiment (one of positive|neutral|negative), and content_ideas (array of 3 short strings).`;
  const userMessage = `Trend: ${trendName}\nMentions: ${mentions}\n\nRespond ONLY with valid JSON, no other text.`;

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
          { role: 'user', content: userMessage }
        ],
        system: systemMessage
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();

    // Extract content from response
    let content = '';
    if (result.content && Array.isArray(result.content) && result.content[0]) {
      content = result.content[0].text || '';
    } else if (result.content) {
      content = result.content;
    }

    if (!content) {
      throw new Error('No content in Claude response');
    }

    const parsed = extractJson(content);

    return {
      longevity_days: Math.max(7, Math.min(365, Number(parsed.longevity_days) || 90)),
      sentiment: String(parsed.sentiment || 'neutral').toLowerCase(),
      content_ideas: Array.isArray(parsed.content_ideas) ? parsed.content_ideas.slice(0, 3) : []
    };
  } catch (error) {
    console.error(`Error analyzing trend "${trendName}":`, error.message);
    // Return fallback data if Claude fails
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

module.exports = { analyzetrend };
