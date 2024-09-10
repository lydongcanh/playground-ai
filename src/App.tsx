import { useState } from "react";
import { AppShell, NavLink, Burger } from "@mantine/core";
import { IconPdf, IconBarbell, IconMessage } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import PDFViewer from "./components/features/PDFViewer";
import GeminiChat from "./components/features/GeminiChat";
import Header from "./components/layout/Header";
import GymTrainingPlanRecommendation from "./components/features/GymTrainingPlanRecommendation";

function App() {
  const [opened, { toggle }] = useDisclosure();
  const [navId, setNavId] = useState<number>(0);

  const Main = () => {
    if (navId === 0) {
      return <GymTrainingPlanRecommendation />;
    } else if (navId === 1) {
      return <PDFViewer />;
    } else {
      return <GeminiChat />;
    }
  };

  return (
    <AppShell header={{ height: 54, offset: true }} padding="md" navbar={{ width: 150, breakpoint: "sm", collapsed: { mobile: !opened } }}>
      <AppShell.Header style={{ padding: 8 }}>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <Header />
      </AppShell.Header>
      <AppShell.Navbar>
        <NavLink
          variant="filled"
          active={navId === 0}
          onClick={() => setNavId(0)}
          label="Fitness Coach"
          leftSection={<IconBarbell size="1rem" stroke={1.5} />}
        />
        <NavLink
          active={navId === 1}
          variant="filled"
          onClick={() => setNavId(1)}
          label="Documents"
          leftSection={<IconPdf size="1rem" stroke={1.5} />}
        />
        <NavLink
          variant="filled"
          active={navId === 2}
          onClick={() => setNavId(2)}
          label="Chat"
          leftSection={<IconMessage size="1rem" stroke={1.5} />}
        />
      </AppShell.Navbar>
      <AppShell.Main>
        <Main />
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
