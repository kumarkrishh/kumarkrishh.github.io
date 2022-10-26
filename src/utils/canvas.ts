export type Point = {
  x: number,
  y: number
}

export class CanvasMouseTracker {
  private canvas: HTMLCanvasElement;

  // mouse status
  public mousePos: { current: Point, previous: Point } | null = null;

  mouseDownListeners:Array<(p:Point) => void> = [];
  mouseMoveListeners:Array<(p:Point) => void> = [];
  mouseUpListeners:Array<(p:Point) => void> = [];

  constructor(ctx: HTMLCanvasElement) {
    this.canvas = ctx;

    // add canvas handler
    this.canvas.addEventListener('pointerdown', this.handleMouseDown);
    this.canvas.addEventListener('pointermove', this.handleMouseMove);
    window.addEventListener('pointerup', this.handleMouseUp);
    // disable touch movements
    this.canvas.addEventListener("touchstart", this.discardTouchEvent)
    this.canvas.addEventListener("touchmove", this.discardTouchEvent)
    this.canvas.addEventListener("touchend", this.discardTouchEvent)
    this.canvas.addEventListener("touchcancel", this.discardTouchEvent)
  }

  addMouseDownListener = (f:(p:Point) => void) => this.mouseDownListeners.push(f);
  removeMouseDownListener = (f:(p:Point) => void) => this.mouseDownListeners = this.mouseDownListeners.filter(x => x !== f);
  addMouseMoveListener = (f:(p:Point) => void) => this.mouseMoveListeners.push(f);
  removeMouseMoveListener = (f:(p:Point) => void) => this.mouseMoveListeners = this.mouseMoveListeners.filter(x => x !== f);
  addMouseUpListener = (f:(p:Point) => void) => this.mouseUpListeners.push(f);
  reupMouseUpListener = (f:(p:Point) => void) => this.mouseUpListeners = this.mouseUpListeners.filter(x => x !== f);

  private getMousePos(canvas: HTMLCanvasElement, evt: MouseEvent) {
    const rect = canvas.getBoundingClientRect(); // abs. size of element
    const scaleX = canvas.width / rect.width;    // relationship bitmap vs. element for X
    const scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

    return {
      x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
      y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
    }
  }

  handleMouseDown = (e: MouseEvent) => {
    const v = this.getMousePos(this.canvas, e);
    this.mousePos = {
      current: v,
      previous: v
    };
    for(const f of this.mouseDownListeners) {
        f(v);
    }
  }
  handleMouseUp = (e: MouseEvent) => {
    this.mousePos = null;
    const v = this.getMousePos(this.canvas, e);
    for(const f of this.mouseUpListeners) {
        f(v);
    }
  }

  handleMouseMove = (e: MouseEvent) => {
    if (!this.mousePos) {
      return;
    }
    const v = this.getMousePos(this.canvas, e);
    this.mousePos = {
      current: v,
      previous: this.mousePos.current
    };
    for(const f of this.mouseMoveListeners) {
        f(v);
    }
  }

  discardTouchEvent = (e: TouchEvent) => e.preventDefault();

  cleanup = () => {
    // remove listeners on canvas
    this.canvas.removeEventListener('pointerdown', this.handleMouseDown);
    this.canvas.removeEventListener('pointermove', this.handleMouseMove);
    window.removeEventListener('pointerup', this.handleMouseUp);
    // reenable touch movements
    this.canvas.removeEventListener("touchstart", this.discardTouchEvent)
    this.canvas.removeEventListener("touchmove", this.discardTouchEvent)
    this.canvas.removeEventListener("touchend", this.discardTouchEvent)
    this.canvas.removeEventListener("touchcancel", this.discardTouchEvent)
  }
}
