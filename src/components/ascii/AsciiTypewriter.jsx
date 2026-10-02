'use client'
import { useRef, useState, useEffect, useCallback } from "react";
import { cx } from "@/libs/utils/className";
import { ASCII_ANIMATION_DURATION } from "@/libs/constants/config";
import { AsciiCanvas } from "@/components/ascii/AsciiCanvas";
import { computeContentBounds, cubicEaseOut } from "@/components/ascii/utils/utils.js";

const DURATION_MS = 1000 * ASCII_ANIMATION_DURATION;

export function AsciiTypewriter({
  imageSrc,
  className,
  color = "#ff6b4a",
  cellSize,
  delay = 100,
  duration = DURATION_MS,
  colorDelay = 150,
  onComplete,
  alignX = "center",
  alignY = "bottom",
  fit = "cover",
  mobileFit,
  enableHover = false,
  hoverMode = "stretch",
  hoverIntensity,
  mouseX = 0,
  mouseY = 0,
  mouseRef,
  revealEnd = 0.85,
  randomness = 0.3,
  linear = false,
  enableGooeyReveal = false,
  gooeyRadius = 0.06,
  gooeySoftness = 0.08,
  gooeyNoiseIntensity = 0.03,
  isHovering = false,
  enableDepthParallax = false,
  depthMapSrc,
  parallaxIntensity = 0.02,
  externalProgress,
  externalColorProgress,
  disableInternalAnimation = false,
  colorDark,
  depthDetailMin,
  revealOrigin = { x: 0.5, y: 0.5 },
  frameloop,
  debugLabel,
  dpr,
  skipContentBounds = false,
}) {
  const effectRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [colorProgress, setColorProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [contentBounds, setContentBounds] = useState(1);
  const [clickColorProgress, setClickColorProgress] = useState(null);
  const [clickPoint, setClickPoint] = useState(null);
  const [clickRadialInvert, setClickRadialInvert] = useState(false);
  const [impactProgress, setImpactProgress] = useState(0);

  const animationDoneRef = useRef(false);
  const clickAnimFrameRef = useRef(null);
  const impactAnimFrameRef = useRef(null);
  const lastClickTimeRef = useRef(0);
  const revealOriginRef = useRef(revealOrigin);
  revealOriginRef.current = revealOrigin;
  const containerRef = useRef(null);
  const isInViewRef = useRef(false);

  
  useEffect(() => {
    if (skipContentBounds) return;
    computeContentBounds(imageSrc, revealOrigin).then(setContentBounds);
  }, [imageSrc, revealOrigin.x, revealOrigin.y, revealOrigin, skipContentBounds]);

  
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const useExternal = disableInternalAnimation && externalProgress !== undefined;

  
  useEffect(() => {
    if (disableInternalAnimation) {
      animationDoneRef.current = true;
      return;
    }
    if (reducedMotion) {
      setProgress(1);
      setColorProgress(1);
      animationDoneRef.current = true;
      onComplete?.();
      return;
    }

    const start = performance.now();
    let raf;

    const tick = (now) => {
      const elapsed = now - start - delay;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const t = Math.min(elapsed / duration, 1);
      setProgress(linear ? t : cubicEaseOut(t));

      const colorElapsed = elapsed - colorDelay;
      if (colorElapsed > 0) {
        const ct = Math.min(colorElapsed / duration, 1);
        setColorProgress(linear ? ct : cubicEaseOut(ct));
      }

      const colorDone = colorElapsed >= duration;
      if (t < 1 || !colorDone) {
        raf = requestAnimationFrame(tick);
      } else {
        animationDoneRef.current = true;
        onComplete?.();
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [delay, duration, colorDelay, linear, reducedMotion, onComplete, disableInternalAnimation]);

  
  const triggerColourSweep = useRef(() => {});
  triggerColourSweep.current = (point, delayMs = 0) => {
    if (!animationDoneRef.current || clickAnimFrameRef.current !== null) return;
    const invert = !clickRadialInvert; 
    
    const startInvert = !clickRadialInvert;
    lastClickTimeRef.current = performance.now();
    setClickPoint(point);
    if (point) setClickRadialInvert(startInvert);

    if (reducedMotion) {
      setClickColorProgress(+!startInvert);
      setClickPoint(null);
      setClickRadialInvert(false);
      return;
    }

    const run = () => {
      const start = performance.now();
      const from = +!!startInvert;
      const to = +!startInvert;
      const tick = (now) => {
        const t = Math.min((now - start) / DURATION_MS, 1);
        setClickColorProgress(from + (to - from) * cubicEaseOut(t));
        if (t < 1) {
          clickAnimFrameRef.current = requestAnimationFrame(tick);
        } else {
          clickAnimFrameRef.current = null;
          if (lastClickTimeRef.current === start) {
            setClickPoint(null);
            setClickRadialInvert(false);
          }
        }
      };
      clickAnimFrameRef.current = requestAnimationFrame(tick);
    };

    if (delayMs > 0) setTimeout(run, delayMs);
    else run();
  };

  const triggerImpact = useRef(() => {});
  triggerImpact.current = () => {
    if (reducedMotion) return;
    if (impactAnimFrameRef.current !== null) {
      cancelAnimationFrame(impactAnimFrameRef.current);
    }
    setImpactProgress(0);
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / 500, 1);
      setImpactProgress(Math.sin((t * Math.PI) / 2));
      if (t < 1) {
        impactAnimFrameRef.current = requestAnimationFrame(tick);
      } else {
        impactAnimFrameRef.current = null;
      }
    };
    impactAnimFrameRef.current = requestAnimationFrame(tick);
  };

  
  useEffect(() => {
    const onKey = (e) => {
      if (
        (e.key !== "c" && e.key !== "C") ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      )
        return;
      const tag = e.target?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        e.target?.isContentEditable
      )
        return;
      if (isInViewRef.current) {
        lastClickTimeRef.current = performance.now();
        setClickPoint(revealOriginRef.current);
        triggerImpact.current();
        triggerColourSweep.current(revealOriginRef.current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  
  useEffect(
    () => () => {
      if (clickAnimFrameRef.current !== null) {
        cancelAnimationFrame(clickAnimFrameRef.current);
        clickAnimFrameRef.current = null;
      }
      if (impactAnimFrameRef.current !== null) {
        cancelAnimationFrame(impactAnimFrameRef.current);
        impactAnimFrameRef.current = null;
      }
    },
    []
  );

  
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) isInViewRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const onClick = useCallback((e) => {
    if (!animationDoneRef.current || clickAnimFrameRef.current !== null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1 - (e.clientY - rect.top) / rect.height;
    lastClickTimeRef.current = performance.now();
    setClickPoint({ x, y });
    triggerImpact.current();
    triggerColourSweep.current({ x, y });
  }, []);

  const finalColorProgress =
    clickColorProgress !== null
      ? clickColorProgress
      : reducedMotion
        ? 1
        : useExternal
          ? (externalColorProgress ?? externalProgress)
          : colorProgress;

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className="size-full cursor-pointer"
    >
      <AsciiCanvas
        imageSrc={imageSrc}
        className={cx("size-full", className)}
        color={color}
        {...(cellSize !== undefined && { cellSize })}
        progress={
          (reducedMotion ? 1 : useExternal ? externalProgress : progress) *
          contentBounds
        }
        colorProgress={finalColorProgress * contentBounds}
        randomness={randomness}
        revealDirection={alignX === "right" ? -1 : 1}
        revealEnd={revealEnd}
        effectRef={effectRef}
        alignX={alignX}
        alignY={alignY}
        fit={fit}
        mobileFit={mobileFit}
        enableHover={enableHover}
        hoverMode={hoverMode}
        hoverIntensity={hoverIntensity}
        mouseX={mouseX}
        mouseY={mouseY}
        mouseRef={mouseRef}
        enableGooeyReveal={enableGooeyReveal}
        gooeyRadius={gooeyRadius}
        gooeySoftness={gooeySoftness}
        gooeyNoiseIntensity={gooeyNoiseIntensity}
        isHovering={isHovering}
        enableDepthParallax={enableDepthParallax}
        depthMapSrc={depthMapSrc}
        parallaxIntensity={parallaxIntensity}
        clickPoint={clickPoint}
        clickRadialInvert={clickRadialInvert}
        impactProgress={impactProgress}
        revealOrigin={revealOrigin}
        {...(colorDark !== undefined && { colorDark })}
        {...(depthDetailMin !== undefined && { depthDetailMin })}
        {...(frameloop !== undefined && { frameloop })}
        {...(debugLabel !== undefined && { debugLabel })}
        {...(dpr !== undefined && { dpr })}
      />
    </div>
  );
}

export default AsciiTypewriter;