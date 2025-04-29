import { useState } from "react";
import { AppShell, NavLink, Burger, Button, Avatar, Text, Stack } from "@mantine/core";
import { IconBarbell, IconMessage, IconLogin, IconLogout, IconBrandBlackberry, IconFileCode } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useAuth0 } from "@auth0/auth0-react";
import DocumentsTranslation from "./components/features/DocumentsRedaction";
import GeminiChat from "./components/features/GeminiChat";
import Header from "./components/layout/Header";
import GymTrainingPlanRecommendation from "./components/features/GymTrainingPlanRecommendation";
import DocumentsComparison from "./components/features/DocumentsComparison";

function App() {
  const [opened, { toggle }] = useDisclosure();
  const [navId, setNavId] = useState<number>(0);
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

  const Main = () => {
    if (navId === 0) {
      return <GymTrainingPlanRecommendation />;
    } else if (navId === 1) {
      return <DocumentsTranslation />;
    } else if (navId === 2) {
      return <DocumentsComparison />;
    } else {
      return <GeminiChat />;
    }
  };

  return (
    <AppShell header={{ height: 54, offset: true }} padding="md" navbar={{ width: 210, breakpoint: "sm", collapsed: { mobile: !opened } }}>
      <AppShell.Header style={{ padding: 8 }}>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <Header />
      </AppShell.Header>
      <AppShell.Navbar>
        <Stack justify="space-between" style={{ height: "100%" }}>
          <Stack gap={0}>
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
              label="Documents Redaction"
              leftSection={<IconBrandBlackberry size="1rem" stroke={1.5} />}
            />
            <NavLink
              active={navId === 2}
              variant="filled"
              onClick={() => setNavId(2)}
              label="Documents Comparison"
              leftSection={<IconFileCode size="1rem" stroke={1.5} />}
            />
            <NavLink
              variant="filled"
              active={navId === 3}
              onClick={() => setNavId(3)}
              label="Chat"
              disabled
              leftSection={<IconMessage size="1rem" stroke={1.5} />}
            />
          </Stack>
          {isAuthenticated ? (
            <Stack align="center" gap="xs">
              <Avatar src={user?.picture} alt={user?.name} radius="xl" />
              <Text size="sm" fw={500}>
                {user?.name}
              </Text>
              <Button
                variant="light"
                leftSection={<IconLogout size="1rem" />}
                onClick={() => logout({ logoutParams: { returnTo: `${window.location.origin}/playground-ai` } })}
                fullWidth
              >
                Logout
              </Button>
            </Stack>
          ) : (
            <Button variant="light" leftSection={<IconLogin size="1rem" />} onClick={() => loginWithRedirect()} fullWidth>
              Login
            </Button>
          )}
        </Stack>
      </AppShell.Navbar>
      <AppShell.Main>
        <Main />
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
