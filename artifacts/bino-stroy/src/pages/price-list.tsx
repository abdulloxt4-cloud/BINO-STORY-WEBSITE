import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight, ArrowUpRight, BadgeCheck, Download,
  Droplets, Filter, Layers, MessageCircle,
  Phone, Search, ShieldCheck, ThermometerSun, Wind, X, CheckCircle2, Ruler, ShoppingCart, LayoutGrid,
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
    warning: 'Narxlar 2026-yil 14-noyabrda spooobino.uz/price-list/ sahifasida ko‘rsatilgan qiymatlar bo‘yicha kiritildi. Amaldagi narx va ayniqsa poliester turlarining narx birligi hamda qalinligini buyurtmadan oldin kompaniya bilan tasdiqlang.',
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
    warning: 'Цены перенесены с отображавшейся 14 ноября 2026 года страницы spooobino.uz/price-list/. Перед заказом подтвердите актуальность, особенно единицу цены и толщину полиэстеровых позиций.',
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
    warning: 'UZS prices match the spooobino.uz/price-list/ display on 14 November 2026. Confirm current pricing, especially the polyester price unit and thickness, before ordering.',
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
    warning: '价格按2026年11月14日spooobino.uz/price-list/页面所示录入。请在下单前确认最新价格，尤其是聚酯类产品的计价单位与厚度。',
    fx: '汇率转换仅供参考，原价以苏姆计。汇率日期：',
    fxFallback: '无法获取实时汇率，使用所示日期的汇率。',
    illustration: '产品图片取自已确认的设计示意图，并非真实产品照片。',
    uncertain: '待确认', back: '返回网站', unit: '/平方米',
  },
} as const;

const detailCopy = {
  uz: { featured: 'Mahsulot haqida', overview: 'Batafsil ma’lumot', specification: 'Texnik ma’lumotlar', facing: 'Ustki qoplama',
    fiberglass: 'Steklotkan', polyester: 'Poliester', dimensions: 'Rulon o‘lchami', dimensionsUnknown: 'Yetkazib beruvchidan aniqlang',
    use: 'Qo‘llanilishi', useValue: 'Gidroizolyatsiya ishlari uchun; loyiha bo‘yicha mosligini mutaxassisdan tekshiring.',
    notice: 'Rasmlar namunaviy. Aniq tarkib, qadoqlash, standart va mavjudligini buyurtmadan avval tasdiqlang.',
    selected: 'Tanlangan', view: 'Batafsil ko‘rish', close: 'Yopish', order: 'Buyurtma berish',
    subtitle: 'Qalinligi va asosiga ko‘ra turini tanlang; kerakli mahsulotni bosib barcha mavjud ma’lumotni ko‘ring.',
    allProducts: 'Barcha mahsulotlar', technical: 'Texnik ko‘rsatkich', image: 'Mahsulot rasmi', sample: 'Namunaviy tasvir',
    priceNote: 'Narxlarning dolzarbligini tasdiqlang', uncertain: 'Birlik/qalinlik tasdiqlanishi kerak',
    onRequest: 'Narx so‘rov bo‘yicha', toConfirm: 'Aniqlanmoqda', requestNote: 'Narxni bilish uchun so‘rov qoldiring' },
  ru: { featured: 'О товаре', overview: 'Подробнее', specification: 'Характеристики', facing: 'Верхний слой',
    fiberglass: 'Стеклоткань', polyester: 'Полиэстер', dimensions: 'Размер рулона', dimensionsUnknown: 'Уточните у поставщика',
    use: 'Применение', useValue: 'Для гидроизоляционных работ; уточните применимость к проекту у специалиста.',
    notice: 'Изображения иллюстративные. Точный состав, упаковку, стандарты и наличие подтвердите до заказа.',
    selected: 'Выбрано', view: 'Подробнее', close: 'Закрыть', order: 'Оставить заявку',
    subtitle: 'Выберите по толщине и основе. Откройте карточку, чтобы увидеть доступные сведения.',
    allProducts: 'Все товары', technical: 'Параметр', image: 'Изображение товара', sample: 'Пример изображения',
    priceNote: 'Уточните актуальную цену', uncertain: 'Требуется подтвердить единицу и толщину',
    onRequest: 'Цена по запросу', toConfirm: 'Уточняется', requestNote: 'Оставьте заявку, чтобы узнать цену' },
  en: { featured: 'Product details', overview: 'Full details', specification: 'Specifications', facing: 'Surface',
    fiberglass: 'Fiberglass', polyester: 'Polyester', dimensions: 'Roll size', dimensionsUnknown: 'Confirm with supplier',
    use: 'Applications', useValue: 'Waterproofing applications; confirm suitability with a specialist.',
    notice: 'Images are illustrative. Verify exact composition, packaging, standards and availability before ordering.',
    selected: 'Selected', view: 'View details', close: 'Close', order: 'Request a quote',
    subtitle: 'Browse by thickness and backing. Select a roll to see the available specifications.',
    allProducts: 'All products', technical: 'Specification', image: 'Product photo', sample: 'Illustration',
    priceNote: 'Please confirm current pricing', uncertain: 'Unit/thickness require confirmation',
    onRequest: 'Price on request', toConfirm: 'To be confirmed', requestNote: 'Send a request to get the price' },
  zh: { featured: '产品介绍', overview: '详细信息', specification: '产品参数', facing: '表面',
    fiberglass: '玻璃纤维', polyester: '聚酯', dimensions: '卷材尺寸', dimensionsUnknown: '请向供应商确认',
    use: '用途', useValue: '适用于防水工程，具体项目适配性请咨询专业人员。',
    notice: '图片仅为示意。下单前请确认准确成分、包装、标准和库存。',
    selected: '已选', view: '查看详情', close: '关闭', order: '提交询价',
    subtitle: '按照厚度和基材选择产品，点击查看现有技术信息。',
    allProducts: '全部产品', technical: '参数', image: '产品图片', sample: '示意图片',
    priceNote: '请确认当前价格', uncertain: '单位/厚度待确认',
    onRequest: '价格面议', toConfirm: '待确认', requestNote: '请提交询价获取价格' },
} as const;


