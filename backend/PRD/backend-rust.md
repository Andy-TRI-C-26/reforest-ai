# PRD Backend Rust — REFOREST AI

## 1. Ringkasan

Bangun backend REST menggunakan Rust untuk mendukung aplikasi REFOREST AI. Backend menyediakan data mock ilmiah awal, API zona/restorasi/monitoring, Digital Twin timeline, dan antarmuka repository yang dapat berpindah dari data mock ke PostgreSQL/PostGIS tanpa perubahan API.

Backend ini harus menjadi fondasi bagi integrasi data real masa depan dari Google Earth Engine, raster Sentinel-2, sensor lapangan, dan model Random Forest.

## 2. Lokasi Implementasi

Proyek frontend berada pada direktori root saat ini. Backend harus dibuat di:

```text
backend/
```

Jangan mengubah atau memindahkan frontend yang sudah ada.

## 3. Tujuan

Backend harus dapat:

- Menyediakan health check.
- Menyediakan lima zona KHDTK Tumbang Nusa.
- Mengembalikan zona sebagai GeoJSON.
- Menghitung tingkat keparahan dNBR.
- Menghasilkan rekomendasi restorasi berbasis data zona.
- Menyediakan tren NDVI/NBR per kuartal.
- Menghasilkan indikator skenario Digital Twin untuk Tahun 0–10.
- Menyediakan metadata model Random Forest.
- Memisahkan infrastruktur transport HTTP dari repository data.
- Menghindari credential GEE atau API key pada frontend.

## 4. Stack Teknis

Gunakan:

- Rust stable terbaru
- Axum
- Tokio
- SQLx
- Serde dan Serde JSON
- Tower dan Tower HTTP
- PostgreSQL/PostGIS
- `geo-types`, `geojson`, atau setara
- `uuid`
- `chrono`
- `dotenvy`
- `tracing` dan `tracing-subscriber`
- Docker dan Docker Compose

Untuk tahap awal, PostgreSQL dapat memakai tabel relasional biasa. Struktur tetap harus mendukung migrasi ke tipe geometri PostGIS.

Dependency ML/ONNX tidak wajib pada fase ini. Gunakan nilai confidence mock yang konsisten dan siapkan interface model untuk implementasi nyata berikutnya.

## 5. Struktur Direktori Target

```text
backend/
├── Cargo.toml
├── Cargo.lock
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── migrations/
├── src/
│   ├── main.rs
│   ├── lib.rs
│   ├── config.rs
│   ├── error.rs
│   ├── db/
│   │   └── mod.rs
│   ├── routes/
│   │   ├── mod.rs
│   │   ├── zones.rs
│   │   ├── monitoring.rs
│   │   ├── recommendations.rs
│   │   └── scenarios.rs
│   ├── models/
│   │   ├── mod.rs
│   │   ├── zone.rs
│   │   ├── monitoring.rs
│   │   └── recommendation.rs
│   ├── services/
│   │   ├── mod.rs
│   │   ├── severity.rs
│   │   └── recommendations.rs
│   └── repository/
│       ├── mod.rs
│       ├── mock.rs
│       └── postgres.rs
└── tests/
    ├── zones.rs
    ├── recommendations.rs
    └── scenarios.rs
```

## 6. Konfigurasi Environment

Buat `.env.example`:

```env
DATABASE_URL=postgres://reforest:reforest@localhost:5432/reforest
RUST_LOG=reforest_backend=debug,tower_http=debug
HOST=0.0.0.0
PORT=8080
CORS_ORIGINS=http://localhost:5173
RUST_ENV=development
```

Docker Compose harus menyediakan:

- PostgreSQL/PostGIS
- Backend API
- Kesehatan database yang dapat diperiksa startup

Gunakan image PostGIS yang kompatibel, misalnya `postgis/postgis:16-3.4`.

## 7. Konteks Area dan Pusat Peta

Area studi: **KHDTK Tumbang Nusa, Kabupaten Pulang Pisau, Kalimantan Tengah**.

Pusat default:

```text
Latitude: -2.3500
Longitude: 114.0833
```

