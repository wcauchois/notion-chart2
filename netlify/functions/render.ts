import { Handler } from "@netlify/functions"
import { z } from "zod"
import { getDatabaseRows } from "./utils"
import * as vega from "vega"
import * as vegaLite from "vega-lite"

const paramSchema = z.object({
  database_id: z.string(),
  spec: z.string(),
})

const handlerInner: Handler = async (event, context) => {
  const params = paramSchema.parse(event.queryStringParameters ?? {})
  const rows = await getDatabaseRows(params.database_id)
  const transformedRows = rows.map((row) => Object.fromEntries(row.properties))
  const parsedSpec = JSON.parse(params.spec)
  const spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: {
      values: transformedRows,
    },
    ...parsedSpec,
  }

  const vegaSpec = vegaLite.compile(spec as any).spec
  const view = new vega.View(vega.parse(vegaSpec), { renderer: "none" })

  const svg = await view.toSVG()

  return {
    statusCode: 200,
    body: svg,
    headers: {
      "Content-Type": "image/svg+xml",
    },
  }
}

const handler: Handler = async (event, context) => {
  // TODO: catch error and convert to image?
  return (await handlerInner(event, context))!
}

export { handler }
