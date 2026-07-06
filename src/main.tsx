import * as THREE from "three";
import * as React from "react";
import { extend, createRoot } from "@react-three/fiber";
import { App } from "./App";
import { createTouchEvents } from "./events";
import { applyConsolePolyfills, applyThreeJsPolyfills } from "./polyfills";

applyThreeJsPolyfills();
applyConsolePolyfills();

extend(THREE as any);

const dpr = 1.2;

const root = createRoot(screen);
await root.configure({
  events: createTouchEvents as any,
  size: {
    height: screen.height / dpr,
    width: screen.width / dpr,
    top: 0,
    left: 0,
  },
  gl: {
    localClippingEnabled: true,
  },
  dpr: [dpr, dpr],
  onPointerMissed: console.debug,
});

root.render(<App />);