Semua koordinat GeoJSON menggunakan EPSG:4326.

## 8. Data Zona Mock

Backend wajib menyediakan lima zona berikut.

| ID | Nama | Luas Ha | NBR Pre | NBR Post | dNBR | NDVI | Kedalaman Gambut | Jarak Kanal | Muka Air |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| ZONA-TN-01 | Block Gambut Utara | 184.6 | 0.72 | -0.08 | 0.80 | 0.18 | 4.2 m | 280 m | -86 cm |
| ZONA-TN-02 | Seksi Kanal Timur | 132.8 | 0.68 | 0.18 | 0.50 | 0.31 | 3.6 m | 420 m | -72 cm |
| ZONA-TN-03 | Hutan Gambut Tengah | 246.3 | 0.75 | 0.39 | 0.36 | 0.52 | 5.1 m | 760 m | -48 cm |
| ZONA-TN-04 | Koridor Riparian Barat | 98.4 | 0.70 | 0.55 | 0.15 | 0.68 | 2.8 m | 980 m | -31 cm |
| ZONA-TN-05 | Plot Restorasi Selatan | 156.2 | 0.73 | 0.46 | 0.27 | 0.47 | 3.9 m | 640 m | -54 cm |

Gunakan koordinat polygon dari implementasi frontend saat ini dan sertakan nilai yang sama.

Zona 01, 02, dan 03 saat ini merupakan contoh data mock. Penambahan sumber, tanggal observasi, serta provenance wajib didukung pada integrasi real nantinya.

## 9. Model Data

```rust
pub struct Zone {
    pub id: String,
    pub name: String,
    pub geometry: GeoJson,
    pub area_ha: f64,
    pub nbr_pre: f64,
    pub nbr_post: f64,
    pub dnbr: f64,
    pub ndvi: f64,
    pub peat_depth_m: f64,
    pub canal_distance_m: f64,
    pub water_table_cm: f64,
    pub priority: RestorationPriority,
    pub severity: Severity,
    pub observed_at: NaiveDate,
    pub model_confidence: f64,
}
```

Jenis GeoJSON dapat memakai `geojson::Geometry` atau representasi Serde terpisah. Pastikan response dapat dikonsumsi Leaflet dan React.

## 10. Validasi Data Ilmiah

Backend wajib menolak atau memvalidasi:

- NDVI harus `-1.0 <= ndvi <= 1.0`
- NBR pre/post harus `-1.0 <= nbr <= 1.0`
- dNBR harus `>= 0.0`
- Kedalaman gambut harus `>= 0.0`
- Jarak kanal harus `>= 0.0`
- Luas zona harus `> 0.0`
- Confidence model harus `0.0 <= confidence <= 1.0`

Gunakan desimal terbatas atau `f64` setelah validasi. Jangan melakukan pembulatan ilmiah yang mengubah threshold.

## 11. Klasifikasi dNBR

Gunakan konvensi backend dan frontend secara konsisten:

| dNBR | Tingkat Keparahan |
|---|---|
| `< 0.10` | Tidak Terbakar |
| `>= 0.10` dan `<= 0.26` | Keparahan Rendah |
| `>= 0.27` dan `<= 0.43` | Keparahan Sedang-Rendah |
| `>= 0.44` dan `<= 0.65` | Keparahan Sedang-Tinggi |
| `>= 0.66` | Keparahan Tinggi |

Nilai `0.66` harus termasuk kategori Keparahan Tinggi.

Validasi harus menangani NaN, infinity, nilai negatif dNBR, dan nilai di luar rentang.

## 12. Klasifikasi Prioritas

Mapping priority:

- dNBR `>= 0.44`: `PRIORITY_1`
- dNBR `>= 0.27` dan `< 0.44`: `PRIORITY_2`
- dNBR `< 0.27`: `PRIORITY_3`

Nilai prioritas response berupa string yang stabil:

```text
PRIORITY_1
PRIORITY_2
PRIORITY_3
```

## 13. Endpoint REST

### Health

```text
GET /health
```

Response sukses:

