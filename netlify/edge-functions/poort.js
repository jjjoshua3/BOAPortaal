export default async (request, context) => {
  const url = new URL(request.url);
  if (url.hostname === "ip.boaportaal.nl") return context.next();
  if (url.pathname === "/.netlify/functions/ip") return context.next();
  if (/\.(?:js|mjs|css|map|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|txt|xml|webmanifest|json)$/i.test(url.pathname)) {
    return context.next();
  }
  const ip = context.ip || request.headers.get("x-nf-client-connection-ip") || "";
  if (!ip) return context.next();
  const control = new AbortController();
  const timer = setTimeout(() => control.abort(), 2000);
  try {
    const res = await fetch("https://systeem.boaportaal.nl/.netlify/functions/ip", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ actie: "kijk", ip }),
      signal: control.signal,
    });
    const data = await res.json();
    if (data?.blok) return Response.redirect("https://ip.boaportaal.nl/", 302);
  } catch {
    return context.next();
  } finally {
    clearTimeout(timer);
  }
  return context.next();
};
