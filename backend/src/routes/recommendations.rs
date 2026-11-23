use std::sync::Arc;

use axum::{
    extract::{Path, State},
    Json,
};

use crate::{
    error::AppError, models::Recommendation, repository::ZoneRepository,
    services::recommendations::recommendation,
};

pub async fn get_recommendation(
    Path(zone_id): Path<String>,
    State(repo): State<Arc<dyn ZoneRepository>>,
) -> Result<Json<Recommendation>, AppError> {
    let zone = repo
        .get_zone(&zone_id)
        .await?
        .ok_or(AppError::ZoneNotFound)?;
    Ok(Json(recommendation(&zone)))
}
