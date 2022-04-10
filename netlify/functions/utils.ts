import { Client } from "@notionhq/client"
import { QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints"

export type ValueType = string | number | null

export interface DatabaseRow {
  id: string
  properties: Array<[string, ValueType]>
}

const NotMapped = Symbol("NotMapped")

function resultToRow(result: QueryDatabaseResponse["results"][0]): DatabaseRow {
  if (result.object === "page") {
    result.object
  }
  return {
    id: result.id,
    properties:
      "properties" in result
        ? Object.entries(result.properties).flatMap(([key, value]) => {
            let mappedValue: ValueType | typeof NotMapped = NotMapped
            if (value.type === "title" || value.type === "rich_text") {
              const tokens =
                value.type === "title" ? value.title : value.rich_text
              mappedValue = tokens.map((token) => token.plain_text).join(" ")
            } else if (value.type === "number") {
              mappedValue = value.number
            } else if (value.type === "multi_select") {
              mappedValue =
                value.multi_select.length > 0
                  ? value.multi_select[0].name
                  : null
            }
            return mappedValue !== NotMapped ? [[key, mappedValue]] : []
          })
        : [],
  }
}

export async function getDatabaseRows(databaseId: string) {
  const notion = new Client({
    auth: process.env.NOTION_TOKEN,
  })

  let rows: DatabaseRow[] = []
  let nextCursor: string | undefined = undefined
  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 100,
      start_cursor: nextCursor,
    })
    rows.push(...response.results.map(resultToRow))
  } while (nextCursor)

  return rows
}
