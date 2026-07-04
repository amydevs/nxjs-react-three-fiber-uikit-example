import { Fullscreen as FullscreenRef } from "@pmndrs/uikit";
import { Fullscreen } from "@react-three/uikit";
import { colors } from "@react-three/uikit-default";
import { MemoryRouter, Route, Routes } from "react-router";
import * as React from "react";
import { Test } from "./routes/Test";
import { Home } from "./routes/Home";
import { useThree } from "@react-three/fiber";

export function App() {
  const state = useThree();
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight intensity={1} position={[-5, 5, 10]} />
      <Fullscreen
        overflow="scroll"
        alignItems="flex-start"
        justifyContent={"center"}
        padding={32}
        backgroundColor={colors.background}
      >
        <MemoryRouter>
          <Routes>
            <Route path="/" Component={Home} />
             <Route path="/test" Component={Test} />
          </Routes>
        </MemoryRouter>
      </Fullscreen>
    </>
  );
}
