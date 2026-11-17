import { Text } from "@react-three/uikit";
import { Button, colors } from "@react-three/uikit-default";
import * as React from "react";
import { useNavigate } from "react-router";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation-react";
export function Home() {
    const navigate = useNavigate();
    const { ref, focused, focusSelf } = useFocusable<object, React.ComponentRef<typeof Button>>({
        onEnterPress: () => navigate("/test"),
    });
    React.useEffect(() => {
        focusSelf();
    }, [focusSelf]);
    return (
        <>
            <Button
                ref={ref}
                borderWidth={2}
                borderColor={focused ? colors.ring : colors.background}
                onClick={() => navigate("/test")}
            >
                <Text>Go to /test</Text>
            </Button>
        </>
    )
}
