const STORAGE_KEY = "tubechat_visited_videos";
const FREE_LIMIT = 2;

function getVisitedVideoIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setVisitedVideoIds(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function recordVideoVisit(videoId: string) {
  const visited = getVisitedVideoIds();
  if (!visited.includes(videoId)) {
    visited.push(videoId);
    setVisitedVideoIds(visited);
  }
}

export function isVideoVisited(videoId: string): boolean {
  return getVisitedVideoIds().includes(videoId);
}

export function hasExceededFreeLimit(): boolean {
  return getVisitedVideoIds().length >= FREE_LIMIT;
}

export function getRemainingFreeChats(): number {
  return Math.max(0, FREE_LIMIT - getVisitedVideoIds().length);
}
