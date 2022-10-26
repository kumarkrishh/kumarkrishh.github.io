import assert from '../utils/assert';

class VectorMap {
  private arr: Float32Array;
  private xsize: number;
  private ysize: number;

  constructor(xsize: number, ysize: number) {
    this.arr = new Float32Array(xsize * ysize * 2);
    this.xsize = xsize;
    this.ysize = ysize;
  }

  getv(x: number, y: number) {
    assert(x < this.xsize);
    assert(y < this.ysize);
    return [this.arr[(this.xsize * y + x) * 2 + 0],
    this.arr[(this.xsize * y + x) * 2 + 1]];
  }

  setv(x: number, y: number, v: number[]) {
    assert(x < this.xsize);
    assert(y < this.ysize);
    let [vx, vy] = v;
    this.arr[(this.xsize * y + x) * 2 + 0] = vx;
    this.arr[(this.xsize * y + x) * 2 + 1] = vy;
  }

  dims() {
    return { width: this.xsize, height: this.ysize };
  }

}

export default VectorMap;
