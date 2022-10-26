import assert from '../utils/assert';

class ScalarMap {
  private arr: Float32Array;
  private readonly xsize: number;
  private readonly ysize: number;

  constructor(xsize: number, ysize: number, fn?: (x: number, y: number) => number) {
    this.arr = new Float32Array(xsize * ysize);
    this.xsize = xsize;
    this.ysize = ysize;
    if (!!fn) {
      for (let y = 0; y < ysize; y++) {
        for (let x = 0; x < xsize; x++) {
          this.arr[x + y * ysize] = fn(x, y);
        }
      }
    }
  }

  getv(x: number, y: number) {
    assert(x < this.xsize);
    assert(y < this.ysize);
    return this.arr[this.xsize * y + x];
  }

  setv(x: number, y: number, v: number) {
    assert(x < this.xsize);
    assert(y < this.ysize);
    assert(v >= 0 && v <= 1.0);
    this.arr[this.xsize * y + x] = v;
  }

  getData(): Float32Array {
    return this.arr;
  }

  dims() {
    return { width: this.xsize, height: this.ysize };
  }

  add(other: ScalarMap) {
    assert(other.arr.length === this.arr.length);
    for (let i = 0; i < this.arr.length; i++) {
      this.arr[i] = other.arr[i];
    }
  }

  scale(v: number) {
    for (let i = 0; i < this.arr.length; i++) {
      this.arr[i] *= v;
    }
  }

}

export default ScalarMap;
