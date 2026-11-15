// YouTube-links: de id eruit halen en de thumbnail erbij (gedeeld door browser en server)

// youtu.be/ID, watch?v=ID, shorts/ID, embed/ID, live/ID, of alleen de id
export function youtubeId(link: string): string | null {
  const s = link.trim();
  const m = s.match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/|\/live\/)([A-Za-z0-9_-]{11})/) ?? s.match(/^([A-Za-z0-9_-]{11})$/);
  return m?.[1] ?? null;
}

export const youtubeThumb = (id: string) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
