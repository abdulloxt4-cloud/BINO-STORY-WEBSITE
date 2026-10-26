import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, MutableRefObject, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import {
  ArrowDownRight,
  ArrowUpRight,
  Instagram,
  Bath,
  CookingPot,
  House,
  Warehouse,
  CarFront,
  Building2,
  Waves,
  Droplets,
  Factory,
  ChevronLeft,
  ChevronRight,
  MapPin,
  MessageCircle,
  Send,
  X,
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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
type Lang = 'uz' | 'ru' | 'en' | 'zh';
/* BINO ZH SUPPORT 2026 */
type ModelKind = 'roll' | 'foundation' | 'roof';
type FormValues = { name: string; phone: string; message: string };
type ChatMessage = { role: 'user' | 'assistant'; content: string };
const sections = [
  'home',
  'product',
  'foundation',
  'roof',
  'uses',
  'why',
  'contact',
] as const;
const styles = `
/* BINO CONTACT 07 V1 — isolated premium responsive contact styles */
#contact { padding-top: clamp(132px, 10vw, 178px) !important; }
#contact .contact-grid {
  display: grid !important;
  grid-template-columns: minmax(0, 0.93fr) minmax(0, 1.07fr) !important;
  gap: clamp(32px, 7vw, 116px) !important;
  align-items: start !important;
}
#contact .contact-title, #contact .lead-form { min-width: 0; }
#contact .contact-title h2 { max-width: 630px; }
#contact .bino-contact-phone { margin-top: clamp(26px, 3vw, 42px); }
#contact .bino-contact-eyebrow {
  display: block; color: #d9a441; font: 600 10px/1.5 monospace;
  letter-spacing: .15em; text-transform: uppercase; margin-bottom: 11px;
}
#contact .bino-contact-phone-number {
  display: inline-flex; align-items: center; gap: 9px; width: fit-content;
  max-width: 100%; text-decoration: none; color: #faf4e8;
  font-size: clamp(22px, 2.7vw, 34px); font-weight: 500; letter-spacing: -.025em;
  border-bottom: 1px solid rgba(217,164,65,.5); padding-bottom: 6px;
}
#contact .bino-contact-phone-number:hover { color: #efbf62; }
#contact .bino-more-phones { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 12px; }
#contact .bino-more-phones a { color: #d9d1c3; font-size: 14px; text-decoration: none; }
#contact .bino-more-phones a:hover { color: #edbc61; }
#contact .bino-social-head { margin-top: clamp(30px, 4vw, 55px); margin-bottom: 16px; }
#contact .bino-social-head h3 { font-size: clamp(19px, 2vw, 25px); font-weight: 500; letter-spacing: -.02em; margin: 0 0 5px; }
#contact .bino-social-head p { margin: 0; color: #a8a095; font-size: 13px; line-height: 1.6; }
#contact .bino-social-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
#contact .bino-social-link {
  min-width: 0; min-height: 104px; padding: 15px 10px;
  background: linear-gradient(155deg, rgba(62,52,38,.65), rgba(26,24,21,.88));
  border: 1px solid rgba(217,164,65,.28); border-radius: 4px;
  display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 9px;
  text-decoration: none !important; color: #f4eee2 !important;
  transition: transform .25s ease, border-color .25s ease, background .25s ease;
}
#contact .bino-social-link svg { width: 27px; height: 27px; color: #e7b14b; fill: none; }
#contact .bino-social-link svg.bino-social-brand { fill: currentColor; }
#contact .bino-social-link span { color: #eee3d2; font-size: 12px; font-weight: 600; letter-spacing: .02em; }
#contact .bino-social-link:hover { transform: translateY(-4px); border-color: #e6ad46; background: rgba(76,58,33,.7); }
#contact .bino-social-link:focus-visible, #contact .bino-map-button:focus-visible {
  outline: 2px solid #fff; outline-offset: 4px;
}
#contact .lead-form { width: 100%; }
#contact .bino-location { margin-top: clamp(52px, 8vw, 112px); border: 1px solid rgba(217,164,65,.3); background: #201e1a; }
#contact .bino-location-top { padding: clamp(20px, 3.2vw, 40px); display: flex; justify-content: space-between; align-items: center; gap: 22px; }
#contact .bino-location-heading { display: flex; gap: 16px; align-items: center; }
#contact .bino-location-heading > svg { color: #d9a441; flex: 0 0 auto; }
#contact .bino-location-heading h3 { font-size: clamp(20px, 2.5vw, 32px); font-weight: 500; margin: 0 0 8px; letter-spacing: -.035em; }
#contact .bino-location-heading p { margin: 0; color: #aea699; font-size: 13px; line-height: 1.5; }
#contact .bino-map-button { display: inline-flex; align-items: center; justify-content: center; gap: 10px; padding: 15px 20px; min-height: 48px; background: #d9a441; color: #19160f !important; border-radius: 3px; font-weight: 700; font-size: 13px; text-decoration: none !important; white-space: nowrap; }
#contact .bino-map-button:hover { background: #efbf62; }
#contact .bino-map-frame { height: clamp(280px, 37vw, 480px); width: 100%; position: relative; overflow: hidden; background: #302d25; }
#contact .bino-map-frame iframe { display: block; width: 100%; height: 100%; border: 0; filter: grayscale(.45) contrast(1.05); }
#contact .bino-map-bottom { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; padding: 17px clamp(20px, 3.2vw, 40px); border-top: 1px solid rgba(217,164,65,.22); }
#contact .bino-map-bottom span { color: #a9a192; font-size: 12px; }
#contact .bino-map-bottom a { color: #e6b659; font-size: 12px; text-decoration: none; }
#contact .bino-map-bottom a:hover { text-decoration: underline; }
#contact .footer { display: flex !important; justify-content: space-between; align-items: center; gap: 22px; flex-wrap: wrap; margin-top: 58px; }
@media (max-width: 1020px) {
  #contact .contact-grid { gap: 35px !important; }
  #contact .bino-social-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; }
}
@media (max-width: 767px) {
  #contact { padding-top: 112px !important; }
  #contact .contact-grid { grid-template-columns: minmax(0, 1fr) !important; gap: 34px !important; }
  #contact .bino-social-grid { gap: 8px; }
  #contact .bino-social-link { min-height: 91px; padding: 12px 7px; }
  #contact .bino-social-link span { font-size: 11px; }
  #contact .bino-location { margin-top: 50px; }
  #contact .bino-location-top { flex-direction: column; align-items: stretch; }
  #contact .bino-map-button { width: 100%; }
  #contact .bino-map-frame { height: 300px; }
  #contact .footer { align-items: flex-start; }
}
@media (prefers-reduced-motion: reduce) {
  #contact .bino-social-link { transition: none; }
  #contact .bino-social-link:hover { transform: none; }
}

/* SP OOO BINO 06 — premium process details */
#why .why-insights { margin-top: clamp(52px, 7vw, 98px); }
#why .why-insights-intro {
  display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(0, .65fr);
  gap: clamp(24px, 5vw, 90px); align-items: end; margin-bottom: 28px;
}
#why .why-insights-kicker {
  display: inline-block; font-size: 10px; letter-spacing: .17em;
  font-family: var(--app-font-mono, monospace); color: #d9a441;
  text-transform: uppercase; margin-bottom: 16px;
}
#why .why-insights-intro h3 {
  max-width: 750px; font-size: clamp(34px, 4.5vw, 66px);
  font-weight: 500; letter-spacing: -.055em; line-height: 1.05;
  margin: 0; color: #f4eee3;
}
#why .why-insights-intro p {
  font-size: 14px; line-height: 1.8; color: #aaa295; margin: 0 0 5px;
}
#why .why-insights-grid {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 13px;
}
#why .why-insight {
  position: relative; isolation: isolate; overflow: hidden;
  display: flex; flex-direction: column; min-height: 252px;
  padding: clamp(21px, 2.1vw, 32px);
  background: linear-gradient(145deg, #2b2721 0%, #1b1a17 90%);
  border: 1px solid rgba(217, 164, 65, .29);
  transition: border-color .25s ease, transform .25s ease, background .25s ease;
}
#why .why-insight:hover {
  transform: translateY(-4px); border-color: #d9a441;
  background: linear-gradient(145deg, #352c1e 0%, #201e1a 95%);
}
#why .why-insight-top { display: flex; align-items: start; justify-content: space-between; position: relative; z-index: 1; }
#why .why-insight-top span:first-child {
  color: #ddb159; font: 10px var(--app-font-mono, monospace); letter-spacing: .12em;
}
#why .why-insight-cross { color: rgba(217,164,65,.8); font-size: 19px; font-weight: 300; line-height: 1; }
#why .why-insight-watermark {
  position: absolute; right: 15px; bottom: 42px; z-index: 0;
  font-size: clamp(80px, 9vw, 145px); font-weight: 600; line-height: 1;
  letter-spacing: -.09em; color: rgba(217,164,65,.055); pointer-events: none;
}
#why .why-insight h4 { z-index: 1; position: relative; margin: auto 0 11px; font-size: clamp(20px, 2vw, 27px); font-weight: 500; color: #f3eee6; letter-spacing: -.035em; }
#why .why-insight p { z-index: 1; position: relative; margin: 0; max-width: 400px; color: #b6ada0; font-size: 12px; line-height: 1.75; }
#why .process { padding-top: clamp(56px, 6vw, 90px); }
#why .timeline-item { align-items: start; gap: 6px 14px; padding: 20px 0; min-height: 96px; }
#why .timeline-item > span { grid-column: 1; grid-row: 1 / 3; padding-top: 3px; }
#why .timeline-item > b { grid-column: 2; grid-row: 1; font-size: 14px; }
#why .why-step-detail { grid-column: 2; grid-row: 2; margin: 0; font-size: 12px; line-height: 1.7; color: #9e9689; }
#why .why-cta {
  margin-top: 48px; display: flex; gap: 30px; align-items: center;
  justify-content: space-between; padding: clamp(25px, 4vw, 52px);
  background: linear-gradient(112deg, #302a21 0%, #221f19 67%, #372b18 100%);
  border: 1px solid rgba(217,164,65,.48);
}
#why .why-cta h3 { margin: 0 0 12px; font-size: clamp(25px, 3vw, 38px); font-weight: 500; line-height: 1.15; letter-spacing: -.04em; }
#why .why-cta p { margin: 0; max-width: 610px; color: #b9afa0; font-size: 13px; line-height: 1.7; }
#why .why-cta-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 16px;
  flex-shrink: 0; min-height: 54px; padding: 0 24px;
  background: #d9a441; border: 1px solid #d9a441;
  color: #18140d; font-size: 12px; font-weight: 700; text-decoration: none;
  transition: background .2s ease, transform .2s ease;
}
#why .why-cta-button:hover { background: #ecc275; transform: translateY(-2px); }
#why .why-cta-button:focus-visible { outline: 2px solid white; outline-offset: 4px; }
@media (max-width: 1000px) {
  #why .why-insights-intro { grid-template-columns: 1fr; gap: 16px; }
  #why .why-insights-intro p { max-width: 650px; }
  #why .why-insights-grid { grid-template-columns: 1fr; gap: 12px; }
  #why .why-insight { min-height: 190px; }
  #why .why-cta { flex-direction: column; align-items: stretch; }
  #why .why-cta-button { align-self: flex-start; }
}
@media (max-width: 767px) {
  #why .why-insight { padding: 23px; min-height: 195px; }
  #why .why-insights { margin-top: 50px; }
  #why .why-insights-intro h3 { font-size: clamp(31px, 8vw, 46px); }
  #why .why-insights-intro p { font-size: 13px; }
  #why .why-cta { margin-top: 38px; padding: 23px; }
  #why .why-cta-button { align-self: stretch; }
}
@media (prefers-reduced-motion: reduce) {
  #why .why-insight, #why .why-cta-button { transition: none; }
  #why .why-insight:hover, #why .why-cta-button:hover { transform: none; }
}
#uses .use-viewport {
  overflow: visible !important;
}
#uses .use-cards {
  width: 100% !important;
  display: grid !important;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  transform: none !important;
}
#uses .use-card {
  width: auto !important;
  min-width: 0 !important;
  min-height: 410px;
  padding: 24px;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(215,186,127,.27);
  background: linear-gradient(145deg,#363027,#25221e 62%,#1d1c19);
  transition: transform .25s ease, border-color .25s ease;
}
#uses .use-card:hover {
  transform: translateY(-5px);
  border-color: rgba(217,164,65,.67);
}
#uses .use-illustration {
  height: 190px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin: 0 0 24px;
  border: 1px solid rgba(212,183,123,.13);
  background: radial-gradient(ellipse at 50% 45%,#58452b,#312920 38%,#24211c 73%);
}
#uses .layer-icon {
  position: relative;
  width: 170px;
  height: 105px;
  flex: 0 0 170px;
  transform: skewY(-11deg);
}
#uses .use-card .mono { color: #e0b25c; }
#uses .use-card h3 {
  font-size: clamp(20px,2vw,26px);
  line-height: 1.18;
}
#uses .use-card p { color: #cdc5b7; }
#uses .use-place { color: #eee4d4; }
.technical-scene .scene-controls {
  position: relative !important;
  left: auto !important;
  right: auto !important;
  top: auto !important;
  bottom: auto !important;
  margin-top: 24px;
  z-index: 12;
  display: flex;
  align-items: center;
  gap: 10px;
  width: max-content;
  max-width: 100%;
  border: 1px solid rgba(215,180,103,.36);
  border-radius: 100px;
  padding: 7px;
  background: rgba(25,23,20,.92);
  box-shadow: 0 12px 30px rgba(0,0,0,.25);
}
.technical-scene .scene-control-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid rgba(215,180,103,.3);
  border-radius: 100px;
  background: #d9a441;
  color: #171613;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  touch-action: manipulation;
}
.technical-scene .scene-control-button:hover:not(:disabled) {
  background: #efbf62;
}
.technical-scene .scene-control-button:disabled {
  opacity: .35;
  cursor: not-allowed;
}
.technical-scene .scene-control-button:focus-visible {
  outline: 2px solid white;
  outline-offset: 2px;
}
.technical-scene .scene-control-counter {
  color: #f3e9d6;
  font: 700 12px monospace;
  min-width: 60px;
  text-align: center;
  white-space: nowrap;
}
#product .layer-dots {
  display: none !important;
}
@media (min-width:768px) and (max-width:1150px) {
  #uses .use-cards {
    grid-template-columns: repeat(2,minmax(0,1fr));
  }
}
@media (max-width:767px) {
  #uses .use-cards {
    grid-template-columns: minmax(0,1fr);
  }
  #uses .use-card {
    min-height: 335px;
    padding: 20px;
  }
  #uses .use-illustration {
    height: 158px;
  }
  .technical-scene .scene-controls {
    margin-top: 16px;
    gap: 5px;
    padding: 5px;
  }
  .technical-scene .scene-control-button {
    min-height: 42px;
    padding: 0 11px;
    font-size: 12px;
  }
  .technical-scene .scene-control-counter {
    min-width: 52px;
  }
}
@media (prefers-reduced-motion:reduce) {
  #uses .use-card { transition: none; }
  #uses .use-card:hover { transform: none; }
}


/* ===========================================
   05 — SP OOO BINO / application photo gallery
   Three actual design assets, no extra WebGL.
   =========================================== */
#uses.applications {
  padding-top: clamp(120px, 11vh, 150px);
  padding-bottom: clamp(90px, 9vh, 130px);
  background: radial-gradient(ellipse at 55% 5%, #30291f 0%, #1c1915 55%, #181612 100%);
}
#uses .applications-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 32px;
  margin-bottom: 30px;
}
#uses .applications-heading h2 {
  max-width: 920px;
  font-size: clamp(38px, 5.1vw, 79px);
  font-weight: 600;
  line-height: 1.03;
  letter-spacing: -0.065em;
  text-wrap: balance;
}
#uses .applications-heading > p {
  flex: 0 1 355px;
  max-width: 355px;
  padding-left: 20px;
  border-left: 1px solid #d9a441;
  color: #c9c2b5;
  font-size: 13px;
  line-height: 1.8;
}
#uses .use-viewport {
  overflow: visible;
}
#uses .use-cards {
  display: grid !important;
  width: 100% !important;
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  gap: 14px !important;
  background: none !important;
  border: 0 !important;
  transform: none !important;
}
#uses .use-card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  width: auto;
  min-height: 0;
  padding: 0 !important;
  overflow: hidden;
  border: 1px solid rgba(213, 165, 73, .54);
  border-radius: 9px;
  background: #171411 !important;
  box-shadow: 0 12px 38px rgba(0,0,0,.15);
  transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease;
}
#uses .use-card:hover {
  transform: translateY(-5px);
  border-color: #efc773;
  box-shadow: 0 25px 48px rgba(0,0,0,.32);
  background: #171411 !important;
}
#uses .use-illustration {
  position: relative;
  display: block;
  width: 100%;
  height: clamp(255px, 24vw, 420px);
  flex: 0 0 auto;
  margin: 0 !important;
  padding: 0;
  border: 0;
  background: #2c251c;
  overflow: hidden;
}
#uses .use-illustration img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform .45s ease;
}
#uses .use-card:hover .use-illustration img {
  transform: scale(1.035);
}
#uses .use-illustration::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg,rgba(9,8,7,.53),transparent 25%,transparent 82%,rgba(9,8,7,.14));
}
#uses .use-illustration-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
}
#uses .use-illustration-fallback .layer-icon {
  transform: skewY(-11deg);
}
#uses .use-feature-place {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid rgba(217,164,65,.18);
  color: #cfbd9b;
  font: 700 10px/1.5 var(--app-font-mono);
  text-transform: uppercase;
}
#uses .use-photo-kicker {
  position: absolute;
  top: 18px;
  left: 20px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 9px;
  color: #f6ca6f;
  font: 700 clamp(9px,.7vw,11px)/1.4 var(--app-font-mono);
  letter-spacing: .075em;
  text-shadow: 0 1px 9px rgba(0,0,0,.86);
  text-transform: uppercase;
}
#uses .use-card-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  padding: 22px clamp(18px,1.6vw,26px) 24px;
}
#uses .use-card-body h3 {
  margin: 0 0 12px;
  color: #f2ebe0;
  font-size: clamp(21px,1.7vw,29px);
  font-weight: 600;
  line-height: 1.18;
  letter-spacing: -.045em;
}
#uses .use-card-body p {
  flex: 1;
  margin: 0;
  color: #cdc5b9;
  font-size: clamp(12px,.84vw,14px);
  line-height: 1.75;
}
#uses .use-place { display: none; }
#uses .use-features {
  display: grid;
  grid-template-columns: repeat(3,minmax(0,1fr));
  gap: 0;
  margin-top: 23px;
  padding-top: 18px;
  border-top: 1px solid rgba(217,164,65,.17);
}
#uses .use-feature {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 2px 7px 2px 0;
}
#uses .use-feature:not(:first-child) {
  border-left: 1px solid rgba(217,164,65,.30);
  padding-left: 12px;
}
#uses .use-feature svg {
  flex: 0 0 auto;
  width: 18px;
  height: 18px;
  color: #e4ad44;
  stroke-width: 1.7;
}
#uses .use-feature span {
  min-width: 0;
  overflow-wrap: anywhere;
  color: #dbd0bc;
  font: 700 clamp(8px,.6vw,10px)/1.35 var(--app-font-mono);
  letter-spacing: .025em;
  text-transform: uppercase;
}
@media (min-width: 768px) and (max-width: 1150px) {
  #uses .use-cards {
    grid-template-columns: repeat(2,minmax(0,1fr)) !important;
  }
    #uses .applications-heading { align-items: start; }
  #uses .applications-heading h2 { font-size: clamp(38px,4.4vw,62px); }
  #uses .applications-heading > p { flex-basis: 270px; }
  #uses .use-illustration { height: 340px; }
}
@media (max-width: 767px) {
  #uses.applications { padding: 105px 18px 68px; }
  #uses .applications-heading {
    display: block;
    margin-bottom: 26px;
  }
  #uses .applications-heading h2 {
    max-width: 100%;
    font-size: clamp(35px,10vw,49px);
    line-height: 1.05;
  }
  #uses .applications-heading > p {
    margin-top: 24px;
    padding-left: 15px;
    max-width: 100%;
  }
  #uses .use-cards {
    grid-template-columns: minmax(0,1fr) !important;
    gap: 16px !important;
  }
  #uses .use-card { border-radius: 8px; }
  #uses .use-illustration { height: clamp(245px,72vw,360px); }
  #uses .use-card-body { padding: 22px 19px 24px; }
  #uses .use-card-body h3 { font-size: 25px; }
  #uses .use-card-body p { font-size: 13px; }
  #uses .use-feature span { font-size: 8px; }
}
@media (prefers-reduced-motion:reduce) {
  #uses .use-card,
  #uses .use-illustration img { transition: none; }
  #uses .use-card:hover,
  #uses .use-card:hover .use-illustration img { transform: none; }
}
`;
function detectChatLanguage(text: string, current: Lang): Exclude<Lang, 'zh'> {
  if (/[А-Яа-яЁё]/.test(text)) return 'ru';
  if (
    /[ʻ‘’ʼ]/.test(text) ||
    /\b(va|uchun|qanday|qayerda|suv|qatlam|gidroizolyatsiya|rulon)\b/i.test(text)
  ) return 'uz';
  if (
    /\b(the|and|what|how|where|please|can|is|waterproof|layer|roll|foundation)\b/i.test(text)
  ) return 'en';
  return current === 'zh' ? 'en' : current;
}
function useIsMobile() {
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' &&
    window.matchMedia('(max-width: 767px)').matches
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
  onStep?: (step: number) => void
) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.registerPlugin(ScrollTrigger);
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      progress.current = 0.5;
      onStep?.(2);
      return;
    }
    const trigger = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top 85%',
      end: 'bottom 15%',
      pin: false,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        progress.current = self.progress;
        onStep?.(
          Math.min(4, Math.floor(self.progress * 5))
        );
      },
    });
    return () => trigger.kill();
  }, [progress, onStep]);
  return ref;
}
function LazyBinoModel({
  kind,
  progress,
}: {
  kind: ModelKind;
  progress: MutableRefObject<number>;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const node = container.current;
    if (!node) return;
    if (!('IntersectionObserver' in window)) {
      setLoaded(true);
      setActive(true);
      return;
    }
    const preload = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoaded(true);
          preload.disconnect();
        }
      },
      {
        rootMargin: '650px 0px',
        threshold: 0,
      },
    );
    const visibility = new IntersectionObserver(
      ([entry]) => {
        setActive(entry.isIntersecting);
      },
      {
        rootMargin: '100px 0px',
        threshold: 0,
      },
    );
    preload.observe(node);
    visibility.observe(node);
    return () => {
      preload.disconnect();
      visibility.disconnect();
    };
  }, []);
  return (
    <div
      ref={container}
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      {loaded && (
        <BinoModel
          kind={kind}
          progress={progress}
          active={active}
        />
      )}
    </div>
  );
}
function Header({
  onLanguage,
}: {
  onLanguage: (lang: Lang) => void;
}) {
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const items = useMemo(
    () => sections.map(id => ({
      id,
      label: t(`nav.${id === 'home' ? 'hero' : id}`),
    })),
    [t]
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
          aria-label={`SP OOO BINO — ${t('labels.home')}`}
          data-testid="link-brand"
        >
          <span className="brand-mark"><span>B</span></span>
          <span>SP OOO BINO</span>
        </a>
        <nav className="bino-top-links" aria-label={t('nav.index')}>
          {(['home', 'product', 'uses', 'why', 'contact'] as const).map(id => (
            <a key={id} href={`#${id}`}>
              {t(`nav.${id === 'home' ? 'hero' : id}`)}
            </a>
          ))}
        </nav><div className="header-right">
          <nav
            className="lang-switch"
            aria-label={t('labels.language')}
          >
            {(['uz', 'ru', 'en', 'zh'] as const).map(lang => (
              <button
                key={lang}
                type="button"
                className={i18n.language === lang ? 'active' : ''}
                onClick={() => onLanguage(lang)}
                aria-pressed={i18n.language === lang}
                data-testid={`button-language-${lang}`}
              >
                {lang === 'zh' ? '中文' : lang.toUpperCase()}
              </button>
            ))}
          </nav>
          <button
            type="button"
            className="index-trigger"
            onClick={() => setMenuOpen(v => !v)}
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
              key={item.id}
              href={`#${item.id}`}
              data-testid={`link-index-${item.id}`}
              onClick={() => setMenuOpen(false)}
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
type SectionProps = {
  kind: ModelKind;
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
};
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
}: SectionProps) {
  const { t, i18n } = useTranslation();
  const mobile = useIsMobile();
  const totalSteps =
    kind === 'roll' ? 5 :
    kind === 'foundation' ? 6 : 7;
  const [selectedStep, setSelectedStep] = useState(0);
  const updateStep = useCallback(
    (step: number) => {
      const next = Math.min(
        totalSteps - 1,
        Math.floor(progressRef.current * totalSteps)
      );
      setSelectedStep(old => old === next ? old : next);
      onStep?.(step);
    },
    [totalSteps, progressRef, onStep]
  );
  const ref = useScrollScene(progressRef, updateStep);
  const chooseStep = (step: number) => {
    const next = Math.max(
      0,
      Math.min(totalSteps - 1, step)
    );
    progressRef.current = next / (totalSteps - 1);
    setSelectedStep(next);
    if (kind === 'roll') onStep?.(next);
  };
  const ru = i18n.language.startsWith('ru');
  const en = i18n.language.startsWith('en');
  const zh = i18n.language.startsWith('zh');
  const prevText = zh ? '上一步' : ru ? 'Назад' : en ? 'Previous' : 'Oldingi';
  const nextText = zh ? '下一步' : ru ? 'Далее' : en ? 'Next' : 'Keyingi';
  return (
    <section
      id={sectionKey}
      ref={ref}
      className="scene technical-scene"
      aria-label={title}
      data-testid={`section-${sectionKey}`}
    >
      <div className="section-head">
        <span className="eyebrow">{eyebrow}</span>
        <span className="scene-number">{index} / 07</span>
        <h2>{title}</h2>
        <p>{copy}</p>
        <div
          className="scene-controls"
          role="group"
          aria-label={title}
        >
          <button
            type="button"
            className="scene-control-button"
            onClick={() => chooseStep(selectedStep - 1)}
            disabled={selectedStep === 0}
            aria-label={prevText}
          >
            <ChevronLeft size={17} />
            {prevText}
          </button>
          <span
            className="scene-control-counter"
            aria-live="polite"
          >
            {String(selectedStep + 1).padStart(2, '0')}
            {' / '}
            {String(totalSteps).padStart(2, '0')}
          </span>
          <button
            type="button"
            className="scene-control-button"
            onClick={() => chooseStep(selectedStep + 1)}
            disabled={selectedStep === totalSteps - 1}
            aria-label={nextText}
          >
            {nextText}
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
      <div
        className={`model-wrap ${mobile ? 'mobile-model-wrap' : ''}`}
        role="img"
        aria-label={kind === 'roll' ? t('product.tag') : title}
      >
        <LazyBinoModel
          kind={kind}
          progress={progressRef}
        />
        <span className="model-label">
          {kind === 'roll' ? layerLabel : callout}
        </span>
      </div>
      {kind !== 'roll' && (
        <div
          className="system-layer-list"
          aria-label={title}
        >
          {layers.map((layer, layerIndex) => (
            <span
              key={`${layer}-${layerIndex}`}
              className={
                kind === 'foundation'
                  ? layerIndex === 3 ? 'bino-layer' : ''
                  : layerIndex === 2 || layerIndex === 3
                    ? 'bino-layer' : ''
              }
            >
              <i />
              {layer}
            </span>
          ))}
        </div>
      )}
      {children}
      <span className="scene-caption">
        {kind === 'roll'
          ? t('product.tag')
          : `${index} / ${t('labels.system')}`}
      </span>
    </section>
  );
}
function LeadForm() {
  const { t, i18n } = useTranslation();
  /* BINO LEAD CONFIRM MODAL V1 */
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const successCloseRef = useRef<HTMLButtonElement>(null);
  const successCopy = i18n.language.startsWith('zh')
    ? { eyebrow: 'SP OOO BINO', title: '感谢您！', message: '您的咨询已成功提交。我们将尽快与您联系。', close: '关闭' }
    : i18n.language.startsWith('ru')
    ? { eyebrow: 'SP OOO BINO', title: 'Спасибо!', message: 'Ваша заявка успешно отправлена. Мы скоро с вами свяжемся.', close: 'Закрыть' }
    : i18n.language.startsWith('en')
    ? { eyebrow: 'SP OOO BINO', title: 'Thank you!', message: 'Your request was submitted successfully. We will contact you soon.', close: 'Close' }
    : { eyebrow: 'SP OOO BINO', title: 'Rahmat!', message: 'So‘rovingiz muvaffaqiyatli yuborildi. Yaqin orada siz bilan bog‘lanamiz.', close: 'Yopish' };
  useEffect(() => {
    if (!isSuccessOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsSuccessOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    successCloseRef.current?.focus();
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSuccessOpen]);
  const createLead = useCreateBinoLead();
  const [values, setValues] = useState<FormValues>({
    name: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<FormValues>>({});
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  useEffect(() => {
    setErrors({});
  }, [i18n.language]);
  const update = (key: keyof FormValues, value: string) => {
    setValues(old => ({ ...old, [key]: value }));
    setErrors(old => ({ ...old, [key]: undefined }));
    setResult(null);
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: Partial<FormValues> = {};
    if (values.name.trim().length < 2)
      next.name = t('contact.validation.name');
    if (values.phone.trim().replace(/\D/g, '').length < 7)
      next.phone = t('contact.validation.phone');
    if (values.message.trim().length < 3)
      next.message = t('contact.validation.message');
    setErrors(next);
    if (Object.keys(next).length) return;
    const leadData: BinoLeadInput = {
      name: values.name.trim(),
      phone: values.phone.trim(),
      message: values.message.trim(),
    };
    createLead.mutate(
      { data: leadData },
      {
        onSuccess: () => {
          // Open the dialog only after the server confirms the request.
          setResult(null);
          setIsSuccessOpen(true);
          setValues({ name: '', phone: '', message: '' });
        },
        onError: () => { setIsSuccessOpen(false); setResult('error'); },
      }
    );
  };
  return (
    <>
    <form
      className="lead-form"
      onSubmit={submit}
      noValidate
      data-testid="form-lead"
    >
      {(['name', 'phone', 'message'] as const).map(key => (
        <div className="field" key={key}>
          <label htmlFor={`lead-${key}`}>
            {t(`contact.${key}`)}
          </label>
          {key === 'message' ? (
            <textarea
              id={`lead-${key}`}
              value={values[key]}
              maxLength={2000}
              placeholder={t(`contact.${key}Placeholder`)}
              onChange={e => update(key, e.target.value)}
              aria-invalid={Boolean(errors[key])}
              aria-describedby={
                errors[key] ? `error-${key}` : undefined
              }
              data-testid={`input-lead-${key}`}
            />
          ) : (
            <input
              id={`lead-${key}`}
              value={values[key]}
              type={key === 'phone' ? 'tel' : 'text'}
              maxLength={key === 'phone' ? 40 : 120}
              autoComplete={key === 'phone' ? 'tel' : 'name'}
              placeholder={t(`contact.${key}Placeholder`)}
              onChange={e => update(key, e.target.value)}
              aria-invalid={Boolean(errors[key])}
              aria-describedby={
                errors[key] ? `error-${key}` : undefined
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
        disabled={createLead.isPending}
        data-testid="button-submit-lead"
      >
        {createLead.isPending
          ? t('contact.sending')
          : t('contact.submit')}
        <ArrowUpRight size={15} />
      </button>
      {result && (
        <p
          className={`form-state ${result === 'error' ? 'error' : ''}`}
          role="status"
          data-testid={`status-lead-${result}`}
        >
          {result === 'success'
            ? t('contact.success')
            : t('contact.error')}
        </p>
      )}
    </form>
      {isSuccessOpen && createPortal(
        <div
          className="bino-confirm-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsSuccessOpen(false);
          }}
        >
          <section
            className="bino-confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bino-confirm-title"
            aria-describedby="bino-confirm-description"
          >
            <span className="bino-confirm-icon" aria-hidden="true">✓</span>
            <span className="bino-confirm-eyebrow">{successCopy.eyebrow}</span>
            <h2 id="bino-confirm-title">{successCopy.title}</h2>
            <p id="bino-confirm-description">{successCopy.message}</p>
            <button
              ref={successCloseRef}
              type="button"
              className="bino-confirm-close"
              onClick={() => setIsSuccessOpen(false)}
            >
              {successCopy.close} <ArrowUpRight size={17} aria-hidden="true" />
            </button>
          </section>
        </div>,
        document.body,
      )}
    </>
  );
}function CounterValue({ value }: { value: number }) {
  const [display, setDisplay] = useState(value > 0 ? 0 : value);
  const node = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (value <= 0) {
      setDisplay(value);
      return;
    }
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setDisplay(value);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const counter = { value: 0 };
    const animation = gsap.to(counter, {
      value,
      duration: 1.35,
      ease: 'power2.out',
      snap: { value: 1 },
      onUpdate: () =>
        setDisplay(Math.round(counter.value)),
      scrollTrigger: {
        trigger: node.current,
        start: 'top 88%',
        once: true,
      },
    });
    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, [value]);
  return <span ref={node}>{display}</span>;
}
function AssistantChat() {
  const { t, i18n } = useTranslation();
  const chatMutation = useCreateBinoChatMessage();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const lang = i18n.language as Lang;
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        { role: 'assistant', content: t('chat.welcome') },
      ]);
    }
  }, [open, messages.length, t]);
  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, chatMutation.isPending, open]);
  const send = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || chatMutation.isPending) return;
    const next: ChatMessage[] = [
      ...messages,
      { role: 'user', content: text },
    ];
    setMessages(next);
    setInput('');
    const history: BinoChatTurn[] = [
      {
        role: 'assistant',
        content: `${lang === 'zh' ? 'The customer selected Simplified Chinese (zh-CN); answer in Simplified Chinese. ' : ''}${assistantProductContext.guidance} Product: ${assistantProductContext.product}. Layers: ${assistantProductContext.layers.join('; ')}. Applications: ${assistantProductContext.applications.join('; ')}.`,
      },
      ...next.slice(-14).map(({ role, content }) => ({
        role,
        content,
      })),
    ];
    const chatData: BinoChatInput = {
      message: text,
      language: detectChatLanguage(text, lang),
      history,
    };
    chatMutation.mutate(
      { data: chatData },
      {
        onSuccess: reply =>
          setMessages(current => [
            ...current,
            { role: 'assistant', content: reply.reply },
            { role: 'assistant', content: t('chat.nameAsk') },
          ]),
        onError: () =>
          setMessages(current => [
            ...current,
            { role: 'assistant', content: t('chat.error') },
          ]),
      }
    );
  };
  return (
    <>
      {open && (
        <section
          className="chat-panel"
          aria-label={t('chat.title')}
          data-testid="panel-chat"
        >
          <div className="chat-head">
            <div>
              <b>{t('chat.title')}</b>
              <span>{t('chat.status')}</span>
            </div>
            <button
              className="icon-button"
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t('chat.close')}
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
            {messages.map((message, i) => (
              <div
                key={`${message.role}-${i}`}
                className={`chat-bubble ${message.role}`}
                data-testid={`message-chat-${i}`}
              >
                {message.content}
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="chat-bubble" role="status">
                {t('chat.loading')}
              </div>
            )}
          </div>
          {chatMutation.isError && (
            <div className="chat-notice" role="alert">
              {t('chat.error')}
            </div>
          )}
          <form className="chat-composer" onSubmit={send}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t('chat.placeholder')}
              aria-label={t('chat.placeholder')}
              maxLength={2000}
              data-testid="input-chat-message"
            />
            <button
              type="submit"
              aria-label={t('chat.send')}
              disabled={!input.trim() || chatMutation.isPending}
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
        aria-label={open ? t('chat.close') : t('chat.open')}
        onClick={() => setOpen(value => !value)}
        aria-expanded={open}
        data-testid="button-chat-toggle"
      >
        {open ? <X size={21} /> : <MessageCircle size={22} />}
      </button>
    </>
  );
}

