"""Generate sample synthetic Sentinel-2 GeoTIFF rasters for testing train_rf.py.

Usage:
    python ml_pipeline/generate_sample_rasters.py --output-dir data
"""

import argparse
from pathlib import Path
import numpy as np
import rasterio
from rasterio.transform import from_origin


def create_raster(path: Path, width=100, height=100, seed=42):
    np.random.seed(seed)
    # Synthetic reflectance values (0.0 to 1.0)
    data = np.random.uniform(0.1, 0.8, size=(height, width)).astype(np.float32)
    transform = from_origin(114.0, -2.0, 0.0001, 0.0001)
    
    path.parent.mkdir(parents=True, exist_ok=True)
    with rasterio.open(
        path,
        'w',
        driver='GTiff',
        height=height,
        width=width,
        count=1,
        dtype=data.dtype,
        crs='EPSG:4326',
        transform=transform,
    ) as dst:
        dst.write(data, 1)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output-dir', type=Path, default=Path('data'))
    args = parser.parse_args()

    pre_dir = args.output_dir / 'pre'
    post_dir = args.output_dir / 'post'

    for band in ('B04', 'B08', 'B12'):
        create_raster(pre_dir / f'{band}.tif', seed=hash(band) % 100)
        create_raster(post_dir / f'{band}.tif', seed=(hash(band) % 100) + 50)

    print(f"Generated sample pre rasters at: {pre_dir}")
    print(f"Generated sample post rasters at: {post_dir}")
    print("You can now run: python ml_pipeline/train_rf.py --pre-dir data/pre --post-dir data/post")


if __name__ == '__main__':
    main()
