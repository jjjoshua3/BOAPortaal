type Seo = {
  meta: ({ title: string } | { name: string; content: string } | { property: string; content: string })[];
  links: { rel: string; href: string }[];
};

export function seo(pad: string, title: string, description: string): Seo {
  const href = pad === "/" ? "https://boaportaal.nl/" : `https://boaportaal.nl${pad}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "BOA Portaal" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: href },
      { property: "og:locale", content: "nl_NL" },
    ],
    links: [{ rel: "canonical", href }],
  };
}
