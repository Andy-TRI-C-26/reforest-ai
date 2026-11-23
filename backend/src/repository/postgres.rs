use async_trait::async_trait;

use crate::{error::AppError, models::Zone, repository::ZoneRepository};

pub struct PostgresZoneRepository;

#[async_trait]
impl ZoneRepository for PostgresZoneRepository {
    async fn list_zones(&self) -> Result<Vec<Zone>, AppError> {
        Err(AppError::Internal)
    }
    async fn get_zone(&self, _zone_id: &str) -> Result<Option<Zone>, AppError> {
        Err(AppError::Internal)
    }
}