const applicationPhotos = [
  '/bino-use-bathroom.webp',
  '/bino-use-basement.webp',
  '/bino-use-pool.webp',
] as const;

const applicationIcons = [
  [Bath, CookingPot, House],
  [Warehouse, CarFront, Building2],
  [Waves, Droplets, Factory],
] as const;

const applicationFeatureTexts: Record<Lang, string[][]> = {
  zh: [
    ['浴室', '厨房', '室内空间'],
    ['地下室', '停车场', '技术设施'],
    ['泳池', '储水池', '水利设施'],
  ],
  uz: [
    ['Vanna xonalar', 'Oshxonalar', 'Ichki xonalar'],
    ['Yerto‘lalar', 'Avtoturargohlar', 'Texnik inshootlar'],
    ['Basseynlar', 'Rezervuarlar', 'Suv inshootlari'],
  ],
  ru: [
    ['Ванные', 'Кухни', 'Помещения'],
    ['Подвалы', 'Паркинги', 'Сооружения'],
    ['Бассейны', 'Резервуары', 'Водные объекты'],
  ],
  en: [
    ['Bathrooms', 'Kitchens', 'Interior'],
    ['Basements', 'Parking', 'Structures'],
    ['Pools', 'Reservoirs', 'Waterworks'],
  ],
};

