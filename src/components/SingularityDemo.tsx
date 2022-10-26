import React from "react";
import { genPlane } from '../utils/uvplane';
import { vec2 } from 'gl-matrix';
import { TrackballCamera, } from '../utils/camera';
import { createShader, createProgram, createTexture, overwriteTexture } from '../utils/webgl';

type SingularityDemoProps = {
  style?: React.CSSProperties,
  className?: string,
  size: number,
}


const torus_vs = `#version 300 es
layout(location=0) in vec3 a_position;
layout(location=1) in vec3 a_color;
layout(location=2) in vec2 a_barycenter;

uniform float u_lerpAlpha;
uniform mat4 u_worldViewProjection;

out vec3 v_color;
out vec2 v_barycenter;

void main() {
   vec3 oldpos = vec3(a_position - vec3(0.5, 0.5, 0.5));
   vec3 newpos = oldpos/length(oldpos);

   vec3 lerpedPos = mix(oldpos, newpos, u_lerpAlpha)*0.9;

   v_color = a_color;
   v_barycenter = a_barycenter;
   gl_Position = u_worldViewProjection * vec4(lerpedPos, 1.0);
}
`;

const torus_fs = `#version 300 es
precision highp float;

in vec3 v_color;
in vec2 v_barycenter;

out vec4 v_outColor;

float gridFactor (vec2 vBC, float width) {
  vec3 bary = vec3(vBC.x, vBC.y, 1.0 - vBC.x - vBC.y);
  vec3 d = fwidth(bary);
  vec3 a3 = smoothstep(d * (width - 0.5), d * (width + 0.5), bary);
  return min(min(a3.x, a3.y), a3.z);
}

void main() {
  float alpha = 1.0-gridFactor(v_barycenter, 1.0);
  v_outColor  = vec4(v_color, alpha);
}
`;

function getBarycenter(i: number) {
  let barycenter;
  switch (i % 3) {
    case 0:
      barycenter = [0, 0];
      break;
    case 1:
      barycenter = [0, 1];
      break;
    default:
      barycenter = [1, 0];
      break;
  }
  return barycenter;
}

const detailLevel = 3;

type Point = {
  x: number,
  y: number
}

function convertColor(color: number) {
  return [
    (color >> 16) / 0xFF,
    ((color >> 8) & 0xFF) / 0xFF,
    (color & 0xFF) / 0xFF,
  ];
}

class SingularityDemo extends React.Component<SingularityDemoProps, {}> {

  // this is the ref that three js uses
  private canvas = React.createRef<HTMLCanvasElement>();


  // the torus vertexes
  private readonly vertexes!: vec2[];

  // how much to lerp to a circle
  private lerpRange = React.createRef<HTMLInputElement>();

  private gl!: WebGL2RenderingContext;

  private camera!: TrackballCamera;

  private torusWorldViewProjectionLoc!: WebGLUniformLocation;
  private torusLerpAlpha!: WebGLUniformLocation;

  private filledbuffer!: WebGLBuffer;
  private wireframebuffer!: WebGLBuffer;


  private requestID!: number;

  constructor(props: SingularityDemoProps) {
    super(props);
  }

