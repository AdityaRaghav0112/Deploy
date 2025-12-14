"use client";

import { useEffect, useRef } from "react";
import { initModel } from "./model";

export default function Elements() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const cleanup = initModel(mountRef.current);

    return () => {
      cleanup?.();
    };
  }, []);

  return <div ref={mountRef} className="w-full min-h-screen" />;
}