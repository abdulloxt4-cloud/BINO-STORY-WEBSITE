import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight, ArrowUpRight, BadgeCheck, ChevronDown, Download,
  Droplets, Filter, Layers, MessageCircle,
  Phone, Search, ShieldCheck, ThermometerSun, Wind, X,
} from 'lucide-react';
import {
  formatPrice, lastVerifiedSnapshot, parseCbuRates,
  products, type FxRates, type PriceLang, type PriceProduct,
} from './price-list.data';
import './price-list.css';

const languages: PriceLang[] = ['uz', 'ru', 'en', 'zh'];
const content = {
  uz: {
    home: 'Bosh sahifa', company: 'Kompaniya', products: 'Mahsulotlar', contact: 'Kontakt', priceList: 'Price List',
    eyebrow: 'SP OOO BINO', title: 'Price List', subtitle: 'Gidroizolyatsiya va tom yopish materiallari narxlari',
    download: 'PDF yuklab olish', inquiry: 'Narx so‘rash', order: 'Buyurtma berish', phone: 'Qo‘ng‘iroq',
    waterproofing: 'Gidroizolyatsion materiallar', roofing: 'Tom yopish materiallari', geotextile: 'Geotekstil materiallar',
    thermal: 'Issiqlik izolyatsiyasi materiallari', vapor: 'Bug‘ to‘sig‘i materiallari',
    catalogTitle: 'Gidroizolyatsion materiallar', foil: 'Folgali', plain: 'Folgasiz',
    base: 'Asosi', top: 'Usti', fiberglass: 'Steklotkan', polyester: 'Poliester', price: 'Narxi',
    name: 'Gidroizolyatsiya materiali', wideName: 'Poliester asosli material', thickness: 'Qalinligi',
    search: 'Mahsulot yoki qalinlikni qidirish', all: 'Hammasi', filter: 'Qidirish va filtrlash',
    table: 'Barcha narxlar jadvali', advantages: 'Mahsulot afzalliklari',
    strength: 'Yuqori mustahkamlik', strengthDesc: 'Ko‘p qatlamli, himoyalovchi tuzilma',
    temperature: 'Haroratga chidamli', temperatureDesc: 'Turli ob-havo sharoitlari uchun',
    waterproof: 'Suv o‘tkazmaydi', waterproofDesc: 'Namlikdan himoya qilishga mo‘ljallangan',
    install: 'Qulay montaj', installDesc: 'Maxsus texnologiya bo‘yicha yotqiziladi',
    guarantee: 'SP OOO BINO — sifatga e’tibor',
    guaranteeDesc: 'Taqdim etilgan hujjatda to‘g‘ri tashish, saqlash va malakali montaj sharoitida 10 yildan ortiq xizmat muddati ko‘rsatilgan.',
    tableDescription: 'Nomi', notPublished: 'Bu turdagi mahsulotlar narxlari hali katalogga kiritilmagan.',
    askPrice: 'Narxni so‘rash uchun so‘rov qoldiring', noResults: 'Mos mahsulot topilmadi',
    warning: 'Narxlar 2025-yildagi kompaniya hujjatidan olindi. Amaldagi narxni tasdiqlang. Oxirgi ikki pozitsiyaning birlik va qalinligini alohida tekshirish zarur.',
    fx: 'Valyuta konvertatsiyasi taxminiy. Asl narxlar so‘mda. Kurs:',
    fxFallback: 'Onlayn kurs olinmadi, sana ko‘rsatilgan saqlangan kurs ishlatilmoqda.',
    illustration: 'Mahsulot rasmlari tasdiqlangan dizayn maketidan olingan namunaviy tasvirlardir, haqiqiy mahsulot fotosuratlari emas.',
    uncertain: 'Tasdiqlansin', back: 'Saytga qaytish', unit: '/m²',
  },
  ru: {
    home: 'Главная', company: 'Компания', products: 'Продукция', contact: 'Контакты', priceList: 'Прайс-лист',
    eyebrow: 'SP OOO BINO', title: 'Прайс-лист', subtitle: 'Цены на кровельные и гидроизоляционные материалы',
    download: 'Сохранить PDF', inquiry: 'Уточнить цену', order: 'Оставить заявку', phone: 'Позвонить',
    waterproofing: 'Гидроизоляция', roofing: 'Кровельные материалы', geotextile: 'Геотекстиль',
    thermal: 'Теплоизоляция', vapor: 'Пароизоляция',
    catalogTitle: 'Гидроизоляционные материалы', foil: 'С фольгой', plain: 'Без фольги',
    base: 'Основа', top: 'Покрытие', fiberglass: 'Стеклоткань', polyester: 'Полиэстер', price: 'Цена',
    name: 'Гидроизоляционный материал', wideName: 'Материал на основе полиэстера', thickness: 'Толщина',
    search: 'Поиск по товару или толщине', all: 'Все', filter: 'Поиск и фильтры',
    table: 'Таблица цен', advantages: 'Преимущества продукции',
    strength: 'Высокая прочность', strengthDesc: 'Многослойная защитная структура',
    temperature: 'Устойчивость к температуре', temperatureDesc: 'Для различных погодных условий',
    waterproof: 'Водонепроницаемость', waterproofDesc: 'Защита от влаги',
    install: 'Удобный монтаж', installDesc: 'Укладка по специальной технологии',
    guarantee: 'SP OOO BINO — внимание к качеству',
    guaranteeDesc: 'В предоставленном документе указан срок службы свыше 10 лет при правильной транспортировке, хранении и профессиональном монтаже.',
    tableDescription: 'Наименование', notPublished: 'Цены для этой категории пока не опубликованы.',
    askPrice: 'Оставьте заявку, чтобы уточнить цену', noResults: 'Товары не найдены',
    warning: 'Цены взяты из документа компании за 2025 год. Подтвердите актуальность. Для двух последних строк требуется уточнить единицы и толщину.',
    fx: 'Пересчёт валют ориентировочный; исходные цены — в сумах. Курс:',
    fxFallback: 'Онлайн-курс недоступен; используется курс указанной даты.',
    illustration: 'Изображения взяты из утверждённого дизайн-макета и являются иллюстрациями, а не реальными фото продукции.',
    uncertain: 'Уточнить', back: 'На главную', unit: '/м²',
  },
  en: {
    home: 'Home', company: 'Company', products: 'Products', contact: 'Contact', priceList: 'Price List',
    eyebrow: 'SP OOO BINO', title: 'Price List', subtitle: 'Waterproofing and roofing membrane prices',
    download: 'Save as PDF', inquiry: 'Ask for price', order: 'Request a quote', phone: 'Call us',
    waterproofing: 'Waterproofing', roofing: 'Roofing materials', geotextile: 'Geotextile',
    thermal: 'Thermal insulation', vapor: 'Vapor barriers',
    catalogTitle: 'Waterproofing materials', foil: 'Foil-faced', plain: 'Non-foil',
    base: 'Base', top: 'Facing', fiberglass: 'Fiberglass', polyester: 'Polyester', price: 'Price',
    name: 'Waterproofing membrane', wideName: 'Polyester-based membrane', thickness: 'Thickness',
    search: 'Search products or thickness', all: 'All', filter: 'Search and filter',
    table: 'Full price comparison', advantages: 'Product advantages',
    strength: 'Strong construction', strengthDesc: 'Multi-layer protective structure',
    temperature: 'Temperature resistant', temperatureDesc: 'Designed for varying conditions',
    waterproof: 'Waterproof protection', waterproofDesc: 'Helps protect against moisture',
    install: 'Practical installation', installDesc: 'Installed using specialized techniques',
    guarantee: 'SP OOO BINO — commitment to quality',
    guaranteeDesc: 'The supplied document states a service life over 10 years with correct transport, storage and professional installation.',
    tableDescription: 'Product', notPublished: 'Prices for this category have not been published yet.',
    askPrice: 'Use the request form to ask for a quote', noResults: 'No matching products',
    warning: 'UZS prices are from a 2025 company sheet. Verify current pricing. The last two entries need unit and thickness confirmation.',
    fx: 'Currency conversions are estimates; source prices are in UZS. Rate date:',
    fxFallback: 'Live rates unavailable; showing the dated saved exchange rate.',
    illustration: 'Product images are illustrations from the approved design mockup, not actual product photographs.',
    uncertain: 'Confirm', back: 'Back to website', unit: '/m²',
  },
  zh: {
    home: '首页', company: '公司', products: '产品', contact: '联系', priceList: '价格表',
    eyebrow: 'SP OOO BINO', title: '产品价格表', subtitle: '防水及屋面卷材价格',
    download: '保存 PDF', inquiry: '询价', order: '提交询价', phone: '致电',
    waterproofing: '防水材料', roofing: '屋面材料', geotextile: '土工布',
    thermal: '保温材料', vapor: '隔汽材料',
    catalogTitle: '防水卷材', foil: '铝箔覆面', plain: '无铝箔',
    base: '胎基', top: '表层', fiberglass: '玻璃纤维', polyester: '聚酯胎基', price: '价格',
    name: '防水卷材', wideName: '聚酯胎基防水卷材', thickness: '厚度',
    search: '搜索产品或厚度', all: '全部', filter: '搜索与筛选',
    table: '完整价格表', advantages: '产品优势',
    strength: '结构坚固', strengthDesc: '多层保护结构',
    temperature: '耐温性能', temperatureDesc: '适应不同气候条件',
    waterproof: '防水防潮', waterproofDesc: '用于防止潮湿侵入',
    install: '施工方便', installDesc: '按照专业工艺施工',
    guarantee: 'SP OOO BINO — 品质承诺',
    guaranteeDesc: '所提供文件说明，正确运输、储存并由专业人员施工时，产品使用寿命超过10年。',
    tableDescription: '产品名称', notPublished: '此类别的价格尚未公布。',
    askPrice: '请通过询价表联系获取报价', noResults: '没有匹配的产品',
    warning: '苏姆价格来自公司2025年的价目表，请确认现行价格。最后两项须核实单位与厚度。',
    fx: '汇率转换仅供参考，原价以苏姆计。汇率日期：',
    fxFallback: '无法获取实时汇率，使用所示日期的汇率。',
    illustration: '产品图片取自已确认的设计示意图，并非真实产品照片。',
    uncertain: '待确认', back: '返回网站', unit: '/平方米',
  },
} as const;

