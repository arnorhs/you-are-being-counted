import { db, Hits, eq, and, gt } from 'astro:db'

export type Period = 'hour' | 'day' | 'week' | 'month' | 'year'

function getFormat(period: Period, today: Date) {
  let dateMask
  let format
  let interval
  switch (period) {
    case 'hour':
      format = 'YYYY-MM-DDTHH-mm'
      interval = 60 * 1000
      dateMask = [0, 0, 0, -1, 0]
      break
    case 'day':
      format = 'YYYY-MM-DDTHH'
      interval = 60 * 60 * 1000
      dateMask = [0, 0, -1, 0, 0]
      break
    case 'week':
    case 'month':
      format = 'YYYY-MM-DD'
      interval = 60 * 60 * 24 * 1000
      dateMask = [0, -1, 0, 0, 0]
      break
    case 'year':
      format = 'YYYY-MM-DD'
      // TODO: use week intervals?
      interval = 60 * 60 * 24 * 1000
      dateMask = [-1, 0, 0, 0, 0]
      break
  }

  return {
    format,
    fromDate: new Date(
      today.getFullYear() + dateMask[0],
      today.getMonth() + dateMask[1],
      today.getDate() + dateMask[2],
      today.getHours() + dateMask[3],
      today.getMinutes() + dateMask[4],
    ),
    interval,
  }
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

  let hits = [] as { thedate: Date; hits: number }[]

  // the loop ends up being inclusive of today, since the time comparison is less fine grained
  // than what we are iterating by - we are ok with for more understandable code
  for (let i = new Date(fromDate); i < today; i = new Date(i.getTime() + interval)) {
    const key = i.toISOString().substring(0, format.length)

    hits.push({ thedate: i, hits: mapped[key] ?? 0 })
  }

  return hits
}
