FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gdal-bin \
    libgdal-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefer-binary -r requirements.txt || pip install --no-cache-dir numpy

COPY . .

CMD ["sh", "-c", "python generate_sample_rasters.py --output-dir data || true && python train_rf.py --pre-dir data/pre --post-dir data/post --zones /app/backend/data/tumbang-nusa-zones.geojson --output-zones /app/backend/data/tumbang-nusa-zones.geojson --metadata-output /app/backend/data/model_metadata.json"]