type Category = 'waterproofing' | 'roofing' | 'geotextile' | 'thermal' | 'vapor';
type ProductFilter = 'all' | 'foil' | 'plain';
const categories: Category[] = ['waterproofing', 'roofing', 'geotextile', 'thermal', 'vapor'];
const categoryIcons = { waterproofing: Droplets, roofing: Layers, geotextile: Layers, thermal: ThermometerSun, vapor: Wind };
const cacheKey = 'spooobino-price-cbu-rates-v1';
function readRates(): FxRates {
  try {
    const cached = JSON.parse(window.localStorage.getItem(cacheKey) || 'null') as FxRates | null;
    if (cached && cached.date >= lastVerifiedSnapshot.date &&
      ['USD', 'RUB', 'CNY'].every(k => Number.isFinite(cached.rates[k as 'USD' | 'RUB' | 'CNY']) && cached.rates[k as 'USD' | 'RUB' | 'CNY'] > 0)) {
      return { ...cached, source: 'saved' };
    }
  } catch { /* storage may be unavailable */ }
  return lastVerifiedSnapshot;
}
function useRates(): FxRates {
  const [fx, setFx] = useState<FxRates>(readRates);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8500);
    const sourceUrls = [
      'https://cbu.uz/uz/arkhiv-kursov-valyut/json/',
    ];
    const load = async () => {
      for (const url of sourceUrls) {
        try {
          const response = await fetch(url, { signal: controller.signal });
          if (!response.ok) continue;
          const newRates = parseCbuRates(await response.json());
          if (newRates && newRates.date >= lastVerifiedSnapshot.date) {
            setFx(newRates);
            try { window.localStorage.setItem(cacheKey, JSON.stringify(newRates)); } catch { /* optional */ }
            break;
          }
        } catch { if (controller.signal.aborted) break; }
      }
    };
    void load().finally(() => window.clearTimeout(timeout));
    return () => { controller.abort(); window.clearTimeout(timeout); };
  }, []);
  return fx;
}

