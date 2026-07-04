import { RootState, RootStore } from "@react-three/fiber";
import {
  createEvents,
  DomEvent,
  EventManager,
  Events,
} from "@react-three/fiber";
import PointerTracker from "pointer-tracker/dist/index.js";

const DOM_EVENTS = {
  onClick: ["click", false],
  onContextMenu: ["contextmenu", false],
  onDoubleClick: ["dblclick", false],
  onWheel: ["wheel", true],
  onPointerDown: ["pointerdown", true],
  onPointerUp: ["pointerup", true],
  onPointerLeave: ["pointerleave", true],
  onPointerMove: ["pointermove", true],
  onPointerCancel: ["pointercancel", true],
  onLostPointerCapture: ["lostpointercapture", true],
} as const;

type SingleTouchEvent = TouchEvent & Touch & { pointerType: "touch" };

/** Default R3F event manager for web */
export function createTouchEvents(store: RootStore): EventManager<Screen> {
  const { handlePointer } = createEvents(store);
  let start: { id: number; x: number; y: number } | null = null;
  const attachedCbs: Record<string, (event: SingleTouchEvent) => void> = {};
  const handleTouch = (event: SingleTouchEvent, name: keyof Events) => {
    const callback = handlePointer(name);
    callback(event);
  };

  return {
    priority: 1,
    enabled: true,
    compute(event_: DomEvent, state: RootState, _previous?: RootState) {
      const event = event_ as SingleTouchEvent;
      state.pointer.set((event.clientX / state.size.width) * 2 - 1, -(event.clientY / state.size.height) * 2 + 1)
      state.raycaster.setFromCamera(state.pointer, state.camera)
    },
    connected: undefined,
    handlers: undefined,
    update: () => {
      const { events, internal } = store.getState();
      if (internal.lastEvent?.current && events.handlers) {
        events.handlers.onPointerMove(internal.lastEvent.current);
      }
    },
    connect: (target_: Screen) => {
      const target = target_ as Screen;
      const { set, events } = store.getState();
      events.disconnect?.();
      set((state) => ({ events: { ...state.events, connected: target } }));
      attachedCbs["touchstart"] = (event) => {
        const touch = event.changedTouches[0];
        start = { id: touch.identifier, x: touch.clientX, y: touch.clientY };
        handleTouch(Object.assign(event, { ...touch, pointerType: "touch" }), "onPointerDown");
      };
      attachedCbs["touchmove"] = (event) => {
        const touch =
          [...event.changedTouches].find((t) => t.identifier === start?.id) ??
          event.changedTouches[0];
        handleTouch(Object.assign(event, { ...touch, pointerType: "touch" }), "onPointerMove");
      };
      attachedCbs["touchend"] = (event) => {
        const touch =
          [...event.changedTouches].find((t) => t.identifier === start?.id) ??
          event.changedTouches[0];
        const singleTouchEvent = Object.assign(event, { ...touch, pointerType: "touch" });
        handleTouch(singleTouchEvent, "onPointerUp");
        if (
          start &&
          Math.hypot(touch.clientX - start.x, touch.clientY - start.y) < 20
        ) {
          handleTouch(singleTouchEvent, "onClick");
        }
        handleTouch(singleTouchEvent, "onPointerLeave");
        start = null;
      };
      Object.entries(attachedCbs).forEach(([name, cb]) => {
        target.addEventListener(name, cb, { passive: false });
      });
    },
    disconnect: () => {
      const { set, events } = store.getState();
      if (events.connected) {
        Object.entries(attachedCbs).forEach(([name, cb]) => {
          (events.connected as Screen).removeEventListener(name, cb);
        });
        set((state) => ({ events: { ...state.events, connected: undefined } }));
      }
    },
  };
}
