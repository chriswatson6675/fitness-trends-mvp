const CHAT_URL = 'https://api.anthropic.com/v1/chat/completions';
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

  const systemMessage = `You are a concise fitness trend analyst. When given a trend name and mention count, respond only with a JSON object (no surrounding text) containing the fields: longevity_days (integer), sentiment (one of positive|neutral|negative), and content_ideas (array of 3 short strings).`;

  const userMessage = `Trend: ${trendName}\nMentions: ${mentions}`;

  const body = {
    model,
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage }
    ],
    max_tokens: 500,
    temperature: 0.25
  };

  const response = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`Claude API error: ${response.status} ${txt}`);
  }

  const result = await response.json();
  // Support both chat-style and legacy fields
  let content = '';
  try {
    if (result.choices && result.choices[0] && result.choices[0].message) {
      content = result.choices[0].message.content || '';
    } else if (result.completion) {
      content = result.completion;
    } else if (result.output) {
      content = result.output;
    } else if (typeof result === 'string') {
      content = result;
    }
  } catch (err) {
    throw new Error('Unable to read Claude response');
  }

  const parsed = extractJson(content);

  return {
    longevity_days: Number(parsed.longevity_days) || 0,
    sentiment: String(parsed.sentiment || 'neutral'),
    content_ideas: Array.isArray(parsed.content_ideas) ? parsed.content_ideas : []
  };
}

module.exports = { analyzetrend };