const extraDetailCopy = {
  uz: {
    weightSqm: '1 m² og‘irligi (kg)', rollWeight: '1 rulon og‘irligi (kg)',
    rollWidth: 'Rulon eni va uzunligi', standard: 'Standart / sertifikat',
    modifier: 'Bitum turi (SBS/APP)', verified: 'Katalog bo‘yicha', notVerified: 'Texnik pasport bilan tasdiqlanadi',
    unknown: 'Hali tasdiqlanmagan', useHeading: 'Qo‘llash sohasi',
    useText: 'Tom, poydevor va namlikdan himoya talab qilinadigan konstruktsiyalar uchun material tanlashda qo‘llanadigan tur. Qatlamlar soni va montaj usulini loyiha muhandisi belgilaydi.',
    construction: 'Mahsulot tuzilishi', constructionText: 'Rulonli gidroizolyatsiya uchun asos va ustki qoplamaga qarab tanlanadi. Aniq bitum formulasi (SBS yoki APP) ishlab chiqaruvchi pasportida tekshiriladi.',
    referenceHeading: 'Og‘irlik haqida ochiq ma’lumot',
    referenceText: 'Faqat umumiy bozor analogi: boshqa ishlab chiqaruvchining 3 mm mahsuloti 3,0–3,3 kg/m², 4 mm mahsuloti 4,0–4,3 kg/m². Bu BINO mahsuloti o‘lchovi yoki kafolati EMAS.',
    referenceLink: 'Tashqi texnik varaqa (BINO emas)',
    calculator: 'Maydon bo‘yicha narx hisoblash', area: 'Maydon (m²)',
    total: 'Taxminiy material narxi', calcNote: 'Faqat m² × katalog narxi; rulon soni, chok ustma-ustligi, transport va montaj hisobga olinmagan.',
    statusTitle: 'Ma’lumotlar manbasi', statusNote: 'Qalinlik, asos, qoplama va narx katalogdan. Og‘irlik, 1 rulon hajmi va standartlar uchun SP OOO BINO texnik pasporti kerak.',
    more: 'To‘liq mahsulot ma’lumoti', photoCount: 'Galereyadagi rasm',
    prevPhoto: 'Oldingi rasm', nextPhoto: 'Keyingi rasm', priceUnitNote: 'Poliester narxi birligini kompaniya bilan aniqlang.',
  },
  ru: {
    weightSqm:'Вес 1 м² (кг)',rollWeight:'Вес 1 рулона (кг)',rollWidth:'Ширина и длина рулона',standard:'Стандарт / сертификат',modifier:'Тип битума (SBS/APP)',verified:'По каталогу',notVerified:'Подтвердить по техпаспорту',unknown:'Не подтверждено',
    useHeading:'Сферы применения',useText:'Тип рулонной гидроизоляции для подбора в проектах кровли, фундамента и защиты конструкций от влаги. Количество слоёв и способ укладки определяет инженер проекта.',
    construction:'Конструкция материала',constructionText:'Рулонная гидроизоляция выбирается по основе и верхнему слою. Точный состав битума SBS/APP необходимо уточнить в паспорте производителя.',
    referenceHeading:'Данные о массе из открытых источников',referenceText:'Только рыночный аналог другого производителя: 3 мм — 3,0–3,3 кг/м², 4 мм — 4,0–4,3 кг/м². Эти значения НЕ являются характеристиками BINO.',referenceLink:'Внешний техпаспорт (не BINO)',
    calculator:'Расчёт по площади',area:'Площадь (м²)',total:'Ориентировочная стоимость материала',calcNote:'Площадь × цену за м². Без учёта нахлёстов, количества рулонов, доставки и монтажа.',
    statusTitle:'Источник данных',statusNote:'Толщина, основа, покрытие и цена указаны в каталоге. Масса, размер рулона и стандарт требуют паспорта SP OOO BINO.',
    more:'Полные сведения о товаре',photoCount:'Изображение галереи',prevPhoto:'Предыдущее изображение',nextPhoto:'Следующее изображение',priceUnitNote:'Уточните единицу цены для полиэстеровой позиции.',
  },
  en: {
    weightSqm:'Weight per m² (kg)',rollWeight:'Weight per roll (kg)',rollWidth:'Roll width and length',standard:'Standard / certificate',modifier:'Bitumen type (SBS/APP)',verified:'Listed in catalogue',notVerified:'Requires technical datasheet',unknown:'Not yet verified',
    useHeading:'Typical application context',useText:'A membrane category used when selecting waterproofing for roofs, foundations and moisture-exposed structures. Layer count and installation method should be determined by the project engineer.',
    construction:'Material construction',constructionText:'Roll waterproofing is selected by reinforcement and surface finish. The exact SBS/APP bitumen formulation requires a manufacturer datasheet.',
    referenceHeading:'Independent weight reference',referenceText:'For context only: another manufacturer lists 3 mm at 3.0–3.3 kg/m² and 4 mm at 4.0–4.3 kg/m². These are NOT BINO product specifications.',referenceLink:'External datasheet (not BINO)',
    calculator:'Area-based price estimate',area:'Area (m²)',total:'Estimated material price',calcNote:'Area × listed price per m² only; excludes overlap, roll rounding, delivery and installation.',
    statusTitle:'Data provenance',statusNote:'Thickness, reinforcement, surface and price come from the catalogue. Mass, roll dimensions and standards require an SP OOO BINO technical datasheet.',
    more:'Full product information',photoCount:'Gallery image',prevPhoto:'Previous image',nextPhoto:'Next image',priceUnitNote:'Confirm the polyester price unit with the company.',
  },
  zh: {
    weightSqm:'每平方米重量（公斤）',rollWeight:'每卷重量（公斤）',rollWidth:'卷材宽度和长度',standard:'标准 / 证书',modifier:'沥青类型（SBS/APP）',verified:'目录已列出',notVerified:'以技术资料为准',unknown:'尚未核实',
    useHeading:'适用范围说明',useText:'用于屋面、基础和潮湿结构防水选型的卷材类别。具体施工层数和工艺应由项目工程师确定。',
    construction:'材料结构',constructionText:'根据增强胎基和表面层选择卷材。具体SBS/APP沥青配方需核对生产商技术资料。',
    referenceHeading:'外部重量参考',referenceText:'仅供比较：另一制造商的3毫米产品约3.0–3.3公斤/平方米，4毫米产品约4.0–4.3公斤/平方米。这不是BINO产品参数。',referenceLink:'第三方技术资料（非BINO）',
    calculator:'按面积估价',area:'面积（平方米）',total:'材料估算价格',calcNote:'仅面积×每平方米价格；未计搭接、整卷数量、运输与施工。',
    statusTitle:'参数来源',statusNote:'厚度、胎基、表层和价格来自目录；重量、卷材规格和标准须参考SP OOO BINO技术资料。',
    more:'完整产品信息',photoCount:'图库图片',prevPhoto:'上一张',nextPhoto:'下一张',priceUnitNote:'请向公司确认聚酯类产品的价格单位。',
  },
} as const;

