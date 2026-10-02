'use client'
import { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { cx } from "@/libs/utils/className";
import { useIsTouchDevice } from "@/hooks/useBreakpoint";
import { HoverImage } from "@/components/ascii/HoverImage";
import { AsciiEffectPass } from "@/components/ascii/AsciiEffectPass";
import { DemandInvalidate } from "@/components/ascii/DemandInvalidate";
import { DEFAULT_CHARS } from "@/components/ascii/utils/utils";

function onCreated({ gl }) {
  // DEBUG: canvas အရွယ်အစား 0 ဖြစ်နေလား စစ်ဖို့
  console.log(
    "[ASCII] 4 canvas created",
    "css:", gl.domElement.clientWidth, "x", gl.domElement.clientHeight,
    "buffer:", gl.domElement.width, "x", gl.domElement.height
  );
  gl.domElement.addEventListener("webglcontextlost", (e) => {
    console.warn("[ASCII] 4 webgl context LOST");
    e.preventDefault();
  });
}

// fC
export function AsciiCanvas({
  imageSrc,
  className,
  characters = DEFAULT_CHARS,
  fontSize = 54,
  cellSize = 20,
  color = "#ff6b4a",
  invert = false,
  progress = 1,
  colorProgress = 1,
  randomness = 0.3,
  revealDirection = 1,
  revealEnd = 0.85,
  effectRef,
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
  enableGooeyReveal = false,
  gooeyRadius = 0.15,
  gooeySoftness = 0.08,
  gooeyNoiseIntensity = 0.03,
  isHovering = false,
  enableDepthParallax = false,
  depthMapSrc,
  parallaxIntensity = 0.02,
  colorDark,
  depthDetailMin,
  clickPoint,
  clickRadialInvert,
  impactProgress,
  revealOrigin = { x: 0.5, y: 0.5 },
  frameloop = "always",
  dpr = [1, 1.5],
}) {
  const containerRef = useRef(null);
  const [resolvedCellSize, setResolvedCellSize] = useState(cellSize);
  const [isVisible, setIsVisible] = useState(true);

  const effectiveHoverIntensity =
    hoverIntensity ?? (hoverMode === "headTurn" ? 0.04 : 0.15);

  const isTouch = useIsTouchDevice();
  const effectiveFit = isTouch && mobileFit ? mobileFit : fit;

  // DEBUG: progress (contentBounds နဲ့ မြှောက်ပြီးသား) ကို 0.1 အဆင့်စီ log
  const progressStep = Math.round(progress * 10);
  useEffect(() => {
    console.log("[ASCII] 5 canvas progress", progress.toFixed(2));
  }, [progressStep]); // eslint-disable-line react-hooks/exhaustive-deps

  // Intersection observer for "always" frameloop visibility
  useEffect(() => {
    if (frameloop !== "always") return;
    const el = containerRef.current;
    if (!el) return;
    let timeout = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          if (entry.isIntersecting) {
            if (timeout) {
              clearTimeout(timeout);
              timeout = null;
            }
            setIsVisible(true);
          } else {
            timeout = setTimeout(() => setIsVisible(false), 500);
          }
        }
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timeout) clearTimeout(timeout);
    };
  }, [frameloop]);

  // ResizeObserver for responsive cell size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const size = Math.max(el.clientWidth, el.clientHeight);
      if (!Number.isFinite(size) || size <= 0) {
        console.warn("[ASCII] 4 container size is 0", el.clientWidth, el.clientHeight);
        return;
      }
      const dprFactor =
        Math.max(dpr[0], Math.min(window.devicePixelRatio ?? 1, dpr[1])) / 2;
      const next =
        cellSize * Math.max(0.5, size / 1920) * 1.35 * dprFactor;
      if (Number.isFinite(next) && next > 0) setResolvedCellSize(next);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cellSize, dpr]);

  const effectiveFrameloop =
    frameloop !== "always" || isVisible ? frameloop : "never";

  const glProps = {
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
  };
  const cameraProps = { position: [0, 0, 5], fov: 50 };
  const styleProps = { background: "transparent" };

  const scaledCell = Math.max(1, 1.6 * resolvedCellSize);

  return (
    <div ref={containerRef} className={cx("relative size-full", className)}>
      <Canvas
        frameloop={effectiveFrameloop}
        className="opacity-100"
        dpr={dpr}
        gl={glProps}
        camera={cameraProps}
        style={styleProps}
        onCreated={onCreated}
      >
        <DemandInvalidate frameloop={frameloop} />
        <HoverImage
          imageSrc={imageSrc}
          alignX={alignX}
          alignY={alignY}
          fit={effectiveFit}
          enableHover={enableHover}
          hoverMode={hoverMode}
          hoverIntensity={effectiveHoverIntensity}
          mouseX={mouseX}
          mouseY={mouseY}
          isHovering={isHovering}
        />
        <AsciiEffectPass
          characters={characters}
          fontSize={fontSize}
          cellSize={scaledCell}
          color={color}
          invert={invert}
          respectAlpha={true}
          alphaThreshold={0.1}
          progress={progress}
          colorProgress={colorProgress}
          randomness={randomness}
          revealDirection={revealDirection}
          revealEnd={revealEnd}
          effectRef={effectRef}
          enableGooeyReveal={enableGooeyReveal}
          gooeyRadius={gooeyRadius}
          gooeySoftness={gooeySoftness}
          gooeyNoiseIntensity={gooeyNoiseIntensity}
          mouseX={mouseX}
          mouseY={mouseY}
          mouseRef={mouseRef}
          isHovering={isHovering}
          enableDepthParallax={enableDepthParallax}
          depthMapSrc={depthMapSrc}
          parallaxIntensity={parallaxIntensity}
          colorDark={colorDark}
          depthDetailMin={depthDetailMin}
          clickPoint={clickPoint}
          clickRadialInvert={clickRadialInvert}
          impactProgress={impactProgress}
          revealOrigin={revealOrigin}
        />
      </Canvas>
    </div>
  );
}
