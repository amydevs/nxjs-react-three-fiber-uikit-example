import { Text } from "@react-three/uikit";
import { Button } from "@react-three/uikit-default";
import * as React from "react";
import { useNavigate } from "react-router";
export function Home() {
    const navigate = useNavigate();
    return (
        <>
            <Button onClick={() => navigate("/test")}><Text>Go to /test</Text></Button>
        </>
    )
}