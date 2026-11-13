import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { NotFoundView } from "@/components/not-found";
import { AppShell } from "@/components/shell";
import { KluisProvider } from "@/lib/kluis/provider";
import { BoaAuthProvider } from "@/lib/supabase/auth";
import appCss from "../styles.css?url";

const THEME_BOOT = `try{var raw=localStorage.getItem("boa-prefs");if(raw){var s=JSON.parse(raw).state;if(s&&s.theme==="night")document.documentElement.classList.add("night");if(s&&s.tekst==="groot")document.documentElement.classList.add("lees-groot");}}catch(e){}`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "BOA Portaal" },
      { name: "description", content: "Naslag, feitcodes, zakkaartjes en praktijk voor buitengewoon opsporingsambtenaren. Domein I t/m VI." },
      { name: "theme-color", content: "#0F2537" },
      { name: "application-name", content: "BOA Portaal" },
      { name: "apple-mobile-web-app-title", content: "BOA Portaal" },
    ],
    links: [
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon-180.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootApp,
  notFoundComponent: NotFoundView,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body>
        <PreviewHostBridge />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootApp() {
  return (
    <AuthProvider>
      <BoaAuthProvider>
        <KluisProvider>
          <AppShell>
            <Outlet />
          </AppShell>
        </KluisProvider>
      </BoaAuthProvider>
    </AuthProvider>
  );
}
