'use client'
import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";

function selectInvalidate(state) {
  return state.invalidate;
}

export function DemandInvalidate({ frameloop }) {
  const invalidate = useThree(selectInvalidate);
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (frameloop !== "demand" || triggeredRef.current) return;
    triggeredRef.current = true;

    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(() => invalidate());
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(() => invalidate(), 0);
    return () => clearTimeout(id);
  }, [frameloop, invalidate]);

  return null;
}