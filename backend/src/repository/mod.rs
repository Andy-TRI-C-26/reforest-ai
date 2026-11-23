pub mod mock;
pub mod postgres;

use async_trait::async_trait;

use crate::{error::AppError, models::Zone};

#[async_trait]
pub trait ZoneRepository: Send + Sync {
    async fn list_zones(&self) -> Result<Vec<Zone>, AppError>;
    async fn get_zone(&self, zone_id: &str) -> Result<Option<Zone>, AppError>;
}

pub use mock::MockZoneRepository;
