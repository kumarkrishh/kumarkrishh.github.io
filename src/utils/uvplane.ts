import { vec2 } from 'gl-matrix';
import assert from '../utils/assert';

export function genPlane(xseg: number, yseg: number): vec2[] {
  assert(xseg > 0);
  assert(yseg > 0);

  let vertexes: vec2[] = [];

  for (let xi = 0; xi < xseg; xi++) {
    const x = xi / xseg;
    const nx = (xi+1) / xseg;
    for (let yi = 0; yi < yseg; yi++) {
      const y = yi / yseg;
      const ny = (yi+1) / yseg;

      // add two triangles

      // upper triangle
      vertexes.push(vec2.fromValues(x, y));
      vertexes.push(vec2.fromValues(nx, y));
      vertexes.push(vec2.fromValues(x, ny));
      // lower triangle
      vertexes.push(vec2.fromValues(nx, y));
      vertexes.push(vec2.fromValues(nx, ny));
      vertexes.push(vec2.fromValues(x, ny));
    }
  }

  return vertexes;
}