// Detailed product copy keeps the two polyester items distinct from the eight bitumen rolls.
// Specifications not supplied by SP OOO BINO are explicitly marked as unverified.
const polyesterCopy = {
  uz: {
    structure: 'Poliester asosli qatlam materiali', underlayer: 'Pastki qatlam tarkibi',
    packageWeight: 'Qadoq og‘irligi', packing: 'Qadoqlash va o‘lcham',
    unit: 'Narx birligi', availability: 'Mavjudligi', application: 'Aniq qo‘llash sohasi',
    verifiedUnit: 'Sotuvchi bilan tasdiqlanadi', requestInfo: 'Texnik pasport, qalinlik, og‘irlik va narx birligini so‘rov orqali aniqlang.',
    productDescription: 'Poliester asosli material. Folgali va folgasiz variantlar alohida sotiladi. Foto mahsulot turini tushuntirish uchun ko‘rsatilgan, aniq qadoq va fizik xususiyatlarni bildirmaydi.',
    foilDifference: 'Folgali variant: ustki qatlam folga bilan qoplangan. Poliester asosining markasi, folga qalinligi va ostki qoplamasi bo‘yicha texnik pasport so‘raladi.',
    plainDifference: 'Folgasiz variant: ustki yuzada folga yo‘q. Poliester asosining markasi, yuzaning aniq tuzilishi va ostki qoplamasi bo‘yicha texnik pasport so‘raladi.',
    sourceNote: 'Katalogda poliester asosi, folgali/folgasiz turi va 300 000 / 290 000 so‘mlik narxlar bor. Qalinlik, o‘lcham, og‘irlik, standart, mahsulotning ishlatilish joyi hamda narx birligi tasdiqlanmagan.',
    features: ['Poliester asos', 'Folgali yoki folgasiz variant', 'Yetkazib berish uchun so‘rov qoldiring'],
    noCalc: 'Ushbu mahsulotlarning narx birligi tasdiqlanmagan: xato hisob chiqmasligi uchun m² kalkulyatori ko‘rsatilmaydi.',
    analogThickness: 'Bozordagi o‘xshash mahsulot qalinligi', analogWeight: 'Bozor analogining og‘irligi',
    analogNotice: 'Quyidagi qiymatlar BINO mahsuloti o‘lchovi yoki kafolati emas; o‘xshash poliester asosli bitum membranalarining ochiq texnik ko‘rsatkichlari. 300 000 va 290 000 so‘mlik materiallarning haqiqiy qalinligi, og‘irligi, eni/uzunligi va narx birligi buyurtmadan oldin sotuvchi bilan tasdiqlanadi.',
    analogLink: 'Taqqoslash uchun tashqi texnik ma’lumot',

  },
  ru: {
    structure: 'Материал на полиэстеровой основе', underlayer: 'Нижнее покрытие',
    packageWeight: 'Вес упаковки', packing: 'Упаковка и размеры',
    unit: 'Единица цены', availability: 'Наличие', application: 'Точное назначение',
    verifiedUnit: 'Уточняется у поставщика', requestInfo: 'Запросите технический паспорт, толщину, массу и единицу цены при оформлении заявки.',
    productDescription: 'Материал на полиэстеровой основе. Варианты с фольгой и без фольги продаются отдельно. Изображение иллюстрирует тип изделия, но не подтверждает характеристики упаковки.',
    foilDifference: 'Вариант с фольгой: верхняя поверхность покрыта фольгой. Марку полиэстера, толщину фольги и нижнее покрытие следует проверить по техпаспорту.',
    plainDifference: 'Вариант без фольги: верхняя поверхность без фольги. Марка полиэстера и точный состав обоих слоёв уточняются по техпаспорту.',
    sourceNote: 'Каталог указывает полиэстеровую основу, тип покрытия и цены 300 000 / 290 000 сум. Толщина, размеры, вес, стандарт, точное назначение и единица цены пока не подтверждены.',
    features: ['Полиэстеровая основа', 'С фольгой или без', 'Доставка по запросу'],
    noCalc: 'Единица цены не подтверждена; расчёт по м² скрыт во избежание ошибочной стоимости.',
    analogThickness: 'Толщина похожих рыночных изделий', analogWeight: 'Вес рыночного аналога',
    analogNotice: 'Эти параметры не являются характеристиками или гарантией продукции BINO. Данные приведены только для сравнения с другими битумными мембранами на полиэстеровой основе. Точную толщину, массу, размеры и единицу цены двух позиций необходимо подтвердить у поставщика.',
    analogLink: 'Внешний источник технических данных',

  },
  en: {
    structure: 'Polyester-based layer material', underlayer: 'Underside composition',
    packageWeight: 'Pack weight', packing: 'Packaging and dimensions',
    unit: 'Price unit', availability: 'Availability', application: 'Verified applications',
    verifiedUnit: 'Confirm with seller', requestInfo: 'Request a datasheet and confirmation of thickness, weight and price unit via the inquiry form.',
    productDescription: 'Polyester-based material. Foil-faced and non-foil versions are sold separately. Images illustrate the category and do not certify exact packing or specifications.',
    foilDifference: 'Foil-faced version: upper surface features foil. Confirm polyester grade, foil thickness and underside coating against the manufacturer datasheet.',
    plainDifference: 'Non-foil version: no foil finish on the upper surface. Confirm the polyester grade, finish and underside coating against the manufacturer datasheet.',
    sourceNote: 'The catalogue confirms polyester backing, the foil/non-foil variant and prices of UZS 300,000 / 290,000. Thickness, size, weight, standard, application and pricing unit remain unconfirmed.',
    features: ['Polyester backing', 'Foil or non-foil finish', 'Ask about delivery'],
    noCalc: 'As the price unit has not been confirmed, the per-m² calculator is hidden to avoid an incorrect quote.',
    analogThickness: 'Typical thickness of market examples', analogWeight: 'Typical weight of market examples',
    analogNotice: 'These figures are not verified BINO product specifications or guarantees. They are published examples for other polyester-reinforced bitumen membranes. Confirm exact thickness, mass, packaging dimensions and price unit of both BINO listings with the seller before ordering.',
    analogLink: 'External comparison datasheet',

  },
  zh: {
    structure: '聚酯基层材料', underlayer: '底层成分',
    packageWeight: '包装重量', packing: '包装与尺寸',
    unit: '价格单位', availability: '库存情况', application: '已核实用途',
    verifiedUnit: '请与卖方确认', requestInfo: '请通过询价表确认技术资料、厚度、重量和价格单位。',
    productDescription: '聚酯基层材料。覆膜和非覆膜型号分别销售。图片仅用于展示产品类别，不代表包装或技术参数认证。',
    foilDifference: '覆膜款：表面有金属箔层。聚酯型号、箔层厚度和底层材质请以厂家技术资料为准。',
    plainDifference: '非覆膜款：表面没有金属箔层。聚酯型号、表面及底层成分请以厂家技术资料为准。',
    sourceNote: '目录注明聚酯基层、覆膜/非覆膜型号及 300,000 / 290,000 苏姆价格。厚度、尺寸、重量、标准、适用范围和计价单位尚未核实。',
    features: ['聚酯基层', '覆膜或非覆膜', '配送请提交询价'],
    noCalc: '由于计价单位尚未核实，为避免报价错误，不显示按平方米计算的价格。',
    analogThickness: '同类产品常见厚度', analogWeight: '同类产品常见重量',
    analogNotice: '以下数据并非BINO产品的已验证技术规格或保证，仅用于对比其他聚酯胎基沥青卷材。下单前请与卖方确认这两款产品的实际厚度、重量、包装尺寸和计价单位。',
    analogLink: '第三方技术资料（供参考）',

  },
} as const;

