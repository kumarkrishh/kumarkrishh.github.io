import assert from '../utils/assert';
import {mod} from '../utils/math';

export async function loadImage(imageUrl: string) {
  const response = await fetch(imageUrl);
  const fileBlob = await response.blob();
  const bitmap = await createImageBitmap(fileBlob);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext('2d')!;
  context.drawImage(bitmap, 0, 0);
  return context.getImageData(0, 0, bitmap.width, bitmap.height);
}

export type BoundaryConditions = "FIXED" | "MIRROR" | "PERIODIC";


// extends an image so that it can be processed by the given matrix
export function extend(img: ImageData, b: BoundaryConditions, radius: number): ImageData {
  // radius is the amount we have to pad the image with
  assert(radius > 0, "radius must be positive");

  let newImg = new ImageData(img.height + radius * 2, img.width + radius * 2);

  switch (b) {
    case "FIXED": {
      for (let y = 0; y < newImg.width; y++) {
        for (let x = 0; x < newImg.height; x++) {
          // clamp x and y between the correct values
          const srcx = Math.max(Math.min(x - radius, img.width - 1), 0);
          const srcy = Math.max(Math.min(y - radius, img.height - 1), 0);

          // calculate base indexes
          const srcbasei = (srcy * img.width + srcx) * 4;
          const destbasei = (y * newImg.width + x) * 4;

          // copy r, g, b, a
          newImg.data[destbasei + 0] = img.data[srcbasei + 0];
          newImg.data[destbasei + 1] = img.data[srcbasei + 1];
          newImg.data[destbasei + 2] = img.data[srcbasei + 2];
          newImg.data[destbasei + 3] = img.data[srcbasei + 3];
        }
      }
      break;
    }
    case "PERIODIC": {
      for (let y = 0; y < newImg.width; y++) {
        for (let x = 0; x < newImg.height; x++) {
          // wrap x and y between the correct values
          const srcx = mod(x - radius, img.width);
          const srcy = mod(y - radius, img.height);

          // calculate base indexes
          const srcbasei = (srcy * img.width + srcx) * 4;
          const destbasei = (y * newImg.width + x) * 4;

          // copy r, g, b, a
          newImg.data[destbasei + 0] = img.data[srcbasei + 0];
          newImg.data[destbasei + 1] = img.data[srcbasei + 1];
          newImg.data[destbasei + 2] = img.data[srcbasei + 2];
          newImg.data[destbasei + 3] = img.data[srcbasei + 3];
        }
      }
      break;
    }
    case "MIRROR": {
      function mirror(x: number, w: number) {
        if (x < 0) {
          // extend
          return Math.min(Math.max(-x, 0), w);
        } else if (x >= w) {
          // extend
          return Math.min(Math.max(2 * w - x, 0), w);
        } else {
          return x;
        }
      }

      for (let y = 0; y < newImg.width; y++) {
        for (let x = 0; x < newImg.height; x++) {
          // wrap x and y between the correct values
          const srcx = mirror(x - radius, img.width - 1);
          const srcy = mirror(y - radius, img.height - 1);

          // calculate base indexes
          const srcbasei = (srcy * img.width + srcx) * 4;
          const destbasei = (y * newImg.width + x) * 4;

          // copy r, g, b, a
          newImg.data[destbasei + 0] = img.data[srcbasei + 0];
          newImg.data[destbasei + 1] = img.data[srcbasei + 1];
          newImg.data[destbasei + 2] = img.data[srcbasei + 2];
          newImg.data[destbasei + 3] = img.data[srcbasei + 3];
        }
      }
      break;
    }
  }

  return newImg;
}

