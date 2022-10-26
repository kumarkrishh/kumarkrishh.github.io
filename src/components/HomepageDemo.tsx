import React from "react";
import { createShader, createProgram } from '../utils/webgl';
import { TrackballCamera, } from '../utils/camera';
import { quat } from 'gl-matrix';
import { genIcosahedron } from '../utils/icosphere';

type HomepageDemoProps = {
  style?: React.CSSProperties,
  className?: string
  width: number,
  height: number
}


const vs = `#version 300 es
layout(location=0) in vec3 a_position;
layout(location=1) in vec2 a_barycenter;

uniform mat4 u_worldViewProjection;

out vec2 v_barycenter;

void main() {
   gl_Position = u_worldViewProjection * vec4(a_position, 1.0);
   v_barycenter = a_barycenter;
}
`;

const fs = `#version 300 es
precision highp float;

in vec2 v_barycenter;

out vec4 v_outColor;

float gridFactor (vec2 vBC, float width) {
  vec3 bary = vec3(vBC.x, vBC.y, 1.0 - vBC.x - vBC.y);
  vec3 d = fwidth(bary);
  vec3 a3 = smoothstep(d * (width - 0.5), d * (width + 0.5), bary);
  return min(min(a3.x, a3.y), a3.z);
}

void main() {
  // color: 0xEBDBB2,
  float alpha = 1.0-gridFactor(v_barycenter, 1.0);
  v_outColor = vec4(0.922,0.859,0.698, alpha);
}
`;

const icoVertexes = genIcosahedron();


// TODO: learn how to handle error cases

type HomepageDemoState = {}

class HomepageDemo extends React.Component<HomepageDemoProps, HomepageDemoState> {
  private canvas = React.createRef<HTMLCanvasElement>();
  private gl!: WebGL2RenderingContext;

  private camera!: TrackballCamera;

  private worldViewProjectionLoc!: WebGLUniformLocation;

  private requestID!: number;

  constructor(props: HomepageDemoProps) {
    super(props);
  }

  componentDidMount() {

    // init camera
    this.camera = new TrackballCamera(
      this.canvas.current!,
      {
        rotation: quat.fromEuler(quat.create(), 0, 0.1, 0)
      }
    );

    // get webgl
    this.gl = this.canvas.current!.getContext('webgl2', { premultipliedAlpha: false })!;

    const program = createProgram(
      this.gl,
      [
        createShader(this.gl, this.gl.VERTEX_SHADER, vs),
        createShader(this.gl, this.gl.FRAGMENT_SHADER, fs),
      ]
    )!;

    const positionLoc = this.gl.getAttribLocation(program, 'a_position');
    const barycenterLoc = this.gl.getAttribLocation(program, 'a_barycenter');

    this.worldViewProjectionLoc =
      this.gl.getUniformLocation(program, "u_worldViewProjection")!;

    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(icoVertexes.flatMap((x, i) => {
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
        return [x[0], x[1], x[2], barycenter[0], barycenter[1]]
      })),
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
      5 * 4,              // stride (0 = auto)
      0,              // offset
    );
    this.gl.enableVertexAttribArray(barycenterLoc);
    this.gl.vertexAttribPointer(
      barycenterLoc,
      2,              // size (num components)
      this.gl.FLOAT,  // type of data in buffer
      false,          // normalize
      5 * 4,              // stride (0 = auto)
      3 * 4,              // offset
    );

    this.gl.useProgram(program);

    // start animation loop
    this.animationLoop();
  }


  componentWillUnmount() {
    // stop animation loop
    window.cancelAnimationFrame(this.requestID!);
    // TODO: destroy vao, buffer, programs, shaders, etc
    this.camera.cleanup();
  }

  animationLoop = () => {
    this.requestID = window.requestAnimationFrame(this.animationLoop);

    // set uniform
    const worldViewProjectionMat = this.camera.getTrackballCameraMatrix(this.props.width, this.props.height);
    this.gl.uniformMatrix4fv(this.worldViewProjectionLoc, false, worldViewProjectionMat);


    // settings
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    // draw triangles
    this.gl.drawArrays(this.gl.TRIANGLES, 0, icoVertexes.length);

    this.camera.update();
  }

  render() {
    return <canvas
      style={this.props.style}
      className={this.props.className}
      ref={this.canvas}
      height={this.props.height}
      width={this.props.width}
    />
  }
}

export default HomepageDemo;