const binoWhyDetails = {
  zh: {
    "kicker": "BINO / 我们的工作方式",
    "title": "每一层都有自己的作用。",
    "summary": "可靠的防水不只依赖材料。基层准备、合适的防水系统以及施工细节，需要共同发挥作用。",
    "cards": [
      {
        "tag": "01 / 分析",
        "title": "了解项目现场",
        "copy": "综合考虑基层类型、水分来源、使用环境和预期荷载。"
      },
      {
        "tag": "02 / 方案",
        "title": "选择合适的系统",
        "copy": "针对地基、屋顶、浴室或泳池确定材料和铺设层次。"
      },
      {
        "tag": "03 / 检查",
        "title": "关注施工细节",
        "copy": "接缝、交接部位、边缘处理和最终检查同样重要。"
      }
    ],
    "steps": [
      "了解建筑类型、面积以及您关心的问题。",
      "根据基层状况讨论材料选择和工程量。",
      "协商材料配送与施工各阶段的安排。",
      "说明验收结果、使用建议及质保条件。"
    ],
    "metricLayers": "BINO卷材结构层数",
    "metricUses": "本网站展示的应用领域",
    "metricSteps": "合作流程步骤",
    "ctaKicker": "为您的项目寻找方案",
    "ctaTitle": "哪种防水系统适合您？",
    "ctaCopy": "简单介绍您的项目，我们将根据具体要求讨论合适方案。",
    "ctaButton": "联系我们"
  },
  uz: {
    kicker: 'BINO / ISHGA YONDASHUV',
    title: 'Har bir qatlamning o‘z vazifasi bor.',
    summary: 'Yaxshi gidroizolyatsiya faqat material bilan cheklanmaydi. Yuzani tayyorlash, mos qatlam tizimini tanlash va montaj bosqichlari bir-birini to‘ldirishi kerak.',
    cards: [
      { tag: '01 / TAHLIL', title: 'Obyektni o‘rganish', copy: 'Yuzaning turi, namlik manbai, foydalanish muhiti va kutilayotgan yuklama hisobga olinadi.' },
      { tag: '02 / YECHIM', title: 'Mos tizimni tanlash', copy: 'Poydevor, tom, hammom yoki basseyn uchun material va qatlamlar ketma-ketligi belgilanadi.' },
      { tag: '03 / NAZORAT', title: 'Detallarga e’tibor', copy: 'Choklar, tutashgan joylar, chetlar va yakuniy tekshiruv gidroizolyatsiyaning muhim qismidir.' },
    ],
    steps: [
      'Obyekt turi, maydoni va sizni qiziqtirgan masalalarni aniqlashtiramiz.',
      'Yuza sharoitiga qarab kerakli material va ish hajmini muhokama qilamiz.',
      'Materialni yetkazish va qo‘llash bosqichlarini kelishib olamiz.',
      'Ish yakuni, foydalanish tavsiyalari va kafolat shartlari tushuntiriladi.',
    ],
    metricLayers: 'BINO mahsulotining qatlamlari',
    metricUses: 'Saytda ko‘rsatilgan qo‘llanish sohalari',
    metricSteps: 'Hamkorlik bosqichlari',
    ctaKicker: 'LOYIHANGIZGA MOS YECHIM',
    ctaTitle: 'Qaysi gidroizolyatsiya tizimi kerak?',
    ctaCopy: 'Obyekt haqida qisqacha yozing. Talab va sharoitga mos yechimni muhokama qilamiz.',
    ctaButton: 'Bog‘lanish',
  },
  ru: {
    kicker: 'BINO / НАШ ПОДХОД',
    title: 'У каждого слоя своя задача.',
    summary: 'Надёжная гидроизоляция — это не только материал. Подготовка поверхности, выбор системы и этапы монтажа должны работать вместе.',
    cards: [
      { tag: '01 / АНАЛИЗ', title: 'Изучение объекта', copy: 'Учитываем тип основания, источник влаги, условия эксплуатации и предполагаемую нагрузку.' },
      { tag: '02 / РЕШЕНИЕ', title: 'Выбор системы', copy: 'Подбираем последовательность материалов и слоёв для фундамента, кровли, ванной или бассейна.' },
      { tag: '03 / КОНТРОЛЬ', title: 'Внимание к деталям', copy: 'Швы, примыкания, края и финальная проверка — важные части гидроизоляционной системы.' },
    ],
    steps: [
      'Уточняем тип объекта, площадь и ваши основные задачи.',
      'Обсуждаем материалы и объём работ с учётом состояния поверхности.',
      'Согласовываем доставку материалов и этапы применения.',
      'Разъясняем результат работ, рекомендации и условия гарантии.',
    ],
    metricLayers: 'Слоёв в материале BINO',
    metricUses: 'Областей применения на сайте',
    metricSteps: 'Этапа сотрудничества',
    ctaKicker: 'РЕШЕНИЕ ДЛЯ ВАШЕГО ОБЪЕКТА',
    ctaTitle: 'Какая гидроизоляция вам подходит?',
    ctaCopy: 'Кратко расскажите об объекте — обсудим решение с учётом условий и задач.',
    ctaButton: 'Связаться',
  },
  en: {
    kicker: 'BINO / OUR APPROACH',
    title: 'Every layer has a purpose.',
    summary: 'Reliable waterproofing is more than a material. Surface preparation, the right layer system, and installation details all need to work together.',
    cards: [
      { tag: '01 / ASSESS', title: 'Understand the site', copy: 'Consider surface type, sources of moisture, operating conditions, and expected loads.' },
      { tag: '02 / DESIGN', title: 'Choose the system', copy: 'Select suitable materials and layer order for foundations, roofs, bathrooms, or pools.' },
      { tag: '03 / DETAIL', title: 'Focus on key details', copy: 'Seams, junctions, edges, and final checks are essential to a waterproofing system.' },
    ],
    steps: [
      'Clarify the site type, area, and what you need help with.',
      'Discuss the materials and scope of work based on surface conditions.',
      'Coordinate material delivery and application stages.',
      'Explain the finished work, care recommendations, and warranty terms.',
    ],
    metricLayers: 'Layers in the BINO product',
    metricUses: 'Application areas shown on this site',
    metricSteps: 'Steps in the process',
    ctaKicker: 'A SOLUTION FOR YOUR PROJECT',
    ctaTitle: 'Which waterproofing system fits?',
    ctaCopy: 'Tell us about your project, and we can discuss an approach for your needs and conditions.',
    ctaButton: 'Get in touch',
  },
};

