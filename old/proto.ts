// prototype code

import * as vega from "vega"
import * as vegaLite from "vega-lite"

const spec = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  data: {
    values: [
      { a: "C", b: 2 },
      { a: "C", b: 7 },
      { a: "C", b: 4 },
      { a: "D", b: 1 },
      { a: "D", b: 2 },
      { a: "D", b: 6 },
      { a: "E", b: 8 },
      { a: "E", b: 4 },
      { a: "E", b: 7 },
    ],
  },
  mark: "point",
  encoding: {
    x: {
      field: "a",
      type: "nominal",
    },
    y: {
      field: "b",
      type: "quantitative",
    },
  },
}

const vegaSpec = vegaLite.compile(spec as any).spec
const view = new vega.View(vega.parse(vegaSpec), { renderer: "none" })

view.toSVG().then((svg) => console.log(svg))
