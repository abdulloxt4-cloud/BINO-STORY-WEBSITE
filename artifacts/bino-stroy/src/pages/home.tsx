import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { FormEvent, MutableRefObject, ReactNode } from 'react';

import { useTranslation } from 'react-i18next';

import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  MapPin,
  MessageCircle,
  Send,
  X,
} from 'lucide-react';

import { gsap } from 'gsap';

import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Lenis from 'lenis';

import {
  useCreateBinoChatMessage,
  useCreateBinoLead,
  useGetBinoSiteConfig,
} from '@workspace/api-client-react';

import type {
  BinoChatInput,
  BinoChatTurn,
  BinoLeadInput,
  BinoSiteConfig,
} from '@workspace/api-client-react';

import { BinoModel } from '@/components/bino-model';

import { assistantProductContext } from '@/i18n/config';

type Lang = 'uz' | 'ru' | 'en';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type FormValues = {
  name: string;
  phone: string;
  message: string;
};

const sections = [
  'home',
  'product',
  'foundation',
  'roof',
  'uses',
  'why',
  'contact',
] as const;

function detectChatLanguage(text: string, current: Lang): Lang {
  if (/[А-Яа-яЁё]/.test(text)) return 'ru';

  if (
    /[ʻ‘’ʼ]/.test(text) ||
    /\b(va|uchun|qanday|qayerda|suv|qatlam|gidroizolyatsiya|rulon)\b/i.test(
      text,
    )
  ) {
    return 'uz';
  }

  if (
    /\b(the|and|what|how|where|please|can|is|waterproof|layer|roll|foundation)\b/i.test(
      text,
    )
  ) {
    return 'en';
  }

  return current;
}

function useIsMobile() {
  const [mobile, setMobile] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 767px)').matches,
  );

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');

    const change = () => setMobile(media.matches);

    media.addEventListener('change', change);

    return () => media.removeEventListener('change', change);
  }, []);

  return mobile;
}

function useScrollScene(
  progress: MutableRefObject<number>,
  onStep?: (step: number) => void,
  onProgress?: (progress: number) => void,
) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const mobile = window.matchMedia('(max-width: 767px)').matches;

    if (mobile) {
      progress.current = 0.55;
      onProgress?.(0.55);
      onStep?.(2);
      return;
    }

    if (reducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const trigger = ScrollTrigger.create({
      trigger: element,
      start: 'top top',
      end: '+=950',
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        progress.current = self.progress;

        onStep?.(
          Math.min(4, Math.floor(self.progress * 5)),
        );
      },
    });

    return () => {
      trigger.kill();
    };
  }, [onProgress, onStep, progress]);

  return ref;
}

function usePageMotion() {
  useEffect(() => {
    const mobile = window.matchMedia(
      '(max-width: 767px)',
    ).matches;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (mobile || reducedMotion) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
    });

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(tick);
    };
  }, []);
}

