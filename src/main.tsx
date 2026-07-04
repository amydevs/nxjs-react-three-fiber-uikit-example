import * as THREE from "three";
import * as React from "react";
import { extend, createRoot } from "@react-three/fiber";
import { UIKitApp } from "./UIKitApp";
import { createTouchEvents } from "./events";

Object.defineProperty(globalThis, "self", {
  value: window,
  writable: false,
  configurable: false,
  enumerable: true,
});
Object.defineProperty(globalThis, "HTMLVideoElement", {
  value: Video,
  writable: false,
  configurable: false,
  enumerable: true,
});
Object.defineProperty(window, "HTMLAudioElement", {
  value: Audio,
  writable: false,
  configurable: false,
  enumerable: true,
});
Object.defineProperty(window, "HTMLImageElement", {
  value: Image,
  writable: false,
  configurable: false,
  enumerable: true,
});
const imageCbMap = new Map<any, any>();
Object.defineProperty(globalThis, "document", {
  value: {
    // fix for r3f hover handler
    body: {
      style: {}
    },
    // this on Image != the return of new Image(), so a polyfill is required to make "this" in an eventHandler work properly
    createElementNS: (_: string, name: string) => {
      if (name === "img") {
        const image = new Image();
        const origAddEventListener = image.addEventListener;
        Object.defineProperty(image, "addEventListener", {
          value: function (...args: Parameters<typeof origAddEventListener>) {
            let [type, cb, opts] = args;
            const once =
              (typeof opts === "object" && "once" in opts && opts.once) ||
              false;
            const origCbObj = cb;
            if (cb != null) {
              if ("handleEvent" in cb) {
                const origCb = cb.handleEvent;
                cb.handleEvent = (...args) => {
                  if (once) {
                    imageCbMap.delete(origCbObj);
                  }
                  origCb.bind(image)(...args);
                };
              } else {
                const origCb = cb;
                cb = (...args) => {
                  if (once) {
                    imageCbMap.delete(origCbObj);
                  }
                  origCb.bind(image)(...args);
                };
              }
            }
            imageCbMap.set(origCbObj, cb);
            origAddEventListener.bind(this)(type, cb, opts);
          },
        });
        const origRemoveEventListener = image.removeEventListener;
        Object.defineProperty(image, "removeEventListener", {
          value: function (
            ...args: Parameters<typeof origRemoveEventListener>
          ) {
            let [type, cb, opts] = args;
            const origCb = imageCbMap.get(cb);
            imageCbMap.delete(cb);
            origRemoveEventListener(type, origCb, opts);
          },
        });
        return image;
      }
    },
  },
  writable: false,
  configurable: false,
  enumerable: true,
});

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
    localClippingEnabled: true
  },
  dpr: [1, 1],
  onPointerMissed: console.debug,
});

root.render(<UIKitApp />);
