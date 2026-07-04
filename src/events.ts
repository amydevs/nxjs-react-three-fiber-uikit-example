import { RootState, RootStore } from "@react-three/fiber";
import {
  createEvents,
  DomEvent,
  EventManager,
  Events,
} from "@react-three/fiber";

type InternalTouchEvent = TouchEvent & Touch;
export type SingleTouchEvent = InternalTouchEvent & {
  pointerId: number,
  pointerType: "touch"
};
// export type SingleTouchEvent = React.SyntheticEvent<
//   Screen,
//   InternalTouchEvent & { pointerType: "touch" }
// >;

/** Default R3F event manager for web */
export function createTouchEvents(store: RootStore): EventManager<Screen> {
  const { handlePointer } = createEvents(store);
  let start: { id: number; x: number; y: number } | null = null;
  const attachedCbs: Record<string, (event: InternalTouchEvent) => void> = {};
  const handleTouch = (event: InternalTouchEvent, name: keyof Events) => {
    const callback = handlePointer(name);
    // let isPropagationStopped = false;
    // const origStopPropagation = event.stopPropagation.bind(event);
    // const stopPropagation = () => {
    //   isPropagationStopped = true;
    //   origStopPropagation();
    // };
    // const singleTouchEvent: SingleTouchEvent = {
    //   ...event,
    //   currentTarget: event.currentTarget as Screen,
    //   nativeEvent: Object.assign(event, {
    //     pointerType: "touch" as const,
    //     stopPropagation: stopPropagation,
    //   }),
    //   preventDefault: () => event.preventDefault(),
    //   stopPropagation: () => stopPropagation,
    //   isDefaultPrevented: () => event.defaultPrevented,
    //   isPropagationStopped: () => isPropagationStopped,
    //   persist: () => {},
    // };
    callback(
      Object.assign(event, {
        pointerId: event.identifier,
        pointerType: "touch" as const,
      }) satisfies SingleTouchEvent,
    );
  };

  return {
    priority: 1,
    enabled: true,
    compute(event_: DomEvent, state: RootState, _previous?: RootState) {
      const event = event_ as InternalTouchEvent;
      state.pointer.set(
        (event.clientX / state.size.width) * 2 - 1,
        -(event.clientY / state.size.height) * 2 + 1,
      );
      state.raycaster.setFromCamera(state.pointer, state.camera);
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
        handleTouch(Object.assign(event, touch), "onPointerDown");
      };
      attachedCbs["touchmove"] = (event) => {
        const touch =
          [...event.changedTouches].find((t) => t.identifier === start?.id) ??
          event.changedTouches[0];
        handleTouch(Object.assign(event, touch), "onPointerMove");
      };
      attachedCbs["touchend"] = (event) => {
        const touch =
          [...event.changedTouches].find((t) => t.identifier === start?.id) ??
          event.changedTouches[0];
        const internalTouchEvent = Object.assign(event, touch);
        handleTouch(internalTouchEvent, "onPointerUp");
        if (
          start &&
          Math.hypot(touch.clientX - start.x, touch.clientY - start.y) < 20
        ) {
          handleTouch(internalTouchEvent, "onClick");
        }
        handleTouch(internalTouchEvent, "onPointerLeave");
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
