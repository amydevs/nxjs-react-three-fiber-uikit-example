import { RootState, RootStore } from "@react-three/fiber";
import {
  createEvents,
  DomEvent,
  EventManager,
  Events,
} from "@react-three/fiber";
import PointerTracker from "pointer-tracker/dist/index.js";

const DOM_EVENTS = {
  onClick: ['click', false],
  onContextMenu: ['contextmenu', false],
  onDoubleClick: ['dblclick', false],
  onWheel: ['wheel', true],
  onPointerDown: ['pointerdown', true],
  onPointerUp: ['pointerup', true],
  onPointerLeave: ['pointerleave', true],
  onPointerMove: ['pointermove', true],
  onPointerCancel: ['pointercancel', true],
  onLostPointerCapture: ['lostpointercapture', true],
} as const

/** Default R3F event manager for web */
export function createPointerEvents(
  store: RootStore,
): EventManager<HTMLElement> {
  const { handlePointer } = createEvents(store);
  let tracker: PointerTracker | null = null;

  return {
    priority: 1,
    enabled: true,
    compute(event_: DomEvent, state: RootState, _previous?: RootState) {
      const event = (event_ as TouchEvent).touches[0];
      if (event == null) {
        return;
      }
      state.pointer.set(
        (event.clientX / state.size.width) * 2 - 1,
        -(event.clientY / state.size.height) * 2 + 1,
      );
      state.raycaster.setFromCamera(state.pointer, state.camera);
    },

    connected: undefined,
    handlers: Object.keys(DOM_EVENTS).reduce(
      (acc, key) => ({ ...acc, [key]: handlePointer(key) }),
      {},
    ) as unknown as Events,
    update: () => {
      const { events, internal } = store.getState();
      if (internal.lastEvent?.current && events.handlers)
        events.handlers.onPointerMove(internal.lastEvent.current);
    },
    connect: (target_: HTMLElement) => {
      const target = target_ as Screen;
      tracker = new PointerTracker(target_, {
        start: (e) => {
          
          return true;
        }
      })
      
      const { set, events } = store.getState();
      events.disconnect?.();
      set((state) => ({ events: { ...state.events, connected: target } }));
      if (events.handlers) {
        for (const name in events.handlers) {
          const event = events.handlers[name as keyof typeof events.handlers];
          const [eventName, passive] =
            DOM_EVENTS[name as keyof typeof DOM_EVENTS];
          target.addEventListener(eventName, (e) => {
            (e as any).pointerType = "touch";
            event(e);
          }, { passive });
        }
      }
    },
    disconnect: () => {
      const { set, events } = store.getState();
      if (events.connected) {
        if (events.handlers) {
          for (const name in events.handlers) {
            const event = events.handlers[name as keyof typeof events.handlers];
            const [eventName] = DOM_EVENTS[name as keyof typeof DOM_EVENTS];
            events.connected.removeEventListener(eventName, event);
          }
        }
        set((state) => ({ events: { ...state.events, connected: undefined } }));
      }
    },
  };
}
