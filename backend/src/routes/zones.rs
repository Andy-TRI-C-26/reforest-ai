use std::sync::Arc;

use axum::{
    extract::{Path, State},
    Json,
};
use geojson::{Feature, FeatureCollection, Geometry, Value};
use serde::Serialize;

use crate::{error::AppError, models::Zone, repository::ZoneRepository};

#[derive(Serialize)]
struct ZoneFeatureProperties {
    id: String,
    name: String,
    area_ha: f64,
    nbr_pre: f64,
    nbr_post: f64,
    dnbr: f64,
    ndvi: f64,
    peat_depth_m: f64,
    canal_distance_m: f64,
    water_table_cm: f64,
    severity: crate::models::Severity,
    priority: crate::models::RestorationPriority,
    observed_at: chrono::NaiveDate,
    model_confidence: f64,
    severity_label: String,
    severity_color: String,
    priority_label: String,
}

pub async fn list_zones(
    State(repo): State<Arc<dyn ZoneRepository>>,
) -> Result<Json<FeatureCollection>, AppError> {
    let features = repo.list_zones().await?.into_iter().map(feature).collect();
    Ok(Json(FeatureCollection {
        bbox: None,
        features,
        foreign_members: None,
    }))
}

pub async fn get_zone(
    Path(zone_id): Path<String>,
    State(repo): State<Arc<dyn ZoneRepository>>,
) -> Result<Json<Zone>, AppError> {
    repo.get_zone(&zone_id)
        .await?
        .map(Json)
        .ok_or(AppError::ZoneNotFound)
}

fn feature(zone: Zone) -> Feature {
    let severity_label = match &zone.severity {
        crate::models::Severity::Unburned => "Tidak Terbakar",
        crate::models::Severity::Low => "Keparahan Rendah",
        crate::models::Severity::ModerateLow => "Keparahan Sedang-Rendah",
        crate::models::Severity::ModerateHigh => "Keparahan Sedang-Tinggi",
        crate::models::Severity::High => "Keparahan Tinggi",
    }.to_owned();
    let severity_color = match &zone.severity {
        crate::models::Severity::Unburned => "#2dd4bf",
        crate::models::Severity::Low => "#55b5a1",
        crate::models::Severity::ModerateLow => "#eab308",
        crate::models::Severity::ModerateHigh => "#f97316",
        crate::models::Severity::High => "#ef4444",
    }.to_owned();
    let priority_label = match &zone.priority {
        crate::models::RestorationPriority::Priority1 => "Prioritas 1 - Kritis",
        crate::models::RestorationPriority::Priority2 => "Prioritas 2 - Sedang",
        crate::models::RestorationPriority::Priority3 => "Prioritas 3 - Alami",
    }.to_owned();
    let properties = serde_json::to_value(ZoneFeatureProperties {
        id: zone.id,
        name: zone.name,
        area_ha: zone.area_ha,
        nbr_pre: zone.nbr_pre,
        nbr_post: zone.nbr_post,
        dnbr: zone.dnbr,
        ndvi: zone.ndvi,
        peat_depth_m: zone.peat_depth_m,
        canal_distance_m: zone.canal_distance_m,
        water_table_cm: zone.water_table_cm,
        severity: zone.severity,
        priority: zone.priority,
        observed_at: zone.observed_at,
        model_confidence: zone.model_confidence,
        severity_label,
        severity_color,
        priority_label,
    })
    .expect("zone properties serialize");
    Feature {
        bbox: None,
        geometry: Some(Geometry::new(Value::Polygon(match zone.geometry.value {
            Value::Polygon(coords) => coords,
            _ => vec![],
        }))),
        id: None,
        properties: properties.as_object().cloned(),
        foreign_members: None,
    }
}
