import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { MantineProvider, createTheme } from "@mantine/core";
import { Auth0Provider } from "@auth0/auth0-react";
import "@mantine/core/styles.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

const theme = createTheme({
  primaryColor: "teal",
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Auth0Provider
      domain="obourreal.au.auth0.com"
      clientId="rzqRa758gHnBcrPjgTPDtrdtPoGCSVyM"
      authorizationParams={{
        redirect_uri: `${window.location.origin}/playground-ai`,
      }}
    >
      <MantineProvider theme={theme}>
        <App />
      </MantineProvider>
    </Auth0Provider>
  </React.StrictMode>
);
