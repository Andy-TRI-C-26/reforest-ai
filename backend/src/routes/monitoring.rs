use std::sync::Arc;

use axum::{
    extract::{Path, State},
    Json,
};

use crate::{
    error::AppError,
    models::{MonitoringPoint, MonitoringResponse},
    repository::ZoneRepository,
};

pub async fn get_monitoring(
    Path(zone_id): Path<String>,
    State(repo): State<Arc<dyn ZoneRepository>>,
) -> Result<Json<MonitoringResponse>, AppError> {
    let zone = repo
        .get_zone(&zone_id)
        .await?
        .ok_or(AppError::ZoneNotFound)?;
    let series = vec![
        ("2023 Q1", 0.61, 0.58, 0.48, 0.45),
        ("2023 Q3", 0.12, 0.16, -0.34, -0.29),
        ("2024 Q1", 0.25, 0.22, -0.12, -0.15),
        ("2024 Q3", 0.39, 0.29, 0.08, -0.04),
        ("2025 Q1", 0.48, 0.34, 0.21, 0.02),
        ("2025 Q3", 0.56, 0.38, 0.34, 0.07),
        ("2026 Q1", 0.63, 0.41, 0.43, 0.11),
    ]
    .into_iter()
    .map(
        |(period, restored_ndvi, unrestored_ndvi, restored_nbr, unrestored_nbr)| MonitoringPoint {
            period: period.into(),
            restored_ndvi,
            unrestored_ndvi,
            restored_nbr,
            unrestored_nbr,
        },
    )
    .collect();
    Ok(Json(MonitoringResponse {
        zone_id,
        series,
        total_impacted_ha: 818.3,
        canopy_recovery_percent: (zone.ndvi * 100.0).round() as u8,
        peat_health_index: (100.0 + zone.water_table_cm / 2.0).clamp(0.0, 100.0),
    }))
}