  componentDidMount() {
    // init camera
    this.camera = new TrackballCamera(this.canvas.current!, {});

    // get webgl
    this.gl = this.canvas.current!.getContext('webgl2')!;
    this.gl.enable(this.gl.DEPTH_TEST);

    const program = createProgram(
      this.gl,
      [
        createShader(this.gl, this.gl.VERTEX_SHADER, torus_vs),
        createShader(this.gl, this.gl.FRAGMENT_SHADER, torus_fs),
      ]
    )!;

    const positionLoc = this.gl.getAttribLocation(program, 'a_position');
    const colorLoc = this.gl.getAttribLocation(program, 'a_color');
    const barycenterLoc = this.gl.getAttribLocation(program, 'a_barycenter');

    this.torusLerpAlpha = this.gl.getUniformLocation(program, "u_lerpAlpha")!;
    this.torusWorldViewProjectionLoc = this.gl.getUniformLocation(program, "u_worldViewProjection")!;

    const topcolor = convertColor(0x458588);
    const bottomcolor = convertColor(0xdc3545);
    const leftcolor = convertColor(0x98971a);
    const rightcolor = convertColor(0xb16286);
    const frontcolor = convertColor(0xd79921);
    const backcolor = convertColor(0xEBDBB2);


    // map different buffers
    let filled = [
      // top level
      ...genPlane(detailLevel, detailLevel).flatMap((v, i) => [v[0], 0, v[1], ...topcolor, ...getBarycenter(i % 3)]),
      // bottomlevel
      ...genPlane(detailLevel, detailLevel).flatMap((v, i) => [v[0], 1, v[1], ...bottomcolor, ...getBarycenter(i % 3)]),
      // left level
      ...genPlane(detailLevel, detailLevel).flatMap((v, i) => [0, v[0], v[1], ...leftcolor, ...getBarycenter(i % 3)]),
      // right level
      ...genPlane(detailLevel, detailLevel).flatMap((v, i) => [1, v[0], v[1], ...rightcolor, ...getBarycenter(i % 3)]),
      // front level
      ...genPlane(detailLevel, detailLevel).flatMap((v, i) => [v[0], v[1], 0, ...frontcolor, ...getBarycenter(i % 3)]),
      // back level
      ...genPlane(detailLevel, detailLevel).flatMap((v, i) => [v[0], v[1], 1, ...backcolor, ...getBarycenter(i % 3)]),
    ];


    this.filledbuffer = this.gl.createBuffer()!;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.filledbuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(filled),
      this.gl.STATIC_DRAW
    );

    // setup our attributes to tell WebGL how to pull
    // the data from the buffer above to the position attribute
    this.gl.enableVertexAttribArray(positionLoc);
    this.gl.vertexAttribPointer(
      positionLoc,
      3,              // size (num components)
      this.gl.FLOAT,  // type of data in buffer
      false,          // normalize
      8 * 4,            // stride (0 = auto)
      0,              // offset
    );
    this.gl.enableVertexAttribArray(colorLoc);
    this.gl.vertexAttribPointer(
      colorLoc,
      3,              // size (num components)
      this.gl.FLOAT,  // type of data in buffer
      false,          // normalize
      8 * 4,            // stride (0 = auto)
      3 * 4,            // offset
    );
    this.gl.enableVertexAttribArray(barycenterLoc);
    this.gl.vertexAttribPointer(
      barycenterLoc,
      2,              // size (num components)
      this.gl.FLOAT,  // type of data in buffer
      false,          // normalize
      8 * 4,            // stride (0 = auto)
      6 * 4,            // offset
    );

    this.gl.useProgram(program);

    // set defaults
    this.gl.uniform1f(this.torusLerpAlpha, 0.0);

    // start animation loop
    this.animationLoop();

  }


  componentWillUnmount() {
    window.cancelAnimationFrame(this.requestID!);
    this.camera.cleanup();
  }

  handleCircularityChange = () => {
    // how much to lerp towards circle
    const lerpAlpha = this.lerpRange.current!.valueAsNumber;
    this.gl.uniform1f(this.torusLerpAlpha, lerpAlpha);
  }



  animationLoop = () => {
    this.camera.update();

    {
      // set uniform
      const worldViewProjectionMat = this.camera.getTrackballCameraMatrix(this.props.size, this.props.size);
      this.gl.uniformMatrix4fv(this.torusWorldViewProjectionLoc, false, worldViewProjectionMat);

      // draw triangles
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.filledbuffer);
      this.gl.drawArrays(this.gl.TRIANGLES, 0, detailLevel * detailLevel * 6 * 6);
    }

    this.requestID = window.requestAnimationFrame(this.animationLoop);
  };

  render() {
    return <div style={this.props.style} className={this.props.className}>
      <canvas
        ref={this.canvas}
        height={this.props.size}
        width={this.props.size}
        className="border border-dark mb-3 d-block mx-auto"
      />
      <div className="mb-2">
        <label className="form-label">Circularity</label>
        <input
          type="range" className="form-range"
          min="0" max="1" step="0.05" defaultValue="0"
          onInput={this.handleCircularityChange}
          ref={this.lerpRange}
        />
      </div>
    </div>;
  }
}

export default SingularityDemo;

