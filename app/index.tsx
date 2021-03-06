import React, { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import * as qs from "query-string"
import classNames from "classnames"
import copy from "copy-to-clipboard"
import { SnackBarProvider } from "./components/SnackBarProvider"
import LZString from "lz-string"

function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  return debouncedValue
}

const env: string = process.env.NODE_ENV!
const siteRoot =
  env === "production"
    ? `https://${window.location.hostname}`
    : "https://notion-chart.netlify.app"

class Endpoints {
  static readonly render = siteRoot + "/.netlify/functions/render"
  static readonly hydrateSpec = siteRoot + "/.netlify/functions/hydrate-spec"
}

function useLocalStorage(
  key: string,
  initialValue: string
): [string, (newValue: string) => void] {
  const [value, setValue] = useState(
    () => window.localStorage.getItem(key) ?? initialValue
  )

  return [
    value,
    (newValue: string) => {
      window.localStorage.setItem(key, newValue)
      setValue(newValue)
    },
  ]
}

function RefreshButton({ onClick }: { onClick: () => void }) {
  const [animating, setAnimating] = useState(false)

  const className = classNames("button refresh-button", {
    "rotate-anim": animating,
  })

  return (
    <div
      className={className}
      onClick={() => {
        onClick()
        setAnimating(true)
      }}
      onAnimationEnd={() => {
        setAnimating(false)
      }}
    >
      🔄
    </div>
  )
}

async function hydrateSpec(databaseId: string, spec: string) {
  const url = `${Endpoints.hydrateSpec}?${qs.stringify({
    database_id: databaseId,
    spec,
  })}`
  const response = await fetch(url)
  return await response.json()
}

function makeVegaEditorUrl(specString: string) {
  // https://github.com/vega/editor/blob/dfa71a1e2242e5ff279549dc96900b585717245d/src/components/header/share-modal/renderer.tsx#L63
  const serializedSpec = LZString.compressToEncodedURIComponent(specString)
  return `https://vega.github.io/editor/#/url/vega-lite/${serializedSpec}`
}

function App() {
  const [ts, setTs] = useState<number | undefined>(undefined)

  const [renderUrl, setRenderUrl] = useLocalStorage(
    "render_url",
    Endpoints.render + "?"
  )

  const renderUrlParams = qs.parse(renderUrl.split("?")[1] ?? "") as Record<
    string,
    string
  >
  const databaseId = renderUrlParams["database_id"] ?? ""
  const spec = renderUrlParams["spec"] ?? ""

  const renderUrlParamSetter = (name: string) => (value: string) => {
    setRenderUrl(
      Endpoints.render +
        "?" +
        qs.stringify({
          ...renderUrlParams,
          [name]: value,
        })
    )
  }
  const setDatabaseId = renderUrlParamSetter("database_id")
  const setSpec = renderUrlParamSetter("spec")

  const renderUrlToShow =
    useDebounce(renderUrl, 300) + (ts ? `&ts=${encodeURIComponent(ts)}` : "")

  return (
    <div className="container">
      <div className="form-container">
        <input
          type="text"
          placeholder="Database ID"
          value={databaseId}
          onChange={(e) => setDatabaseId(e.currentTarget.value)}
        />
        <textarea
          value={spec}
          onChange={(e) => setSpec(e.currentTarget.value)}
        />
        <input
          type="text"
          value={renderUrl}
          onChange={(e) => setRenderUrl(e.currentTarget.value)}
          onFocus={(e) => e.target.select()}
        />
        <a
          href="#"
          onClick={async (e) => {
            e.preventDefault()
            const { data, ...other } = await hydrateSpec(databaseId, spec)
            // Move data to the end of the JSON object, makes it easier to edit.
            other["data"] = data
            const url = makeVegaEditorUrl(JSON.stringify(other))
            window.open(url)
          }}
        >
          Open in Vega Editor &rarr;
        </a>
      </div>
      <div className="chart-container">
        <RefreshButton
          onClick={() => {
            setTs(new Date().getTime()) // Cache-bust
          }}
        />
        <div>
          <SnackBarProvider>
            {({ snackBarFromClick }) => (
              <img
                src={renderUrlToShow}
                style={{ cursor: "pointer" }}
                onClick={(event) => {
                  snackBarFromClick(event, "Copied to clipboard!")
                  copy(renderUrl)
                }}
              />
            )}
          </SnackBarProvider>
        </div>
      </div>
    </div>
  )
}

const container = document.getElementById("app")
const root = createRoot(container!)
root.render(<App />)