const binoContactDetails = {
  zh: {
    "number": "电话 / WHATSAPP",
    "socialsTitle": "直接与我们联系",
    "socialsCopy": "选择您方便的联系方式。",
    "mapTitle": "在地图上找到我们",
    "mapCopy": "导航至您提供的地点。",
    "directions": "获取路线",
    "mapOpen": "在Google地图中打开",
    "mapPosition": "坐标：41.233425, 69.152564"
  },
  uz: {
    number: 'TELEFON / WHATSAPP',
    socialsTitle: 'Biz bilan bevosita bog‘laning',
    socialsCopy: 'O‘zingizga qulay platformani tanlang.',
    mapTitle: 'Bizni xaritadan toping',
    mapCopy: 'Yuborilgan joylashuv asosida yo‘nalish oling.',
    directions: 'Yo‘nalish olish',
    mapOpen: 'Google Maps’da ochish',
    mapPosition: 'Joylashuv: 41.233425, 69.152564',
  },
  ru: {
    number: 'ТЕЛЕФОН / WHATSAPP',
    socialsTitle: 'Свяжитесь с нами напрямую',
    socialsCopy: 'Выберите удобный способ связи.',
    mapTitle: 'Найдите нас на карте',
    mapCopy: 'Постройте маршрут к указанной точке.',
    directions: 'Проложить маршрут',
    mapOpen: 'Открыть в Google Maps',
    mapPosition: 'Координаты: 41.233425, 69.152564',
  },
  en: {
    number: 'PHONE / WHATSAPP',
    socialsTitle: 'Get in touch directly',
    socialsCopy: 'Choose the platform that works for you.',
    mapTitle: 'Find us on the map',
    mapCopy: 'Get directions to the shared location.',
    directions: 'Get directions',
    mapOpen: 'Open in Google Maps',
    mapPosition: 'Coordinates: 41.233425, 69.152564',
  },
};

