
export type AutoplayOptions = {
  delay?: number
  pauseOnHover?: boolean
  pauseOnFocus?: boolean
}

/**
 * Pequeno plugin de autoplay para Keen Slider (v6).
 * - Respeita hover/focus (pausa ao interagir).
 * - Evita timers correndo durante drag.
 */
export function autoplayPlugin(options: AutoplayOptions = {}) {
  const { delay = 3500, pauseOnHover = true, pauseOnFocus = true } = options

  return (slider: any) => {
    let timeout: number | undefined
    let mouseOver = false

    function clearNextTimeout() {
      if (timeout) {
        window.clearTimeout(timeout)
        timeout = undefined
      }
    }

    function nextTimeout() {
      clearNextTimeout()
      if (mouseOver) return
      timeout = window.setTimeout(() => {
        slider && slider.next()
      }, delay)
    }

    slider.on("created", () => {
      const container: HTMLElement | null = slider.container
      if (!container) return

      if (pauseOnHover) {
        container.addEventListener("mouseenter", () => {
          mouseOver = true
          clearNextTimeout()
        })
        container.addEventListener("mouseleave", () => {
          mouseOver = false
          nextTimeout()
        })
      }

      if (pauseOnFocus) {
        container.addEventListener("focusin", clearNextTimeout)
        container.addEventListener("focusout", nextTimeout)
      }

      nextTimeout()
    })

    slider.on("dragStarted", clearNextTimeout)
    slider.on("animationEnded", nextTimeout)
    slider.on("updated", nextTimeout)
  }
}
