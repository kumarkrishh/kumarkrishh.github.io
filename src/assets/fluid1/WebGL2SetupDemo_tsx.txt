import React from "react";
import { createShader, createProgram } from '../utils/webgl';

type WebGL2SetupDemoProps = {
  // these two props are for styling of the canvas
  style?: React.CSSProperties,
  className?: string
  // this one impacts how many pixels will be in the image
  size: number
}

// the vertex shader
// note that "#version 300 es" must be the first line
const vs = `#version 300 es
in vec2 a_position;
out vec2 v_texCoord;
void main() {
  // represents the logical coordinate
  v_texCoord = a_position;

  // converts the position (which is from 0 to 1)
  // to clip space (which is from -1 to 1)
  // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection
  vec2 clipSpace = (a_position * 2.0) - 1.0;

  gl_Position = vec4(clipSpace, 0, 1);
}
`;

// the fragment shader
const fs = `#version 300 es
precision highp float;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// the color to print out
out vec4 outColor;
 
void main() {
  // red is the x coordinate of v_texCoord
  // green is the y coordinate of v_texCoord
  // blue is 0
  // alpha is 1 (totally opaque)
  outColor = vec4(v_texCoord, 0, 1.0);
}
`;

// we're using a React class component since it's more convenient than a function
class WebGL2SetupDemo extends React.Component<WebGL2SetupDemoProps, {}> {

  private canvas = React.createRef<HTMLCanvasElement>();
  private gl!: WebGL2RenderingContext;
  private vao!: WebGLVertexArrayObject;
  private program!: WebGLProgram;
  private requestID!: number;

  constructor(props: WebGL2SetupDemoProps) {
    super(props);
  }

  // code runs when the component is being rendered
  componentDidMount() {
    // get webgl
    this.gl = this.canvas.current!.getContext('webgl2')!;

    this.program = createProgram(
        this.gl,
        [
            createShader(this.gl, this.gl.VERTEX_SHADER, vs),
            createShader(this.gl, this.gl.FRAGMENT_SHADER, fs),
        ]
    )!;

    // we create two triangles that form a rectangle.
    // these rectangles cover a space from 0 to 1
    const buffer = this.gl.createBuffer();
    // there's a buffer slot in the webgl context,
    // this sets this buffer to be the current one
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    // bufferData command works on the buffer in the current slot
    // (which we just set)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
      0, 0,
      1, 0,
      0, 1,
      0, 1,
      1, 0,
      1, 1,
    ]), this.gl.STATIC_DRAW);

    // get the index of the a_position attribute that we defined in the GLSL
    const positionLoc = this.gl.getAttribLocation(this.program, 'a_position');

    // create a vao and bind it
    // the vao stores all our data about attributes for a program
    this.vao = this.gl.createVertexArray()!;
    this.gl.bindVertexArray(this.vao);

    // enable the attribute array on the vao
    this.gl.enableVertexAttribArray(positionLoc);

    // bind the buffer data to our vao's positionLoc
    this.gl.vertexAttribPointer(
      positionLoc,
      2,              // size (num components)
      this.gl.FLOAT,  // type of data in buffer
      false,          // normalize
      0,              // stride (0 = auto)
      0,              // offset
    );


    // start animation loop
    this.animationLoop();
  }

  // code runs when the component is about to stop being rendered
  componentWillUnmount() {
    // stop animation loop
    window.cancelAnimationFrame(this.requestID!);
    // destroy context
    this.gl.getExtension('WEBGL_lose_context')!.loseContext();
  }

  animationLoop = () => {
    // schedule next frame
    this.requestID = window.requestAnimationFrame(this.animationLoop);
    // sets the current program to run
    this.gl.useProgram(this.program);
    // sets the current vao
    // (which contains all the data about which attributes are bound to what in our program)
    this.gl.bindVertexArray(this.vao);
    // draw triangles
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }

  // use JSX syntax to render a canvas
  render() {
    return <canvas
      style={this.props.style}
      className={this.props.className}
      ref={this.canvas}
      height={this.props.size}
      width={this.props.size}
    />
  }

}

export default WebGL2SetupDemo;
