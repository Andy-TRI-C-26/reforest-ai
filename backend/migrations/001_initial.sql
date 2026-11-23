CREATE TABLE IF NOT EXISTS zones (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    geometry_geojson JSONB NOT NULL,
    area_ha DOUBLE PRECISION NOT NULL CHECK (area_ha > 0),
    nbr_pre DOUBLE PRECISION NOT NULL,
    nbr_post DOUBLE PRECISION NOT NULL,
    dnbr DOUBLE PRECISION NOT NULL CHECK (dnbr >= 0),
    ndvi DOUBLE PRECISION NOT NULL,
    peat_depth_m DOUBLE PRECISION NOT NULL CHECK (peat_depth_m >= 0),
    canal_distance_m DOUBLE PRECISION NOT NULL CHECK (canal_distance_m >= 0),
    water_table_cm DOUBLE PRECISION NOT NULL,
    priority TEXT NOT NULL,
    severity TEXT NOT NULL,
    observed_at DATE NOT NULL,
    model_confidence DOUBLE PRECISION NOT NULL CHECK (model_confidence BETWEEN 0 AND 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS zone_observations (
    id BIGSERIAL PRIMARY KEY,
    zone_id TEXT NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
    observed_at DATE NOT NULL,
    nbr_pre DOUBLE PRECISION NOT NULL,
    nbr_post DOUBLE PRECISION NOT NULL,
    ndvi DOUBLE PRECISION NOT NULL,
    source TEXT,
    provenance JSONB
);

CREATE TABLE IF NOT EXISTS monitoring_series (
    id BIGSERIAL PRIMARY KEY,
    zone_id TEXT NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
    period TEXT NOT NULL,
    restored_ndvi DOUBLE PRECISION NOT NULL,
    unrestored_ndvi DOUBLE PRECISION NOT NULL,
    restored_nbr DOUBLE PRECISION NOT NULL,
    unrestored_nbr DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS model_metadata (
    id BIGSERIAL PRIMARY KEY,
    model TEXT NOT NULL,
    accuracy_percent DOUBLE PRECISION NOT NULL,
    validation TEXT NOT NULL,
    confidence_score DOUBLE PRECISION NOT NULL,
    feature_importance JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS restoration_scenarios (
    id BIGSERIAL PRIMARY KEY,
    zone_id TEXT NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
    year SMALLINT NOT NULL CHECK (year BETWEEN 0 AND 10),
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
