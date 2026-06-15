import { ApiError } from '../../utils/ApiError.js';

const DEFAULT_NESHAN_BASE_URL = 'https://api.neshan.org';
const DEFAULT_TIMEOUT_MS = 8000;

const getNeshanApiKey = () => {
  return process.env.NESHAN_API_KEY?.trim() || null;
};

export const hasNeshanApiKey = () => Boolean(getNeshanApiKey());

export const callNeshanApi = async ({ path, queryParams = {} }) => {
  const apiKey = getNeshanApiKey();

  if (!apiKey) {
    throw new ApiError(500, 'Neshan API key is not configured', 'NESHAN_API_KEY_MISSING');
  }

  const baseUrl = process.env.NESHAN_BASE_URL?.trim() || DEFAULT_NESHAN_BASE_URL;
  const url = new URL(path, baseUrl);

  for (const [key, value] of Object.entries(queryParams)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  const controller = new AbortController();
  const timeoutMs = Number(process.env.NESHAN_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Api-Key': apiKey,
        Accept: 'application/json'
      },
      signal: controller.signal
    });

    const text = await response.text();
    let data = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
    }

    if (!response.ok) {
      throw new ApiError(
        response.status || 502,
        data?.message || data?.error || 'Neshan API request failed',
        'NESHAN_API_ERROR',
        data
      );
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new ApiError(504, 'Neshan API request timed out', 'NESHAN_API_TIMEOUT');
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(502, 'Could not connect to Neshan API', 'NESHAN_API_UNAVAILABLE');
  } finally {
    clearTimeout(timeout);
  }
};
