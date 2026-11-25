# Reforest AI - Machine Learning Pipeline (`ml_pipeline`)

This pipeline processes Sentinel-2 multispectral satellite imagery (pre-fire and post-fire bands B04, B08, B12) to compute spectral indices (dNBR, NDVI, NBR), train a Random Forest burn-severity classifier, evaluate accuracy against dNBR proxy thresholds, and enrich spatial restoration zones for the backend and frontend.

## Prerequisites

Install Python dependencies:
```bash
pip install -r ml_pipeline/requirements.txt
```

## Usage

1. Prepare or generate Sentinel-2 raster directories containing aligned GeoTIFF files (`B04.tif`, `B08.tif`, `B12.tif`):
   - Pre-fire directory: `--pre-dir data/pre`
   - Post-fire directory: `--post-dir data/post`

2. Run the training and zone classification pipeline:
   ```bash
   python ml_pipeline/train_rf.py --pre-dir data/pre --post-dir data/post
   ```

3. Outputs generated:
   - Enriched Zone GeoJSON: `backend/data/tumbang-nusa-zones.geojson` (consumed by Rust backend `GET /api/zones`)
   - Model Metrics & Feature Importance: `backend/data/model_metadata.json` (consumed by Rust backend `GET /api/model/metadata`)
