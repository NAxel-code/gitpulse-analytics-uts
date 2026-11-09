export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '/api';

export const GITHUB_API_URL = `${API_BASE_URL}/github`;
export const AI_API_URL = `${API_BASE_URL}/ai`;
export const LEADERBOARD_API_URL = `${GITHUB_API_URL}/leaderboard`;
