import React from "react";
import { createShader, createProgram, createTexture, updateTextureFromCanvas, createR32FTexture, createRG32FTexture, overwriteR32FTexture, overwriteRG32FTexture } from '../utils/webgl';
import { clamp } from '../utils/math';
import { createCurlNoise } from '../utils/noise';
import { genPlane } from '../utils/uvplane';
import { TrackballCamera, } from '../utils/camera';
import { CanvasMouseTracker } from '../utils/canvas';

type IncompressibleTorusFluidDemoProps = {
  style?: React.CSSProperties,
  className?: string
  xsize: number
  ysize: number
  torussize: number
}

// the vertex shader is used in 2 different programs, it basically is just for translating clip space
const vs = `#version 300 es
in vec2 c_position;
out vec2 v_texCoord;

void main() {
  v_texCoord = c_position;

  // convert from 0->1 to 0->2
  // convert from 0->2 to -1->+1 (clip space)
  vec2 clipSpace = (c_position * 2.0) - 1.0;

  gl_Position = vec4(clipSpace, 0, 1);
}
`;

// this fragment shader does the actual work of advect_scalarion
const advect_scalar_fs = `#version 300 es
precision highp float;
precision highp sampler2D;

// the scalar texture
uniform sampler2D u_scalar_tex;

// the velocity texture
uniform sampler2D u_vel_tex;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// the output
out vec4 value;

float textureGood(sampler2D sam, vec2 uv) {
    vec2 res = vec2(textureSize(sam, 0));
    vec2 st = uv*res - 0.5;

    vec2 iuv = floor( st );
    vec2 fuv = fract( st );

    float a = texture( sam, (iuv+vec2(0.5,0.5))/res).r;
    float b = texture( sam, (iuv+vec2(1.5,0.5))/res).r;
    float c = texture( sam, (iuv+vec2(0.5,1.5))/res).r;
    float d = texture( sam, (iuv+vec2(1.5,1.5))/res).r;

    return mix( mix( a, b, fuv.x),
                mix( c, d, fuv.x), fuv.y );
}

void main() {
  // get the floatwise velocity
  vec2 vel = texture(u_vel_tex, v_texCoord).xy;

  // now we advect the scalar field:
  // we calculate the scalar value that will be at this location at the next timestep
  float val = textureGood(u_scalar_tex, v_texCoord-vel);

  value = vec4(val, 0.0, 0.0, 0.0);
}
`;

const advect_vel_fs = `#version 300 es
precision highp float;
precision highp sampler2D;

// the velocity texture
uniform sampler2D u_vel_tex;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// the output
out vec4 value;

vec2 textureGood(sampler2D sam, vec2 uv)
{
    vec2 res = vec2(textureSize(sam, 0));
    vec2 st = uv*res - 0.5;

    vec2 iuv = floor( st );
    vec2 fuv = fract( st );

    vec2 a = texture(sam, (iuv+vec2(0.5,0.5))/res).xy;
    vec2 b = texture(sam, (iuv+vec2(1.5,0.5))/res).xy;
    vec2 c = texture(sam, (iuv+vec2(0.5,1.5))/res).xy;
    vec2 d = texture(sam, (iuv+vec2(1.5,1.5))/res).xy;

    return mix( mix( a, b, fuv.x),
                mix( c, d, fuv.x), fuv.y );
}

void main() {
  // get the floatwise velocity
  vec2 vel = texture(u_vel_tex, v_texCoord).xy;

  // now we advect the scalar field:
  // we calculate the scalar value that will be at this location at the next timestep
  vec2 val = textureGood(u_vel_tex, v_texCoord-vel);

  value = vec4(val, 0, 0);
}
`;


const divergence_fs = `#version 300 es
precision highp float;
precision highp sampler2D;

// the velocity texture
uniform sampler2D u_vel_tex;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// the output
out vec4 value;

void main() {
  // get neighboring cell distances
  vec2 resolution = vec2(textureSize(u_vel_tex, 0));
  float x_off = 1.0/resolution.x;
  float y_off = 1.0/resolution.y;

  // get data
  vec2 v01 = texture(u_vel_tex, v_texCoord + vec2(-x_off,+0.000)).xy;
  vec2 v10 = texture(u_vel_tex, v_texCoord + vec2(+0.000,-y_off)).xy;
  vec2 v12 = texture(u_vel_tex, v_texCoord + vec2(+0.000,+y_off)).xy;
  vec2 v21 = texture(u_vel_tex, v_texCoord + vec2(+x_off,+0.000)).xy;

  // calculate divergence using finite differences
  // remember, divergence is df/dx + df/dy
  float divergence = (v01.x - v21.x)/(2.0*x_off)
                   + (v10.y - v12.y)/(2.0*y_off);

  // return divergence
  value = vec4(divergence, 0.0, 0.0, 0.0);
}
`;

const solve_pressure_fs = `#version 300 es
precision highp float;
precision highp sampler2D;

// the divergence texture
uniform sampler2D u_divergence_tex;

// the pressure texture of the last iteration
uniform sampler2D u_pressure_tex;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// the output
out vec4 value;

void main() {
  // get neighboring cell distances
  vec2 resolution = vec2(textureSize(u_divergence_tex, 0));
  float x_off = 1.0/resolution.x;
  float y_off = 1.0/resolution.y;

  // get previous iteration pressure data
  float p01 = texture(u_pressure_tex, v_texCoord + vec2(-x_off,+0.000)).x;
  float p10 = texture(u_pressure_tex, v_texCoord + vec2(+0.000,-y_off)).x;
  float p12 = texture(u_pressure_tex, v_texCoord + vec2(+0.000,+y_off)).x;
  float p21 = texture(u_pressure_tex, v_texCoord + vec2(+x_off,+0.000)).x;

  // get divergence
  float d11 = texture(u_divergence_tex , v_texCoord).x;

  // use the jacobi method to derive the next iteration of pressure at this location
  float p_next = (d11 + p01 + p10 + p12 + p21)/4.0;

  value = vec4(p_next, 0.0, 0.0, 0.0);
}
`;

