import { db, Hits, sql, eq, and, gt, gte } from 'astro:db'

export type Period = 'hour' | 'day' | 'week' | 'month' | 'year'

function getFormat(period: Period, today: Date) {
  let format
  let fromDate
  let interval
  switch (period) {
    case 'hour':
      format = 'YYYY-MM-DDTHH-mm'
      interval = 60 * 1000
      fromDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        today.getHours() - 1,
        today.getMinutes(),
      )
      break
    case 'day':
      format = 'YYYY-MM-DDTHH'
      interval = 60 * 60 * 1000
      fromDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 1,
        today.getHours(),
      )
      break
    case 'week':
    case 'month':
      format = 'YYYY-MM-DD'
      interval = 60 * 60 * 24 * 1000
      fromDate = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        today.getDate(),
        today.getHours(),
      )
      break
    case 'year':
      format = 'YYYY-MM-DD'
      // TODO: use week intervals?
      interval = 60 * 60 * 24 * 1000
      fromDate = new Date(
        today.getFullYear() - 1,
        today.getMonth(),
        today.getDate(),
        today.getHours(),
      )
      break
  }

  return { format, fromDate, interval }
}

export async function queryHits(path: string, period: Period, today: Date) {
  const { format, fromDate, interval } = getFormat(period, today)

  const hitsRows = await db
    .select({
      dateKey: Hits.dateKey,
      hits: Hits.hits,
    })
    .from(Hits)
    .where(and(eq(Hits.path, path), gt(Hits.dtCreated, fromDate)))

  const mapped = hitsRows.reduce(
    (acc, hit) => {
      const key = hit.dateKey.substring(0, format.length)
      acc[key] = (acc[key] ?? 0) + hit.hits

      return acc
    },
    {} as { [key: string]: number },
  )

  let hits = [] as { thedate: string; hits: number }[]

  // the loop ends up being inclusive of today, since the time comparison is less fine grained
  // than what we are iterating by - we are ok with for more understandable code
  for (let i = new Date(fromDate); i < today; i.setTime(i.getTime() + interval)) {
    const key = i.toISOString().substring(0, format.length)

    hits.push({ thedate: key, hits: mapped[key] ?? 0 })
  }

  const max = Math.max(...hits.map((hit) => hit.hits), 0)

  return { hits, max }
}
