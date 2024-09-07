import { Title, Code, Group, Avatar } from "@mantine/core";
import { IconAi } from "@tabler/icons-react";

export default function Header() {
  return (
    <Group>
      <Avatar color="blue" style={{ marginLeft: 8 }}>
        <IconAi size="1.5rem" />
      </Avatar>
      <Title order={3}>Playground</Title>
      <Code style={{ marginTop: 4 }}>v0.2.0</Code>
    </Group>
  );
}
