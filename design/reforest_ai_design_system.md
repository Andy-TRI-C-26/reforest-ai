---
name: "REFOREST AI — Environmental Intelligence & Scientific GIS"
description: "Sistem desain presisi untuk platform intelijen geospasial dan restorasi hutan gambut pascabakar KHDTK Tumbang Nusa."
---

## Overview

REFOREST AI dirancang untuk peneliti kehutanan, rimbawan lapangan, dan pengambil kebijakan restorasi gambut di Kalimantan Tengah. Estetika **Environmental Intelligence & Scientific GIS** memadukan kanvas analitik terang yang bersih dan kontras tinggi dengan viewport geospasial gelap (`#0F172A`) serta panel *inspector* slate (`#1E293B`) agar citra satelit Sentinel-2, peta keparahan kebakaran (`dNBR`), dan model 3D Digital Twin tampil tajam tanpa kelelahan mata. Setiap angka indeks, koordinat geografis, dan luasan hektare disajikan dengan presisi tipografi tabular yang berwibawa namun tetap mudah dipindai.

## Colors

Palet warna berakar pada identitas ekologis hutan gambut tropis dan standar kartografi keparahan kebakaran (*USGS Burn Severity*):

- **Primary / Restoration (`#0F5132` & `#10B981`):** Forest Emerald sebagai jangkar aksi utama, status vegetasi sehat, dan progres pemulihan kanopi.
- **Neutral / Surface (`#F8FAFC`, `#FFFFFF`, `#0F172A`, `#1E293B`):** Kanvas terang kontras tinggi untuk analitik data dan tabel, dipadukan dengan permukaan slate gelap untuk peta GIS dan *inspector drawer*.
- **Burn Severity (`#F59E0B`, `#EA580C`, `#EF4444`):** Amber, Burnt Orange, dan Crimson Red khusus untuk klasifikasi tingkat keparahan kebakaran (`dNBR` & `Random Forest`) serta status kritis.
- **Hydrology / Rewetting (`#0284C7`):** Cyan-Blue untuk indikator tinggi muka air tanah gambut (*TMAT*), kanal, dan intervensi sekat kanal (*canal blocking*).

```yaml
colors:
  primary: "#0F5132"
  on-primary: "#FFFFFF"
  primary-container: "#B0F1C7"
  on-primary-container: "#002111"
  forest-emerald: "#10B981"
  on-forest-emerald: "#002113"
  secondary: "#006398"
  on-secondary: "#FFFFFF"
  secondary-container: "#CCE5FF"
  on-secondary-container: "#001D31"
  hydrology-cyan: "#0284C7"
  severity-amber: "#F59E0B"
  severity-orange: "#EA580C"
  severity-crimson: "#EF4444"
  error: "#B91A24"
  on-error: "#FFFFFF"
  error-container: "#FFDAD7"
  on-error-container: "#410004"
  warning-container: "#FFEEDE"
  on-warning-container: "#472A00"
  surface: "#F8FAFC"
  on-surface: "#0F172A"
  surface-container-lowest: "#FFFFFF"
  surface-container-low: "#F1F5F9"
  surface-container: "#E2E8F0"
  surface-container-high: "#CBD5E1"
  on-surface-variant: "#3F465C"
  outline: "#6F778E"
  outline-variant: "#CBD5E1"
  map-surface: "#0F172A"
  on-map-surface: "#F8FAFC"
  inspector-surface: "#1E293B"
  on-inspector-surface: "#F8FAFC"
  inspector-border: "#334155"
  inspector-muted: "#94A3B8"
```

## Typography

Sistem tipografi menggunakan tiga peran yang jelas: **Archivo** untuk judul dan angka KPI berkarakter tegas, **Plus Jakarta Sans** untuk antarmuka pengguna dan narasi rekomendasi yang ramah dibaca, serta **JetBrains Mono** (`tabular-nums`) untuk koordinat geografis, nilai indeks spektral (`NDVI`, `NBR`, `dNBR`), luas area (`Ha`), dan metrik akurasi model AI.

```yaml
typography:
  display-lg:
    fontFamily: "Archivo"
    fontSize: 36px
    fontWeight: 700
    lineHeight: 42px
    letterSpacing: -0.5px
  display-lg-mobile:
    fontFamily: "Archivo"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 34px
    letterSpacing: -0.25px
  headline-lg:
    fontFamily: "Archivo"
    fontSize: 24px
    fontWeight: 700
    lineHeight: 30px
    letterSpacing: -0.25px
  headline-md:
    fontFamily: "Archivo"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 24px
    letterSpacing: -0.1px
  title-lg:
    fontFamily: "Plus Jakarta Sans"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 22px
    letterSpacing: 0px
  title-md:
    fontFamily: "Plus Jakarta Sans"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 20px
    letterSpacing: 0px
  body-md:
    fontFamily: "Plus Jakarta Sans"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 21px
    letterSpacing: 0px
  body-sm:
    fontFamily: "Plus Jakarta Sans"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 18px
    letterSpacing: 0px
  label-lg:
    fontFamily: "Plus Jakarta Sans"
    fontSize: 13px
    fontWeight: 600
    lineHeight: 18px
    letterSpacing: 0.1px
  label-sm:
    fontFamily: "Plus Jakarta Sans"
    fontSize: 11px
    fontWeight: 600
    lineHeight: 14px
    letterSpacing: 0.2px
  mono-lg:
    fontFamily: "JetBrains Mono"
    fontSize: 20px
    fontWeight: 700
    lineHeight: 26px
    letterSpacing: -0.2px
  mono-md:
    fontFamily: "JetBrains Mono"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 18px
    letterSpacing: 0px
  mono-sm:
    fontFamily: "JetBrains Mono"
    fontSize: 11px
    fontWeight: 500
    lineHeight: 14px
    letterSpacing: 0px
```

