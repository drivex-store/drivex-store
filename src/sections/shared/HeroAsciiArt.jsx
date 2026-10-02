'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { ASCII_GSAP_DURATION, ASCII_EASE, ASCII_COLOR_DELAY } from '@/libs/constants/config'
import { useIsTouchDevice } from '@/hooks/useBreakpoint'
import { useMousePosition } from '@/hooks/useMousePosition'
import { usePageEnter } from '@/hooks/usePageEnter'

gsap.registerPlugin(useGSAP, ScrollTrigger)

// Reduce Motion ဖွင့်ထားရင် ပြမယ့် ပုံ (static)
// next/image မှာ width/height မရှိရင် error တက်လို့ fill သုံးထားတယ်
function HeroImageFallback({ imageSrc }) {
  return (
    <div className="absolute inset-0 animate-fade-in">
      <Image
        src={imageSrc}
        alt=""
        fill
        priority
        sizes="50vw"
        className="object-contain object-bottom"
      />
    </div>
  )
}

export function HeroAsciiArt({
  imageSrc,
  mobileImageSrc,
  depthMapSrc,
  parallaxIntensity = 0.02,
  cellSize = 20,
  color,
  colorDark,
  revealOriginX,
  revealOriginY
}) {
  const isTouchDevice = useIsTouchDevice()
  const [mounted, setMounted] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const containerRef = useRef(null)

  const [progress, setProgress] = useState(0)
  const [colorProgress, setColorProgress] = useState(0)
  const animationState = useRef({
    progress: 0,
    colorProgress: 0
  })
  const tweensRef = useRef([])

  const shouldAnimate = mounted && !reduceMotion
  const [AsciiComponent, setAsciiComponent] = useState(null)

  // AsciiTypewriter ကို dynamic import (error ကို မဖုံးအောင် catch ထည့်ထား)
  useEffect(() => {
    if (!shouldAnimate) return

    let cancelled = false
    import('@/components/ascii/AsciiTypewriter')
      .then((mod) => {
        if (cancelled) return
        console.log('[ASCII] 1 module loaded', !!mod.AsciiTypewriter)
        setAsciiComponent(() => mod.AsciiTypewriter)
      })
      .catch((err) => {
        console.error('[ASCII] 1 import FAILED', err)
      })

    return () => {
      cancelled = true
    }
  }, [shouldAnimate])

  const { mouseX, mouseY, isHovering } = useMousePosition({
    enabled: shouldAnimate && !isTouchDevice,
    containerRef: containerRef
  })

  const onPageEnter = useCallback(
    (delay) => {
      console.log('[ASCII] ascii enter fired', delay)

      if (reduceMotion) {
        setProgress(1)
        setColorProgress(1)
        return
      }

      const t1 = gsap.to(animationState.current, {
        progress: 1,
        duration: ASCII_GSAP_DURATION,
        delay: delay,
        ease: ASCII_EASE,
        onUpdate: () => {
          setProgress(animationState.current.progress)
        }
      })

      const t2 = gsap.to(animationState.current, {
        colorProgress: 1,
        duration: ASCII_GSAP_DURATION,
        delay: delay + ASCII_COLOR_DELAY,
        ease: ASCII_EASE,
        onUpdate: () => {
          setColorProgress(animationState.current.colorProgress)
        }
      })

      tweensRef.current.push(t1, t2)
    },
    [reduceMotion]
  )

  usePageEnter(onPageEnter, {
    priority: 0
  })

  // unmount ဖြစ်ရင် tween တွေကို ရပ်မယ်
  useEffect(() => {
    return () => {
      tweensRef.current.forEach((t) => t.kill())
      tweensRef.current = []
    }
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mediaQuery.matches)

    const handleChange = (e) => setReduceMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const currentImageSrc = isTouchDevice ? (mobileImageSrc ?? imageSrc) : imageSrc

  if (mounted && reduceMotion) {
    return <HeroImageFallback imageSrc={currentImageSrc} />
  }

  if (shouldAnimate && AsciiComponent) {
    return (
      <div ref={containerRef} className="absolute inset-0">
        <AsciiComponent
          imageSrc={currentImageSrc}
          cellSize={cellSize}
          color={color}
          colorDark={colorDark}
          className="size-full"
          alignX="center"
          alignY="bottom"
          fit="contain"
          mobileFit="contain"
          revealEnd={1}
          randomness={0.6}
          mouseX={isTouchDevice ? undefined : mouseX}
          mouseY={isTouchDevice ? undefined : mouseY}
          enableGooeyReveal={!isTouchDevice}
          isHovering={!isTouchDevice && isHovering}
          gooeyRadius={0.035}
          gooeySoftness={0.04}
          gooeyNoiseIntensity={0.02}
          enableDepthParallax={!isTouchDevice && !!depthMapSrc}
          depthMapSrc={isTouchDevice ? undefined : depthMapSrc}
          parallaxIntensity={parallaxIntensity}
          externalProgress={progress}
          externalColorProgress={colorProgress}
          disableInternalAnimation={true}
          {...(revealOriginX != null &&
            revealOriginY != null && {
              revealOrigin: {
                x: revealOriginX,
                y: revealOriginY
              }
            })}
        />
      </div>
    )
  }

  return null
}
