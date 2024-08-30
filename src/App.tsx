import { useState } from "react";
import { AppShell, NavLink, Burger } from "@mantine/core";
import { IconPdf, IconRobot } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import PDFViewer from "./components/features/PDFViewer";
import GeminiChat from "./components/features/GeminiChat";
import Header from "./components/layout/Header";

function App() {
  const [opened, { toggle }] = useDisclosure();
  const [navId, setNavId] = useState<number>(0);

  const Main = () => {
    return navId === 0 ? <PDFViewer /> : <GeminiChat />;
  };

  return (
    <AppShell header={{ height: 54, offset: true }} padding="md" navbar={{ width: 150, breakpoint: "sm", collapsed: { mobile: !opened } }}>
      <AppShell.Header style={{ padding: 8 }}>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <Header />
      </AppShell.Header>
      <AppShell.Navbar>
        <NavLink
          active={navId === 0}
          variant="filled"
          onClick={() => setNavId(0)}
          label="Documents"
          leftSection={<IconPdf size="1rem" stroke={1.5} />}
        />
        <NavLink
          variant="filled"
          active={navId === 1}
          onClick={() => setNavId(1)}
          label="Chat"
          leftSection={<IconRobot size="1rem" stroke={1.5} />}
        />
      </AppShell.Navbar>
      <AppShell.Main>
        <Main />
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
