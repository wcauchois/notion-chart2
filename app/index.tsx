import React, { useState } from "react"
import { createRoot } from "react-dom/client"
import * as qs from "query-string"
import { useDebounce } from "use-debounce"

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

function App() {
  const [databaseId, setDatabaseId] = useLocalStorage("database_id", "")
  const [spec, setSpec] = useLocalStorage("spec", "")

  const renderUrl = `${renderEndpoint}?${qs.stringify({
    database_id: databaseId,
    spec,
  })}`
  const [debouncedRenderUrl] = useDebounce(renderUrl, 500)

  return (
    <div>
      <div>
        <input
          type="text"
          value={databaseId}
          onChange={(e) => setDatabaseId(e.currentTarget.value)}
        />
        <textarea
          value={spec}
          onChange={(e) => setSpec(e.currentTarget.value)}
        />
      </div>
      <div>
        <img src={debouncedRenderUrl} />
      </div>
    </div>
  )
}

const container = document.getElementById("app")
const root = createRoot(container!)
root.render(<App />)
