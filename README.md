# nx.js + react + @react-three/fiber + @react-three/uikit Example

<video src="./media/demo.mp4" controls width="1280" height="720" />

This repository is an example of using [nx.js](https://nxjs.n8.io/), [React](https://react.dev/), [React Three Fiber](https://r3f.docs.pmnd.rs/), [Poimandres' UIKit](https://pmndrs.github.io/uikit/docs) to demonstrate a base Proof of Concept.

The point of this is to be able to use React with Tailwind-like styling to be able to develop user interfaces for Nintendo Switch homebrew.

What confirmed does work:

- Touch and scrolling input
- MSDF font rendering
- SVG rendering and SVG-based icons
- Adjusting device pixel ratio for component scale


What doesn't work yet:

- THREE.VideoTexture does not work as the nx.js supplied Video class can't be used as a source for THREE.VideoTexture. Hence, the Video component in UIKit will also not work. The work around is to use OffscreenCanvases as textures inputs and draw videos to those canvases:

```ts
import { CustomContainer } from "@react-three/uikit";
const video = new Video("sdmc:/video.mp4");
const canvas = new OffscreenCanvas(1280, 720);
const canvas_texture = new THREE.CanvasTexture(canvas);
canvas_texture.minFilter = THREE.LinearFilter;
canvas_texture.magFilter = THREE.LinearFilter;

function VideoComponent() {
    useFrame(() => {
        canvas_texture.needsUpdate = !video.paused
    })
    return (
        <CustomContainer onClick={() => video.paused ? video.play() : video.pause()} width={1280} height={720}>
            <meshBasicMaterial map={canvas_texture} />
        </CustomContainer>
    )
}
```

There are a few files to note in order to get React Three Fiber to run smoothly on nx.js:

- polyfills.ts - This file contains logic that Polyfills all of the required resources that React Three Fiber and underlying Three.js requires in order to run.
- events.ts - This file holds an implementation of React Three Fiber's EventManager to polyfill click and pointer events from touch events.
