import * as THREE from "three";
import { getRootState } from "@react-three/fiber";
import type { Component } from "@pmndrs/uikit";
import { Button } from "@nx.js/constants";
import { SpatialNavigation } from "@noriginmedia/norigin-spatial-navigation-core";
import type {
  AddEventListenersOptions,
  FocusableComponent,
  FocusableComponentLayout,
  Key,
  LayoutAdapter,
  SpatialNavigationServiceOptions,
} from "@noriginmedia/norigin-spatial-navigation-core";

declare module "@noriginmedia/norigin-spatial-navigation-core" {
  interface NodeTypeOverrides {
    node: Component;
  }
}

const BUTTON_KEYS: [number, Key][] = [
  [Button.Up, "up"],
  [Button.Down, "down"],
  [Button.Left, "left"],
  [Button.Right, "right"],
  [Button.A, "enter"],
];
const STICK_THRESHOLD = 0.5;
const REPEAT_DELAY = 400;
const REPEAT_INTERVAL = 100;

const PANEL_CORNERS = [
  new THREE.Vector3(-0.5, -0.5, 0),
  new THREE.Vector3(0.5, -0.5, 0),
  new THREE.Vector3(-0.5, 0.5, 0),
  new THREE.Vector3(0.5, 0.5, 0),
];

class UikitLayoutAdapter implements LayoutAdapter {
  private listeners: AddEventListenersOptions = {};
  private projected = new THREE.Vector3();
  private pressed = new Map<Key, number>();
  private frame?: number;

  addEventListeners(listeners: AddEventListenersOptions) {
    this.listeners = listeners;
    this.frame = requestAnimationFrame(this.poll);
  }

  removeEventListeners() {
    if (this.frame !== undefined) cancelAnimationFrame(this.frame);
    this.frame = undefined;
    this.listeners = {};
    this.pressed.clear();
  }

  private poll = (now: number) => {
    const down = new Set<Key>();
    for (const pad of navigator.getGamepads()) {
      if (!pad) continue;
      for (const [index, key] of BUTTON_KEYS) {
        if (pad.buttons[index]?.pressed) down.add(key);
      }
      const [x = 0, y = 0] = pad.axes;
      if (x < -STICK_THRESHOLD) down.add("left");
      else if (x > STICK_THRESHOLD) down.add("right");
      if (y < -STICK_THRESHOLD) down.add("up");
      else if (y > STICK_THRESHOLD) down.add("down");
    }

    for (const key of down) {
      const nextRepeat = this.pressed.get(key);
      if (nextRepeat === undefined) {
        this.pressed.set(key, now + REPEAT_DELAY);
        this.listeners.keyDown?.(key, new Event("keydown"));
      } else if (key !== "enter" && now >= nextRepeat) {
        this.pressed.set(key, now + REPEAT_INTERVAL);
        this.listeners.keyDown?.(key, new Event("keydown"));
      }
    }
    for (const key of this.pressed.keys()) {
      if (!down.has(key)) {
        this.pressed.delete(key);
        this.listeners.keyUp?.(key);
      }
    }

    this.frame = requestAnimationFrame(this.poll);
  };

  measureLayout = async (
    component: FocusableComponent,
  ): Promise<FocusableComponentLayout> => {
    const node = component.node;
    const { camera, size } = getRootState(node)!;
    node.updateWorldMatrix(true, false);

    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;
    for (const corner of PANEL_CORNERS) {
      this.projected
        .copy(corner)
        .applyMatrix4(node.matrixWorld)
        .project(camera);
      const x = ((this.projected.x + 1) / 2) * size.width;
      const y = ((1 - this.projected.y) / 2) * size.height;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }

    return {
      node,
      x: left,
      y: top,
      left,
      top,
      right,
      bottom,
      width: right - left,
      height: bottom - top,
    };
  };

  blurNode() {}
  focusNode() {}
}

export function initSpatialNavigation(
  options: Partial<SpatialNavigationServiceOptions> = {},
) {
  SpatialNavigation.init({
    layoutAdapter: UikitLayoutAdapter,
    shouldFocusDOMNode: false,
    ...options,
  });
}
