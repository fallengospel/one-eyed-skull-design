import { useEffect, useRef, useState } from 'react'

/**
 * Reveal-on-scroll: returns [ref, visible]. Element fades/slides in the
 * first time it enters the viewport, then disconnects.
 */
export function useScrollReveal({ threshold = 0.15, rootMargin = '0px 0px -40px 0px' } = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold, rootMargin }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold, rootMargin])

  return [ref, visible]
}

/**
 * Declarative wrapper: <Reveal delay={120}>content</Reveal>
 */
export function Reveal({ children, delay = 0, className = '', as = 'div', style, ...rest }) {
  const Tag = as
  const [ref, visible] = useScrollReveal()
  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