function useHorizontalApplications() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia('(max-width: 767px)').matches
    ) {
      return;
    }

    const section = document.getElementById('uses');

    const track =
      section?.querySelector<HTMLElement>('.use-cards');

    if (!section || !track) return;

    const viewport =
      section.querySelector<HTMLElement>('.use-viewport');

    const animation = gsap.to(track, {
      x: () =>
        -(
          track.scrollWidth -
          (viewport?.clientWidth ?? section.clientWidth)
        ),

      ease: 'none',

      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () =>
          `+=${Math.max(
            track.scrollWidth -
              (viewport?.clientWidth ?? section.clientWidth),
            700,
          )}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, []);
}

function Header({
  onLanguage,
}: {
  onLanguage: (lang: Lang) => void;
}) {
  const { t, i18n } = useTranslation();

  const [menuOpen, setMenuOpen] = useState(false);

  const items = useMemo(
    () =>
      sections.map((id) => ({
        id,
        label: t(`nav.${id === 'home' ? 'hero' : id}`),
      })),
    [t],
  );

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    window.addEventListener('keydown', key);

    return () => window.removeEventListener('keydown', key);
  }, []);

  return (
    <>
      <header className="site-header">
        <a
          className="brand"
          href="#home"
          aria-label={`BINO STROY — ${t('labels.home')}`}
          data-testid="link-brand"
        >
          <span className="brand-mark">
            <span>B</span>
          </span>

          <span>BINO STROY</span>
        </a>

        <div className="header-right">
          <nav
            className="lang-switch"
            aria-label={t('labels.language')}
          >
            {(['uz', 'ru', 'en'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                className={
                  i18n.language === lang ? 'active' : ''
                }
                onClick={() => onLanguage(lang)}
                aria-pressed={i18n.language === lang}
                data-testid={`button-language-${lang}`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </nav>

          <button
            type="button"
            className="index-trigger"
            onClick={() =>
              setMenuOpen((open) => !open)
            }
            aria-expanded={menuOpen}
            aria-controls="site-index"
            data-testid="button-index"
          >
            {t('nav.index')}
          </button>
        </div>
      </header>

      {menuOpen && (
        <nav
          id="site-index"
          className="menu-panel"
          aria-label={t('nav.index')}
        >
          {items.map((item, i) => (
            <a
              href={`#${item.id}`}
              key={item.id}
              onClick={() => setMenuOpen(false)}
              data-testid={`link-index-${item.id}`}
            >
              <span
                className="mono"
                style={{
                  color: '#d9a441',
                  fontSize: 9,
                  marginRight: 15,
                }}
              >
                0{i + 1}
              </span>

              {item.label}
            </a>
          ))}
        </nav>
      )}
    </>
  );
}

