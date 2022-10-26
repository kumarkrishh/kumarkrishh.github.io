import { makeNoise4D } from 'open-simplex-noise';

export function makeTorusNoise2D(scale: number, seed: number) {
  const noise4 = makeNoise4D(seed);
  return (theta: number, phi: number) => noise4(
    Math.cos(theta * Math.PI * 2) / scale, Math.sin(theta * Math.PI * 2) / scale,
    Math.cos(phi * Math.PI * 2) / scale, Math.sin(phi * Math.PI * 2) / scale
  );
}


export function createCurlNoise(scale:number , xsize: number, ysize: number, seed: number) {
  function sampleCurlNoise(noise: (x: number, y: number) => number, x: number, y: number) {
    const EPSILON = 0.0001;
    //Find rate of change in X direction
    const dxs1 = noise(x + EPSILON, y);
    const dxs2 = noise(x - EPSILON, y);
    //Average to find approximate derivative
    const dx = (dxs1 - dxs2) / (2 * EPSILON);
    //Find rate of change in Y direction
    const dys1 = noise(x, y + EPSILON);
    const dys2 = noise(x, y - EPSILON);
    //Average to find approximate derivative
    const dy = (dys1 - dys2) / (2 * EPSILON);
    //Curl
    return [dy, -dx];
  }

  const data = new Float32Array(xsize * ysize * 2);

  const noise = makeTorusNoise2D(3, seed);

  for (let y = 0; y < ysize; y++) {
    for (let x = 0; x < xsize; x++) {
      const [dx, dy] = sampleCurlNoise(noise, x / xsize, y / ysize);
      const baseIdx = xsize * y + x;
      data[baseIdx * 2 + 0] = dx/0xFFF;
      data[baseIdx * 2 + 1] = dy/0xFFF;
    }
  }
  return data;
}