function scrollToProducts() {
  document.getElementById('bpl-products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function PriceList() {
  const { i18n } = useTranslation();
  const lang: PriceLang = languages.includes(i18n.language as PriceLang) ? i18n.language as PriceLang : 'uz';
  const t = content[lang];
  const fx = useRates();
  const [category, setCategory] = useState<Category>('waterproofing');
  const [filter, setFilter] = useState<ProductFilter>('all');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const orderUrl = '/#contact';
  const chooseLanguage = (code: PriceLang) => { void i18n.changeLanguage(code); };
  const shownProducts = useMemo(() => products.filter(p => {
    if (filter === 'foil' && !p.foil) return false;
    if (filter === 'plain' && p.foil) return false;
    const text = search.trim().toLocaleLowerCase();
    return !text || [p.thickness, p.id, t.name, t.wideName, p.foil ? t.foil : t.plain].join(' ').toLocaleLowerCase().includes(text);
  }), [filter, search, t]);

  useEffect(() => {
    document.title = `${t.priceList} | SP OOO BINO`;
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (meta) meta.content = `SP OOO BINO. ${t.subtitle}`;
  }, [lang, t]);

  const toPrice = (p: PriceProduct) => formatPrice(p.uzs, lang, fx);
  const savePDF = () => { setCategory('waterproofing'); setFilter('all'); setSearch(''); window.setTimeout(() => window.print(), 120); };
  const selectCategory = (next: Category) => { setCategory(next); setFilter('all'); setSearch(''); scrollToProducts(); };
  const card = (p: PriceProduct) => {
    const isWide = p.base === 'polyester';
    const name = isWide ? t.wideName : t.name;
    return <article className={`bpl-product ${isWide ? 'bpl-product-wide' : ''}`} key={p.id}>
      <div className="bpl-photo">
        <img loading="lazy" decoding="async" width={isWide ? 540 : 620} height="240" src={p.photo}
          alt={`${name}: ${p.thickness} mm, ${p.foil ? t.foil : t.plain}`} />
      </div>
      <div className="bpl-product-info">
        <h3>{name}{!isWide && <small> ({p.thickness} mm)</small>}</h3>
        {isWide && <span className="bpl-uncertain">{p.thickness} mm · {t.uncertain}</span>}
        <p><Droplets size={13} aria-hidden="true"/>{t.top}: <strong>{p.foil ? t.foil : t.plain}</strong></p>
        <p><Layers size={13} aria-hidden="true"/>{t.base}: <strong>{p.base === 'polyester' ? t.polyester : t.fiberglass}</strong></p>
        <a className="bpl-price" href="/#contact"
          aria-label={`${t.order}: ${name}, ${p.thickness} mm`} title={t.order}>
          <strong>{toPrice(p)}</strong><small>{t.unit}</small><ArrowUpRight className="bpl-card-arrow" size={17} aria-hidden="true"/>
        </a>
      </div>
    </article>;
  };

  return <div className="bpl">
    <header className="bpl-header">
      <div className="bpl-header-inner">
        <a href="/" className="bpl-logo" aria-label="SP OOO BINO">
          <img src="/price-images/bino-design-mark.webp" alt="SP OOO BINO" width="112" height="49" />
        </a>
        <nav aria-label="Price List navigation" className="bpl-nav">
          <a href="/">{t.home}</a><a href="/#why">{t.company}</a>
          <a href="/#product">{t.products}</a>
          <span aria-current="page">{t.priceList}</span><a href="/#contact">{t.contact}</a>
        </nav>
        <div className="bpl-header-right">
          <div className="bpl-langs" aria-label="Languages" role="group">
            {languages.map(code => <button type="button" key={code} onClick={() => chooseLanguage(code)}
              aria-pressed={lang === code} className={lang === code ? 'active' : ''}>{code === 'zh' ? '中文' : code.toUpperCase()}</button>)}
          </div>
          <a className="bpl-whatsapp" href="https://wa.me/998977240002" target="_blank" rel="noopener noreferrer"><MessageCircle size={16}/><span>WhatsApp</span></a>
        </div>
      </div>
    </header>

    <main>
      <section className="bpl-hero" aria-labelledby="bpl-h1">
        <div className="bpl-hero-image" role="img" aria-label={t.waterproofing}/>
        <div className="bpl-hero-inner">
          <div className="bpl-hero-label">{t.eyebrow}</div>
          <h1 id="bpl-h1">{t.title}</h1>
          <p>{t.subtitle}</p>
          <div className="bpl-hero-actions">
            <button onClick={savePDF} type="button" className="bpl-button-primary"><Download size={16}/>{t.download}</button>
            <a href={orderUrl} className="bpl-button-light"><MessageCircle size={16}/>{t.inquiry}</a>
            <a href="tel:+998977240002" className="bpl-button-phone"><Phone size={15}/> +998 97 724 00 02</a>
          </div>
        </div>
      </section>

      <div className="bpl-category-shell">
        <nav className="bpl-category-bar" aria-label={t.products}>
          {categories.map(c => {
            const Icon = categoryIcons[c];
            return <button type="button" key={c} onClick={() => selectCategory(c)}
              className={`bpl-category ${category === c ? 'active' : ''}`} aria-pressed={category === c}>
              <Icon size={25} strokeWidth={1.7} aria-hidden="true"/><span>{t[c]}</span>
            </button>;
          })}
        </nav>
      </div>

      <section className="bpl-catalog" id="bpl-products" aria-labelledby="bpl-products-title">
        <div className="bpl-title-row">
          <div><h2 id="bpl-products-title">{category === 'waterproofing' ? t.catalogTitle : t[category]}</h2><div className="bpl-heading-rule"/></div>
          {category === 'waterproofing' && <button className="bpl-filter-toggle" type="button" aria-expanded={showSearch} onClick={() => setShowSearch(!showSearch)}><Filter size={16}/>{t.filter}<ChevronDown size={15}/></button>}
        </div>
        {category === 'waterproofing' ? <>
          {showSearch && <div className="bpl-filter-panel">
            <label className="bpl-search"><Search size={17}/><input placeholder={t.search} aria-label={t.search} value={search} onChange={e => setSearch(e.target.value)}/>{search && <button type="button" onClick={() => setSearch('')}><X size={15}/></button>}</label>
            <div className="bpl-filter-options">{(['all','foil','plain'] as ProductFilter[]).map(value => <button key={value} type="button" aria-pressed={value===filter} onClick={() => setFilter(value)} className={filter===value?'active':''}>{t[value]}</button>)}</div>
          </div>}
          {shownProducts.length ? <div className="bpl-product-grid">
            {shownProducts.map((p) => card(p))}
          </div> : <div className="bpl-no-results">{t.noResults}</div>}
        </> : <div className="bpl-unpublished"><p>{t.notPublished}</p><a className="bpl-button-primary" href={orderUrl}>{t.askPrice}<ArrowRight size={16}/></a></div>}
      </section>

      <section className="bpl-information" aria-label={t.table}>
        <div className="bpl-table-box">
          <h2>{t.table}</h2>
          <div className="bpl-table-wrapper"><table><thead><tr><th>{t.thickness}</th><th>{t.top}</th><th>{t.base}</th><th>{t.price} ({lang==='uz'?'so‘m':lang==='ru'?'₽':lang==='en'?'$':'¥'}{t.unit})</th></tr></thead>
            <tbody>{products.map(p => <tr key={p.id}>
              <td>{p.thickness} {['3.0','4.0'].includes(p.thickness) ? '(±0.2)' : ''}</td><td>{p.foil?t.foil:t.plain}</td>
              <td>{p.base==='polyester'?t.polyester:t.fiberglass}</td><td>{toPrice(p)}</td>
            </tr>)}</tbody></table></div>
        </div>
        <div className="bpl-advantages">
          <div><h2>{t.advantages}</h2>
            <div className="bpl-advantage-list">
              <div><ShieldCheck size={25}/><p><strong>{t.strength}</strong><span>{t.strengthDesc}</span></p></div>
              <div><ThermometerSun size={25}/><p><strong>{t.temperature}</strong><span>{t.temperatureDesc}</span></p></div>
              <div><Droplets size={25}/><p><strong>{t.waterproof}</strong><span>{t.waterproofDesc}</span></p></div>
              <div><Layers size={25}/><p><strong>{t.install}</strong><span>{t.installDesc}</span></p></div>
            </div>
          </div>
          <img className="bpl-application-photo" src="/price-images/roof-application.webp" alt={t.advantages} loading="lazy" decoding="async" width="500" height="461" />
        </div>
      </section>

      <div className="bpl-footnotes">
        <p><BadgeCheck size={17}/>{t.fx} <strong>{fx.date}</strong>. {fx.source !== 'live' && lang !== 'uz' && t.fxFallback}</p>
        <p>{t.warning}</p><p>{t.illustration}</p>
      </div>
      <section className="bpl-footer-cta">
        <div className="bpl-footer-inner"><ShieldCheck size={39}/><strong>{t.guarantee}</strong><span>{t.guaranteeDesc}</span>
          <a href={orderUrl} className="bpl-button-primary"><MessageCircle size={17}/>{t.order}</a>
        </div>
      </section>
      <div className="bpl-footer-tail"><span>© SP OOO BINO</span><a href="/">{t.back}<ArrowUpRight size={14}/></a></div>
    </main>
  </div>;
}
