import { Handler } from "@netlify/functions"
import { hydrateSpecFromQueryParams, paramsSchema } from "./utils"
import * as vega from "vega"
import * as vegaLite from "vega-lite"

const handlerInner: Handler = async (event, context) => {
  const params = paramsSchema.parse(event.queryStringParameters ?? {})
  const hydratedSpec = await hydrateSpecFromQueryParams(params)
  const vegaSpec = vegaLite.compile(hydratedSpec).spec
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
