import { DOMParser } from "linkedom";

export function applyThreeJsPolyfills() {
  const createElement = (name: string) => {
    // classes that extend EventTarget but have constructors that return a different object
    // will cause "this" on to be bound to the class instance rather than the returned object.
    if (name === "img") {
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
              const origCb = cb.handleEvent;
              cb.handleEvent = (...args) => {
                if (once) {
                  imageCbMap.delete(orig_cb_obj);
                }
                origCb.bind(image)(...args);
              };
            } else {
              const origCb = cb;
              cb = (...args) => {
                if (once) {
                  imageCbMap.delete(orig_cb_obj);
                }
                origCb.bind(image)(...args);
              };
            }
          }
          imageCbMap.set(orig_cb_obj, cb);
          origAddEventListener.bind(this)(type, cb, opts);
        },
      });
      const origRemoveEventListener = image.removeEventListener;
      Object.defineProperty(image, "removeEventListener", {
        value: function (...args: Parameters<typeof origRemoveEventListener>) {
          let [type, orig_cb_obj, opts] = args;
          const cb = imageCbMap.get(orig_cb_obj);
          imageCbMap.delete(orig_cb_obj);
          origRemoveEventListener(type, cb, opts);
        },
      });
      return image;
    } else if (name === "canvas") {
      // polyfill for THREE SVGLoader
      return new OffscreenCanvas(64, 64);
    }
  };
  const imageCbMap = new Map<any, any>();
  const property_descriptors: Record<string, PropertyDescriptor> = {
    // required for THREE to bootstrap correctly
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
    // To support THREE.Audio
    HTMLAudioElement: {
      value: Audio,
      writable: false,
      configurable: false,
      enumerable: true,
    },
    // To support THREE.Texture with image source
    HTMLImageElement: {
      value: Image,
      writable: false,
      configurable: false,
      enumerable: true,
    },
    // To support THREE.SVGLoader requires DOMParser with querySelector support
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
        createElementNS: (_: string, name: string) => createElement(name),
      },
      writable: false,
      configurable: false,
      enumerable: true,
    },
  };
  for (const e of [globalThis, window]) {
    Object.defineProperties(e, property_descriptors);
  }
}

export function applyConsolePolyfills() {
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
