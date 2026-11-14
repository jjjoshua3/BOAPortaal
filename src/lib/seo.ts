type Seo = {
  meta: ({ title: string } | { name: string; content: string } | { property: string; content: string })[];
  links: { rel: string; href: string; id?: string }[];
  scripts?: { type: string; children: string }[];
};

const SITE = "https://boaportaal.nl";
const OG = `${SITE}/og-image.png`;
export const ROBOTS_INDEX = "index, follow, max-image-preview:large, max-snippet:-1";
export const ROBOTS_HIDDEN = "noindex, nofollow";

export const HOME_TITEL = "BOA Portaal | Feitcodes, Beslisbomen & Zakboek voor Handhaving (Domein I t/m VI)";
export const HOME_TEKST =
  "Het praktijk- en referentieplatform voor Buitengewoon Opsporingsambtenaren (BOA), HTV-studenten en docenten in Nederland. Direct toegang tot feitcodes, beslisbomen, cautie-voorbeelden, begrippen en zakkaartjes voor Domein 1 t/m 6.";

function absoluut(pad: string): string {
  if (!pad || pad === "/") return `${SITE}/`;
  return `${SITE}${pad.startsWith("/") ? pad : `/${pad}`}`;
}

export function seo(pad: string, title: string, description: string, index = true): Seo {
  const href = absoluut(pad);
  const robots = index ? ROBOTS_INDEX : ROBOTS_HIDDEN;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: robots },
      { property: "og:locale", content: "nl_NL" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "BOA Portaal" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: href },
      { property: "og:image", content: OG },
      { property: "og:image:alt", content: "BOA Portaal" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: OG },
    ],
    links: [{ rel: "canonical", href, id: "canonical-link" }],
    scripts: pad === "/" ? [{ type: "application/ld+json", children: schema(description) }] : undefined,
  };
}

function schema(description: string): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE}/#website`,
        name: "BOA Portaal",
        url: `${SITE}/`,
        description,
        inLanguage: "nl-NL",
        publisher: { "@id": `${SITE}/#org` },
      },
      {
        "@type": ["EducationalOrganization", "WebApplication"],
        "@id": `${SITE}/#org`,
        name: "BOA Portaal",
        url: `${SITE}/`,
        description,
        inLanguage: "nl-NL",
        areaServed: "NL",
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        isAccessibleForFree: true,
        knowsAbout: [
          "Handhaving, Toezicht en Veiligheid",
          "Buitengewoon opsporingsambtenaar",
          "Feitcodes",
          "Beslisbomen",
          "Zakboek handhaving",
        ],
      },
    ],
  });
}

function metaZetten(name: string, content: string) {
  let el = document.head.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/** Bijwerken van title, description, canonical en robots na een client-navigatie of soft-404. */
export function updateSEOMeta(route: { title: string; description: string; pad: string; index: boolean }) {
  if (typeof document === "undefined") return;
  document.title = route.title;
  metaZetten("description", route.description);
  metaZetten("robots", route.index ? ROBOTS_INDEX : ROBOTS_HIDDEN);
  const href = absoluut(route.pad);
  const bestaand = document.getElementById("canonical-link");
  const link = bestaand instanceof HTMLLinkElement ? bestaand : document.createElement("link");
  if (!(bestaand instanceof HTMLLinkElement)) {
    link.id = "canonical-link";
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = href;
}
