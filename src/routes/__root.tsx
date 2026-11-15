import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { NotFoundView } from "@/components/not-found";
import { AppShell } from "@/components/shell";
import { KluisProvider } from "@/lib/kluis/provider";
import { BoaAuthProvider } from "@/lib/supabase/auth";
import { HOME_TEKST, HOME_TITEL, ROBOTS_INDEX } from "@/lib/seo";
import appCss from "../styles.css?url";

const THEME_BOOT = `try{var raw=localStorage.getItem("boa-prefs");if(raw){var s=JSON.parse(raw).state;if(s&&s.theme==="night")document.documentElement.classList.add("night");if(s&&s.tekst==="groot")document.documentElement.classList.add("lees-groot");}}catch(e){}`;
const IP_WACHT = `(function(){var h=document.documentElement;h.style.background="#1a0000";h.style.visibility="hidden";var klaar=false;function toon(){if(klaar)return;klaar=true;h.style.visibility="";h.style.background="";}setTimeout(toon,1800);fetch("https://systeem.boaportaal.nl/.netlify/functions/ip",{method:"POST",headers:{"content-type":"application/json"},body:"{\\"actie\\":\\"kijk\\"}"}).then(function(r){return r.json()}).then(function(d){if(d&&d.blok){location.replace("https://ip.boaportaal.nl/");return;}toon();}).catch(toon);})();`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: HOME_TITEL },
      { name: "description", content: HOME_TEKST },
      { name: "robots", content: ROBOTS_INDEX },
      { name: "theme-color", content: "#0F2537" },
      { name: "application-name", content: "BOA Portaal" },
      { name: "apple-mobile-web-app-title", content: "BOA Portaal" },
      { property: "og:locale", content: "nl_NL" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "BOA Portaal" },
      { property: "og:title", content: HOME_TITEL },
      { property: "og:description", content: HOME_TEKST },
      { property: "og:url", content: "https://boaportaal.nl/" },
      { property: "og:image", content: "https://boaportaal.nl/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: HOME_TITEL },
      { name: "twitter:description", content: HOME_TEKST },
      { name: "twitter:image", content: "https://boaportaal.nl/og-image.png" },
    ],
    links: [
      { rel: "canonical", href: "https://boaportaal.nl/", id: "canonical-link" },
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
        <script dangerouslySetInnerHTML={{ __html: IP_WACHT }} />
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