const apply_pressure_force_fs = `#version 300 es
precision highp float;
precision highp sampler2D;

// the velocity texture
uniform sampler2D u_vel_tex;

// the pressure texture
uniform sampler2D u_pressure_tex;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// the output
out vec4 value;

void main() {
  // get neighboring cell distances
  vec2 resolution = vec2(textureSize(u_vel_tex, 0));
  float x_off = 1.0/resolution.x;
  float y_off = 1.0/resolution.y;

  // get pressure data
  float p01 = texture(u_pressure_tex, v_texCoord + vec2(-x_off,+0.000)).x;
  float p10 = texture(u_pressure_tex, v_texCoord + vec2(+0.000,-y_off)).x;
  float p12 = texture(u_pressure_tex, v_texCoord + vec2(+0.000,+y_off)).x;
  float p21 = texture(u_pressure_tex, v_texCoord + vec2(+x_off,+0.000)).x;

  // calculate the gradient
  // remember, the gradient is [df/dx, df/dy]
  vec2 pGradient = vec2((p21 - p01)/resolution.x, (p12 - p10)/resolution.y);

  // adjust the velocity by the pressure gradient
  vec2 vel = texture(u_vel_tex, v_texCoord).xy - pGradient;

  value = vec4(vel, 0, 0);
}
`
// this fragment shader is used to render to the canvas so we can see what's going on
const render_fs = `#version 300 es
precision highp float;
precision highp sampler2D;

// the scalar texture
uniform sampler2D u_scalar_tex;

// offset to apply
uniform float u_offset;

// the velocity texture
uniform sampler2D u_vel_tex;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// the output
out vec4 outColor;

const float ARROW_TILE_SIZE = 32.0;

// Computes the center pixel of the tile containing pixel pos
vec2 arrowTileCenterCoord(vec2 pos) {
	return (floor(pos / ARROW_TILE_SIZE) + 0.5) * ARROW_TILE_SIZE;
}

// Computes the signed distance from a line segment
float line(vec2 p, vec2 p1, vec2 p2) {
  vec2 center = (p1 + p2) * 0.5;
  float len = length(p2 - p1);
  vec2 dir = (p2 - p1) / len;
  vec2 rel_p = p - center;
  float dist1 = abs(dot(rel_p, vec2(dir.y, -dir.x)));
  float dist2 = abs(dot(rel_p, dir)) - 0.5*len;
  return max(dist1, dist2);
}

// v = field sampled at arrowTileCenterCoord(p), scaled by the length
// desired in pixels for arrows
// Returns a signed distance from the arrow
float arrow(vec2 p, vec2 v) {
  // Make everything relative to the center, which may be fractional
  p -= arrowTileCenterCoord(p);
    
  float mag_v = length(v), mag_p = length(p);
  
  if (mag_v > 0.0) {
    // Non-zero velocity case
    vec2 dir_v = v / mag_v;
    
    // We can't draw arrows larger than the tile radius, so clamp magnitude.
    // Enforce a minimum length to help see direction
    mag_v = clamp(mag_v, 5.0, ARROW_TILE_SIZE * 0.5)*2.0;

    // Arrow tip location
    v = dir_v * mag_v;

    // Signed distance from shaft
    float shaft = line(p, v, -v);
    // Signed distance from head
    float head = min(line(p, v, 0.4*v + 0.2*vec2(-v.y, v.x)),
                     line(p, v, 0.4*v + 0.2*vec2(v.y, -v.x)));

    return min(shaft, head);
  } else {
    // Signed distance from the center point
    return mag_p;
  }
}

vec3 inferno(float t) {
    const vec3 c0 = vec3(0.0002189403691192265, 0.001651004631001012, -0.01948089843709184);
    const vec3 c1 = vec3(0.1065134194856116, 0.5639564367884091, 3.932712388889277);
    const vec3 c2 = vec3(11.60249308247187, -3.972853965665698, -15.9423941062914);
    const vec3 c3 = vec3(-41.70399613139459, 17.43639888205313, 44.35414519872813);
    const vec3 c4 = vec3(77.162935699427, -33.40235894210092, -81.80730925738993);
    const vec3 c5 = vec3(-71.31942824499214, 32.62606426397723, 73.20951985803202);
    const vec3 c6 = vec3(25.13112622477341, -12.24266895238567, -23.07032500287172);

    return c0+t*(c1+t*(c2+t*(c3+t*(c4+t*(c5+t*c6)))));
}

void main() {
  // both textures are the same size
  vec2 resolution = vec2(textureSize(u_scalar_tex, 0));

  // coordinate in pixels
  vec2 pxCoord = v_texCoord*resolution;

  vec2 tileCenterCoord = arrowTileCenterCoord(pxCoord);

  vec2 vel_vec = texture(u_vel_tex, tileCenterCoord/resolution).xy;

  float arrow_dist = arrow(pxCoord, vel_vec * ARROW_TILE_SIZE);
  vec4 arrow_col = vec4(0, 1.0, 0, clamp(arrow_dist, 0.0, 1.0));

  float scalar_val = clamp(texture(u_scalar_tex, v_texCoord).x + u_offset, 0.0, 1.0);
  vec4 field_col = vec4(inferno(scalar_val), 1.0);

  outColor = vec4(mix(arrow_col.rgb, field_col.rgb, arrow_col.a), 1);
}
`

const paint_vel_fs = `#version 300 es
precision highp float;
precision highp sampler2D;

// the velocity texture
uniform sampler2D u_vel_tex;

// old mouse position
uniform vec2 u_old_mouse;
// new mouse position
uniform vec2 u_new_mouse;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// the output
out vec4 value;

float sdSegment( in vec2 p, in vec2 a, in vec2 b )
{
    vec2 pa = p-a, ba = b-a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length( pa - ba*h );
}

void main() {
  // both textures are the same size
  vec2 resolution = vec2(textureSize(u_vel_tex, 0));

  // the direction to paint in
  vec2 paintDir = 0.01*(u_new_mouse - u_old_mouse)/resolution.y;

  // coordinate in pixels
  vec2 pxCoord = v_texCoord*resolution;
  float pxDist = sdSegment(pxCoord, u_old_mouse, u_new_mouse);

  if(pxDist < 20.0) {
    value = texture(u_vel_tex, v_texCoord) + vec4(paintDir, 0, 0);
  } else {
    value = texture(u_vel_tex, v_texCoord);
  }
}
`

