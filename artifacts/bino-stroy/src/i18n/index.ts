import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import uz from './uz.json';
import ru from './ru.json';
import en from './en.json';

const supported = ['uz', 'ru', 'en'] as const;
const saved = typeof window !== 'undefined' ? window.localStorage.getItem('bino-language') : null;
const browserLanguage = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2).toLowerCase() : 'uz';
const initialLanguage = saved && supported.includes(saved as (typeof supported)[number])
  ? saved
  : supported.includes(browserLanguage as (typeof supported)[number]) ? browserLanguage : 'uz';

void i18n.use(initReactI18next).init({
  resources: { uz: { translation: uz }, ru: { translation: ru }, en: { translation: en } },
  lng: initialLanguage,
  fallbackLng: 'uz',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (language) => {
  if (typeof document !== 'undefined') document.documentElement.lang = language;
  if (typeof window !== 'undefined') window.localStorage.setItem('bino-language', language);
});

export default i18n;