function Home() {
  const { t, i18n } = useTranslation();
  const configQuery = useGetBinoSiteConfig();
  const contactDetails = i18n.language.startsWith('zh') ? binoContactDetails.zh : i18n.language.startsWith('ru')
    ? binoContactDetails.ru
    : i18n.language.startsWith('en')
      ? binoContactDetails.en
      : binoContactDetails.uz;
  const heroProgress = useRef(0);
  const foundationProgress = useRef(0);
  const roofProgress = useRef(0);
  const [activeLayer, setActiveLayer] = useState(0);
  const [currentSection, setCurrentSection] = useState(1);
  const [preloading, setPreloading] = useState(true);
  const stepCallback = useCallback(
    (step: number) => setActiveLayer(step),
    []
  );
  const productSteps = t('product.steps', {
    returnObjects: true,
  }) as { title: string; description: string }[];
  const foundationLayers = t('foundation.layers', {
    returnObjects: true,
  }) as string[];
  const roofLayers = t('roof.layers', {
    returnObjects: true,
  }) as string[];
  const useLang: Lang = i18n.language.startsWith('zh') ? 'zh' : i18n.language.startsWith('ru')
    ? 'ru'
    : i18n.language.startsWith('en')
      ? 'en'
      : 'uz';
  const useCards = t('uses.cards', {
    returnObjects: true,
  }) as {
    title: string;
    description: string;
    place: string;
  }[];
  const langHandler = (lang: Lang) => {
    void i18n.changeLanguage(lang);
  };
  useEffect(() => {
    document.title = t('meta.title');
    document.documentElement.lang = i18n.language;
    let meta = document.querySelector(
      'meta[name="description"]'
    );
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', t('meta.description'));
  }, [i18n.language, t]);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const targets = sections
      .map(id => document.getElementById(id))
      .filter(Boolean);
    const triggers = targets.map(target =>
      ScrollTrigger.create({
        trigger: target!,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () =>
          setCurrentSection(
            sections.indexOf(
              target!.id as (typeof sections)[number]
            ) + 1
          ),
        onEnterBack: () =>
          setCurrentSection(
            sections.indexOf(
              target!.id as (typeof sections)[number]
            ) + 1
          ),
      })
    );
    return () => triggers.forEach(trigger => trigger.kill());
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(
      () => setPreloading(false),
      850
    );
    return () => window.clearTimeout(timer);
  }, []);
  const config = configQuery.data as BinoSiteConfig | undefined;
  const values = config?.metrics;
  const whyDetails = i18n.language.startsWith('zh') ? binoWhyDetails.zh : i18n.language.startsWith('ru')
    ? binoWhyDetails.ru
    : i18n.language.startsWith('en')
      ? binoWhyDetails.en
      : binoWhyDetails.uz;

  // When the backend has no figures, show verifiable product/process facts
  // rather than inventing a project count, client count, or warranty years.
  const completedProjects = values?.completedProjects ?? 0;
  const satisfiedClients = values?.satisfiedClients ?? 0;
  const warrantyYears = values?.warrantyYears ?? 0;
  const metrics = [
    (values?.experienceYears ?? 0) > 0 ? values!.experienceYears : 20,
    completedProjects > 0 ? completedProjects : 5,
    satisfiedClients > 0 ? satisfiedClients : useCards.length,
    warrantyYears > 0 ? warrantyYears : 4,
  ];
  const metricLabels = [
    t('why.metrics.0'),
    completedProjects > 0 ? t('why.metrics.1') : whyDetails.metricLayers,
    satisfiedClients > 0 ? t('why.metrics.2') : whyDetails.metricUses,
    warrantyYears > 0 ? t('why.metrics.3') : whyDetails.metricSteps,
  ];
  return (
    <main>
      <style>{styles}</style>
      <div
        className={`preloader ${preloading ? '' : 'done'}`}
        aria-hidden={!preloading}
      >
        <div className="preloader-inner">
          <div className="brand-mark"><span>B</span></div>
          <p>{t('labels.preload')}</p>
          <div className="preloader-line" />
        </div>
      </div>
      <div className="noise" aria-hidden="true" />
      <Header onLanguage={langHandler} />
      <div className="scroll-index" aria-hidden="true">
        <b>{String(currentSection).padStart(2, '0')}</b>
        {' / 07'}
      </div>
      <section
        id="home"
        className="scene hero"
        data-testid="section-home"
        aria-label={`${t('hero.eyebrow')}: ${t('hero.copy')}`}
      >
        <div className="hero-content">
          <div className="eyebrow">{t('hero.eyebrow')}</div>
          <h1>{t('hero.title')}</h1>
          <p className="hero-copy">{t('hero.copy')}</p>
          <div className="hero-actions">
            <a
              className="btn"
              href="#product"
              data-testid="link-explore"
            >
              {t('hero.explore')}
              <ArrowDownRight size={16} />
            </a>
            <a
              className="btn btn-quiet"
              href="#contact"
              data-testid="link-contact"
            >
              {t('hero.contact')}
              <ChevronRight size={15} />
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
        eyebrow={t('product.eyebrow')}
        callout={t('product.tag')}
        layers={productSteps.map(step => step.title)}
        onStep={stepCallback}
        layerLabel={`${t('labels.layer')} / 0${activeLayer + 1} / 240`}
      >
        <div className="scene-aside">
          <div className="layer-kicker">
            {t('product.step')} / 0{activeLayer + 1} / 05
          </div>
          <h3>{productSteps[activeLayer]?.title}</h3>
          <p>{productSteps[activeLayer]?.description}</p>
          <div
            className="layer-dots"
            aria-label={t('product.tag')}
          >
            {productSteps.map((step, index) => (
              <button
                key={step.title}
                className={index === activeLayer ? 'active' : ''}
                type="button"
                aria-label={`${t('product.step')} ${index + 1}: ${step.title}`}
                aria-pressed={index === activeLayer}
                onClick={() => {
                  setActiveLayer(index);
                  heroProgress.current = index / 4;
                }}
                data-testid={`button-product-layer-${index + 1}`}
              />
            ))}
          </div>
        </div>
      </TechnicalSection>
      <TechnicalSection
        kind="foundation"
        sectionKey="foundation"
        index="03"
        progressRef={foundationProgress}
        title={t('foundation.title')}
        copy={t('foundation.copy')}
        eyebrow={t('foundation.eyebrow')}
        callout={t('foundation.callout')}
        layers={foundationLayers}
      />
      <TechnicalSection
        kind="roof"
        sectionKey="roof"
        index="04"
        progressRef={roofProgress}
        title={t('roof.title')}
        copy={t('roof.copy')}
        eyebrow={t('roof.eyebrow')}
        callout={t('roof.callout')}
        layers={roofLayers}
      />
      <section
        id="uses"
        className="scene applications"
        data-testid="section-uses"
      >
        <div className="applications-heading">
          <div>
            <span className="eyebrow">{t('uses.eyebrow')}</span>
            <h2>{t('uses.title')}</h2>
          </div>
          <p>{t('uses.copy')}</p>
        </div>
        <div className="use-viewport">
          <div className="use-cards">
            {useCards.map((card, index) => (
              <article
                className="use-card"
                key={card.title}
                data-testid={`card-application-${index + 1}`}
              >
                {index < applicationPhotos.length ? (
                  <>
                    <div className="use-illustration">
                      <img
                        src={applicationPhotos[index]}
                        alt={`${card.title} — SP OOO BINO ruloni qo‘llanilgan tasvir`}
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="use-photo-kicker">
                        {String(index + 1).padStart(2, '0')}
                        {' / '}
                        {t('labels.application')}
                      </span>
                    </div>
                    <div className="use-card-body">
                      <h3>{card.title}</h3>
                      <p>{card.description}</p>
                      <div className="use-features" aria-label={card.place}>
                        {applicationFeatureTexts[useLang][index].map((label, featureIndex) => {
                          const FeatureIcon = applicationIcons[index][featureIndex];
                          return (
                            <div className="use-feature" key={label}>
                              <FeatureIcon aria-hidden="true" />
                              <span>{label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="use-illustration use-illustration-fallback" role="img" aria-label={card.title}>
                      <div className="layer-icon">
                        <i /><i /><i /><i /><i /><i />
                      </div>
                    </div>
                    <div className="use-card-body">
                      <h3>{card.title}</h3>
                      <p>{card.description}</p>
                      <div className="use-feature-place">{card.place}</div>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
      <section
        id="why"
        className="scene why"
        data-testid="section-why"
      >
        <div className="why-title">
          <div className="bino-why-visual">
            <img
              src="/bino-hamkorlik.webp"
              alt={i18n.language.startsWith('zh') ? '工程师共同审核施工图纸' : i18n.language.startsWith('ru')
                ? 'РРЅР¶РµРЅРµСЂС‹ РѕР±СЃСѓР¶РґР°СЋС‚ СЃС‚СЂРѕРёС‚РµР»СЊРЅС‹Р№ РїСЂРѕРµРєС‚'
                : i18n.language.startsWith('en')
                  ? 'Engineers reviewing construction blueprints together'
                  : 'Muhandislar qurilish loyihasini birga muhokama qilmoqda'}
              loading="lazy"
              decoding="async"
            />
            <div className="bino-why-tag">
              <strong>20</strong>
              <span>{t('why.metrics.0')}</span>
            </div>
          </div>
          <div>
            <span className="eyebrow">{t('why.eyebrow')}</span>
            <h2>{t('why.title')}</h2>
          </div>
        </div>
        <div className="metrics" aria-label={t('why.eyebrow')}>
          {metrics.map((value, index) => (
            <div
              className="metric"
              key={index}
              data-testid={`metric-value-${index + 1}`}
            >
              <strong><CounterValue value={value} /></strong>
              <span>{metricLabels[index]}</span>
            </div>
          ))}
        </div>
        <div className="why-insights">
          <div className="why-insights-intro">
            <div>
              <span className="why-insights-kicker">{whyDetails.kicker}</span>
              <h3>{whyDetails.title}</h3>
            </div>
            <p>{whyDetails.summary}</p>
          </div>
          <div className="why-insights-grid">
            {whyDetails.cards.map((card, index) => (
              <article className="why-insight" key={card.tag}>
                <div className="why-insight-top">
                  <span>{card.tag}</span>
                  <span className="why-insight-cross" aria-hidden="true">+</span>
                </div>
                <span className="why-insight-watermark" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h4>{card.title}</h4>
                <p>{card.copy}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="process">
          <div className="bino-process-intro">
            {/* BINO PROCESS PHOTO 2026 */}
            <h3>{t('why.timelineTitle')}</h3>
            <img
              className="bino-process-photo"
              src="/bino-hamkorlik-jamoa.webp"
              alt={i18n.language.startsWith('zh')
                ? 'BINO建筑团队在施工现场讨论工程图纸'
                : i18n.language.startsWith('ru')
                  ? 'Команда SP OOO BINO обсуждает чертежи на стройплощадке'
                  : i18n.language.startsWith('en')
                    ? 'SP OOO BINO team reviewing plans at a construction site'
                    : 'SP OOO BINO jamoasi qurilish maydonida loyiha ustida maslahatlashmoqda'}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="timeline">
            {[0, 1, 2, 3].map(step => (
              <div key={step} className="timeline-item">
                <span>0{step + 1}</span>
                <b>{t(`why.timeline.${step}`)}</b>
                <p className="why-step-detail">{whyDetails.steps[step]}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="services">
          <h3>{t('why.servicesTitle')}</h3>
          <div className="services-list">
            {[0, 1, 2, 3, 4].map(service => (
              <span className="service-pill" key={service}>
                {t(`why.services.${service}`)}
              </span>
            ))}
          </div>
        </div>
        <div className="why-cta">
          <div>
            <span className="why-insights-kicker">{whyDetails.ctaKicker}</span>
            <h3>{whyDetails.ctaTitle}</h3>
            <p>{whyDetails.ctaCopy}</p>
          </div>
          <a href="#contact" className="why-cta-button">
            {whyDetails.ctaButton} <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
      <section
        id="contact"
        className="scene contact"
        data-testid="section-contact"
      >
        <div className="contact-grid">
          <div className="contact-title">
            <span className="eyebrow">{t('contact.eyebrow')}</span>
            <h2>{t('contact.title')}</h2>
            <p>{t('contact.copy')}</p>

            <div className="bino-contact-phone">
              <span className="bino-contact-eyebrow">{contactDetails.number}</span>
              <a className="bino-contact-phone-number" href="tel:+998977240002" data-testid="link-phone-998977240002">
                +998 97 724 00 02 <ArrowUpRight size={17} />
              </a>
              {config?.phones && config.phones.length > 0 && (
                <div className="bino-more-phones">
                  {config.phones
                    .filter(phone => phone.number.replace(/\D/g, '') !== '998977240002' && phone.number.replace(/\D/g, '') !== '977240002')
                    .map(phone => (
                      <a
                        href={`tel:${phone.number.replace(/[^\d+]/g, '')}`}
                        key={`${phone.label}-${phone.number}`}
                        aria-label={`${phone.label}: ${phone.number}`}
                        data-testid={`link-phone-${phone.number.replace(/\D/g, '')}`}
                      >
                        {phone.number}
                      </a>
                    ))}
                </div>
              )}
            </div>

            <div className="bino-social-head">
              <h3>{contactDetails.socialsTitle}</h3>
              <p>{contactDetails.socialsCopy}</p>
            </div>
            <div className="bino-social-grid" aria-label={contactDetails.socialsTitle}>
              <a
                className="bino-social-link"
                href="https://t.me/Turgunov_771"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram — @Turgunov_771"
                data-testid="link-telegram"
              >
                <svg className="bino-social-brand" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M11.944 0C5.346 0 0 5.344 0 11.94c0 6.598 5.346 11.946 11.944 11.946 6.598 0 11.944-5.348 11.944-11.946C23.888 5.344 18.542 0 11.944 0zm5.768 8.17-1.959 9.233c-.148.654-.534.818-1.081.509l-2.99-2.204-1.442 1.388c-.159.159-.294.294-.602.294l.214-3.042 5.537-5.002c.24-.214-.052-.334-.373-.12l-6.845 4.31-2.947-.92c-.64-.2-.654-.64.134-.949l11.525-4.443c.534-.194 1.001.125.829.946z" />
                </svg>
                <span>Telegram</span>
              </a>
              <a
         
            className="bino-social-link"
            href="https://www.instagram.com/spooobino/"
          target="_blank"
             rel="noopener noreferrer"
            aria-label="Instagram — @spooobino"
               data-testid="link-instagram"
>


              >
                <Instagram size={27} strokeWidth={1.7} aria-hidden="true" />
                <span>Instagram</span>
              </a>
              <a
                className="bino-social-link"
                href="https://wa.me/998977240002"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp — +998 97 724 00 02"
                data-testid="link-whatsapp"
              >
                <svg className="bino-social-brand" viewBox="0 0 32 32" aria-hidden="true">
                  <path d="M16 .8C7.6.8.8 7.6.8 16c0 2.7.7 5.3 2 7.6L.7 31.3l7.9-2.1c2.2 1.2 4.8 1.8 7.4 1.8 8.4 0 15.2-6.8 15.2-15.2S24.4.8 16 .8zm0 27.5c-2.4 0-4.7-.7-6.6-1.9l-.5-.3-4.6 1.2 1.2-4.5-.3-.5c-1.3-2-2-4.2-2-6.6C3.2 8.8 8.7 3.3 16 3.3S28.8 8.8 28.8 16 23.2 28.3 16 28.3zm7.1-9.2c-.4-.2-2.3-1.1-2.7-1.2-.4-.1-.6-.2-.9.2-.3.4-1 1.2-1.2 1.4-.2.2-.4.3-.8.1-.4-.2-1.7-.6-3.2-2-1.2-1.1-2-2.4-2.2-2.8-.2-.4 0-.6.2-.8.2-.2.4-.5.6-.7.2-.2.3-.4.4-.7.1-.3.1-.5 0-.7-.1-.2-.9-2.1-1.2-2.9-.3-.8-.6-.7-.9-.7h-.8c-.3 0-.7.1-1.1.5-.4.4-1.4 1.4-1.4 3.4s1.5 4 1.7 4.3c.2.3 3 4.6 7.2 6.4 1 .4 1.8.7 2.4.9 1 .3 1.9.2 2.6.2.8-.1 2.3-.9 2.6-1.8.3-.9.3-1.7.2-1.8-.1-.1-.4-.3-.8-.5z" />
                </svg>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
          <LeadForm />
        </div>

        <div className="bino-location" data-testid="section-bino-location">
          <div className="bino-location-top">
            <div className="bino-location-heading">
              <MapPin size={28} aria-hidden="true" />
              <div>
                <h3>{contactDetails.mapTitle}</h3>
                <p>{contactDetails.mapCopy}</p>
              </div>
            </div>
            <a
              className="bino-map-button"
              href="https://www.google.com/maps/dir/?api=1&destination=41.233425%2C69.152564"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-map-directions"
            >
              {contactDetails.directions} <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="bino-map-frame">
            <iframe
              title={contactDetails.mapTitle}
              src="https://maps.google.com/maps?q=41.233425%2C69.152564&z=16&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <div className="bino-map-bottom">
            <span>{contactDetails.mapPosition}</span>
            <a
              href="https://www.google.com/maps/search/?api=1&query=41.233425%2C69.152564"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-map-open"
            >
              {contactDetails.mapOpen} ↗
            </a>
          </div>
        </div>
        <footer className="footer">
          <a
            className="brand"
            href="#home"
            aria-label={`SP OOO BINO — ${t('labels.home')}`}
            data-testid="link-footer-brand"
          >
            <span className="brand-mark"><span>B</span></span>
            <span>SP OOO BINO</span>
          </a>
          <span>{t('contact.copyright')}</span>
        </footer>
      </section>
      <AssistantChat />
    </main>
  );
}
export default Home;
