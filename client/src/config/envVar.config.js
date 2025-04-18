export function getRecaptchaKey() {
  return import.meta.env.VITE_RECAPTCHA_SITE_KEY;
}

const FALLBACK_IMG = import.meta.env.VITE_FALLBACK_IMG;
export { FALLBACK_IMG };

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5005";
export { API_URL };

const DEFAULT_PASS = import.meta.env.VITE_DEFAULT_PASS || "Pass123";
export { DEFAULT_PASS };
