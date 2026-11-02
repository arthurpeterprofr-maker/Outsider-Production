const KEY = "op-intro-seen";

export const SHOW_INTRO = typeof window !== "undefined" && !sessionStorage.getItem(KEY);
export const INTRO_DELAY = SHOW_INTRO ? 2.4 : 0;
let played = !SHOW_INTRO;

export const introPending = () => !played;
export const getIntroDelay = () => (played ? 0 : INTRO_DELAY);
export const markIntroSeen = () => {
  sessionStorage.setItem(KEY, "1");
};
export const markIntroPlayed = () => {
  played = true;
};
