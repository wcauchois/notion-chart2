import React, { useState } from "react"
import { createRoot } from "react-dom/client"
import * as qs from "query-string"
import { useDebounce } from "use-debounce"
import classNames from "classnames"
import copy from "copy-to-clipboard"

const env: string = process.env.NODE_ENV!
const siteRoot =
  env === "production" ? "" : "https://lovely-biscotti-ad161b.netlify.app"
const renderEndpoint = siteRoot + "/.netlify/functions/render"

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

function App() {
  const [databaseId, setDatabaseId] = useLocalStorage("database_id", "")
  const [spec, setSpec] = useLocalStorage("spec", "")
  const [ts, setTs] = useState<number | undefined>(undefined)

  const renderUrl = `${renderEndpoint}?${qs.stringify({
    database_id: databaseId,
    spec,
    ts,
  })}`
  const [debouncedRenderUrl] = useDebounce(renderUrl, 500)

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
      </div>
      <div className="chart-container">
        <RefreshButton
          onClick={() => {
            setTs(new Date().getTime()) // Cache-bust
          }}
        />
        <div>
          <img src={debouncedRenderUrl} />
        </div>
      </div>
    </div>
  )
}

const container = document.getElementById("app")
const root = createRoot(container!)
root.render(<App />)
