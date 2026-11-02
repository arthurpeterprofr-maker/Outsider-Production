const KEY = "op-intro-seen";

export const SHOW_INTRO = typeof window !== "undefined" && !sessionStorage.getItem(KEY);
export const INTRO_DELAY = SHOW_INTRO ? 2.4 : 0;
export const markIntroSeen = () => sessionStorage.setItem(KEY, "1");
