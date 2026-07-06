import { BellRing } from "@react-three/uikit-lucide";
import { Container, Text } from "@react-three/uikit";
import {
  colors,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Switch,
  Button,
} from "@react-three/uikit-default";
import * as React from "react";

export function Test() {
  const [isNotificationsActive, setIsNotificationsActive] =
    React.useState(false);
  const [notifications, setNotifications] = React.useState(() => [
    {
      title: "Your call has been confirmed.",
      description: "1 hour ago",
    },
    {
      title: "You have a new message!",
      description: "1 hour ago",
    },
    {
      title: "Your subscription is expiring soon!",
      description: "2 hours ago",
    },
  ]);
  return (
    <Card width={380}>
      <CardHeader>
        <CardTitle>
          <Text>Notifications</Text>
        </CardTitle>
        <CardDescription>
          <Text>You have 3 unread messages.</Text>
        </CardDescription>
      </CardHeader>
      <CardContent flexDirection="column" gap={16}>
        <Container
          flexDirection="row"
          alignItems="center"
          gap={16}
          borderRadius={6}
          borderWidth={1}
          padding={16}
        >
          <BellRing />
          <Container flexDirection="column" gap={4}>
            <Text fontSize={14} lineHeight="100%">
              Push Notifications
            </Text>
            <Text
              fontSize={14}
              lineHeight="20px"
              color={colors.mutedForeground}
            >
              Send notifications to device.
            </Text>
          </Container>
          <Switch
            checked={isNotificationsActive}
            onClick={() => setIsNotificationsActive(!isNotificationsActive)}
          />
        </Container>
        <Container flexDirection="column">
          {notifications.map((notification, index) => (
            <Container
              key={index}
              marginBottom={index === notifications.length - 1 ? 0 : 16}
              paddingBottom={index === notifications.length - 1 ? 0 : 16}
              alignItems="flex-start"
              flexDirection="row"
              gap={17}
            >
              <Container
                height={8}
                width={8}
                transformTranslateY={4}
                borderRadius={1000}
                backgroundColor={0x0ea5e9}
              />
              <Container flexDirection="column" gap={4}>
                <Text fontSize={14} lineHeight="100%">
                  {notification.title}
                </Text>
                <Text
                  fontSize={14}
                  lineHeight="20px"
                  color={colors.mutedForeground}
                >
                  {notification.description}
                </Text>
              </Container>
            </Container>
          ))}
        </Container>
      </CardContent>
      <CardFooter>
        <Button
          onClick={(e) => {
            setNotifications([...notifications, notifications[0]]);
          }}
          flexDirection="row"
          width="100%"
        >
          <Text>Add notification</Text>
        </Button>
      </CardFooter>
    </Card>
  );
}
