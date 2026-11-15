// Een bestand uit de openbare bucket (impressies, nieuwsfoto's), ook te gebruiken
// in client components: lib/r2.ts hoort alleen op de server.
export const publiekeUrl = (key: string) =>
  `${(process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL ?? "").replace(/\/$/, "")}/${key}`;
