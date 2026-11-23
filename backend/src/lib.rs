pub mod config;
pub mod db;
pub mod error;
pub mod models;
pub mod repository;
pub mod routes;
pub mod services;

use std::sync::Arc;

use axum::Router;
use repository::ZoneRepository;
use tower_http::services::{ServeDir, ServeFile};

pub fn app(repository: Arc<dyn ZoneRepository>) -> Router {
    routes::router(repository, &["http://localhost:5173".to_owned()])
}

pub fn app_with_origins(repository: Arc<dyn ZoneRepository>, origins: &[String]) -> Router {
    routes::router(repository, origins)
}

pub fn app_with_origins_and_static(
    repository: Arc<dyn ZoneRepository>,
    origins: &[String],
    static_dir: &str,
) -> Router {
    let index = format!("{}/index.html", static_dir.trim_end_matches('/'));
    routes::router(repository, origins)
        .fallback_service(ServeDir::new(static_dir).not_found_service(ServeFile::new(index)))
}
