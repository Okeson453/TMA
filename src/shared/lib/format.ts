export function formatRelativeTime(isoString?: string): string {
  if (!isoString) return 'Never';
  const now = Date.now();
  const date = new Date(isoString).getTime();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function parseCookieSummary(cookieString: string): { cUser?: string; count: number; hasXs: boolean; hasDatr: boolean } {
  if (!cookieString) return { count: 0, hasXs: false, hasDatr: false };
  const parts = cookieString.split(';').map((p) => p.trim()).filter(Boolean);
  let cUser: string | undefined;
  let hasXs = false;
  let hasDatr = false;

  for (const part of parts) {
    if (part.startsWith('c_user=')) {
      cUser = part.substring(7);
    } else if (part.startsWith('xs=')) {
      hasXs = true;
    } else if (part.startsWith('datr=')) {
      hasDatr = true;
    }
  }

  return {
    cUser,
    count: parts.length,
    hasXs,
    hasDatr,
  };
}
