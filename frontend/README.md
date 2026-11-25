# REFOREST AI — Next.js

Migrasi dari React + Vite ke Next.js 16 (App Router), Tailwind CSS 4.

## Menjalankan

```bash
cp .env.example .env.local   # atur BACKEND_URL
npm install
npm run dev                  # http://localhost:3000
```

Produksi: `npm run build && node .next/standalone/server.js`
(salin `.next/static` dan `public` ke dalam `.next/standalone` bila dijalankan manual; Dockerfile sudah mengurusnya).

Docker: `docker build -t reforest-ai .` — container mendengarkan **port 3000** (sebelumnya nginx di port 80).
Alamat backend lewat env `BACKEND_URL` (default di image: `http://backend:8080`), dibaca saat runtime.

## Route

| URL | Modul |
| --- | --- |
| `/` | redirect 307 ke `/geospatial` |
| `/geospatial` | Peta keparahan kebakaran |
| `/eco-recommend` | Rekomendasi restorasi |
| `/green-monitor` | Tren NDVI / NBR |
| `/forest-digital-twin` | Simulasi 3D |
| `/api/*`, `/health` | diteruskan ke backend (pengganti `nginx.conf`) |

## Struktur

```
src/app/            route, layout, proxy API
src/components/     TopNav, ZonesProvider (state zona terpilih), tiap modul
src/lib/zones.js    kelas dNBR + normalisasi GeoJSON (satu sumber untuk semua ambang)
src/lib/api.js      apiGet / apiPost
```

Bila `/api/zones` gagal, aplikasi memakai `public/data/tumbang-nusa-zones.geojson`
dan menampilkan badge "Data lokal". Rekomendasi dan time-series hanya tersedia dari backend.

## Sumber data (semua dari backend)

| Tampilan | Endpoint |
| --- | --- |
| Zona, keparahan, prioritas, tanggal observasi, keyakinan model | `GET /api/zones` |
| KPI pemulihan (kanopi, kesehatan gambut, status) & grafik NDVI/NBR | `GET /api/zones/{id}/monitoring` |
| Strategi, aksi bertahap, spesies, jumlah bibit | `GET /api/zones/{id}/recommendation` |
| Metrik HUD & parameter scene 3D | `POST /api/scenarios` |
| Nama model, akurasi, feature importance | `GET /api/model/metadata` |

Keparahan dan prioritas **dipercaya dari backend** (bisa berasal dari prediksi model, jadi bisa
berbeda dari kelas dNBR). Frontend tidak menghitung ulang angka apa pun; bila data tidak ada,
UI menampilkan "—" atau keterangan, bukan angka pengganti.

Belum ada di backend, jadi tidak ditampilkan: skenario "tanpa intervensi", filter periode,
citra RGB/SWIR, biaya restorasi.
