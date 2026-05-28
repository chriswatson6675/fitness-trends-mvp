// API client for communicating with backend

const PORTS_TO_CHECK = [3001, 3002, 3003, 3004, 3005];
let cachedBackendUrl = null;
let backendProbePromise = null;

async function probeBackend(port) {
  try {
    const url = `http://localhost:${port}`;
    const response = await fetch(`${url}/api/health`, { cache: 'no-store' });
    if (response.ok) {
      return url;
    }
  } catch (error) {
    // ignore and return undefined
  }
  return undefined;
}

export async function detectBackendUrl() {
  if (cachedBackendUrl) {
    return cachedBackendUrl;
  }

  if (backendProbePromise) {
    return backendProbePromise;
  }

  backendProbePromise = (async () => {
    for (const port of PORTS_TO_CHECK) {
      const url = await probeBackend(port);
      if (url) {
        cachedBackendUrl = url;
        return url;
      }
    }
    return null;
  })();

  const url = await backendProbePromise;
  backendProbePromise = null;
  return url;
}

async function getBackendUrl() {
  const url = await detectBackendUrl();
  if (!url) {
    throw new Error('Backend not found on ports 3001-3005');
  }
  return url;
}

export async function fetchTrends(limit = 10, platform = null, region = 'GB') {
  try {
    const baseUrl = await getBackendUrl();
    const url = new URL(`${baseUrl}/api/trends`);
    url.searchParams.append('limit', limit);
    if (platform) url.searchParams.append('platform', platform);
    if (region) url.searchParams.append('region', region);

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const payload = await response.json();
    return {
      data: payload.data || payload.trends || [],
      region: payload.region || region,
      error: payload.error || null,
    };
  } catch (error) {
    console.error('Error fetching trends:', error);
    return { data: [], region, error: error.message };
  }
}

export async function analyzeTrend(trendName, mentionsToday, mentionsYesterday = 0, platform = 'youtube') {
  try {
    const baseUrl = await getBackendUrl();
    const response = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trend_name: trendName,
        mentions_today: mentionsToday,
        mentions_yesterday: mentionsYesterday,
        platform,
      }),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error analyzing trend:', error);
    return { error: error.message };
  }
}

export async function checkHealth() {
  try {
    const baseUrl = await getBackendUrl();
    const response = await fetch(`${baseUrl}/api/health`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error checking health:', error);
    return { status: 'offline', error: error.message };
  }
}
