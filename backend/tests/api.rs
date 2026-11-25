use std::sync::Arc;

use axum::{
    body::Body,
    http::{Request, StatusCode},
    Router,
};
use reforest_backend::{app, repository::MockZoneRepository};
use serde_json::Value;
use tower::ServiceExt;

fn test_app() -> Router {
    app(Arc::new(
        MockZoneRepository::new().expect("GeoJSON should load"),
    ))
}

#[tokio::test]
async fn health_check_works() {
    let response = test_app()
        .oneshot(Request::get("/health").body(Body::empty()).unwrap())
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
}

#[tokio::test]
async fn zones_are_geojson_and_complete() {
    let response = test_app()
        .oneshot(Request::get("/api/zones").body(Body::empty()).unwrap())
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    let body = axum::body::to_bytes(response.into_body(), usize::MAX)
        .await
        .unwrap();
    let json: Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(json["type"], "FeatureCollection");
    assert!(!json["features"].as_array().unwrap().is_empty());
}

#[tokio::test]
async fn model_metadata_is_served_from_backend_data() {
    let response = test_app()
        .oneshot(
            Request::get("/api/model/metadata")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    let body = axum::body::to_bytes(response.into_body(), usize::MAX)
        .await
        .unwrap();
    let json: Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(json["model"], "Random Forest");
    assert!(json["feature_importance"].is_array());
}

#[tokio::test]
async fn missing_zone_is_404() {
    let response = test_app()
        .oneshot(Request::get("/api/zones/nope").body(Body::empty()).unwrap())
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn scenario_rejects_out_of_range_year() {
    let request = Request::post("/api/scenarios")
        .header("content-type", "application/json")
        .body(Body::from(r#"{"zone_id":"ZONA-TN-01","year":11}"#))
        .unwrap();
    let response = test_app().oneshot(request).await.unwrap();
    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
}

#[test]
fn severity_thresholds_are_inclusive() {
    use reforest_backend::models::{RestorationPriority, Severity};
    use reforest_backend::services::severity::{priority, severity};
    assert_eq!(severity(0.10), Severity::Low);
    assert_eq!(severity(0.26), Severity::Low);
    assert_eq!(severity(0.27), Severity::ModerateLow);
    assert_eq!(severity(0.43), Severity::ModerateLow);
    assert_eq!(severity(0.44), Severity::ModerateHigh);
    assert_eq!(severity(0.66), Severity::High);
    assert_eq!(priority(0.44), RestorationPriority::Priority1);
    assert_eq!(priority(0.27), RestorationPriority::Priority2);
}
