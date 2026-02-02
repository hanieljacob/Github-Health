import { useCallback, useEffect, useState } from "react"

interface Size {
  width: number
  height: number
}

export function useResizeObserver<T extends HTMLElement>() {
  const [node, setNode] = useState<T | null>(null)
  const [size, setSize] = useState<Size>({ width: 0, height: 0 })

  const ref = useCallback((element: T | null) => {
    setNode(element)
  }, [])

  useEffect(() => {
    if (!node) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      setSize({
        width: Math.round(width),
        height: Math.round(height),
      })
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [node])

  return { ref, size }
}
