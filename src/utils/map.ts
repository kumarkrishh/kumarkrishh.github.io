import ScalarMap from './ScalarMap';

export function grayscaleMap(hmap: ScalarMap) {
  const { width, height } = hmap.dims();
  const imageData = new ImageData(width, height);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const i = (x + y * width) * 4;
      const value = hmap.getv(x, y);
      imageData.data[i + 0] = value * 255;
      imageData.data[i + 1] = value * 255;
      imageData.data[i + 2] = value * 255;
      imageData.data[i + 3] = 255;
    }
  }
  return imageData;
}

export function thresholdHeightMap(hmap: ScalarMap, thresh: number, threshcol: [number, number, number]): ImageData {
  const { width, height } = hmap.dims();
  const imageData = new ImageData(width, height);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const i = (x + y * width) * 4;
      const value = hmap.getv(x, y);
      if (value > thresh) {
        imageData.data[i + 0] = value * 255;
        imageData.data[i + 1] = value * 255;
        imageData.data[i + 2] = value * 255;
        imageData.data[i + 3] = 255;
      } else {
        imageData.data[i + 0] = threshcol[0];
        imageData.data[i + 1] = threshcol[1];
        imageData.data[i + 2] = threshcol[2];
        imageData.data[i + 3] = 255;
      }
    }
  }
  return imageData;
}