const coriolis_fs = `#version 300 es
precision highp float;
precision highp sampler2D;

#define PI 3.1415926538

// the velocity texture
uniform sampler2D u_vel_tex;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// the output
out vec4 value;

void main() {
  float phi = (v_texCoord.y + 0.5)*2.0*PI;

  // express the rotation vector in terms of local coordinates
  vec3 omega = vec3(
      0,
      cos(phi),
      sin(phi)
   );

  vec2 src = texture(u_vel_tex, v_texCoord).xy;

  // express the wind direction in terms of local coordinates
  vec3 v = vec3(src, 0);

  vec2 acc = cross(omega, v).xy;

  vec2 ret = src;

  // rescale so we don't get infinite energy
  if(length(acc) > 0.0) {
    ret = src; //0.05*acc;
  }

  value = vec4(ret, 0, 0);
}
`

const thermal_fs = `#version 300 es
precision highp float;
precision highp sampler2D;

#define PI 3.1415926538

// the thermal texture
uniform sampler2D u_scalar_tex;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// the output
out vec4 value;

void main() {
  const float dissipation_rate = 0.999;

  float phi = (v_texCoord.y + 0.5)*2.0*PI;
  float xComponentNormal = cos(phi);
  float added_load = 0.0;
  if(xComponentNormal > 0.0) {
      added_load = 0.001*cos(phi);
  }

  value = texture(u_scalar_tex, v_texCoord)*dissipation_rate + vec4(added_load, 0, 0, 0);
  //value = texture(u_scalar_tex, v_texCoord);
}
`


const torus_vs = `#version 300 es
#define PI 3.1415926538

in vec2 a_position;
out vec2 v_texCoord;

const float u_majorRadius = 0.5;
const float u_minorRadius = 0.25;

uniform float u_majorAlpha;
uniform float u_minorAlpha;
uniform float u_lerpAlpha;

uniform mat4 u_worldViewProjection;


void main() {
   float theta = (a_position.y * u_minorAlpha + 0.5) * 2.0 * PI;
   float phi = a_position.x * u_majorAlpha * 2.0 * PI;

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
  // color: 0xEBDBB2,
  // v_outColor = vec4(0.922,0.859,0.698, 1.0);
  v_outColor = texture(u_render_tex, v_texCoord);
}
`;

const xn = 20;
const yn = 20
const torusVertexes = genPlane(xn, yn);

type IncompressibleTorusFluidDemoState = {}

class IncompressibleTorusFluidDemo extends React.Component<IncompressibleTorusFluidDemoProps, IncompressibleTorusFluidDemoState> {

  // this is the ref to the canvas
  private canvas = React.createRef<HTMLCanvasElement>();

  // this is the ref we use to monitor sim speed
  private range = React.createRef<HTMLInputElement>();

  // this is the ref we use to choose color background
  private scalarSelect = React.createRef<HTMLSelectElement>();
  private velocitySelect = React.createRef<HTMLSelectElement>();

  private gl!: WebGL2RenderingContext;

  // the texture that shows scalar density (the value that will be advected)
  private scalarTextures: WebGLTexture[] = [];
  private scalarFramebuffers: WebGLFramebuffer[] = [];

  // the velocity textures represent the velocity field of the fluid
  private velTextures: WebGLTexture[] = [];
  private velFramebuffers: WebGLFramebuffer[] = [];

  // the divergence texture.
  // We don't need an array of these bc we don't have to ping pong
  private divTexture!: WebGLTexture;
  private divFramebuffer!: WebGLFramebuffer;

  // the pressure textures represent the velocity field of the fluid
  // we will use an iterative method to solve for pressure so we need to ping pong
  private pressureTextures: WebGLTexture[] = [];
  private pressureFramebuffers: WebGLFramebuffer[] = [];


  private newMouseLoc!: WebGLUniformLocation;
  private oldMouseLoc!: WebGLUniformLocation;

  private renderOffset!: WebGLUniformLocation;

  private prog_advect_scalar!: WebGLProgram;
  private prog_advect_vel!: WebGLProgram;
  private prog_divergence!: WebGLProgram;
  private prog_solve_pressure!: WebGLProgram;
  private prog_apply_pressure_force!: WebGLProgram;
  private prog_render!: WebGLProgram;
  private prog_paint_vel!: WebGLProgram;

  // environmental
  private prog_thermal!: WebGLProgram;
  private prog_coriolis!: WebGLProgram;

  // The index of the scalar texture we're using as a source
  private scalarIndex = 0;

  // the index of the vel texture we're using as a source
  private velIndex = 0;

  // the index of the pressure texture we're using as a source
  private pressureIndex = 0;

  // whether we need to reset on the next frame
  private needsScalarReset = true;
  private needsVelocityReset = true;

  // mouse status
  private cmt!: CanvasMouseTracker;

  // if we're viewing pressure
  private viewPressure = false;

  private requestID!: number;


  // this is the ref we use to monitor circularization
  private torusnessRange = React.createRef<HTMLInputElement>();

  private majorRange = React.createRef<HTMLInputElement>();
  private minorRange = React.createRef<HTMLInputElement>();
  private lerpRange = React.createRef<HTMLInputElement>();

  // this is the ref to the canvas
  private torusCanvas = React.createRef<HTMLCanvasElement>();
  private torusGl!: WebGL2RenderingContext;

  private camera!: TrackballCamera;

  private torusTexture!: WebGLTexture;

  private torusWorldViewProjectionLoc!: WebGLUniformLocation;
  private torusMajorAlpha!: WebGLUniformLocation;
  private torusMinorAlpha!: WebGLUniformLocation;
  private torusLerpAlpha!: WebGLUniformLocation;

  constructor(props: IncompressibleTorusFluidDemoProps) {
    super(props);
  }

