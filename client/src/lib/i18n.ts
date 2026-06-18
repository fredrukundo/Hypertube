import en from "@/i18n/en.json";
import fr from "@/i18n/fr.json";

export const translations = {
  en,
  fr,
};

export function getTranslation(lang: string) {
  return translations[lang as keyof typeof translations] || en;
}