import { useLang } from "../lib/i18n";
import { AdGrid } from "./AdGrid";
import { SectionHead, SeeAll, HOME_LIMIT } from "./Films";

export const Commercials = () => {
  const { t, site } = useLang();
  const items = Array.isArray(site.commercials) ? site.commercials : [];
  const c = t.commercials;
  return (
    <section id="commercials" className="relative border-t border-white/10 bg-[#050505] py-24 sm:py-36" data-testid="commercials-section">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-10">
        <SectionHead label={c.label} title={(c.title || []).join(" ")} intro={c.intro} />
        <div className="mt-16"><AdGrid items={items.slice(0, HOME_LIMIT)} /></div>
        <SeeAll to="/publicites" label={c.viewAll} count={items.length > HOME_LIMIT ? items.length : 0} testId="commercials-see-all" />
      </div>
    </section>
  );
};