  componentDidMount() {
    // get webgl
    this.gl = this.canvas.current!.getContext('webgl2')!;

    const ext = this.gl.getExtension('EXT_color_buffer_float');

    // setup a full canvas clip space quad
    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
      0, 0,
      1, 0,
      0, 1,
      0, 1,
      1, 0,
      1, 1,
    ]), this.gl.STATIC_DRAW);



    // create pingpongable textures and framebuffers for the scalar field
    for (let i = 0; i < 2; i++) {
      const tex = createR32FTexture(this.gl, this.props.xsize, this.props.ysize, new Float32Array(this.props.xsize*this.props.ysize))!;
      this.scalarTextures.push(tex);

      const fbo = this.gl.createFramebuffer()!;
      // this makes fbo the current active framebuffer
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fbo);
      // configure the currently active framebuffer to use te
      this.gl.framebufferTexture2D(
        this.gl.FRAMEBUFFER, // will bind as a framebuffer
        this.gl.COLOR_ATTACHMENT0, // Attaches the texture to the framebuffer's color buffer. 
        this.gl.TEXTURE_2D, // we have a 2d texture
        tex, // the texture to attach
        0 // the mipmap level (we don't want mipmapping, so we set to 0)
      );
      // push framebuffer
      this.scalarFramebuffers.push(fbo);
    }

    // create pingpongable textures and framebuffers for the velocity field
    for (let i = 0; i < 2; i++) {
      // create velocity texture
      const tex = createRG32FTexture(this.gl, this.props.xsize, this.props.ysize, new Float32Array(this.props.xsize*this.props.ysize*2))!;

      this.velTextures.push(tex);

      const fbo = this.gl.createFramebuffer()!;
      // this makes fbo the current active framebuffer
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fbo);
      // configure the currently active framebuffer to use te
      this.gl.framebufferTexture2D(
        this.gl.FRAMEBUFFER, // will bind as a framebuffer
        this.gl.COLOR_ATTACHMENT0, // Attaches the texture to the framebuffer's color buffer. 
        this.gl.TEXTURE_2D, // we have a 2d texture
        tex, // the texture to attach
        0 // the mipmap level (we don't want mipmapping, so we set to 0)
      );
      // push framebuffer
      this.velFramebuffers.push(fbo);
    }

    // create pingpongable textures and framebuffers for the divergence field
    // create divergence texture
    this.divTexture = createR32FTexture(this.gl, this.props.xsize, this.props.ysize, new Float32Array(this.props.xsize*this.props.ysize))!;
    this.divFramebuffer = this.gl.createFramebuffer()!;
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.divFramebuffer);
    // configure the currently active framebuffer to use te
    this.gl.framebufferTexture2D(
      this.gl.FRAMEBUFFER, // will bind as a framebuffer
      this.gl.COLOR_ATTACHMENT0, // Attaches the texture to the framebuffer's color buffer. 
      this.gl.TEXTURE_2D, // we have a 2d texture
      this.divTexture, // the texture to attach
      0 // the mipmap level (we don't want mipmapping, so we set to 0)
    );

    // create pingpongable textures and framebuffers for the pressure field
    for (let i = 0; i < 2; i++) {
      // create pressure texture
      const tex = createR32FTexture(this.gl, this.props.xsize, this.props.ysize, new Float32Array(this.props.xsize*this.props.ysize))!;

      this.pressureTextures.push(tex);

      const fbo = this.gl.createFramebuffer()!;
      // this makes fbo the current active framebuffer
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fbo);
      // configure the currently active framebuffer to use te
      this.gl.framebufferTexture2D(
        this.gl.FRAMEBUFFER, // will bind as a framebuffer
        this.gl.COLOR_ATTACHMENT0, // Attaches the texture to the framebuffer's color buffer. 
        this.gl.TEXTURE_2D, // we have a 2d texture
        tex, // the texture to attach
        0 // the mipmap level (we don't want mipmapping, so we set to 0)
      );
      // push framebuffer
      this.pressureFramebuffers.push(fbo);
    }


    // build the compute program
    {
      // create program
      this.prog_advect_scalar = createProgram(
        this.gl,
        [
          createShader(this.gl, this.gl.VERTEX_SHADER, vs),
          createShader(this.gl, this.gl.FRAGMENT_SHADER, advect_scalar_fs),
        ]
      )!;

      const positionLoc = this.gl.getAttribLocation(this.prog_advect_scalar, 'c_position');
      const scalarTexLoc = this.gl.getUniformLocation(this.prog_advect_scalar, 'u_scalar_tex');
      const velTexLoc = this.gl.getUniformLocation(this.prog_advect_scalar, 'u_vel_tex');

      // setup our attributes to tell WebGL how to pull
      // the data from the buffer above to the position attribute
      this.gl.enableVertexAttribArray(positionLoc);
      this.gl.vertexAttribPointer(
        positionLoc,
        2,         // size (num components)
        this.gl.FLOAT,  // type of data in buffer
        false,     // normalize
        0,         // stride (0 = auto)
        0,         // offset
      );

      // bind uniforms
      this.gl.useProgram(this.prog_advect_scalar);
      // Tell the shader to get the scalar texture from texture unit 0
      this.gl.uniform1i(scalarTexLoc, 0);
      // Tell the shader to get the velocity texture from texture unit 1
      this.gl.uniform1i(velTexLoc, 1);
    }

    {
      // create program
      this.prog_advect_vel = createProgram(
        this.gl,
        [
          createShader(this.gl, this.gl.VERTEX_SHADER, vs),
          createShader(this.gl, this.gl.FRAGMENT_SHADER, advect_vel_fs),
        ]
      )!;

      const positionLoc = this.gl.getAttribLocation(this.prog_advect_vel, 'c_position');
      const velTexLoc = this.gl.getUniformLocation(this.prog_advect_vel, 'u_vel_tex');

      // setup our attributes to tell WebGL how to pull
      // the data from the buffer above to the position attribute
      this.gl.enableVertexAttribArray(positionLoc);
      this.gl.vertexAttribPointer(
        positionLoc,
        2,         // size (num components)
        this.gl.FLOAT,  // type of data in buffer
        false,     // normalize
        0,         // stride (0 = auto)
        0,         // offset
      );

      // bind uniforms
      this.gl.useProgram(this.prog_advect_vel);
      // Tell the shader to get the velocity texture from texture unit 1
      this.gl.uniform1i(velTexLoc, 1);
    }

    {
      // create program
      this.prog_divergence = createProgram(
        this.gl,
        [
          createShader(this.gl, this.gl.VERTEX_SHADER, vs),
          createShader(this.gl, this.gl.FRAGMENT_SHADER, divergence_fs),
        ]
      )!;

      const positionLoc = this.gl.getAttribLocation(this.prog_divergence, 'c_position');
      const velTexLoc = this.gl.getUniformLocation(this.prog_divergence, 'u_vel_tex');

      // setup our attributes to tell WebGL how to pull
      // the data from the buffer above to the position attribute
      this.gl.enableVertexAttribArray(positionLoc);
      this.gl.vertexAttribPointer(
        positionLoc,
        2,         // size (num components)
        this.gl.FLOAT,  // type of data in buffer
        false,     // normalize
        0,         // stride (0 = auto)
        0,         // offset
      );

      // bind uniforms
      this.gl.useProgram(this.prog_divergence);
      // Tell the shader to get the velocity texture from texture unit 1
      this.gl.uniform1i(velTexLoc, 1);
    }

    {
      // create program
      this.prog_solve_pressure = createProgram(
        this.gl,
        [
          createShader(this.gl, this.gl.VERTEX_SHADER, vs),
          createShader(this.gl, this.gl.FRAGMENT_SHADER, solve_pressure_fs),
        ]
      )!;

      const positionLoc = this.gl.getAttribLocation(this.prog_solve_pressure, 'c_position');
      const divergenceTexLoc = this.gl.getUniformLocation(this.prog_solve_pressure, 'u_divergence_tex');
      const pressureTexLoc = this.gl.getUniformLocation(this.prog_solve_pressure, 'u_pressure_tex');

      // setup our attributes to tell WebGL how to pull
      // the data from the buffer above to the position attribute
      this.gl.enableVertexAttribArray(positionLoc);
      this.gl.vertexAttribPointer(
        positionLoc,
        2,         // size (num components)
        this.gl.FLOAT,  // type of data in buffer
        false,     // normalize
        0,         // stride (0 = auto)
        0,         // offset
      );

      // bind uniforms
      this.gl.useProgram(this.prog_solve_pressure);
      // Tell the shader to get the divergence texture from texture unit 2
      this.gl.uniform1i(divergenceTexLoc, 2);
      // Tell the shader to get the pressure texture from texture unit 3
      this.gl.uniform1i(pressureTexLoc, 3);
    }

    {
      // create program
      this.prog_apply_pressure_force = createProgram(
        this.gl,
        [
          createShader(this.gl, this.gl.VERTEX_SHADER, vs),
          createShader(this.gl, this.gl.FRAGMENT_SHADER, apply_pressure_force_fs),
        ]
      )!;

      const positionLoc = this.gl.getAttribLocation(this.prog_apply_pressure_force, 'c_position');
      const velTexLoc = this.gl.getUniformLocation(this.prog_apply_pressure_force, 'u_vel_tex');
      const pressureTexLoc = this.gl.getUniformLocation(this.prog_apply_pressure_force, 'u_pressure_tex');

      // setup our attributes to tell WebGL how to pull
      // the data from the buffer above to the position attribute
      this.gl.enableVertexAttribArray(positionLoc);
      this.gl.vertexAttribPointer(
        positionLoc,
        2,         // size (num components)
        this.gl.FLOAT,  // type of data in buffer
        false,     // normalize
        0,         // stride (0 = auto)
        0,         // offset
      );

      // bind uniforms
      this.gl.useProgram(this.prog_apply_pressure_force);
      // Tell the shader to get the vel texture from texture unit 1
      this.gl.uniform1i(velTexLoc, 1);
      // Tell the shader to get the pressure texture from texture unit 3
      this.gl.uniform1i(pressureTexLoc, 3);
    }


    // build the render program
    {
      // create program
      this.prog_render = createProgram(
        this.gl,
        [
          createShader(this.gl, this.gl.VERTEX_SHADER, vs),
          createShader(this.gl, this.gl.FRAGMENT_SHADER, render_fs),
        ]
      )!;

      const positionLoc = this.gl.getAttribLocation(this.prog_render, 'c_position');
      const scalarTexLoc = this.gl.getUniformLocation(this.prog_render, 'u_scalar_tex');
      const velTexLoc = this.gl.getUniformLocation(this.prog_render, 'u_vel_tex');
      this.renderOffset = this.gl.getUniformLocation(this.prog_render, 'u_offset')!;

      // setup our attributes to tell WebGL how to pull
      // the data from the buffer above to the position attribute
      this.gl.enableVertexAttribArray(positionLoc);
      this.gl.vertexAttribPointer(
        positionLoc,
        2,         // size (num components)
        this.gl.FLOAT,  // type of data in buffer
        false,     // normalize
        0,         // stride (0 = auto)
        0,         // offset
      );

      // bind uniforms
      this.gl.useProgram(this.prog_render);

      // Tell the shader to get the scalar texture from texture unit 0
      this.gl.uniform1i(scalarTexLoc, 0);

      // Tell the shader to get the velocity texture from texture unit 1
      this.gl.uniform1i(velTexLoc, 1);
    }

    // build the paint on vel texture program
    {
      // create program
      this.prog_paint_vel = createProgram(
        this.gl,
        [
          createShader(this.gl, this.gl.VERTEX_SHADER, vs),
          createShader(this.gl, this.gl.FRAGMENT_SHADER, paint_vel_fs),
        ]
      )!;

      const positionLoc = this.gl.getAttribLocation(this.prog_paint_vel, 'c_position');
      const velTexLoc = this.gl.getUniformLocation(this.prog_paint_vel, 'u_vel_tex');
      this.newMouseLoc = this.gl.getUniformLocation(this.prog_paint_vel, 'u_new_mouse')!;
      this.oldMouseLoc = this.gl.getUniformLocation(this.prog_paint_vel, 'u_old_mouse')!;

      // setup our attributes to tell WebGL how to pull
      // the data from the buffer above to the position attribute
      this.gl.enableVertexAttribArray(positionLoc);
      this.gl.vertexAttribPointer(
        positionLoc,
        2,         // size (num components)
        this.gl.FLOAT,  // type of data in buffer
        false,     // normalize
        0,         // stride (0 = auto)
        0,         // offset
      );

      // bind uniforms
      this.gl.useProgram(this.prog_paint_vel);

      // Tell the shader to get the velocity texture from texture unit 1
      this.gl.uniform1i(velTexLoc, 1);
    }

    // build the thermal program
    {
      // create program
      this.prog_thermal = createProgram(
        this.gl,
        [
          createShader(this.gl, this.gl.VERTEX_SHADER, vs),
          createShader(this.gl, this.gl.FRAGMENT_SHADER, thermal_fs),
        ]
      )!;

      const positionLoc = this.gl.getAttribLocation(this.prog_thermal, 'c_position');
      const scalarTexLoc = this.gl.getUniformLocation(this.prog_thermal, 'u_scalar_tex');

      // setup our attributes to tell WebGL how to pull
      // the data from the buffer above to the position attribute
      this.gl.enableVertexAttribArray(positionLoc);
      this.gl.vertexAttribPointer(
        positionLoc,
        2,         // size (num components)
        this.gl.FLOAT,  // type of data in buffer
        false,     // normalize
        0,         // stride (0 = auto)
        0,         // offset
      );

      // bind uniforms
      this.gl.useProgram(this.prog_thermal);

      // Tell the shader to get the scalar texture from texture unit 1
      this.gl.uniform1i(scalarTexLoc , 0);
    }

    // build the coriolis program
    {
      // create program
      this.prog_coriolis = createProgram(
        this.gl,
        [
          createShader(this.gl, this.gl.VERTEX_SHADER, vs),
          createShader(this.gl, this.gl.FRAGMENT_SHADER, coriolis_fs),
        ]
      )!;

      const positionLoc = this.gl.getAttribLocation(this.prog_coriolis, 'c_position');
      const velTexLoc = this.gl.getUniformLocation(this.prog_coriolis, 'u_vel_tex');

      // setup our attributes to tell WebGL how to pull
      // the data from the buffer above to the position attribute
      this.gl.enableVertexAttribArray(positionLoc);
      this.gl.vertexAttribPointer(
        positionLoc,
        2,         // size (num components)
        this.gl.FLOAT,  // type of data in buffer
        false,     // normalize
        0,         // stride (0 = auto)
        0,         // offset
      );

      // bind uniforms
      this.gl.useProgram(this.prog_coriolis);

      // Tell the shader to get the vel texture from texture unit 1
      this.gl.uniform1i(velTexLoc , 1);
    }

    {
      // init camera
      this.camera = new TrackballCamera(this.torusCanvas.current!, {});

      // get webgl
      this.torusGl = this.torusCanvas.current!.getContext('webgl2', { premultipliedAlpha: false })!;
      this.torusGl.enable(this.torusGl.DEPTH_TEST);

      // create texture
      this.torusTexture = createTexture(this.torusGl, this.props.torussize, this.props.torussize)!;

      const program = createProgram(
        this.torusGl,
        [
          createShader(this.torusGl, this.torusGl.VERTEX_SHADER, torus_vs),
          createShader(this.torusGl, this.torusGl.FRAGMENT_SHADER, torus_fs),
        ]
      )!;

      const positionLoc = this.torusGl.getAttribLocation(program, 'a_position');
      const renderTexLoc = this.torusGl.getUniformLocation(program, "u_render_tex");
      this.torusMajorAlpha = this.torusGl.getUniformLocation(program, "u_majorAlpha")!;
      this.torusMinorAlpha = this.torusGl.getUniformLocation(program, "u_minorAlpha")!;
      this.torusLerpAlpha = this.torusGl.getUniformLocation(program, "u_lerpAlpha")!;

      this.torusWorldViewProjectionLoc = this.torusGl.getUniformLocation(program, "u_worldViewProjection")!;

      const buffer = this.torusGl.createBuffer();
      this.torusGl.bindBuffer(this.torusGl.ARRAY_BUFFER, buffer);
      this.torusGl.bufferData(
        this.torusGl.ARRAY_BUFFER,
        new Float32Array(torusVertexes.flatMap(x => ([x[0], x[1]]))),
        this.torusGl.STATIC_DRAW
      );
      // setup our attributes to tell WebGL how to pull
      // the data from the buffer above to the position attribute
      this.torusGl.enableVertexAttribArray(positionLoc);
      this.torusGl.vertexAttribPointer(
        positionLoc,
        2,                   // size (num components)
        this.torusGl.FLOAT,  // type of data in buffer
        false,          // normalize
        0,              // stride (0 = auto)
        0,              // offset
      );

      this.torusGl.useProgram(program);

      // set defaults
      this.torusGl.uniform1f(this.torusMajorAlpha, 0.0);
      this.torusGl.uniform1f(this.torusMinorAlpha, 0.0);
      this.torusGl.uniform1f(this.torusLerpAlpha, 0.0);

      // Tell the shader to get the render texture from texture unit 0
      this.torusGl.uniform1i(renderTexLoc, 0);
    }

    this.torusnessRange.current!.addEventListener('input', this.handleTorusChange);
    this.majorRange.current!.addEventListener('input', this.handleCircularityChange);
    this.minorRange.current!.addEventListener('input', this.handleCircularityChange);
    this.lerpRange.current!.addEventListener('input', this.handleCircularityChange);

    // begin monitoring mouse location
    this.cmt = new CanvasMouseTracker(this.canvas.current!);

    // start animation loop
    this.animationLoop();
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

    this.torusGl.uniform1f(this.torusMajorAlpha, majorAlpha);
    this.torusGl.uniform1f(this.torusMinorAlpha, minorAlpha);
    this.torusGl.uniform1f(this.torusLerpAlpha, lerpAlpha);
  }

  componentWillUnmount() {
    // clean up mouse tracker
    this.cmt.cleanup();

    // remove listeners on thing
    this.torusnessRange.current!.removeEventListener('input', this.handleTorusChange);
    this.majorRange.current!.removeEventListener('input', this.handleCircularityChange);
    this.minorRange.current!.removeEventListener('input', this.handleCircularityChange);
    this.lerpRange.current!.removeEventListener('input', this.handleCircularityChange);

    // stop animation loop
    window.cancelAnimationFrame(this.requestID!);
    // destroy webgl
    this.gl.getExtension('WEBGL_lose_context')!.loseContext();
    this.torusGl.getExtension('WEBGL_lose_context')!.loseContext();

    this.camera.cleanup();
  }

  animationLoop = () => {
    this.requestID = window.requestAnimationFrame(this.animationLoop);
    this.camera.update();

    // handle drawing
    const mousePos = this.cmt.mousePos;
    if (mousePos) {
      // in order to draw the velocity texture we will execute a program
      this.gl.useProgram(this.prog_paint_vel);

      // bind the source velocity texture to texture unit 1
      this.gl.activeTexture(this.gl.TEXTURE1);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.velTextures[this.velIndex]);
      // set the framebuffer to draw at the other velocity texture
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.velFramebuffers[(this.velIndex + 1) % 2]);

      // set old and new mouse positions
      this.gl.uniform2f(this.oldMouseLoc,
        clamp(mousePos.previous.x, 0, this.props.xsize),
        clamp(this.props.ysize - mousePos.previous.y, 0, this.props.ysize),
      );
      this.gl.uniform2f(this.newMouseLoc,
        clamp(mousePos.current.x, 0, this.props.xsize),
        clamp(this.props.ysize - mousePos.current.y, 0, this.props.ysize),
      );

      // execute program, doing paint
      this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

      this.velIndex = (this.velIndex + 1) % 2;
    }

    if (this.needsScalarReset) {
      const size = this.props.ysize;
      // select the scalar texture being used as a source
      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.scalarTextures[this.scalarIndex]);
      // overwrite the whole thing with a checkerboard
      const checkerboardCount = parseInt(this.scalarSelect.current?.value!);
      const resetScalarFieldTex = new Float32Array(this.props.xsize * this.props.ysize)
      for (let y = 0; y < this.props.ysize; y++) {
        const b = Math.floor(y / (size / checkerboardCount)) % 2;
        for (let x = 0; x < this.props.xsize; x++) {
          const a = Math.floor(x / (size / checkerboardCount)) % 2;
          if (a + b == 1) {
            resetScalarFieldTex[y * this.props.xsize + x] = 1;
          } else {
            resetScalarFieldTex[y * this.props.xsize + x] = 0;
          }
        }
      }
      overwriteR32FTexture(this.gl, 0, 0, this.props.xsize, this.props.ysize, resetScalarFieldTex);
      this.needsScalarReset = false;
    }

    if (this.needsVelocityReset) {
      // select the pressure texture being used as a source
      this.gl.activeTexture(this.gl.TEXTURE3);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.pressureTextures[this.pressureIndex]);
      // overwrite pressure with 0
      overwriteR32FTexture(this.gl, 0, 0, this.props.xsize, this.props.ysize, new Float32Array(this.props.xsize * this.props.ysize));


      // select the vel texture being used as a source
      this.gl.activeTexture(this.gl.TEXTURE1);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.velTextures[this.velIndex]);

      // overwrite the velocity field with what se select
      let data;
      switch (this.velocitySelect.current?.value) {
        case 'curlnoise':
          data = createCurlNoise(3,this.props.xsize, this.props.ysize, Math.random() * 500);
          break;
        default:
          data = new Float32Array(this.props.xsize * this.props.ysize * 2);
          break;
      }
      overwriteRG32FTexture(this.gl, 0, 0, this.props.xsize, this.props.ysize, data);

      this.needsVelocityReset = false;
    }


    for (let i = 0; i < this.range.current!.valueAsNumber; i++) {

      // do thermal
      {
        this.gl.useProgram(this.prog_thermal);

        // make tex the texture to read from at texture0
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.scalarTextures[this.scalarIndex]);

        // make fbo corresponding to the next texture the current framebuffer
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.scalarFramebuffers[(this.scalarIndex + 1) % 2]);

        // execute draw to the next framebuffer
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        // swap source and dest for the next frame
        this.scalarIndex = (this.scalarIndex + 1) % 2;
      }

      // do coriolis
      {
        this.gl.useProgram(this.prog_coriolis);

        // bind the source velocity texture to texture unit 1
        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.velTextures[this.velIndex]);

        // set the framebuffer to draw at the other velocity texture
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.velFramebuffers[(this.velIndex + 1) % 2]);

        // execute program, doing paint
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        // swap source and dest for the next frame
        this.velIndex = (this.velIndex + 1) % 2;
      }

      // we will advect scalar now
      {
        this.gl.useProgram(this.prog_advect_scalar);

        // make tex the texture to read from at texture0
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.scalarTextures[this.scalarIndex]);

        // make fbo corresponding to the next texture the current framebuffer
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.scalarFramebuffers[(this.scalarIndex + 1) % 2]);

        // execute draw to the next framebuffer
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        // swap source and dest for the next frame
        this.scalarIndex = (this.scalarIndex + 1) % 2;
      }

      // now advect vel field
      {
        this.gl.useProgram(this.prog_advect_vel);

        // bind the source velocity texture to texture unit 1
        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.velTextures[this.velIndex]);

        // set the framebuffer to draw at the other velocity texture
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.velFramebuffers[(this.velIndex + 1) % 2]);

        // execute program, doing paint
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        // swap source and dest for the next frame
        this.velIndex = (this.velIndex + 1) % 2;
      }

      // now calculate divergence
      {
        this.gl.useProgram(this.prog_divergence);

        // bind the velocity texture to texture unit 1
        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.velTextures[this.velIndex]);

        // set the framebuffer to draw at the divergence texture
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.divFramebuffer);

        // execute program, doing paint
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
      }

      // now iteratively calculate pressure
      {
        this.gl.useProgram(this.prog_solve_pressure);

        // we execute multiple iterations of jacobi
        for (let i = 0; i < 15; i++) {
          // bind the divergence texture to texture unit 2
          this.gl.activeTexture(this.gl.TEXTURE2);
          this.gl.bindTexture(this.gl.TEXTURE_2D, this.divTexture);

          // bind the source pressure texture to texture unit 3
          this.gl.activeTexture(this.gl.TEXTURE3);
          this.gl.bindTexture(this.gl.TEXTURE_2D, this.pressureTextures[this.pressureIndex]);

          // set the framebuffer to draw at the other velocity texture
          this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.pressureFramebuffers[(this.pressureIndex + 1) % 2]);

          // execute program, doing paint
          this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

          // swap source and dest for the next frame
          this.pressureIndex = (this.pressureIndex + 1) % 2;
        }
      }

      // now apply pressure gradient to the velocity field
      {
        this.gl.useProgram(this.prog_apply_pressure_force);

        // bind the pressure texture to texture unit 3
        this.gl.activeTexture(this.gl.TEXTURE3);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.pressureTextures[this.pressureIndex]);

        // bind the source velocity texture to texture unit 1
        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.velTextures[this.velIndex]);

        // set the framebuffer to draw at the other velocity texture
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.velFramebuffers[(this.velIndex + 1) % 2]);

        // execute program, doing paint
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        // swap source and dest for the next frame
        this.velIndex = (this.velIndex + 1) % 2;
      }
    }
    {
      // now draw to canvas
      this.gl.useProgram(this.prog_render);

      if (this.viewPressure) {
        //bind the pressure texture to texture unit 0
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.pressureTextures[this.pressureIndex]);
        // this.gl.bindTexture(this.gl.TEXTURE_2D, this.divTexture);
        this.gl.uniform1f(this.renderOffset, 0.5);
      } else {
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.scalarTextures[this.scalarIndex]);
        this.gl.uniform1f(this.renderOffset, 0);
      }

      // set the canvas as the current framebuffer
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
      // execute draw to canvas
      this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }

    {
      // set uniform
      const worldViewProjectionMat = this.camera.getTrackballCameraMatrix(this.props.torussize, this.props.torussize);
      this.torusGl.uniformMatrix4fv(this.torusWorldViewProjectionLoc, false, worldViewProjectionMat);

      // update the texture
      updateTextureFromCanvas(this.torusGl, this.torusTexture, this.canvas.current!);

      // bind the newly updated texture to texture unit 0
      this.torusGl.activeTexture(this.torusGl.TEXTURE0);
      this.torusGl.bindTexture(this.torusGl.TEXTURE_2D, this.torusTexture);

      // settings
      this.torusGl.enable(this.torusGl.BLEND);
      this.torusGl.blendFunc(this.torusGl.SRC_ALPHA, this.torusGl.ONE_MINUS_SRC_ALPHA);

      // draw triangles
      this.torusGl.drawArrays(this.torusGl.TRIANGLES, 0, torusVertexes.length);
    }
  }

  render() {
    return <div style={this.props.style} className={this.props.className}>
      <div className="row">
        <div className="col-md-8 d-flex">
          <div>
            <canvas
              className="border border-dark mx-3 my-3"
              ref={this.canvas}
              width={this.props.xsize}
              height={this.props.ysize}
            />
            <canvas
              className="border border-dark mx-3 my-3"
              ref={this.torusCanvas}
              width={this.props.torussize}
              height={this.props.torussize}
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="border border-dark p-3 m-3">
            <div className="form-group mb-3">
              <label className="form-label">Simulation Speed</label>
              <input type="range" className="form-range" min="0" max="5" step={1} defaultValue={1} ref={this.range} />
            </div>
            <div className="form-group mb-3">
              <label className="form-label">Scalar Field</label>
              <select className="form-select mb-3" defaultValue={8} ref={this.scalarSelect}>
                <option value={1}>Empty</option>
                <option value={2}>Grid 2</option>
                <option value={8}>Grid 8</option>
                <option value={64}>Grid 64</option>
              </select>
              <button className="btn btn-primary btn-sm" onClick={() => this.needsScalarReset = true}>Reset Scalar</button>
            </div>
            <div className="form-group mb-3">
              <label className="form-label">Velocity Field</label>
              <select className="form-select mb-3" defaultValue={8} ref={this.velocitySelect}>
                <option value="empty">Empty</option>
                <option value="curlnoise">Curl Noise</option>
              </select>
              <button className="btn btn-primary btn-sm" onClick={() => this.needsVelocityReset = true}>Reset Velocity</button>
            </div>

            <div className="form-group mb-3">
              <div className="form-check">
                <input type="checkbox" className="form-check-input" onClick={() => this.viewPressure = !this.viewPressure} />
                <label className="form-check-label">View Pressure</label>
              </div>
            </div>
          </div>

          <div className="border border-dark p-3 m-3">
            <div className="form-group mb-3">
              <label className="form-label">Torusness</label>
              <input type="range" className="form-range" min="0" max="1" step="0.05" defaultValue="0" ref={this.torusnessRange} />
            </div>

            <div className="form-group mb-3">
              <details>
                <summary>Advanced Torus Controls</summary>
                <div className="mx-auto d-block flex-grow-1 ">
                  <label className="form-label">Join Major</label>
                  <input type="range" className="form-range" min="0" max="1" step="0.05" defaultValue="0" ref={this.majorRange} />
                </div>
                <div className="mx-auto d-block flex-grow-1 ">
                  <label className="form-label">Join Minor</label>
                  <input type="range" className="form-range" min="0" max="1" step="0.05" defaultValue="0" ref={this.minorRange} />
                </div>
                <div className="mx-auto d-block flex-grow-1 ">
                  <label className="form-label">Alpha</label>
                  <input type="range" className="form-range" min="0" max="1" step="0.05" defaultValue="0" ref={this.lerpRange} />
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  }
}

export default IncompressibleTorusFluidDemo;
