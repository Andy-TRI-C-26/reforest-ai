use std::{net::SocketAddr, sync::Arc};

use reforest_backend::{
    app_with_origins, app_with_origins_and_static, config::Config, repository::MockZoneRepository,
};
use tokio::net::TcpListener;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenvy::dotenv().ok();
    let config = Config::from_env()?;
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| config.log_filter.clone().into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let address: SocketAddr = format!("{}:{}", config.host, config.port).parse()?;
    let listener = TcpListener::bind(address).await?;
    tracing::info!(%address, "reforest backend listening");
    let repository = Arc::new(MockZoneRepository::new());
    let app = match &config.static_dir {
        Some(static_dir) => {
            app_with_origins_and_static(repository, &config.cors_origins, static_dir)
        }
        None => app_with_origins(repository, &config.cors_origins),
    };
    axum::serve(listener, app).await?;
    Ok(())
}