## Layout & Spacing

Arsitektur tata letak mengikuti pola **Spatial-First Dashboard**: bilah navigasi atas setinggi `60px` tetap hadir di seluruh halaman, sementara area utama menyesuaikan konteks—kanvas peta/3D layar penuh dengan panel kontrol mengambang di kiri (`280px`) dan *inspector drawer* kontekstual di kanan (`340px`) untuk mode spasial, serta grid 12 kolom dengan margin `24px` dan *gutter* `16px` untuk halaman analitik `EcoRecommend` dan `Green Monitor`. Skala spasi berbasis kelipatan `4px` menjaga keselarasan antar elemen.

```yaml
spacing:
  gutter-xs: 4px
  gutter-sm: 8px
  gutter-md: 16px
  gutter-lg: 24px
  gutter-xl: 32px
  section: 32px
  page-margin: 24px
```

## Elevation & Depth

Hierarki visual dibangun melalui **Tonal Layers & Crisp Hairline Outlines** (`1px solid`), bukan bayangan tebal. Di atas kanvas peta gelap (`#0F172A`), panel mengambang menggunakan latar solid slate (`#1E293B`) atau putih bersih (`#FFFFFF`) dengan tepi `1px` yang tegas dan bayangan ambient sangat halus agar informasi geospasial di bawahnya tidak terganggu.

## Shapes

Bahasa bentuk bersifat teknis dan presisi: sudut membulat `8px` (`DEFAULT`) untuk kartu dan panel, `6px` (`sm`) untuk tombol, *input*, dan kontrol layer, serta `9999px` (`full`) khusus untuk *pill* status pemulihan, *badge* keparahan, dan indikator titik koordinat.

```yaml
rounded:
  sm: 6px
  DEFAULT: 8px
  md: 12px
  lg: 16px
  full: 9999px
```

## Motion & Micro-interaction

Transisi antarmuka bersifat cepat dan terukur: perubahan status layer, *toggle*, dan *hover* terjadi dalam `120ms`, sementara kemunculan *Right Inspector Drawer* menggunakan kurva deselerasi `220ms` agar terasa responsif tanpa mengganggu pembacaan data spasial. Animasi hanya menyentuh properti `transform`, `opacity`, dan warna.

```yaml
motion:
  state-change:
    duration: 120ms
    delay: 0ms
    timingFunction: ease-out
  drawer-enter:
    duration: 220ms
    delay: 0ms
    timingFunction: cubic-bezier(0.2, 0, 0, 1)
  drawer-exit:
    duration: 150ms
    delay: 0ms
    timingFunction: cubic-bezier(0.3, 0, 1, 1)
```

## Voice & Content Strategy

Seluruh salinan antarmuka menggunakan **Bahasa Indonesia ilmiah-praktis** yang jelas bagi rimbawan, peneliti BRGM/KLHK, dan pengambil kebijakan:

- **Nada:** Objektif, presisi, dan berorientasi tindakan. Hindari jargon pemasaran yang berlebihan.
- **Kapitalisasi:** *Title Case* untuk nama modul dan judul kartu utama; *Sentence case* untuk deskripsi intervensi dan label kontrol.
- **Terminologi Konsisten:** Gunakan istilah baku seperti `KHDTK Tumbang Nusa`, `Sekat Kanal`, `Tinggi Muka Air Tanah (TMAT)`, `Keparahan Kebakaran (dNBR)`, dan `Zona Prioritas`.
- **Format Angka & Satuan:** Gunakan pemisah desimal titik atau koma konsisten untuk indeks spektral (`dNBR +0.68`, `NDVI 0.24`), satuan luas `Ha` (`1,420.5 Ha`), dan koordinat geografis (`-2.3418° LS, 114.0892° BT`).

## Components

Component implementations live as individual HTML sticker sheet files in
`components/`. Each file contains the canonical, styled HTML components with
`<!-- COMPONENT: name -->` comment markers. Read each file before use.

- **Badge** → `@components/badge.html` — `badge-numeric`, `badge-dot`
- **Button** → `@components/button.html` — `button-primary`, `button-icon`, `button-with-icon`
- **Card** → `@components/card.html` — `card-elevated`, `card-action`, `card-interactive`, `card-interactive-2`
- **Tabs** → `@components/tabs.html` — `tabs-horizontal`, `tabs-with-icon`
