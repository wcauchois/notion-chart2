import React, { ReactNode, useState } from "react"
import ReactDOM from "react-dom"

interface SnackBarProps {
  top: number
  left: number
  text: string
  onDone(): void
}

function SnackBar({ top, left, text, onDone }: SnackBarProps) {
  return (
    <div
      className="snackbar"
      style={{ left, top }}
      onAnimationEnd={() => {
        onDone()
      }}
    >
      {text}
    </div>
  )
}

export function SnackBarProvider({
  children,
}: {
  children(args: {
    snackBarFromClick(event: React.MouseEvent, text: string): void
  }): ReactNode
}) {
  const [snackBars, setSnackBars] = useState<
    Array<Omit<SnackBarProps, "onDone"> & { id: string }>
  >([])

  return (
    <>
      {children({
        snackBarFromClick(event, text) {
          setSnackBars([
            ...snackBars,
            {
              top: event.clientY + 10,
              left: event.clientX + 10,
              id: `ts-${new Date().getTime()}`,
              text,
            },
          ])
        },
      })}
      {ReactDOM.createPortal(
        <>
          {snackBars.map((snackBarProps) => (
            <SnackBar
              key={snackBarProps.id}
              {...snackBarProps}
              onDone={() => {
                setSnackBars(
                  snackBars.filter((sb) => sb.id !== snackBarProps.id)
                )
              }}
            />
          ))}
        </>,
        document.body
      )}
    </>
  )
}
