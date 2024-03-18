import { db, Hits, sql } from 'astro:db'

export async function recordHits(path: string, date: Date) {
  // including the minutes
  const dateKey = date.toISOString().substring(0, 16)
  return db
    .insert(Hits)
    .values({ dateKey, hits: 1, path, dtCreated: date })
    .onConflictDoUpdate({
      target: [Hits.dateKey, Hits.path],
      set: { hits: sql`(hits + 1)` },
    })
    .execute()
}