function MobileRoll({
  activeLayer,
}: {
  activeLayer: number;
}) {
  const lift = (activeLayer - 2) * -2;

  return (
    <div
      className="mobile-diagram"
      aria-hidden="true"
    >
      <div
        className="mobile-roll"
        style={{
          transform: `rotate(-16deg) skewY(-4deg) translateY(${lift}px)`,
        }}
      />

      <div
        className="mobile-layers"
        style={{
          transform: `rotate(-14deg) translateY(${lift * 1.5}px)`,
        }}
      >
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

function FoundationDiagram({
  layers,
  binoLabel,
  progress,
}: {
  layers: string[];
  binoLabel: string;
  progress: number;
}) {
  const colors = [
    '#665f52',
    '#9a907e',
    '#777267',
    '#d9a441',
    '#777064',
    '#514e45',
    '#625c4e',
  ];

  return (
    <div
      className="mobile-diagram"
      aria-label={layers.join(', ')}
    >
      <div
        style={{
          width: 220,
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
          transform:
            'perspective(400px) rotateX(20deg)',
        }}
      >
        {layers.map((layer, index) => {
          const bino = layer
            .toUpperCase()
            .includes('BINO');

          const separation =
            (index -
              (layers.length - 1) / 2) *
            progress *
            16;

          return (
            <div
              key={layer}
              style={{
                height: bino ? 17 : 24,
                transform: `translateY(${separation}px)`,
                background: bino
                  ? '#d9a441'
                  : colors[index],
                color: bino
                  ? '#201b12'
                  : '#ddd5c7',
                fontSize: 8,
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 10,
                fontFamily:
                  'var(--app-font-mono)',
                textTransform: 'uppercase',
                transition:
                  'transform .12s linear',
              }}
            >
              {layer}
            </div>
          );
        })}
      </div>

      <span
        className="mono"
        style={{
          position: 'absolute',
          top: 26,
          right: 4,
          color: '#d9a441',
          fontSize: 8,
        }}
      >
        {binoLabel}
      </span>
    </div>
  );
}

function TechnicalSection({
  kind,
  sectionKey,
  index,
  progressRef,
  title,
  copy,
  eyebrow,
  callout,
  layers,
  children,
  onStep,
  layerLabel,
  activeLayer,
}: {
  kind: 'roll' | 'foundation' | 'roof';
  sectionKey: string;
  index: string;
  progressRef: MutableRefObject<number>;
  title: string;
  copy: string;
  eyebrow: string;
  callout: string;
  layers: string[];
  children?: ReactNode;
  onStep?: (step: number) => void;
  layerLabel?: string;
  activeLayer?: number;
}) {
  const { t } = useTranslation();

  const mobile = useIsMobile();

  const [diagramProgress, setDiagramProgress] =
    useState(0);

  const onProgress = useCallback(
    (value: number) =>
      setDiagramProgress(value),
    [],
  );

  const ref = useScrollScene(
    progressRef,
    onStep,
    onProgress,
  );

  return (
    <section
      id={sectionKey}
      ref={ref}
      className="scene technical-scene"
      aria-label={title}
      data-testid={`section-${sectionKey}`}
    >
      <div className="section-head">
        <span className="eyebrow">
          {eyebrow}
        </span>

        <span className="scene-number">
          {index} / 07
        </span>

        <h2>{title}</h2>

        <p>{copy}</p>
      </div>

      {kind === 'roll' ? (
        <MobileRoll
          activeLayer={activeLayer ?? 0}
        />
      ) : (
        <FoundationDiagram
          layers={layers}
          binoLabel={callout}
          progress={
            mobile ? diagramProgress : 0
          }
        />
      )}

      {!mobile && (
        <div
          className="model-wrap"
          role="img"
          aria-label={
            kind === 'roll'
              ? t('product.tag')
              : title
          }
        >
          <BinoModel
            kind={kind}
            progress={progressRef}
          />

          <span className="model-label">
            {kind === 'roll'
              ? layerLabel
              : callout}
          </span>
        </div>
      )}

      {kind !== 'roll' && (
        <div
          className="system-layer-list"
          aria-label={title}
        >
          {layers.map(
            (layer, layerIndex) => (
              <span
                key={layer}
                className={
                  kind === 'foundation'
                    ? layerIndex === 3
                      ? 'bino-layer'
                      : ''
                    : layerIndex === 2 ||
                        layerIndex === 3
                      ? 'bino-layer'
                      : ''
                }
              >
                <i />
                {layer}
              </span>
            ),
          )}
        </div>
      )}

      {children}

      <span className="scene-caption">
        {kind === 'roll'
          ? t('product.tag')
          : `${index} / ${t(
              'labels.system',
            )}`}
      </span>
    </section>
  );
}

function LeadForm() {
  const { t, i18n } = useTranslation();

  const createLead = useCreateBinoLead();

  const [values, setValues] =
    useState<FormValues>({
      name: '',
      phone: '',
      message: '',
    });

  const [errors, setErrors] = useState<
    Partial<FormValues>
  >({});

  const [result, setResult] = useState<
    'success' | 'error' | null
  >(null);

  useEffect(() => {
    setErrors({});
  }, [i18n.language]);

  const update = (
    key: keyof FormValues,
    value: string,
  ) => {
    setValues((old) => ({
      ...old,
      [key]: value,
    }));

    setErrors((old) => ({
      ...old,
      [key]: undefined,
    }));

    setResult(null);
  };

  const submit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const next: Partial<FormValues> = {};

    if (values.name.trim().length < 2) {
      next.name = t(
        'contact.validation.name',
      );
    }

    if (
      values.phone
        .trim()
        .replace(/\D/g, '').length < 7
    ) {
      next.phone = t(
        'contact.validation.phone',
      );
    }

    if (
      values.message.trim().length < 3
    ) {
      next.message = t(
        'contact.validation.message',
      );
    }

    setErrors(next);

    if (Object.keys(next).length) return;

    const leadData: BinoLeadInput = {
      name: values.name.trim(),
      phone: values.phone.trim(),
      message: values.message.trim(),
    };

    createLead.mutate(
      {
        data: leadData,
      },
      {
        onSuccess: () => {
          setResult('success');

          setValues({
            name: '',
            phone: '',
            message: '',
          });
        },

        onError: () => {
          setResult('error');
        },
      },
    );
  };

  return (
    <form
      className="lead-form"
      onSubmit={submit}
      noValidate
      data-testid="form-lead"
    >
      {(
        [
          'name',
          'phone',
          'message',
        ] as const
      ).map((key) => (
        <div
          className="field"
          key={key}
        >
          <label
            htmlFor={`lead-${key}`}
          >
            {t(`contact.${key}`)}
          </label>

          {key === 'message' ? (
            <textarea
              id={`lead-${key}`}
              value={values[key]}
              maxLength={2000}
              placeholder={t(
                `contact.${key}Placeholder`,
              )}
              onChange={(event) =>
                update(
                  key,
                  event.target.value,
                )
              }
              aria-invalid={Boolean(
                errors[key],
              )}
              aria-describedby={
                errors[key]
                  ? `error-${key}`
                  : undefined
              }
              data-testid={`input-lead-${key}`}
            />
          ) : (
            <input
              id={`lead-${key}`}
              value={values[key]}
              type={
                key === 'phone'
                  ? 'tel'
                  : 'text'
              }
              maxLength={
                key === 'phone'
                  ? 40
                  : 120
              }
              autoComplete={
                key === 'phone'
                  ? 'tel'
                  : 'name'
              }
              placeholder={t(
                `contact.${key}Placeholder`,
              )}
              onChange={(event) =>
                update(
                  key,
                  event.target.value,
                )
              }
              aria-invalid={Boolean(
                errors[key],
              )}
              aria-describedby={
                errors[key]
                  ? `error-${key}`
                  : undefined
              }
              data-testid={`input-lead-${key}`}
            />
          )}

          {errors[key] && (
            <span
              id={`error-${key}`}
              className="field-error"
              role="alert"
            >
              {errors[key]}
            </span>
          )}
        </div>
      ))}

      <button
        className="btn"
        type="submit"
        disabled={
          createLead.isPending
        }
        data-testid="button-submit-lead"
      >
        {createLead.isPending
          ? t('contact.sending')
          : t('contact.submit')}

        <ArrowUpRight size={15} />
      </button>

      {result && (
        <p
          className={`form-state ${
            result === 'error'
              ? 'error'
              : ''
          }`}
          role="status"
          data-testid={`status-lead-${result}`}
        >
          {result === 'success'
            ? t('contact.success')
            : t('contact.error')}
        </p>
      )}
    </form>
  );
}

function CounterValue({
  value,
}: {
  value: number;
}) {
  const [display, setDisplay] =
    useState(
      value > 0 ? 0 : value,
    );

  const node =
    useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (value <= 0) {
      setDisplay(value);
      return;
    }

    if (
      window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
    ) {
      setDisplay(value);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const counter = {
      value: 0,
    };

    const animation = gsap.to(
      counter,
      {
        value,
        duration: 1.35,
        ease: 'power2.out',
        snap: {
          value: 1,
        },

        onUpdate: () =>
          setDisplay(
            Math.round(counter.value),
          ),

        scrollTrigger: {
          trigger: node.current,
          start: 'top 88%',
          once: true,
        },
      },
    );

    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, [value]);

  return (
    <span ref={node}>
      {display}
    </span>
  );
}

function AssistantChat() {
  const { t, i18n } = useTranslation();

  const chatMutation =
    useCreateBinoChatMessage();

  const [open, setOpen] =
    useState(false);

  const [input, setInput] =
    useState('');

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const listRef =
    useRef<HTMLDivElement>(null);

  const lang =
    i18n.language as Lang;

  useEffect(() => {
    if (
      open &&
      messages.length === 0
    ) {
      setMessages([
        {
          role: 'assistant',
          content: t('chat.welcome'),
        },
      ]);
    }
  }, [
    open,
    messages.length,
    t,
  ]);

  useEffect(() => {
    listRef.current?.scrollTo({
      top:
        listRef.current
          .scrollHeight,
      behavior: 'smooth',
    });
  }, [
    messages,
    chatMutation.isPending,
    open,
  ]);

  const send = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const text = input.trim();

    if (
      !text ||
      chatMutation.isPending
    ) {
      return;
    }

    const next = [
      ...messages,
      {
        role: 'user' as const,
        content: text,
      },
    ];

    setMessages(next);

    setInput('');

    const history: BinoChatTurn[] = [
      {
        role: 'assistant',
        content: `${assistantProductContext.guidance} Product: ${assistantProductContext.product}. Layers: ${assistantProductContext.layers.join('; ')}. Applications: ${assistantProductContext.applications.join('; ')}.`,
      },

      ...next
        .slice(-14)
        .map(
          ({
            role,
            content,
          }) => ({
            role,
            content,
          }),
        ),
    ];

    const chatData: BinoChatInput =
      {
        message: text,
        language:
          detectChatLanguage(
            text,
            lang,
          ),
        history,
      };

    chatMutation.mutate(
      {
        data: chatData,
      },
      {
        onSuccess: (reply) =>
          setMessages(
            (current) => [
              ...current,
              {
                role: 'assistant',
                content:
                  reply.reply,
              },
              {
                role: 'assistant',
                content: t(
                  'chat.nameAsk',
                ),
              },
            ],
          ),

        onError: () =>
          setMessages(
            (current) => [
              ...current,
              {
                role: 'assistant',
                content: t(
                  'chat.error',
                ),
              },
            ],
          ),
      },
    );
  };

  return (
    <>
      {open && (
        <section
          className="chat-panel"
          aria-label={t(
            'chat.title',
          )}
          data-testid="panel-chat"
        >
          <div className="chat-head">
            <div>
              <b>
                {t('chat.title')}
              </b>

              <span>
                {t('chat.status')}
              </span>
            </div>

            <button
              className="icon-button"
              type="button"
              onClick={() =>
                setOpen(false)
              }
              aria-label={t(
                'chat.close',
              )}
              data-testid="button-chat-close"
            >
              <X size={17} />
            </button>
          </div>

          <div
            className="chat-messages"
            ref={listRef}
            aria-live="polite"
          >
            {messages.map(
              (
                message,
                i,
              ) => (
                <div
                  key={`${message.role}-${i}`}
                  className={`chat-bubble ${message.role}`}
                  data-testid={`message-chat-${i}`}
                >
                  {
                    message.content
                  }
                </div>
              ),
            )}

            {chatMutation.isPending && (
              <div
                className="chat-bubble"
                role="status"
              >
                {t(
                  'chat.loading',
                )}
              </div>
            )}
          </div>

          {chatMutation.isError && (
            <div
              className="chat-notice"
              role="alert"
            >
              {t('chat.error')}
            </div>
          )}

          <form
            className="chat-composer"
            onSubmit={send}
          >
            <input
              value={input}
              onChange={(event) =>
                setInput(
                  event.target
                    .value,
                )
              }
              placeholder={t(
                'chat.placeholder',
              )}
              aria-label={t(
                'chat.placeholder',
              )}
              maxLength={2000}
              data-testid="input-chat-message"
            />

            <button
              type="submit"
              aria-label={t(
                'chat.send',
              )}
              disabled={
                !input.trim() ||
                chatMutation.isPending
              }
              data-testid="button-chat-send"
            >
              <Send size={15} />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="chat-launch"
        aria-label={
          open
            ? t('chat.close')
            : t('chat.open')
        }
        onClick={() =>
          setOpen((value) => !value)
        }
        aria-expanded={open}
        data-testid="button-chat-toggle"
      >
        {open ? (
          <X size={21} />
        ) : (
          <MessageCircle
            size={22}
          />
        )}
      </button>
    </>
  );
}

function Home() {
  const { t, i18n } =
    useTranslation();

  usePageMotion();

  const configQuery =
    useGetBinoSiteConfig();

  const [
    heroProgress,
    foundationProgress,
    roofProgress,
  ] = [
    useRef(0),
    useRef(0),
    useRef(0),
  ];

  const [
    activeLayer,
    setActiveLayer,
  ] = useState(0);

  const [
    currentSection,
    setCurrentSection,
  ] = useState(1);

  const [
    preloading,
    setPreloading,
  ] = useState(true);

  const stepCallback =
    useCallback(
      (step: number) =>
        setActiveLayer(step),
      [],
    );

  const productSteps = t(
    'product.steps',
    {
      returnObjects: true,
    },
  ) as {
    title: string;
    description: string;
  }[];

  const foundationLayers = t(
    'foundation.layers',
    {
      returnObjects: true,
    },
  ) as string[];

  const roofLayers = t(
    'roof.layers',
    {
      returnObjects: true,
    },
  ) as string[];

  const useCards = t(
    'uses.cards',
    {
      returnObjects: true,
    },
  ) as {
    title: string;
    description: string;
    place: string;
  }[];

  const langHandler = (
    lang: Lang,
  ) => {
    void i18n.changeLanguage(lang);
  };

  useEffect(() => {
    document.title =
      t('meta.title');

    document.documentElement.lang =
      i18n.language;

    let meta =
      document.querySelector(
        'meta[name="description"]',
      );

    if (!meta) {
      meta =
        document.createElement(
          'meta',
        );

      meta.setAttribute(
        'name',
        'description',
      );

      document.head.appendChild(
        meta,
      );
    }

    meta.setAttribute(
      'content',
      t('meta.description'),
    );
  }, [i18n.language, t]);

  useEffect(() => {
    const targets = sections
      .map((id) =>
        document.getElementById(
          id,
        ),
      )
      .filter(Boolean);

    const triggers = targets.map(
      (target) =>
        ScrollTrigger.create({
          trigger: target!,
          start: 'top 50%',
          end: 'bottom 50%',

          onEnter: () =>
            setCurrentSection(
              sections.indexOf(
                target!.id as (typeof sections)[number],
              ) + 1,
            ),

          onEnterBack: () =>
            setCurrentSection(
              sections.indexOf(
                target!.id as (typeof sections)[number],
              ) + 1,
            ),
        }),
    );

    return () =>
      triggers.forEach(
        (trigger) =>
          trigger.kill(),
      );
  }, []);

  useEffect(() => {
    const timer =
      window.setTimeout(
        () =>
          setPreloading(false),
        850,
      );

    return () =>
      window.clearTimeout(timer);
  }, []);

  useHorizontalApplications();

  const config =
    configQuery.data as
      | BinoSiteConfig
      | undefined;

  const metricValues =
    config?.metrics;

  const metrics = [
    metricValues?.experienceYears ??
      0,
    metricValues?.completedProjects ??
      0,
    metricValues?.satisfiedClients ??
      0,
    metricValues?.warrantyYears ??
      0,
  ];

  return (
    <main>
      <div
        className={`preloader ${
          preloading ? '' : 'done'
        }`}
        aria-hidden={!preloading}
      >
        <div className="preloader-inner">
          <div className="brand-mark">
            <span>B</span>
          </div>

          <p>
            {t('labels.preload')}
          </p>

          <div className="preloader-line" />
        </div>
      </div>

      <div
        className="noise"
        aria-hidden="true"
      />

      <Header
        onLanguage={langHandler}
      />

      <div
        className="scroll-index"
        aria-hidden="true"
      >
        <b>
          {String(
            currentSection,
          ).padStart(2, '0')}
        </b>{' '}
        / 07
      </div>

      <section
        id="home"
        className="scene hero"
        data-testid="section-home"
        aria-label={`${t(
          'hero.eyebrow',
        )}: ${t('hero.copy')}`}
      >
        <div className="hero-content">
          <div className="eyebrow">
            {t('hero.eyebrow')}
          </div>

          <h1>
            {t('hero.title')}
          </h1>

          <p className="hero-copy">
            {t('hero.copy')}
          </p>

          <div className="hero-actions">
            <a
              className="btn"
              href="#product"
              data-testid="link-explore"
            >
              {t('hero.explore')}

              <ArrowDownRight
                size={16}
              />
            </a>

            <a
              className="btn btn-quiet"
              href="#contact"
              data-testid="link-contact"
            >
              {t('hero.contact')}

              <ChevronRight
                size={15}
              />
            </a>
          </div>

          <div className="scroll-cue">
            <i />

            {t('hero.scroll')}
          </div>
        </div>

        <div className="hero-foot">
          <span>
            <b>01 / 07</b>
            {t('hero.chip1')}
          </span>

          <span>
            <b>02 / BINO</b>
            {t('hero.chip2')}
          </span>
        </div>
      </section>

      <TechnicalSection
        kind="roll"
        sectionKey="product"
        index="02"
        progressRef={heroProgress}
        title={t('product.title')}
        copy={t('product.copy')}
        eyebrow={t(
          'product.eyebrow',
        )}
        callout={t('product.tag')}
        layers={productSteps.map(
          (step) => step.title,
        )}
        onStep={stepCallback}
        activeLayer={activeLayer}
        layerLabel={`${t(
          'labels.layer',
        )} / 0${
          activeLayer + 1
        } / 240`}
      >
        <div className="scene-aside">
          <div className="layer-kicker">
            {t('product.step')} / 0
            {activeLayer + 1} / 05
          </div>

          <h3>
            {
              productSteps[
                activeLayer
              ]?.title
            }
          </h3>

          <p>
            {
              productSteps[
                activeLayer
              ]?.description
            }
          </p>

          <div
            className="layer-dots"
            aria-label={t(
              'product.tag',
            )}
          >
            {productSteps.map(
              (
                step,
                index,
              ) => (
                <button
                  key={
                    step.title
                  }
                  className={
                    index ===
                    activeLayer
                      ? 'active'
                      : ''
                  }
                  type="button"
                  aria-label={`${t(
                    'product.step',
                  )} ${index + 1}: ${step.title}`}
                  aria-pressed={
                    index ===
                    activeLayer
                  }
                  onClick={() => {
                    setActiveLayer(
                      index,
                    );

                    heroProgress.current =
                      index / 4;
                  }}
                  data-testid={`button-product-layer-${index + 1}`}
                />
              ),
            )}
          </div>
        </div>
      </TechnicalSection>

      <TechnicalSection
        kind="foundation"
        sectionKey="foundation"
        index="03"
        progressRef={
          foundationProgress
        }
        title={t(
          'foundation.title',
        )}
        copy={t(
          'foundation.copy',
        )}
        eyebrow={t(
          'foundation.eyebrow',
        )}
        callout={t(
          'foundation.callout',
        )}
        layers={foundationLayers}
      />

      <TechnicalSection
        kind="roof"
        sectionKey="roof"
        index="04"
        progressRef={roofProgress}
        title={t('roof.title')}
        copy={t('roof.copy')}
        eyebrow={t(
          'roof.eyebrow',
        )}
        callout={t(
          'roof.callout',
        )}
        layers={roofLayers}
      />

      <section
        id="uses"
        className="scene applications"
        data-testid="section-uses"
      >
        <div className="applications-heading">
          <div>
            <span className="eyebrow">
              {t('uses.eyebrow')}
            </span>

            <h2>
              {t('uses.title')}
            </h2>
          </div>

          <p>
            {t('uses.copy')}
          </p>
        </div>

        <div className="use-viewport">
          <div className="use-cards">
            {useCards.map(
              (
                card,
                index,
              ) => (
                <article
                  className="use-card"
                  key={card.title}
                  data-testid={`card-application-${index + 1}`}
                >
                  <div
                    className="use-illustration"
                    role="img"
                    aria-label={
                      card.title
                    }
                  >
                    <div className="layer-icon">
                      <i />
                      <i />
                      <i />
                      <i />
                      <i />
                      <i />
                    </div>
                  </div>

                  <span className="mono">
                    0{index + 1} /{' '}
                    {t(
                      'labels.application',
                    )}
                  </span>

                  <h3>
                    {card.title}
                  </h3>

                  <p>
                    {
                      card.description
                    }
                  </p>

                  <div className="use-place">
                    {card.place}
                  </div>
                </article>
              ),
            )}
          </div>
        </div>
      </section>

      <section
        id="why"
        className="scene why"
        data-testid="section-why"
      >
        <div className="why-title">
          <div>
            <span className="eyebrow">
              {t('why.eyebrow')}
            </span>

            <h2>
              {t('why.title')}
            </h2>
          </div>
        </div>

        <div
          className="metrics"
          aria-label={t(
            'why.eyebrow',
          )}
        >
          {metrics.map(
            (
              value,
              index,
            ) => (
              <div
                className="metric"
                key={index}
                data-testid={`metric-value-${index + 1}`}
              >
                {configQuery.isLoading ? (
                  <strong
                    className="placeholder-metric"
                    aria-label={t(
                      'loading',
                    )}
                  >
                    ···
                  </strong>
                ) : (
                  <strong
                    className={
                      value > 0
                        ? ''
                        : 'placeholder-metric'
                    }
                  >
                    {value > 0 ? (
                      <CounterValue
                        value={value}
                      />
                    ) : (
                      t(
                        'why.emptyMetric',
                      )
                    )}
                  </strong>
                )}

                <span>
                  {t(
                    `why.metrics.${index}`,
                  )}
                </span>
              </div>
            ),
          )}
        </div>

        <div className="process">
          <h3>
            {t(
              'why.timelineTitle',
            )}
          </h3>

          <div className="timeline">
            {[0, 1, 2, 3].map(
              (step) => (
                <div
                  key={step}
                  className="timeline-item"
                >
                  <span>
                    0{step + 1}
                  </span>

                  <b>
                    {t(
                      `why.timeline.${step}`,
                    )}
                  </b>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="services">
          <h3>
            {t(
              'why.servicesTitle',
            )}
          </h3>

          <div className="services-list">
            {[
              0, 1, 2, 3, 4,
            ].map((service) => (
              <span
                className="service-pill"
                key={service}
              >
                {t(
                  `why.services.${service}`,
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="scene contact"
        data-testid="section-contact"
      >
        <div className="contact-grid">
          <div className="contact-title">
            <span className="eyebrow">
              {t(
                'contact.eyebrow',
              )}
            </span>

            <h2>
              {t('contact.title')}
            </h2>

            <p>
              {t('contact.copy')}
            </p>

            <div
              className="phones"
              aria-live="polite"
            >
              {configQuery.isLoading && (
                <span
                  className="phone-skeleton"
                  role="status"
                >
                  {t(
                    'contact.phoneLoad',
                  )}
                </span>
              )}

              {configQuery.isError && (
                <div
                  className="form-state error"
                  role="alert"
                >
                  {t(
                    'contact.phoneError',
                  )}{' '}

                  <button
                    className="icon-button"
                    onClick={() =>
                      void configQuery.refetch()
                    }
                    type="button"
                    data-testid="button-retry-config"
                  >
                    {t(
                      'contact.retry',
                    )}
                  </button>
                </div>
              )}

              {config?.phones?.map(
                (phone) => (
                  <a
                    href={`tel:${phone.number.replace(/[^\d+]/g, '')}`}
                    key={`${phone.label}-${phone.number}`}
                    data-testid={`link-phone-${phone.number.replace(/\D/g, '')}`}
                    aria-label={`${phone.label}: ${phone.number}`}
                  >
                    {phone.number}
                  </a>
                ),
              )}

              {config?.phones &&
                config.phones
                  .length === 0 && (
                  <span
                    className="phone-skeleton"
                    role="status"
                  >
                    {t(
                      'contact.phoneEmpty',
                    )}
                  </span>
                )}
            </div>

            <a
              className="telegram-link"
              href="https://t.me/"
              target="_blank"
              rel="noreferrer"
              data-testid="link-telegram"
            >
              {t(
                'contact.telegram',
              )}

              <ArrowUpRight
                size={14}
              />
            </a>
          </div>

          <LeadForm />
        </div>

        <div
          className="map-placeholder"
          role="note"
          data-testid="placeholder-map"
        >
          <MapPin size={17} />

          <span>
            {t('contact.map')}
          </span>

          <span
            style={{
              color: '#787165',
            }}
          >
            —{' '}
            {t(
              'contact.mapNote',
            )}
          </span>
        </div>

        <footer className="footer">
          <a
            className="brand"
            href="#home"
            aria-label={`BINO STROY — ${t('labels.home')}`}
            data-testid="link-footer-brand"
          >
            <span className="brand-mark">
              <span>B</span>
            </span>

            <span>
              BINO STROY
            </span>
          </a>

          <span>
            {t(
              'contact.copyright',
            )}
          </span>
        </footer>
      </section>

      <AssistantChat />
    </main>
  );
}

export default Home;