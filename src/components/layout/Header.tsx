import { Title, Code, Group, Avatar } from "@mantine/core";
import { IconAi } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";

export default function Header() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Group justify={isMobile ? "center" : "flex-start"} style={isMobile ? { marginTop: -30, marginLeft: 30 } : {}}>
      {!isMobile && (
        <Avatar color="teal" style={{ marginLeft: 8 }}>
          <IconAi size="1.5rem" />
        </Avatar>
      )}
      <Title order={3}>Playground</Title>
      <Code style={{ marginTop: 4 }}>v0.3.0</Code>
    </Group>
  );
}
