import { Handler } from "@netlify/functions"

const handler: Handler = async (event, context) => {
  return {
    statusCode: 200,
    body: `hello world. my query parms are: ${JSON.stringify(
      event.queryStringParameters
    )}`,
  }
}

export { handler }