```json
{
  "status": "ok",
  "service": "reforest-ai-backend"
}
```

### Daftar zona

```text
GET /api/zones
```

Response:

```json
{
  "type": "FeatureCollection",
  "features": []
}
```

### Detail zona

```text
GET /api/zones/{zone_id}
```

Response minimal:

```json
{
  "id": "ZONA-TN-01",
  "name": "Block Gambut Utara",
  "geometry": {
    "type": "Polygon",
    "coordinates": []
  },
  "area_ha": 184.6,
  "nbr_pre": 0.72,
  "nbr_post": -0.08,
  "dnbr": 0.80,
  "ndvi": 0.18,
  "peat_depth_m": 4.2,
  "canal_distance_m": 280,
  "water_table_cm": -86,
  "severity": "Keparahan Tinggi",
  "priority": "PRIORITY_1",
  "observed_at": "2026-11-23",
  "model_confidence": 0.894
}
```

### Monitoring zona

```text
GET /api/zones/{zone_id}/monitoring
```

### Rekomendasi zona

```text
GET /api/zones/{zone_id}/recommendation
```

### Skenario Digital Twin

```text
POST /api/scenarios
```

Request:

```json
{
  "zone_id": "ZONA-TN-01",
  "year": 5
}
```

### Metadata model

```text
GET /api/model/metadata
```

### Layer metadata

```text
GET /api/layers/{layer_id}
```

Layer ID awal:

```text
rgb
dnbr
priority
```

## 14. Rekomendasi Restorasi

Rekomendasi harus dihitung backend dan tidak boleh disalin hard-coded dari frontend.

### dNBR lebih dari 0.44

Termasuk pada batas yang diperketat:

- dNBR `> 0.44` atau sesuai aturan modul UI `0.44–0.65` dan `>= 0.66`
- Rekomendasikan intervensi hidrologi segera.
- Rekomendasikan pembangunan sekat kanal.
- Rekomendasikan pemulihan tanah.
- Rekomendasikan `Melaleuca cajuputi` sebagai pionir.
- `Shorea balangeran` boleh ditambahkan sebagai spesies pendukung.

### dNBR 0.27–0.43

- Rekomendasikan enrichment planting.
- Gunakan `Shorea balangeran`.
- Gunakan `Dyera polyphylla`.

### dNBR kurang dari 0.26

- Rekomendasikan assisted natural regeneration.
- Rekomendasikan patroli pencegahan kebakaran.
- Gunakan `Melaleuca cajuputi` dan/atau `Shorea balangeran` pada jumlah terbatas jika diperlukan.

Spesies yang diperbolehkan pada implementasi awal:

- `Shorea balangeran` / Belangeran
- `Dyera polyphylla` / Jelutung Rawa
- `Gonystylus bancanus` / Ramin
- `Melaleuca cajuputi` / Gelam

Jangan menyarankan spesies yang tidak terbatas pada ekosistem rawa gambut Kalimantan Tengah.

Teknik hidrologi yang diperbolehkan:

- Sekat kanal/canal blocking
- Pemantauan tinggi muka air tanah
- Tidak merekomendasikan drainase tambahan

### Response rekomendasi

```json
{
  "zone_id": "ZONA-TN-01",
  "strategy": "Intervensi Hidrologi & Stabilitas Lahan",
  "species": [
    {
      "latin_name": "Melaleuca cajuputi",
      "common_name": "Gelam",
      "seedlings_per_ha": 650
    }
  ],
  "seedlings_per_ha": 900,
  "total_seedlings": 166140,
  "actions": [
    {
      "step": 1,
      "action": "Pasang sekat kanal",
      "target_year": 0
    }
  ]
}
```

Jumlah bibit di tabel berikut adalah estimasi mock awal:

| dNBR | Bibit per hektar |
|---|---:|
| `> 0.44` | 900 |
| `0.27–0.43` | 750 |
| `< 0.26` | 500 |

Total bibit dihitung dengan pembulatan ke bilangan bulat terdekat:

```text
total_seedlings = round(area_ha * seedlings_per_ha)
```

