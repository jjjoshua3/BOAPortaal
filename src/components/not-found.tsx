import { Link } from "@tanstack/react-router";

export function NotFoundView() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <p className="font-mono text-xs tracking-wide text-muted">404 | ROUTE</p>
      <div className="mt-4 flex items-center gap-4">
        <img src="/boa-mark.png" alt="" className="size-16 shrink-0" />
        <div>
          <h1 className="font-mono text-5xl font-semibold leading-none tracking-tight sm:text-6xl">404</h1>
          <p className="mt-2 text-lg font-semibold">Deze pagina staat niet in het portaal.</p>
        </div>
      </div>
      <p className="mt-4 max-w-xl text-sm text-muted">
        Het adres klopt niet, of de pagina is verplaatst. Feitcodes, zakkaart en de rest van de naslag zijn er nog.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link to="/" className="btn btn-brand">
          Naar de start
        </Link>
        <Link to="/feitcodes" className="btn">
          Feitcodes
        </Link>
        <Link to="/zakkaart" className="btn">
          Zakkaart
        </Link>
        <Link to="/privacy" className="btn">
          Privacy
        </Link>
      </div>
    </div>
  );
}
