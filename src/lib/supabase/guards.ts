import zxcvbn from "zxcvbn";

const BLOCKED = new Set([
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "hotmail.nl",
  "hotmail.co.uk",
  "outlook.com",
  "outlook.nl",
  "live.nl",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "yahoo.com",
  "yahoo.nl",
  "yahoo.co.uk",
  "ziggo.nl",
  "kpnmail.nl",
  "planet.nl",
  "hetnet.nl",
  "protonmail.com",
  "proton.me",
  "pm.me",
  "gmx.com",
  "gmx.nl",
  "mail.com",
  "aol.com",
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamailblock.com",
  "10minutemail.com",
  "yopmail.com",
  "tempmail.com",
  "trashmail.com",
  "sharklasers.com",
  "dispostable.com",
  "getnada.com",
  "moakt.com",
]);

const OWNER = new Set(["joshua.bosma@kpnmail.nl"]);

const DISPOSABLE = /(tempmail|guerrillamail|mailinator|10minutemail|yopmail|trashmail|sharklasers|dispostable|minuteinbox|maildrop)/i;

export function emailDomainError(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  if (OWNER.has(trimmed)) return null;
  const match = trimmed.match(/^[^\s@]+@([^\s@]+\.[^\s@]+)$/);
  if (!match) return "Vul een volledig zakelijk of schooladres in.";
  const domain = match[1] ?? "";
  const labels = domain.split(".");
  for (let i = 0; i < labels.length - 1; i += 1) {
    const parent = labels.slice(i).join(".");
    if (BLOCKED.has(parent) || DISPOSABLE.test(parent)) {
      return "Gratis of particuliere mailboxen zijn niet toegestaan. Gebruik het domein van je gemeente, vervoerder, school of organisatie.";
    }
  }
  return null;
}

export function passwordIssues(password: string, extra: string[] = []): string[] {
  const issues: string[] = [];
  if (password.length < 12) issues.push("minimaal 12 tekens");
  if (password.length > 200) issues.push("maximaal 200 tekens");
  if (!/[A-Z]/.test(password)) issues.push("één hoofdletter");
  if (!/[0-9]/.test(password)) issues.push("één cijfer");
  if (!/[^A-Za-z0-9]/.test(password)) issues.push("één speciaal teken");
  if (password.length < 4) return issues;
  const score = zxcvbn(password, extra.map((deel) => String(deel || "")).filter((deel) => deel.length > 1));
  const dagen = Math.floor(Number(score.crack_times_seconds?.offline_fast_hashing_1e10_per_second || 0) / 86400);
  if (dagen < 30) issues.push(`minstens 30 dagen kraaktijd, nu ${dagen}. Een zin van vier willekeurige woorden`);
  return issues;
}

export function passwordScore(password: string, extra: string[] = []): number {
  if (!password) return 0;
  const classes = [/[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length;
  if (password.length < 8 || classes === 0) return 0;
  if (password.length < 12 || classes < 2) return 1;
  const score = zxcvbn(password, extra.map((deel) => String(deel || "")).filter((deel) => deel.length > 1));
  const dagen = Math.floor(Number(score.crack_times_seconds?.offline_fast_hashing_1e10_per_second || 0) / 86400);
  if (dagen < 1 || classes < 3) return 2;
  if (dagen < 30) return 3;
  return 4;
}

export function wachtwoordIsZwak(password: string, extra: string[] = []): boolean {
  return passwordIssues(password, extra).length > 0;
}

export function mapAuthError(message: string, email = ""): string {
  const m = message.toLowerCase();
  const eigen = email.trim().toLowerCase() === "joshua.bosma@kpnmail.nl";
  if (m.includes("invalid login") || m.includes("invalid credentials")) {
    return "Onjuist e-mailadres of wachtwoord.";
  }
  if (m.includes("email not confirmed")) {
    return "Bevestig eerst het adres met de code uit de mail van account@boaportaal.nl.";
  }
  if (m.includes("already registered") || m.includes("already been registered")) {
    return "Dit adres is al geregistreerd. Log in of stel het wachtwoord opnieuw in.";
  }
  if (m.includes("rate") || m.includes("too many")) {
    return "Te veel pogingen. Wacht even en probeer het opnieuw.";
  }
  if (m.includes("database error saving new user") || m.includes("unexpected_failure")) {
    if (eigen) {
      return "Niet aangemaakt. De database wijst joshua.bosma@kpnmail.nl zelf af. In reject_free_email moet dat adres return new; doen, vóór de blokkade op kpnmail.nl. Nu staat daar een raise.";
    }
    return "Niet aangemaakt. Dit adres wordt door de database geweigerd. Gebruik het domein van je organisatie, vervoerder of school.";
  }
  if (m.includes("otp") || m.includes("token") || m.includes("expired")) {
    return "De code klopt niet of is verlopen. Vraag een nieuwe mail aan bij account@boaportaal.nl.";
  }
  if (m.includes("password")) {
    return "Het wachtwoord voldoet niet aan de eisen van de server of van dit portaal.";
  }
  if (m.includes("gratis") || m.includes("niet toegestaan") || m.includes("registratie geweigerd") || m.includes("not allowed") || m.includes("domain")) {
    const zin = message.trim();
    if (eigen) {
      return `${zin} De insert in auth.users wordt door reject_free_email afgebroken. Dat adres moet daar return new; zijn. Een raise blokkeert ook een SQL-insert.`;
    }
    return zin || "Dit e-maildomein is niet toegestaan.";
  }
  if (m.includes("network") || m.includes("fetch")) {
    return "Geen verbinding met het accountsysteem. Probeer het opnieuw.";
  }
  return message.trim() || "Het accountsysteem weigerde het verzoek. Controleer het adres en probeer het opnieuw.";
}
