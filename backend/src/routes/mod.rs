mod monitoring;
mod recommendations;
mod scenarios;
mod zones;

use std::sync::Arc;

use axum::{
    routing::{get, post},
    Router,
};
use tower_http::{
    cors::CorsLayer,
    trace::{DefaultMakeSpan, TraceLayer},
    request_id::{MakeRequestUuid, PropagateRequestIdLayer, SetRequestIdLayer},
};

use crate::repository::ZoneRepository;

pub fn router(repository: Arc<dyn ZoneRepository>, cors_origins: &[String]) -> Router {
    let api = Router::new()
        .route("/zones", get(zones::list_zones))
        .route("/zones/:zone_id", get(zones::get_zone))
        .route(
            "/zones/:zone_id/monitoring",
            get(monitoring::get_monitoring),
        )
        .route(
            "/zones/:zone_id/recommendation",
            get(recommendations::get_recommendation),
        )
        .route("/scenarios", post(scenarios::create_scenario))
        .route("/model/metadata", get(scenarios::model_metadata))
        .route("/layers/:layer_id", get(scenarios::layer_metadata))
        .with_state(repository);

    let origins = cors_origins
        .iter()
        .filter_map(|origin| origin.parse::<axum::http::HeaderValue>().ok())
        .collect::<Vec<_>>();

    Router::new()
        .route("/health", get(health))
        .nest("/api", api)
        .layer(CorsLayer::new().allow_origin(origins))
        .layer(SetRequestIdLayer::x_request_id(MakeRequestUuid))
        .layer(PropagateRequestIdLayer::x_request_id())
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(DefaultMakeSpan::new().include_headers(true))
                .on_response(|response: &axum::http::Response<_>, latency: std::time::Duration, _span: &tracing::Span| {
                    tracing::info!(
                        status = %response.status(),
                        latency_ms = latency.as_millis(),
                        "backend_http_response"
                    );
                }),
        )
}

async fn health() -> axum::Json<serde_json::Value> {
    axum::Json(serde_json::json!({ "status": "ok", "service": "reforest-ai-backend" }))
}