## 15. Monitoring

Backend menyediakan time-series kuartalan dengan periode berikut:

```text
2023 Q1
2023 Q3
2024 Q1
2024 Q3
2025 Q1
2025 Q3
2026 Q1
```

Setiap periode harus berisi:

- `restored_ndvi`
- `unrestored_ndvi`
- `restored_nbr`
- `unrestored_nbr`

Data mock awal mengikuti tren pemulihan frontend. Perioda kebakaran 2023 Q3 harus bernilai NBR negatif dan NDVI rendah.

Response minimal:

```json
{
  "zone_id": "ZONA-TN-01",
  "series": []
}
```

KPI response:

```json
{
  "total_impacted_ha": 818.3,
  "canopy_recovery_percent": 18,
  "peat_health_index": 72.8
}
```

`total_impacted_ha` harus dihitung sebagai jumlah luas kelima zona mock.

## 16. Skenario Digital Twin

`POST /api/scenarios` menerima:

```json
{
  "zone_id": "ZONA-TN-01",
  "year": 5
}
```

Validasi:

- Tahun integer antara `0` dan `10`, inklusif.
- Zona harus ditemukan.
- Tidak menerima tahun desimal atau negatif.

Response:

```json
{
  "zone_id": "ZONA-TN-01",
  "year": 5,
  "burn_scar_opacity": 0.2,
  "vegetation_scale": 0.72,
  "canal_blocks_visible": true,
  "restored_tree_count": 12,
  "canopy_recovery_percent": 42.0,
  "carbon_sequestration_t_per_ha": 6.7,
  "water_table_cm": -60
}
```

Aturan mock:

- Tahun 0:
  - `burn_scar_opacity = 1.0`
  - `vegetation_scale = 0.35`
  - `canal_blocks_visible = false`
- Tahun 2:
  - `burn_scar_opacity = 0.5`
  - `vegetation_scale = 0.45`
  - `canal_blocks_visible = true` jika dNBR `> 0.44`
- Tahun 5–10:
  - Tanah tertutup vegetasi secara bertahap.
  - `vegetation_scale` naik secara linear sampai mendekati `1.08`.
  - Sekat kanal tetap terlihat pada zona prioritas tinggi.
  - Muka air tanah naik mendekati atau melewati target pemulihan.

Ketidakseragaman dengan frontend tidak boleh terjadi. Gunakan rumus helper tunggal pada backend dan frontend tetap mengambil nilai dari backend jika endpoint diintegrasikan.

## 17. Metadata Model

`GET /api/model/metadata` response:

```json
{
  "model": "Random Forest",
  "accuracy_percent": 89.4,
  "validation": "10-Fold CV",
  "confidence_score": 0.894,
  "feature_importance": [
    {
      "feature": "dNBR",
      "importance": 0.92
    },
    {
      "feature": "Kedalaman Gambut",
      "importance": 0.76
    },
    {
      "feature": "Jarak dari Kanal",
      "importance": 0.61
    },
    {
      "feature": "Tinggi Muka Air Tanah",
      "importance": 0.54
    }
  ]
}
```

Nilai ini adalah mock, bukan bukti akurasi model real.

## 18. Repository Abstraction

Implementasikan trait:

```rust
#[async_trait]
pub trait ZoneRepository: Send + Sync {
    async fn list_zones(&self) -> Result<Vec<Zone>, AppError>;
    async fn get_zone(&self, zone_id: &str) -> Result<Option<Zone>, AppError>;
}
```

Implementasi awal:

- `MockZoneRepository`
- Optional `PostgresZoneRepository`

Route dan service tidak boleh langsung mengakses data mock statis.

PostgreSQL/PostGIS harus hanya menjadi implementasi repository, bukan dependency aplikasi HTTP.

## 19. Database

Walaupun fase awal dapat memakai repository mock, tuliskan migration awal untuk:

- `zones`
- `zone_observations`
- `monitoring_series`
- `model_metadata`
- `restoration_scenarios`

Kolom minimum `zones`:

