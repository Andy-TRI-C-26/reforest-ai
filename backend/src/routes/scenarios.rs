use std::sync::Arc;

use axum::{
    extract::{Path, State},
    Json,
};
use serde::{Deserialize, Serialize};

use crate::{error::AppError, models::Severity, repository::ZoneRepository};

const MODEL_METADATA_JSON: &str = include_str!("../../data/model_metadata.json");

#[derive(Debug, Deserialize)]
pub struct ScenarioRequest {
    pub zone_id: String,
    pub year: u8,
}

#[derive(Debug, Serialize)]
pub struct ScenarioResponse {
    pub zone_id: String,
    pub year: u8,
    pub burn_scar_opacity: f64,
    pub vegetation_scale: f64,
    pub canal_blocks_visible: bool,
    pub restored_tree_count: u32,
    pub canopy_recovery_percent: f64,
    pub carbon_sequestration_t_per_ha: f64,
    pub water_table_cm: f64,
}

pub async fn create_scenario(
    State(repo): State<Arc<dyn ZoneRepository>>,
    Json(request): Json<ScenarioRequest>,
) -> Result<Json<ScenarioResponse>, AppError> {
    if request.year > 10 {
        return Err(AppError::YearOutOfRange);
    }
    let zone = repo
        .get_zone(&request.zone_id)
        .await?
        .ok_or(AppError::ZoneNotFound)?;
    let year = f64::from(request.year);
    let burn_scar_opacity = if request.year == 0 {
        1.0
    } else {
        (1.0 - year / 10.0).max(0.2)
    };
    let vegetation_scale = if request.year == 0 {
        0.35
    } else {
        (0.35 + year * 0.073).min(1.08)
    };
    let canal_blocks_visible =
        request.year >= 2 && matches!(&zone.severity, Severity::High | Severity::ModerateHigh);
    Ok(Json(ScenarioResponse {
        zone_id: request.zone_id,
        year: request.year,
        burn_scar_opacity,
        vegetation_scale,
        canal_blocks_visible,
        restored_tree_count: (year * 2.4).round() as u32,
        canopy_recovery_percent: (year * 8.4).min(84.0),
        carbon_sequestration_t_per_ha: (year * 1.34).min(13.4),
        water_table_cm: (zone.water_table_cm + year * 5.2).min(-30.0),
    }))
}

pub async fn model_metadata() -> Json<serde_json::Value> {
    Json(serde_json::from_str(MODEL_METADATA_JSON).expect("model metadata must be valid JSON"))
}

pub async fn layer_metadata(
    Path(layer_id): Path<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    let layer = match layer_id.as_str() {
        "rgb" => ("rgb", "True color satellite imagery", "EPSG:4326"),
        "dnbr" => ("dnbr", "Burn severity dNBR", "EPSG:4326"),
        "priority" => ("priority", "Restoration priority", "EPSG:4326"),
        _ => return Err(AppError::InvalidRequest("layer tidak didukung".into())),
    };
    Ok(Json(
        serde_json::json!({"id": layer.0, "name": layer.1, "crs": layer.2}),
    ))
}
