'use client'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef, useState, useEffect } from 'react'
import { ScrambleText } from '@/components/animations/ScrambleText'
import { cx } from '@/libs/utils/className'
import { usePreloader } from '@/providers/PreloaderProvider'

// NOTE: org-module id: 906928
// import '@/lib/setup'
// NOTE: org-module id: 213332

export function Preloader() {
  const { phase, setPhase, isInitialLoad } = usePreloader()
  const wrapperRef = useRef(null)
  const containerRef = useRef(null)
  const boxesContainerRef = useRef(null)
  const boxesRef = useRef([])
  const scrambleTextReady = useRef(null)
  const tl = useRef(null)
  const [isReducedMotion, setIsReducedMotion] = useState(false)

  useEffect(() => {
    let mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setIsReducedMotion(mediaQuery.matches)
    let handleChange = e => setIsReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const handleReady = e => {
    scrambleTextReady.current = e
  }

  useGSAP(() => {
    if (!isInitialLoad || 'loading' !== phase) return
    if (isReducedMotion) return void setPhase('complete')
    
    let boxes = boxesRef.current.filter(Boolean)
    if (0 === boxes.length) return

    let runAnimation = () => {
      if (!scrambleTextReady.current) return void requestAnimationFrame(runAnimation)
      
      tl.current = gsap.timeline()
      scrambleTextReady.current()
      
      boxes.forEach((box, index) => {
        tl.current?.fromTo(
          box,
          { x: 0 === index ? -16 : (index - 1) * 18, rotate: 0 },
          { x: 18 * index - 16, rotate: 90, duration: 0.7, ease: 'expo.inOut', immediateRender: false },
          0 === index ? 0 : '>-25%'
        )
      })
      
      let delay = 2.2749999999999995
      tl.current?.to(containerRef.current, { opacity: 0, duration: 0.4, ease: 'power3.out' }, delay + 0.2)
      
      let progress = { value: 0 }
      let hasRevealed = { value: false }
      
      tl.current?.to(progress, {
        value: 1,
        duration: 1.5,
        ease: 'expo.inOut',
        onUpdate: () => {
          let v
          if (wrapperRef.current) {
            wrapperRef.current.style.clipPath = (v = progress.value) <= 0
              ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
              : v >= 1
                ? 'polygon(0% 100%, 0% 100%, 0% 100%)'
                : v <= 0.5
                  ? `polygon(0% 100%, ${2 * v * 100}% 0%, 100% 0%, 100% 100%)`
                  : `polygon(0% 100%, 100% ${(v - 0.5) * 200}%, 100% 100%)`
          }
          if (!hasRevealed.value && progress.value >= 0.9) {
            hasRevealed.value = true
            setPhase('revealing')
          }
        }
      }, delay)
    }

    let timeoutId = setTimeout(runAnimation, 100)
    return () => {
      clearTimeout(timeoutId)
      tl.current?.kill()
    }
  }, { dependencies: [isInitialLoad, phase, isReducedMotion, setPhase] })

  if (!isInitialLoad || 'hidden' === phase) return null

  let pointerClass = 'complete' === phase && 'pointer-events-none'
  let wrapperClass = cx('fixed inset-0 z-[10000] flex items-center justify-center bg-background', pointerClass)

  return (
    <div ref={wrapperRef} data-theme="brand" className={wrapperClass}>
      <div ref={containerRef} className="flex flex-col items-center gap-4">
        <div ref={boxesContainerRef} className="relative overflow-x-clip overflow-y-visible" style={{ width: 70, height: 16 }}>
          {[0, 1, 2, 3].map(e => (
            <div
              key={e}
              ref={t => { boxesRef.current[e] = t }}
              className="absolute top-0 left-0 bg-foreground"
              style={{ width: 16, height: 16, transform: 'translateX(-16px)', transformOrigin: 'bottom right' }}
            />
          ))}
        </div>
        <div className="overflow-hidden">
          <ScrambleText revealMode={true} duration={1} onReady={handleReady}>LOADING</ScrambleText>
        </div>
      </div>
    </div>
  )
}