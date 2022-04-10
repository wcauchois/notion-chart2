import { Handler } from "@netlify/functions"
import { hydrateSpecFromQueryParams, paramsSchema } from "./utils"

const handler: Handler = async (event, context) => {
  const params = paramsSchema.parse(event.queryStringParameters ?? {})
  const hydratedSpec = await hydrateSpecFromQueryParams(params)
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      ...(event.headers.origin === "https://localhost:8080"
        ? {
            "Access-Control-Allow-Origin": event.headers.origin,
          }
        : {}),
    },
    body: JSON.stringify(hydratedSpec),
  }
}

export { handler }
