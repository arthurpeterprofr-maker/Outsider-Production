import { useLang } from "../lib/i18n";
import { AdGrid } from "./AdGrid";
import { HomeStrip, HOME_LIMIT } from "./Films";

export const Commercials = () => {
  const { t, site } = useLang();
  const items = Array.isArray(site.commercials) ? site.commercials : [];
  const c = t.commercials;
  return (
    <HomeStrip id="commercials" testId="commercials-section" label={c.label} title={(c.title || []).join(" ")} to="/publicites"
      viewAll={c.viewAll} count={items.length > HOME_LIMIT ? items.length : 0}>
      {(strip) => <AdGrid items={items.slice(0, HOME_LIMIT)} strip={strip} />}
    </HomeStrip>
  );
};
