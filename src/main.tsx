import * as THREE from "three";
import * as React from "react";
import { extend, createRoot } from "@react-three/fiber";
import { App } from "./App";
import { createTouchEvents } from "./events";
import { DOMParser } from "@xmldom/xmldom";

function applyGlobalPolyfills() {
  const createElement = (name: string) => {
    if (name === "img") {
      console.debug("image created");
      const image = new Image();
      const origAddEventListener = image.addEventListener;
      Object.defineProperty(image, "addEventListener", {
        value: function (...args: Parameters<typeof origAddEventListener>) {
          let [type, cb, opts] = args;
          const once =
            (typeof opts === "object" && "once" in opts && opts.once) || false;
          const orig_cb_obj = cb;
          if (cb != null) {
            if ("handleEvent" in cb) {
              const orig_cb = cb.handleEvent;
              cb.handleEvent = (...args) => {
                if (once) {
                  image_cb_map.delete(orig_cb_obj);
                }
                orig_cb.bind(image)(...args);
              };
            } else {
              const orig_cb = cb;
              cb = (...args) => {
                if (once) {
                  image_cb_map.delete(orig_cb_obj);
                }
                orig_cb.bind(image)(...args);
              };
            }
          }
          image_cb_map.set(orig_cb_obj, cb);
          origAddEventListener.bind(this)(type, cb, opts);
        },
      });
      const origRemoveEventListener = image.removeEventListener;
      Object.defineProperty(image, "removeEventListener", {
        value: function (...args: Parameters<typeof origRemoveEventListener>) {
          let [type, orig_cb_obj, opts] = args;
          const cb = image_cb_map.get(orig_cb_obj);
          image_cb_map.delete(orig_cb_obj);
          origRemoveEventListener(type, cb, opts);
        },
      });
      return image;
    } else if (name === "canvas") {
      return new OffscreenCanvas(64, 64);
    }
  };
  // this on Image != the return of new Image(), so a polyfill is required to make "this" in an eventHandler work properly
  const image_cb_map = new Map<any, any>();
  const property_descriptors: Record<string, PropertyDescriptor> = {
    self: {
      value: window,
      writable: false,
      configurable: false,
      enumerable: true,
    },
    HTMLVideoElement: {
      value: Video,
      writable: false,
      configurable: false,
      enumerable: true,
    },
    HTMLAudioElement: {
      value: Audio,
      writable: false,
      configurable: false,
      enumerable: true,
    },
    HTMLImageElement: {
      value: Image,
      writable: false,
      configurable: false,
      enumerable: true,
    },
    DOMParser: {
      value: DOMParser,
      writable: false,
      configurable: false,
      enumerable: true,
    },
    document: {
      value: {
        body: {
          style: {},
        },
        createElement,
        createElementNS: (_: string, name: string) => createElement(name)
      },
      writable: false,
      configurable: false,
      enumerable: true,
    },
  };
  for (const e of [globalThis, window]) {
    Object.defineProperties(e, property_descriptors);
  }
  // polyfill for console methods
  for (const k of ["log", "warn", "info", "error"] as const) {
    const original = console[k].bind(console);
    Object.defineProperty(console, k, {
      value: (...args: any[]) => {
        console.debug(...args);
        original(...args);
      },
      writable: false,
      configurable: false,
      enumerable: true,
    });
  }
}

applyGlobalPolyfills();

extend(THREE as any);

const root = createRoot(screen);
await root.configure({
  events: createTouchEvents as any,
  size: {
    height: screen.height,
    width: screen.width,
    top: 0,
    left: 0,
  },
  gl: {
    localClippingEnabled: true,
  },
  dpr: [1, 1],
  onPointerMissed: console.debug,
});

root.render(<App />);
