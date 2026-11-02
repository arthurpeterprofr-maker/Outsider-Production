import { useLang } from "../lib/i18n";
import { PageShell, PageCta, usePageTitle } from "../components/PageParts";
import { SectionHead } from "../components/Films";
import { FilmGrid } from "../components/FilmGrid";
import { AdGrid } from "../components/AdGrid";

// Full catalogue page for films ("cinema") or commercials ("ads"), with filters.
export default function Catalogue({ kind }) {
  const { t, site } = useLang();
  const isFilms = kind === "films";
  const s = isFilms ? t.films : t.commercials;
  const items = Array.isArray(isFilms ? site.films : site.commercials) ? (isFilms ? site.films : site.commercials) : [];
  usePageTitle(s.label);
  return (
    <PageShell testId={isFilms ? "cinema-page" : "commercials-page"}>
      <section className="mx-auto max-w-[1500px] px-5 pb-10 pt-36 sm:px-10 sm:pt-44">
        <SectionHead as="h1" onLoad label={s.label} title={(s.title || []).join(" ")} intro={s.intro} italic={isFilms} />
        <div className="mt-16">
          {isFilms ? <FilmGrid films={items} filters cols="lg:grid-cols-4" /> : <AdGrid items={items} filters cols="lg:grid-cols-3" />}
        </div>
      </section>
      <PageCta label={t.films.moreCta} testId={isFilms ? "cinema-cta" : "commercials-cta"} />
    </PageShell>
  );
}
