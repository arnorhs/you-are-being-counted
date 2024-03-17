import { column, defineDb, defineTable, sql } from 'astro:db'

const Hits = defineTable({
  columns: {
    dtCreated: column.date({
      default: sql`CURRENT_TIMESTAMP`,
    }),
    dateKey: column.text(),
    path: column.text(),
    hits: column.number(),
  },
  indexes: {
    pathDateKey: {
      unique: true,
      on: ['path', 'dateKey'],
    },
    createdDate: {
      on: 'dtCreated',
    },
  },
})

// https://astro.build/db/config
export default defineDb({
  tables: {
    Hits,
  },
})