// crops the data
export function boxBlur(img: ImageData, radius: number) {
  assert(radius > 0, "radius must be positive");

  // radius is the amount we will crop from the image

  // dimensions of the src image
  const srcxsize = img.width;
  const srcysize = img.height;

  // dimensions of new image
  const newxsize = srcxsize - radius * 2;
  const newysize = srcysize - radius * 2;

  assert(newxsize > 0 && newysize > 0, "radius is too large");

  // create new image
  let newImg = new ImageData(newxsize, newysize);

  // create specific channel sums
  // each array is the sum of specified channel in the rectangle [0, x] by [0, y]
  let rSums = new Uint32Array(srcxsize * srcysize);
  let gSums = new Uint32Array(srcxsize * srcysize);
  let bSums = new Uint32Array(srcxsize * srcysize);
  let aSums = new Uint32Array(srcxsize * srcysize);

  // here, we calculate the sum in each of the channels in the horizontal direction
  for (let y = 0; y < srcysize; y++) {
    // note we start at 1, not 0
    for (let x = 1; x < srcxsize; x++) {
      const srcBaseIdx = (srcysize * y + x) * 4;
      const destIdx = srcysize * y + x;
      // add the previous column value to the current column
      rSums[destIdx] = img.data[srcBaseIdx + 0] + rSums[destIdx - 1];
      gSums[destIdx] = img.data[srcBaseIdx + 1] + gSums[destIdx - 1];
      bSums[destIdx] = img.data[srcBaseIdx + 2] + bSums[destIdx - 1];
      aSums[destIdx] = img.data[srcBaseIdx + 3] + aSums[destIdx - 1];
    }
  }

  // now, we calculate the sum in each of the channels in the vertical direction
  for (let x = 0; x < srcxsize; x++) {
    // note we start at 1, not 0
    for (let y = 1; y < srcysize; y++) {
      const destIdx = srcysize * y + x;
      const srcIdx = srcysize * (y - 1) + x;
      // add the above row value to the current position
      rSums[destIdx] += rSums[srcIdx];
      gSums[destIdx] += gSums[srcIdx];
      bSums[destIdx] += bSums[srcIdx];
      aSums[destIdx] += aSums[srcIdx];
    }
  }

  // number of pixels in box
  const pixels = Math.pow(radius * 2, 2);

  // now, we calculate the blur
  for (let y = 0; y < newysize; y++) {
    for (let x = 0; x < newxsize; x++) {
      // see explanation here
      // https://github.com/francium/fast-blur/blob/master/fast_blur.c

      // get src coords
      const srcx = x + radius;
      const srcy = y + radius;

      // calculate indexes
      const aIdx = (srcx - radius) + srcysize * (srcy - radius);
      const bIdx = (srcx - radius) + srcysize * (srcy + radius);
      const cIdx = (srcx + radius) + srcysize * (srcy - radius);
      const dIdx = (srcx + radius) + srcysize * (srcy + radius);

      // get sums
      const rSum = rSums[dIdx] - (rSums[bIdx] + rSums[cIdx] - rSums[aIdx]);
      const gSum = gSums[dIdx] - (gSums[bIdx] + gSums[cIdx] - gSums[aIdx]);
      const bSum = bSums[dIdx] - (bSums[bIdx] + bSums[cIdx] - bSums[aIdx]);
      const aSum = aSums[dIdx] - (aSums[bIdx] + aSums[cIdx] - aSums[aIdx]);

      // destIdx
      const destBaseIdx = (x + y * newysize) * 4;
      newImg.data[destBaseIdx + 0] = rSum / pixels;
      newImg.data[destBaseIdx + 1] = gSum / pixels;
      newImg.data[destBaseIdx + 2] = bSum / pixels;
      newImg.data[destBaseIdx + 3] = aSum / pixels;
    }
  }

  return newImg;
}

export function imageDataFromFn(xsize: number, ysize: number, fn: (x: number, y: number) => number) {
  let img = new ImageData(xsize, ysize);
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const color = fn(x, y);
      const baseIdx = (x + y * ysize) * 4;
      img.data[baseIdx + 0] = color >> 16;
      img.data[baseIdx + 1] = (color >> 8) & 0xFF;
      img.data[baseIdx + 2] = color & 0xFF;
      img.data[baseIdx + 3] = 0xFF;
    }
  }
  return img;
}

export function crop(src: ImageData, srcx: number, srcy: number, xsize: number, ysize: number) {
  // ensure validity of arguments
  assert(Number.isInteger(srcx), "srcx is not integer");
  assert(Number.isInteger(srcy), "srcy is not integer");
  assert(Number.isInteger(xsize), "xsize is not integer");
  assert(Number.isInteger(ysize), "ysize is not integer");

  let dest = new ImageData(xsize, ysize);
  for (let y = 0; y < ysize; y++) {
    for (let x = 0; x < xsize; x++) {
      const srcBaseIdx = ((srcx + x) + (srcy + y) * src.height) * 4;
      const destBaseIdx = (x + y * ysize) * 4;

      // copy data
      dest.data[destBaseIdx + 0] = src.data[srcBaseIdx + 0];
      dest.data[destBaseIdx + 1] = src.data[srcBaseIdx + 1];
      dest.data[destBaseIdx + 2] = src.data[srcBaseIdx + 2];
      dest.data[destBaseIdx + 3] = src.data[srcBaseIdx + 3];
    }
  }
  return dest;
}
