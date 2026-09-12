import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-[100svh] w-full flex flex-col justify-between overflow-hidden border-b border-hairline">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(122,46,46,0.08), transparent 60%)",
        }}
      />

      <div className="relative z-10 flex items-center justify-between px-6 md:px-12 pt-8">
        <span className="text-xs tracking-wider2 text-ash">WHITE F.P.G.</span>
        <nav className="text-xs tracking-wider2 text-ash">
          <Link href="/showroom" className="hover:text-bone transition-colors">
            Showroom
          </Link>
        </nav>
      </div>

      <div className="relative z-10 px-6 md:px-12">
        <h1 className="fpg-hero-reveal font-sans font-bold leading-[0.86] tracking-tightest text-bone select-none text-[19vw] md:text-[13vw]">
          WHITE
          <br />
          F.P.G.
        </h1>
      </div>

      <div className="relative z-10 flex items-end justify-between px-6 md:px-12 pb-10 md:pb-14 fpg-fade-in">
        <p className="max-w-xs text-sm text-ash leading-relaxed">
          Studio grafico indipendente. Cover, poster, loghi e opere visive,
          raccolte in un archivio in continua espansione.
        </p>
        <Link
          href="/showroom"
          className="group inline-flex items-center gap-3 border border-hairline px-6 py-3 text-xs tracking-wider2 text-bone hover:border-bone transition-colors duration-300"
        >
          ENTER SHOWROOM
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
            &#8594;
          </span>
        </Link>
      </div>
    </section>
  );
}