type Category = 'waterproofing' | 'roofing' | 'geotextile' | 'thermal' | 'vapor';


type ProductMeta = {
  thicknessLabel?: string;
  weightSqm: string;
  rollWeight: string;
  dimensions: string;
  modifier: string;
  standard: string;
  useText: string;
  deliveryText: string;
  rollArea: string;
};

function localizeValue(lang: PriceLang, values: { uz: string; ru: string; en: string; zh: string }): string {
  return values[lang];
}

function getProductMeta(p: PriceProduct, lang: PriceLang): ProductMeta {
  const commonUse = localizeValue(lang, {
    uz: 'Tom, poydevor, yerto‘la, sanuzel va namlikdan himoya kerak bo‘ladigan boshqa qurilish qismlarida qo‘llanadi.',
    ru: 'Применяется на кровле, фундаменте, в подвалах, санузлах и других участках, где требуется защита от влаги.',
    en: 'Used on roofs, foundations, basements, bathrooms and other construction zones that require moisture protection.',
    zh: '适用于屋面、基础、地下室、卫生间及其他需要防潮防水的建筑部位。',
  });
  const deliveryText = localizeValue(lang, {
    uz: 'Yetkazib berish bo‘yicha so‘rov qoldiring — buyurtma hajmi va manzilga qarab alohida hisoblanadi.',
    ru: 'По вопросам доставки оставьте заявку — стоимость рассчитывается отдельно в зависимости от объёма и адреса.',
    en: 'For delivery, please leave an inquiry — transport cost is calculated separately based on quantity and destination.',
    zh: '如需配送，请提交询价 — 运费将根据订货数量和送达地址单独计算。',
  });
  const standard = localizeValue(lang, {
    uz: 'SP OOO BINO narx katalogi / texnik ma’lumot sotuvchi bilan tasdiqlanadi',
    ru: 'Прайс-каталог SP OOO BINO / технические данные уточняются у поставщика',
    en: 'SP OOO BINO price catalogue / technical details to be confirmed with the supplier',
    zh: 'SP OOO BINO 价格目录 / 技术参数请与供应商确认',
  });
  const fiberglassModifier = localizeValue(lang, {
    uz: 'Bitum asosli rulon material',
    ru: 'Рулонный материал на битумной основе',
    en: 'Bitumen-based roll membrane',
    zh: '沥青基卷材',
  });
  const polyesterModifier = localizeValue(lang, {
    uz: 'Poliester asosli qatlam material',
    ru: 'Материал на основе полиэстера',
    en: 'Polyester-based layer material',
    zh: '聚酯基层材料',
  });
  const rollArea = localizeValue(lang, {
    uz: '1.0 × 10 m (10 m²)', ru: '1,0 × 10 м (10 м²)', en: '1.0 × 10 m (10 m²)', zh: '1.0 × 10 米（10 平方米）'
  });
  if (p.base === 'polyester') {
    // External industry comparison only: BINO's actual variant dimensions and weights are NOT verified.
    // Never infer a specific thickness based on the two price points (300,000 and 290,000).
    return {
      thicknessLabel: localizeValue(lang, { uz: 'Aniqlashtiriladi', ru: 'Уточняется', en: 'To confirm', zh: '待确认' }),
      weightSqm: localizeValue(lang, {
        uz: '3 mm: 3,5–3,7 kg/m²; 4 mm: 4,5–4,7 kg/m² (bozor analogi)',
        ru: '3 мм: 3,5–3,7 кг/м²; 4 мм: 4,5–4,7 кг/м² (аналог)',
        en: '3 mm: 3.5–3.7 kg/m²; 4 mm: 4.5–4.7 kg/m² (market examples)',
        zh: '3 毫米：3.5–3.7 千克/平方米；4 毫米：4.5–4.7 千克/平方米（同类产品）',
      }),
      rollWeight: localizeValue(lang, {
        uz: '3 mm: 35–37 kg; 4 mm: 45–47 kg (bozor analogi)',
        ru: '3 мм: 35–37 кг; 4 мм: 45–47 кг (аналог)',
        en: '3 mm: 35–37 kg; 4 mm: 45–47 kg (market examples)',
        zh: '3 毫米：35–37 千克；4 毫米：45–47 千克（同类产品）',
      }),
      dimensions: localizeValue(lang, {
        uz: 'Odatda 1 × 10 m (10 m²); BINO o‘lchami tasdiqlansin',
        ru: 'Обычно 1 × 10 м (10 м²); размер BINO уточнить',
        en: 'Typically 1 × 10 m (10 m²); BINO size unverified',
        zh: '同类产品通常为 1 × 10 米（10 平方米）；BINO尺寸待确认',
      }),
      modifier: polyesterModifier,
      standard,
      useText: localizeValue(lang, {
        uz: 'Poliester asosli material. Qalinligi, qadoqdagi o‘lchami va og‘irligini sotuvchi bilan tasdiqlang. Yetkazib berish uchun so‘rov qoldiring.',
        ru: 'Материал на полиэстеровой основе. Уточните у поставщика толщину, размер упаковки и вес. По вопросам доставки оставьте заявку.',
        en: 'Polyester-based material. Confirm thickness, packaging dimensions and weight with the seller. Request delivery details via the inquiry form.',
        zh: '聚酯基材料。厚度、包装尺寸及重量请向卖方确认，配送事宜请提交询价。',
      }),
      deliveryText,
      rollArea: localizeValue(lang, { uz: 'Odatda 1 × 10 m (bozor analogi)', ru: 'Обычно 1 × 10 м (аналог)', en: 'Typically 1 × 10 m (market examples)', zh: '同类产品通常 1 × 10 米' }),
    };
  }
  const byThickness = {
    '2.0': { wsqm: '3.0 kg', wroll: '30 kg' },
    '2.5': { wsqm: '2.5 kg', wroll: '25 kg' },
    '3.0': { wsqm: '4.0–4.5 kg', wroll: '40–45 kg' },
    '4.0': { wsqm: '5.5–6.5 kg', wroll: '55–65 kg' },
  } as const;
  const weights = byThickness[p.thickness ?? '2.0'];
  return {
    thicknessLabel: p.thickness ? `${p.thickness} mm` : undefined,
    weightSqm: weights.wsqm,
    rollWeight: weights.wroll,
    dimensions: rollArea,
    modifier: fiberglassModifier,
    standard,
    useText: commonUse,
    deliveryText,
    rollArea,
  };
}

