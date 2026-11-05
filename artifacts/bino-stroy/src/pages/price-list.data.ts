export type PriceProduct = {
  id: string;
  thickness: '2.0' | '2.5' | '3.0' | '4.0' | '±0.2';
  foil: boolean;
  base: 'fiberglass' | 'polyester';
  uzs: number;
  photo: string;
  needsVerification?: boolean;
};
export const products: PriceProduct[] = [
  { id: 'fiber-20-foil', thickness: '2.0', foil: true, base: 'fiberglass', uzs: 17000, photo: '/price-images/product-1.webp' },
  { id: 'fiber-20-plain', thickness: '2.0', foil: false, base: 'fiberglass', uzs: 16000, photo: '/price-images/product-2.webp' },
  { id: 'fiber-25-foil', thickness: '2.5', foil: true, base: 'fiberglass', uzs: 18000, photo: '/price-images/product-3.webp' },
  { id: 'fiber-25-plain', thickness: '2.5', foil: false, base: 'fiberglass', uzs: 17000, photo: '/price-images/product-4.webp' },
  { id: 'fiber-30-foil', thickness: '3.0', foil: true, base: 'fiberglass', uzs: 20000, photo: '/price-images/product-5.webp' },
  { id: 'fiber-30-plain', thickness: '3.0', foil: false, base: 'fiberglass', uzs: 19000, photo: '/price-images/product-6.webp' },
  { id: 'fiber-40-foil', thickness: '4.0', foil: true, base: 'fiberglass', uzs: 25000, photo: '/price-images/product-7.webp' },
  { id: 'fiber-40-plain', thickness: '4.0', foil: false, base: 'fiberglass', uzs: 24000, photo: '/price-images/product-8.webp' },
  { id: 'polyester-foil', thickness: '±0.2', foil: true, base: 'polyester', uzs: 300000, photo: '/price-images/polyester-photo-foil.webp', needsVerification: true },
  { id: 'polyester-plain', thickness: '±0.2', foil: false, base: 'polyester', uzs: 290000, photo: '/price-images/polyester-photo-plain.webp', needsVerification: true },
];

export type PriceLang = 'uz' | 'ru' | 'en' | 'zh';
export type FxCode = 'USD' | 'RUB' | 'CNY';
export type FxRates = { rates: Record<FxCode, number>; date: string; source: 'live' | 'saved' | 'snapshot' };

export const lastVerifiedSnapshot: FxRates = {
  rates: { USD: 11903.15, RUB: 146.75, CNY: 1783.4 },
  date: '2026-10-23',
  source: 'snapshot',
};

export const currencyForLanguage: Record<PriceLang, 'UZS' | FxCode> = {
  uz: 'UZS', ru: 'RUB', en: 'USD', zh: 'CNY',
};

export function convertPrice(uzs: number, language: PriceLang, fx: FxRates): number {
  const code = currencyForLanguage[language];
  if (code === 'UZS') return uzs;
  const rate = fx.rates[code];
  return Number.isFinite(rate) && rate > 0 ? uzs / rate : NaN;
}

export function formatPrice(uzs: number, language: PriceLang, fx: FxRates): string {
  const price = convertPrice(uzs, language, fx);
  if (!Number.isFinite(price)) return '—';
  if (language === 'uz') return `${new Intl.NumberFormat('uz-UZ', {maximumFractionDigits: 0}).format(price).replace(/\u00a0/g,' ')} so‘m`;
  const locale = language === 'ru' ? 'ru-RU' : language === 'zh' ? 'zh-CN' : 'en-US';
  const symbol = language === 'ru' ? '₽' : language === 'zh' ? '¥' : '$';
  const n = new Intl.NumberFormat(locale, {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(price);
  return language === 'ru' ? `${n} ${symbol}` : `${symbol}${n}`;
}

export function parseCbuRates(data: unknown): FxRates | null {
  if (!Array.isArray(data)) return null;
  const read = (code: FxCode) => data.find((item) => item && item.Ccy === code) as { Rate?: unknown; Nominal?: unknown; Date?: unknown } | undefined;
  const usd = read('USD'), rub = read('RUB'), cny = read('CNY');
  if (!usd || !rub || !cny) return null;
  const rates = { USD: Number(usd.Rate) / (Number(usd.Nominal) || 1), RUB: Number(rub.Rate) / (Number(rub.Nominal) || 1), CNY: Number(cny.Rate) / (Number(cny.Nominal) || 1) };
  if (Object.values(rates).some(value => !Number.isFinite(value) || value <= 0)) return null;
  const published = String(usd.Date ?? '');
  const match = published.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return null;
  return { rates, date: `${match[3]}-${match[2]}-${match[1]}`, source: 'live' };
}
