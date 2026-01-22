import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
// Ensure you are importing from the react-router specific adapter
import { AppProvider } from "@shopify/shopify-app-react-router/react";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
      </head>
      <body>
        {/* The AppProvider MUST wrap the Outlet */}
        <AppProvider isEmbeddedApp>
          <Outlet />
        </AppProvider>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}