type ProductFilter = 'all' | 'foil' | 'plain';
const categories: Category[] = ['waterproofing', 'roofing', 'geotextile', 'thermal', 'vapor'];
const categoryIcons = { waterproofing: Droplets, roofing: Layers, geotextile: LayoutGrid, thermal: ThermometerSun, vapor: Wind };
const cacheKey = 'spooobino-price-cbu-rates-v1';
function readRates(): FxRates {
  try {
    const cached = JSON.parse(window.localStorage.getItem(cacheKey) || 'null') as FxRates | null;
    if (cached && cached.date >= lastVerifiedSnapshot.date &&
      ['USD', 'RUB', 'CNY'].every(k => Number.isFinite(cached.rates[k as 'USD' | 'RUB' | 'CNY']) && cached.rates[k as 'USD' | 'RUB' | 'CNY'] > 0)) {
      return { ...cached, source: 'saved' };
    }
  } catch { return lastVerifiedSnapshot; }
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
            try { window.localStorage.setItem(cacheKey, JSON.stringify(newRates)); } catch { void 0; }
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
  const d = detailCopy[lang];
  const x = extraDetailCopy[lang];
  const fx = useRates();
  const [category, setCategory] = useState<Category>('waterproofing');
  const [filter, setFilter] = useState<ProductFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [areaText, setAreaText] = useState('10');
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const modalRef = useRef<HTMLElement | null>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);
  const orderUrl = '/#lead-form';
  const chooseLanguage = (code: PriceLang) => { void i18n.changeLanguage(code); };
  const shownProducts = useMemo(() => products.filter(p => {
    if (filter === 'foil' && !p.foil) return false;
    if (filter === 'plain' && p.foil) return false;
    const text = search.trim().toLocaleLowerCase();
    return !text || [p.thickness ?? '', p.base === 'polyester' ? t.wideName : t.name, p.base === 'polyester' ? t.polyester : t.fiberglass, p.foil ? t.foil : t.plain].join(' ').toLocaleLowerCase().includes(text);
  }), [filter, search, t]);

  useEffect(() => {
    document.title = `${t.priceList} | SP OOO BINO`;
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (meta) meta.content = `SP OOO BINO. ${t.subtitle}`;
  }, [lang, t]);

  const toPrice = (p: PriceProduct) => p.uzs === null ? d.onRequest : formatPrice(p.uzs, lang, fx);
  const thicknessText = (p: PriceProduct) => p.thickness ? `${p.thickness} mm` : d.toConfirm;
  const savePDF = () => { setCategory('waterproofing'); setFilter('all'); setSearch(''); window.setTimeout(() => window.print(), 120); };
  const selectCategory = (next: Category) => { setCategory(next); setFilter('all'); setSearch(''); scrollToProducts(); };
  const selected = selectedId ? products.find(p => p.id === selectedId) ?? null : null;
  useEffect(() => { setActiveGalleryIndex(0); }, [selectedId]);
  const selectProduct = (p: PriceProduct) => {
    lastTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSelectedId(p.id);
    setActiveGalleryIndex(0);
    setAreaText('10');
    setDetailsOpen(true);
  };
  const closeDetails = () => setDetailsOpen(false);
  useEffect(() => {
    if (!detailsOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeDetails(); return; }
      if (event.key !== 'Tab' || !modalRef.current) return;
      const items = Array.from(modalRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'));
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    modalRef.current?.querySelector<HTMLElement>('.bpl-detail-close')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = oldOverflow;
      lastTrigger.current?.focus();
    };
  }, [detailsOpen]);
  const productName = (p: PriceProduct) => `${p.base === 'polyester' ? t.wideName : t.name}${p.thickness ? ` — ${p.thickness} mm` : ''} (${p.foil ? t.foil : t.plain})`;
  const productOrderUrl = (p: PriceProduct) => `/?product=${encodeURIComponent(productName(p) + (p.base !== 'polyester' && Number(areaText) > 0 && Number(areaText) <= 100000 ? ` — ${areaText} m² (taxminiy)` : ''))}#lead-form`;
  const details = (p: PriceProduct) => {
    const productNumber = String(products.findIndex(item => item.id === p.id) + 1).padStart(2, '0');
    const gallery = p.base === 'polyester'
      ? [p.photo]
      : [p.photo, `/price-images/gallery-detail-${productNumber}.webp`, `/price-images/gallery-angle-${productNumber}.webp`, '/price-images/roof-application.webp'];
    const sqm = Number(areaText.replace(',', '.'));
    const estimatedTotal = p.uzs !== null && Number.isFinite(sqm) && sqm > 0 && sqm <= 100000 ? formatPrice(sqm * p.uzs, lang, fx) : '—';
    const meta = getProductMeta(p, lang);
    const pc = polyesterCopy[lang];
    const isPolyester = p.base === 'polyester';
    const specRows = isPolyester ? [
      { label: t.base, value: t.polyester, known: true },
      { label: d.facing, value: p.foil ? t.foil : t.plain, known: true },
      { label: t.thickness, value: meta.thicknessLabel ?? d.toConfirm, known: false },
      { label: pc.analogThickness, value: localizeValue(lang, { uz: '3 yoki 4 mm (bozor analoglari)', ru: '3 или 4 мм (аналоги)', en: '3 or 4 mm (market examples)', zh: '3 或 4 毫米（同类产品）' }), known: false },
      { label: x.weightSqm, value: meta.weightSqm, known: false },
      { label: pc.packageWeight, value: meta.rollWeight, known: false },
      { label: pc.packing, value: meta.dimensions, known: false },
      { label: pc.underlayer, value: pc.verifiedUnit, known: false },
      { label: pc.unit, value: pc.verifiedUnit, known: false },
      { label: pc.application, value: pc.verifiedUnit, known: false },
      { label: pc.availability, value: pc.verifiedUnit, known: false },
      { label: x.standard, value: pc.verifiedUnit, known: false },
    ] : [
      { label: t.thickness, value: meta.thicknessLabel ?? thicknessText(p), known: Boolean(p.thickness) },
      { label: t.base, value: p.base === 'polyester' ? t.polyester : t.fiberglass, known: true },
      { label: d.facing, value: p.foil ? t.foil : t.plain, known: true },
      { label: x.weightSqm, value: meta.weightSqm, known: true },
      { label: x.rollWeight, value: meta.rollWeight, known: true },
      { label: x.rollWidth, value: meta.dimensions, known: true },
      { label: x.modifier, value: meta.modifier, known: true },
      { label: x.standard, value: meta.standard, known: true },
    ];
    return <>
      <div className="bpl-detail-heading">
        <span className="bpl-detail-eyebrow"><BadgeCheck size={15}/>{d.featured}</span>
        <button className="bpl-detail-close" type="button" onClick={closeDetails} aria-label={d.close}><X size={23}/></button>
      </div>
      <div className="bpl-detail-main">
        <div className="bpl-detail-images">
          <div className="bpl-detail-image">
            <img key={gallery[activeGalleryIndex]} src={gallery[activeGalleryIndex] ?? p.photo}
              alt={`${d.image}: ${productName(p)} (${activeGalleryIndex + 1}/${gallery.length})`}
              decoding="async" width={960} height={560} />
          </div>
          {gallery.length > 1 && <>
            <div className="bpl-detail-gallery-controls">
              <button type="button" aria-label={x.prevPhoto} onClick={() => setActiveGalleryIndex(i => (i + gallery.length - 1) % gallery.length)}>‹</button>
              <span aria-live="polite">{x.photoCount}: {activeGalleryIndex + 1} / {gallery.length}</span>
              <button type="button" aria-label={x.nextPhoto} onClick={() => setActiveGalleryIndex(i => (i + 1) % gallery.length)}>›</button>
            </div>
            <div className="bpl-detail-thumbs" role="group" aria-label={d.sample}>
              {gallery.map((src, index) => <button key={src} type="button" className={index === activeGalleryIndex ? 'active' : ''}
                aria-pressed={index === activeGalleryIndex} aria-label={`${d.image} ${index + 1}/${gallery.length}`}
                onClick={() => setActiveGalleryIndex(index)}>
                <img src={src} alt="" width={92} height={66} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" />
              </button>)}
            </div>
          </>}
          <div className="bpl-detail-explanation">
            <h4>{x.construction}</h4><p>{isPolyester ? pc.productDescription : x.constructionText}</p>
            <h4>{x.useHeading}</h4><p>{isPolyester ? (p.foil ? pc.foilDifference : pc.plainDifference) : meta.useText}</p>
          </div>
        </div>
        <div className="bpl-detail-description">
          <h3 id="bpl-modal-title">{productName(p)}</h3>
          <p className="bpl-detail-tagline">{p.foil ? t.foil : t.plain} · {p.base === 'polyester' ? t.polyester : t.fiberglass} · {meta.thicknessLabel ?? thicknessText(p)}</p>
          <div className="bpl-detail-points">
            {isPolyester ? pc.features.map(feature => <p key={feature}><CheckCircle2 size={15}/>{feature}</p>) : <>
              <p><CheckCircle2 size={15}/>{t.waterproof}</p>
              <p><CheckCircle2 size={15}/>{t.strength}</p>
              <p><CheckCircle2 size={15}/>{t.install}</p>
            </>}
          </div>
          <h4>{d.specification}</h4>
          <dl className="bpl-spec-list">{specRows.map(row => <div key={row.label}>
            <dt>{row.label}</dt><dd className={row.known ? '' : 'bpl-spec-unverified'}>{row.value}</dd>
          </div>)}</dl>
          {!isPolyester ? <div className="bpl-detail-calculator">
            <h4>{x.calculator}</h4>
            <label htmlFor="bpl-area-input">{x.area}</label>
            <div className="bpl-calc-row">
              <input id="bpl-area-input" type="number" inputMode="decimal" min="1" max="100000" step="0.5"
                value={areaText} onChange={e => setAreaText(e.target.value)} />
              <div><small>{x.total}</small><strong>{estimatedTotal}</strong></div>
            </div>
            <p>{x.calcNote}</p>
          </div> : <p className="bpl-price-caution">{pc.noCalc}</p>}
          {isPolyester && <p className="bpl-price-caution">{pc.requestInfo}</p>}
          <div className="bpl-detail-action">
            <div><strong>{toPrice(p)}{p.uzs !== null && !isPolyester && <> <small>{t.unit}</small></>}</strong><span>{d.priceNote}</span></div>
            <a className="bpl-order-button" href={productOrderUrl(p)}><ShoppingCart size={17}/>{d.order}<ArrowRight size={15}/></a>
          </div>
          <div className="bpl-detail-provenance">
            <h4>{x.statusTitle}</h4>
            <p>{isPolyester ? pc.sourceNote : x.statusNote}</p>
            {isPolyester && <p>{pc.analogNotice} <a href={p.foil ? 'https://madeinturkmenistan.com/all-products/tm-aluminium-foil-waterproofing-membrane-turkmenistan/' : 'https://madeinturkmenistan.com/all-products/tm-waterproofing-membrane-polyester-turkmenistan/'} target="_blank" rel="noopener noreferrer">{pc.analogLink} ↗</a></p>}
            {!isPolyester && <p><strong>{x.rollWidth}:</strong> {meta.rollArea}</p>}
            <p><strong>{x.useHeading}:</strong> {meta.deliveryText}</p>
            <p>{d.notice}</p>
          </div>
        </div>
      </div>
    </>;
  };
  const card = (p: PriceProduct) => {
    const isWide = p.base === 'polyester';
    const name = isWide ? t.wideName : t.name;
    const meta = getProductMeta(p, lang);
    return <article className={`bpl-product${isWide ? ' bpl-product--polyester' : ''}`} key={p.id}>
      <button type="button" className="bpl-product-open" onClick={() => selectProduct(p)}
        aria-label={`${d.view}: ${productName(p)}`}>
        <span className="bpl-photo"><img loading="lazy" decoding="async" width="620" height="270" src={p.photo}
          alt={`${name}: ${meta.thicknessLabel ?? thicknessText(p)}, ${p.foil ? t.foil : t.plain}`} /></span>
        <span className="bpl-product-info">
          <strong className="bpl-card-title">{name}{p.thickness && <small> · {p.thickness} mm</small>}</strong>
          <span className="bpl-card-subtitle">{p.foil ? t.foil : t.plain} · {p.base === 'polyester' ? t.polyester : t.fiberglass}</span>
          <span className="bpl-card-spec"><Ruler size={15}/>{t.thickness}: <strong>{meta.thicknessLabel ?? thicknessText(p)}</strong></span>
          <span className="bpl-card-spec"><Layers size={15}/>{t.base}: <strong>{p.base === 'polyester' ? t.polyester : t.fiberglass}</strong></span>
          <span className="bpl-card-foot"><strong>{toPrice(p)}{p.uzs !== null && !isWide && <small>{t.unit}</small>}</strong><span className="bpl-card-arrow-button"><ArrowRight size={18}/></span></span>
        </span>
      </button>
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
          <span aria-current="page">{t.priceList}</span><a href="/#lead-form">{t.contact}</a>
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
            <a href="tel:+998931230202" className="bpl-button-phone"><Phone size={15}/> +998 93 123 02 02</a>
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
          {category === 'waterproofing' && <span className="bpl-filter-title"><Filter size={16}/>{t.filter}</span>}
        </div>
        {category === 'waterproofing' ? <>
          <div className="bpl-filter-panel bpl-showcase-filters">
            <label className="bpl-search"><Search size={17}/><input placeholder={t.search} aria-label={t.search} value={search} onChange={e => setSearch(e.target.value)}/>{search && <button type="button" onClick={() => setSearch('')}><X size={15}/></button>}</label>
            <div className="bpl-filter-options">{(['all','foil','plain'] as ProductFilter[]).map(value => <button key={value} type="button" aria-pressed={value===filter} onClick={() => setFilter(value)} className={filter===value?'active':''}>{t[value]}</button>)}</div>
          </div>
          <p className="bpl-catalog-caption">{d.subtitle}</p>
          {shownProducts.length ? <div className="bpl-showcase-layout">
            <div className="bpl-product-grid">{shownProducts.map(p => card(p))}</div>
          </div> : <div className="bpl-no-results">{t.noResults}</div>}
          {detailsOpen && selected && <div className="bpl-modal-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDetails(); }}>
            <section className="bpl-modal-panel" role="dialog" aria-modal="true" aria-labelledby="bpl-modal-title" ref={modalRef}>
              {details(selected)}
            </section>
          </div>}
        </> : <div className="bpl-unpublished"><p>{t.notPublished}</p><a className="bpl-button-primary" href={orderUrl}>{t.askPrice}<ArrowRight size={16}/></a></div>}
      </section>

      <section className="bpl-information" aria-label={t.table}>
        <div className="bpl-table-box">
          <h2>{t.table}</h2>
          <div className="bpl-table-wrapper"><table><thead><tr><th>{t.thickness}</th><th>{t.top}</th><th>{t.base}</th><th>{t.price}</th></tr></thead>
            <tbody>{products.map(p => <tr key={p.id}>
              <td>{p.thickness ? `${p.thickness}${p.thickness === '3.0' || p.thickness === '4.0' ? ' (±0.2)' : ''}` : d.toConfirm}</td><td>{p.foil?t.foil:t.plain}</td>
              <td>{p.base==='polyester'?t.polyester:t.fiberglass}</td><td>{toPrice(p)}{p.base === 'polyester' ? ` (${polyesterCopy[lang].verifiedUnit})` : t.unit}</td>
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
