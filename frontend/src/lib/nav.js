import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { scrollToId } from "./smooth";
import { useLang } from "./i18n";

export const useGoTo = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useLang();
  return useCallback((id) => {
    const route = (t.nav || []).find((n) => n.id === id)?.route;
    if (route) {
      navigate(route);
      window.scrollTo(0, 0);
    } else if (pathname !== "/") {
      navigate("/", { state: { scrollTo: id } });
    } else {
      scrollToId(id);
    }
  }, [navigate, pathname, t.nav]);
};
