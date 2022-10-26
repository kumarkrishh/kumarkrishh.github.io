import React from "react";
import { genPlane } from '../utils/uvplane';
import { vec2 } from 'gl-matrix';
import { TrackballCamera, } from '../utils/camera';
import { createShader, createProgram, createTexture, overwriteTexture } from '../utils/webgl';

type TorusDemoProps = {
  style?: React.CSSProperties,
  className?: string,
  texture: ImageData,
  size: number,
  aspectRatio: number,
  detailLevel: number,
}


const torus_vs = `#version 300 es
#define PI 3.1415926538

in vec2 a_position;

const float u_majorRadius = 0.5;
const float u_minorRadius = 0.25;

uniform float u_majorAlpha;
uniform float u_minorAlpha;
uniform float u_lerpAlpha;
uniform mat4 u_worldViewProjection;

out vec2 v_texCoord;

void main() {
   float theta = a_position.x * u_minorAlpha * 2.0 * PI + PI;
   float phi = a_position.y * u_majorAlpha * 2.0 * PI;

   v_texCoord = a_position;

   vec3 oldpos = vec3(a_position - 0.5, 0.0);
   vec3 newpos = vec3(
       (u_majorRadius + u_minorRadius * cos(theta)) * cos(phi),
       (u_majorRadius + u_minorRadius * cos(theta)) * sin(phi),
       u_minorRadius * sin(theta)
    );

   vec3 lerpedPos = mix(oldpos, newpos, u_lerpAlpha);

   gl_Position = u_worldViewProjection * vec4(lerpedPos, 1.0);
}
`;

const torus_fs = `#version 300 es
precision highp float;
precision highp sampler2D;

// the rendered texture
uniform sampler2D u_render_tex;

in vec2 v_texCoord;

out vec4 v_outColor;

void main() {
  v_outColor  = texture(u_render_tex, v_texCoord);
}
`;


type Point = {
  x: number,
  y: number
}


type TorusDemoState = {}



class TorusDemo extends React.Component<TorusDemoProps, TorusDemoState> {

  // this is the ref that three js uses
  private canvas = React.createRef<HTMLCanvasElement>();


  // the torus vertexes
  private readonly torusVertexes: vec2[];
  private readonly imageData: ImageData;

  // this is the ref we use to monitor circularization
  private torusnessRange = React.createRef<HTMLInputElement>();

  private majorRange = React.createRef<HTMLInputElement>();
  private minorRange = React.createRef<HTMLInputElement>();
  private lerpRange = React.createRef<HTMLInputElement>();

  private gl!: WebGL2RenderingContext;

  private camera!: TrackballCamera;

  private torusTexture!: WebGLTexture;
  private torusWorldViewProjectionLoc!: WebGLUniformLocation;
  private torusMajorAlpha!: WebGLUniformLocation;
  private torusMinorAlpha!: WebGLUniformLocation;
  private torusLerpAlpha!: WebGLUniformLocation;


  private requestID!: number;

  constructor(props: TorusDemoProps) {
    super(props);
    this.torusVertexes = genPlane(props.detailLevel, props.detailLevel);
    this.imageData = props.texture;
  }

  componentDidMount() {
    // init camera
    this.camera = new TrackballCamera(this.canvas.current!, {});

    // get webgl
    this.gl = this.canvas.current!.getContext('webgl2')!;
    this.gl.enable(this.gl.DEPTH_TEST);

    // create and set texture
    this.torusTexture = createTexture(this.gl, this.imageData.width, this.imageData.height)!;
    overwriteTexture(this.gl, 0, 0, this.imageData);

    const program = createProgram(
      this.gl,
      [
        createShader(this.gl, this.gl.VERTEX_SHADER, torus_vs),
        createShader(this.gl, this.gl.FRAGMENT_SHADER, torus_fs),
      ]
    )!;

    const positionLoc = this.gl.getAttribLocation(program, 'a_position');

    const renderTexLoc = this.gl.getUniformLocation(program, "u_render_tex");
    this.torusMajorAlpha = this.gl.getUniformLocation(program, "u_majorAlpha")!;
    this.torusMinorAlpha = this.gl.getUniformLocation(program, "u_minorAlpha")!;
    this.torusLerpAlpha = this.gl.getUniformLocation(program, "u_lerpAlpha")!;
    this.torusWorldViewProjectionLoc = this.gl.getUniformLocation(program, "u_worldViewProjection")!;


    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(this.torusVertexes.flatMap(x => ([x[0], x[1]]))),
      this.gl.STATIC_DRAW
    );
    // setup our attributes to tell WebGL how to pull
    // the data from the buffer above to the position attribute
    this.gl.enableVertexAttribArray(positionLoc);
    this.gl.vertexAttribPointer(
      positionLoc,
      2,                   // size (num components)
      this.gl.FLOAT,  // type of data in buffer
      false,          // normalize
      0,              // stride (0 = auto)
      0,              // offset
    );

