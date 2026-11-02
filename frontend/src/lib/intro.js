const KEY = "op-intro-seen";

export const SHOW_INTRO = typeof window !== "undefined" && !sessionStorage.getItem(KEY);
export const INTRO_MS = 3800;
export const INTRO_DELAY = SHOW_INTRO ? INTRO_MS / 1000 + 0.5 : 0;
let played = !SHOW_INTRO;

export const introPending = () => !played;
export const getIntroDelay = () => (played ? 0 : INTRO_DELAY);
export const markIntroSeen = () => {
  sessionStorage.setItem(KEY, "1");
};
export const markIntroPlayed = () => {
  played = true;
};
