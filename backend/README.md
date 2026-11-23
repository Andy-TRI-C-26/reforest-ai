# REFOREST AI Backend

Rust/Axum REST API with a mock repository for KHDTK Tumbang Nusa. The repository boundary keeps HTTP routes independent from the future PostgreSQL/PostGIS implementation.

```bash
cargo run
curl http://localhost:8080/health
curl http://localhost:8080/api/zones
```

Run checks:

```bash
cargo fmt --check
cargo test
cargo clippy --all-targets --all-features -- -D warnings
docker compose config
```

The mock API intentionally contains no GEE credentials. Real ingestion workers can write validated observations to PostgreSQL/PostGIS later.