    this.gl.useProgram(program);

    // set defaults
    this.gl.uniform1f(this.torusMajorAlpha, 0.0);
    this.gl.uniform1f(this.torusMinorAlpha, 0.0);
    this.gl.uniform1f(this.torusLerpAlpha, 0.0);

    // Tell the shader to get the render texture from texture unit 0
    this.gl.uniform1i(renderTexLoc, 0);

    // start animation loop
    this.animationLoop();

  }


  componentWillUnmount() {
    window.cancelAnimationFrame(this.requestID!);
    this.camera.cleanup();
  }

  handleTorusChange = () => {
    const torusnessAlpha = this.torusnessRange.current!.valueAsNumber;

    this.majorRange.current!.valueAsNumber = torusnessAlpha;
    this.minorRange.current!.valueAsNumber = torusnessAlpha;
    this.lerpRange.current!.valueAsNumber = Math.min(torusnessAlpha * 1.5, 1);
    //now continue
    this.handleCircularityChange();
  }


  handleCircularityChange = () => {
    // how much to lerp towards circle
    const majorAlpha = this.majorRange.current!.valueAsNumber;
    const minorAlpha = this.minorRange.current!.valueAsNumber;
    const lerpAlpha = this.lerpRange.current!.valueAsNumber;

    this.gl.uniform1f(this.torusMajorAlpha, majorAlpha);
    this.gl.uniform1f(this.torusMinorAlpha, minorAlpha);
    this.gl.uniform1f(this.torusLerpAlpha, lerpAlpha);
  }



  animationLoop = () => {
    this.camera.update();

    {
      // set uniform
      const worldViewProjectionMat = this.camera.getTrackballCameraMatrix(this.props.size, this.props.size);
      this.gl.uniformMatrix4fv(this.torusWorldViewProjectionLoc, false, worldViewProjectionMat);

      // bind the newly updated texture to texture unit 0
      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.torusTexture);

      // draw triangles
      this.gl.drawArrays(this.gl.TRIANGLES, 0, this.torusVertexes.length);
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
        <label className="form-label">Torusness</label>
        <input
          type="range" className="form-range"
          min="0" max="1" step="0.05" defaultValue="0"
          ref={this.torusnessRange}
          onInput={this.handleTorusChange}
        />
      </div>
      <details>
        <summary>Advanced Torus Controls</summary>
        <div className="mx-auto">
          <label className="form-label">Join Major</label>
          <input
            type="range" className="form-range"
            min="0" max="1" step="0.05" defaultValue="0"
            ref={this.majorRange}
            onInput={this.handleCircularityChange}
          />
        </div>
        <div className="mx-auto">
          <label className="form-label">Join Minor</label>
          <input
            type="range" className="form-range"
            min="0" max="1" step="0.05" defaultValue="0"
            ref={this.minorRange}
            onInput={this.handleCircularityChange}
          />
        </div>
        <div className="mx-auto">
          <label className="form-label">Alpha</label>
          <input
            type="range" className="form-range"
            min="0" max="1" step="0.05" defaultValue="0"
            ref={this.lerpRange}
            onInput={this.handleCircularityChange}
          />
        </div>
      </details>
    </div>;
  }
}

export default TorusDemo;