```text
id
name
geometry_geojson
area_ha
nbr_pre
nbr_post
dnbr
ndvi
peat_depth_m
canal_distance_m
water_table_cm
priority
severity
observed_at
model_confidence
created_at
updated_at
```

Untuk integrasi PostGIS nyata, gunakan tipe `GEOMETRY(Polygon,4326)` dan endpoint tetap mengembalikan GeoJSON.

## 20. Integrasi Data Real Masa Depan

Backend Rust tidak wajib menghubungkan Google Earth Engine pada fase awal.

Siapkan modularitas untuk:

1. Worker Python/GEE menghasilkan agregat zona.
2. Worker menyimpan hasil ke PostgreSQL/PostGIS.
3. Rust membaca hasil dari repository Postgres.
4. Worker menyimpan COG/raster ke object storage.
5. API mengembalikan tile URL atau GeoJSON, bukan raster mentah.
6. Model Random Forest dilatih Python, diekspor ONNX, dan dipanggil dari Rust atau worker inference terpisah.

Credential GEE hanya boleh berada pada worker/secret manager. Tidak boleh dikirim atau disimpan di frontend atau Rust public API.

## 21. Keamanan dan Operasional

- Batasi CORS ke origin frontend.
- Tambahkan rate limiting pada API publik.
- Tambahkan request ID dan tracing.
- Gunakan SQL prepared statement.
- Jangan mengembalikan stack trace internal.
- Gunakan environment/secret manager.
- Batasi payload scenario.
- Validasi semua zone ID.
- Gunakan 404 untuk zone tidak ditemukan.
- Gunakan 400 untuk request invalid.
- Gunakan 500 hanya untuk kegagalan internal yang sudah dicatat.

## 22. Docker

Backend harus dapat dijalankan:

```bash
cd backend
docker compose up --build
```

API seharusnya tersedia di:

```text
http://localhost:8080
```

Frontend Vite seharusnya dapat memanggil:

```text
http://localhost:8080
```

## 23. Testing

Sediakan unit test untuk:

- `GET /health`.
- 404 zone.
- Klasifikasi semua threshold dNBR.
- Batas NDVI/NBR.
- dNBR 0.27, 0.43, 0.44, 0.66.
- dNBR 0.10 dan 0.26.
- Rekomendasi rendah, sedang, dan tinggi.
- Perhitungan total bibit.
- Validasi Tahun 0–10.
- GeoJSON valid dan EPSG 4326.
- Klasifikasi priority.
- CORS.
- Response metadata model.

Sediakan integration test dengan database bila Compose dijalankan.

Skrip acceptance:

```bash
cd backend
cargo fmt --check
cargo test
cargo clippy --all-targets --all-features -- -D warnings
docker compose config
docker compose build
```

## 24. Error Response

Gunakan format konsisten:

```json
{
  "error": {
    "code": "ZONE_NOT_FOUND",
    "message": "Zona tidak ditemukan",
    "details": null
  }
}
```

Kode minimum:

- `INVALID_REQUEST`
- `ZONE_NOT_FOUND`
- `INVALID_ZONE_DATA`
- `YEAR_OUT_OF_RANGE`
- `INTERNAL_ERROR`

## 25. Acceptance Criteria

Backend dianggap selesai jika:

1. Lima zona dapat diambil dan dipilih melalui API.
2. Detail zone dapat diambil berdasarkan zone ID.
3. Data scientific selalu berada pada batas yang disepakati.
4. Klasifikasi severity dan priority konsisten.
5. Rekomendasi hanya memakai spesies/restorasi gambut yang diperbolehkan.
6. Monitoring dan KPI tersedia.
7. Timeline Tahun 0–10 menghasilkan indikator valid.
8. Tidak ada API key atau credential GEE di frontend atau response.
9. Mock repository dapat diganti dengan Postgres repository tanpa mengubah route.
10. `cargo fmt --check`, `cargo test`, `cargo clippy`, dan Docker build berhasil.
11. API dapat dipakai frontend Vite melalui CORS lokal.
12. Backend memiliki README singkat untuk menjalankan dan menguji endpoint.
