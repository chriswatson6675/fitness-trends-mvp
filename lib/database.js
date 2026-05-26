const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
const TABLE_NAME = process.env.SUPABASE_TABLE || 'trends';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('Supabase connection values are not fully configured. getTrends() and saveTrend() will fail until SUPABASE_URL and SUPABASE_ANON_KEY are set.');
}

const headers = {
  apikey: SUPABASE_KEY || '',
  Authorization: SUPABASE_KEY ? `Bearer ${SUPABASE_KEY}` : '',
  'Content-Type': 'application/json',
  Accept: 'application/json'
};

async function saveTrend(trend) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase configuration is missing');
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}`, {
    method: 'POST',
    headers: {
      ...headers,
      Prefer: 'return=minimal'
    },
    body: JSON.stringify(trend)
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase saveTrend failed: ${response.status} ${body}`);
  }

  return true;
}

async function getTrends() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase configuration is missing');
  }

  const url = new URL(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}`);
  url.searchParams.set('select', '*');
  url.searchParams.set('order', 'created_at.desc');
  url.searchParams.set('limit', '10');

  const response = await fetch(url.toString(), {
    headers
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase getTrends failed: ${response.status} ${body}`);
  }

  return response.json();
}

module.exports = { saveTrend, getTrends };
