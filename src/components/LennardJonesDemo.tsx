import React from "react";
import {
  createShader,
  createProgram,
  createRGBA32FTexture,
  overwriteRGBA32FTexture,
  createRG32ITexture,
  overwriteRG32ITexture
} from '../utils/webgl';
import { clamp } from '../utils/math';
import { createCurlNoise } from '../utils/noise';
import { CanvasMouseTracker, Point } from "../utils/canvas";

type WebGL2FluidAdvectionDemoProps = {
  style?: React.CSSProperties,
  className?: string
  xsize: number
  ysize: number
}

// the vertex shader is used in 2 different programs, it basically is just for translating clip space
const vs = `#version 300 es
in vec2 a_position;
out vec2 v_texCoord;

void main() {
  v_texCoord = a_position;

  // convert from 0->1 to 0->2
  // convert from 0->2 to -1->+1 (clip space)
  vec2 clipSpace = (a_position * 2.0) - 1.0;

  gl_Position = vec4(clipSpace, 0, 1);
}
`;

// this fragment shader applies the gravitational force to all particles
const apply_gravity_fs = `#version 300 es
precision highp float;
precision highp sampler2D;
precision highp isampler2D;

// the particle texture
uniform isampler2D u_particle_state_tex;

// the position / velocity texture
uniform sampler2D u_particle_position_velocity_tex;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// the output
out vec4 value;

uniform float u_x_gravity;
uniform float u_y_gravity;
uniform float u_viscosity;
uniform float u_repulsion;
uniform float u_attraction;
uniform float u_wall_spring_damping;
uniform float u_wall_spring_constant;

uniform vec2 u_dimensions;

void main() {
  // get the resolution
  ivec2 resolution = textureSize(u_particle_state_tex, 0);

  // our current position and velocity
  vec2 p1 = texture(u_particle_position_velocity_tex, v_texCoord).xy;
  vec2 v1 = texture(u_particle_position_velocity_tex, v_texCoord).zw;

  // our current state and mass
  int state1 = texture(u_particle_state_tex, v_texCoord).x;
  float m1 = float(texture(u_particle_state_tex, v_texCoord).y);

  if(state1 == 0) {
    for(int y = 0; y < resolution.y; y++) {
      for(int x = 0; x < resolution.x; x++) {
        ivec2 loc2 = ivec2(x, y);
        int state2 = texelFetch(u_particle_state_tex, loc2, 0).x;
        float m2 = float(texelFetch(u_particle_state_tex, loc2, 0).y);
        if(state2 == 0) {
          vec2 p2 = texelFetch(u_particle_position_velocity_tex, loc2, 0).xy;

          vec2 r_vec = p2-p1;
          float r = length(r_vec);
          vec2 r_hat = r_vec/r;

          float force_strength = u_attraction*pow(r, -7.0) - u_repulsion*pow(r, -13.0);
          vec2 accel = r_hat*clamp(force_strength/m1, -0.1, 0.1);

          if(!isnan(accel.x) && !isnan(accel.y)) {
            v1 += accel;
          }
        }
      }
    }

    v1 *= (1.0-u_viscosity);
  
    v1.x += u_x_gravity;
    v1.y += u_y_gravity;
  
    float xl = 10.0;
    float yl = 10.0;
    float xg = u_dimensions.x - 10.0;
    float yg = u_dimensions.y - 10.0;
  
    if(p1.x < xl) {
      v1.x = u_wall_spring_damping*v1.x + u_wall_spring_constant*pow(p1.x-xl, 2.0);
    }
    if(p1.x > xg) {
      v1.x = u_wall_spring_damping*v1.x -u_wall_spring_constant*pow(p1.x-xg, 2.0);
    }
    if(p1.y < yl) {
      v1.y = u_wall_spring_damping*v1.y + u_wall_spring_constant*pow(p1.y-yl, 2.0);
    }
    if(p1.y > yg) {
      v1.y = u_wall_spring_damping*v1.y -u_wall_spring_constant*pow(p1.y-yg, 2.0);
    }
  
  
    // apply new values
    value = vec4(p1 + v1, v1);
  } else {
    // do nothing if state == 1
    value = vec4(p1, v1);
  }
}
`;


// this fragment shader applies the gravitational force to all particles
const apply_mouse_fs = `#version 300 es
precision highp float;
precision highp sampler2D;
precision highp isampler2D;

// the particle texture
uniform isampler2D u_particle_state_tex;

// the position / velocity texture
uniform sampler2D u_particle_position_velocity_tex;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// the output
out vec4 value;

// new mouse position
uniform vec2 u_mouse;

void main() {
  // our current position and velocity
  vec2 p1 = texture(u_particle_position_velocity_tex, v_texCoord).xy;
  vec2 v1 = texture(u_particle_position_velocity_tex, v_texCoord).zw;

  // our current state and mass
  int state1 = texture(u_particle_state_tex, v_texCoord).x;

  if(state1 == 0) {
      vec2 p_to_mouse = u_mouse - p1;
      float d = length(p_to_mouse);
      if(d < 50.0) {
          v1 += 0.01*(p_to_mouse/(d));
          v1 *= 0.9;
      }
  }

  // apply new values
  value = vec4(p1, v1);
}
`;


// a no-op for now
const handle_state_fs = `#version 300 es
precision highp float;
precision highp sampler2D;
precision highp isampler2D;

// the state texture
uniform isampler2D u_particle_state_tex;

// the position texture
uniform sampler2D u_particle_position_velocity_tex;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// the output
out ivec4 value;

uniform vec2 u_dimensions;


void main() {
  vec2 upperCorner = vec2(0, 0);
  vec2 lowerCorner = u_dimensions;

  int state = texture(u_particle_state_tex, v_texCoord).x;
  int mass = texture(u_particle_state_tex, v_texCoord).y;
  vec2 position = texture(u_particle_position_velocity_tex, v_texCoord).xy;
  if(position == clamp(position, upperCorner, lowerCorner)) {
    value = ivec4(state, mass, 0, 1);
  } else {
    value = ivec4(state, mass, 0, 1);
  }
}
`;


type WebGL2FluidAdvectionDemoState = {}

class WebGL2FluidAdvectionDemo extends React.Component<WebGL2FluidAdvectionDemoProps, WebGL2FluidAdvectionDemoState> {

  private xsize = 40;
  private ysize = 40;

  private particle_tex_xsize = 40;
  private particle_tex_ysize = 40;

  // this is the ref to the canvas we use to work with particles
  private particle_canvas = React.createRef<HTMLCanvasElement>();

  // mouse status
  private cmt!: CanvasMouseTracker;

  // this is the ref to the canvas we use to render
  private render_canvas = React.createRef<HTMLCanvasElement>();

  // this is the ref we use to monitor sim speed
  private range = React.createRef<HTMLInputElement>();

  private readonly gravityDefault = 0;
  private readonly viscosityDefault = 0;
  private readonly attractionDefault = 1;
  private readonly repulsionDefault = 5000;
  private readonly wallSpringConstantDefault = 0.001;
  private readonly wallSpringDampingDefault = 0.99;


  private xGravityRange = React.createRef<HTMLInputElement>();
  private yGravityRange = React.createRef<HTMLInputElement>();
  private viscosityRange = React.createRef<HTMLInputElement>();
  private attractionRange = React.createRef<HTMLInputElement>();
  private repulsionRange = React.createRef<HTMLInputElement>();
  private wallSpringConstantRange = React.createRef<HTMLInputElement>();
  private wallSpringDampingRange = React.createRef<HTMLInputElement>();

  // this is the ref we use to choose color background
  private scalarSelect = React.createRef<HTMLSelectElement>();
  private velocitySelect = React.createRef<HTMLSelectElement>();

  private gl!: WebGL2RenderingContext;

  private xGravityLoc!: WebGLUniformLocation;
  private yGravityLoc!: WebGLUniformLocation;
  private viscosityLoc!: WebGLUniformLocation;
  private attractionLoc!: WebGLUniformLocation;
  private repulsionLoc!: WebGLUniformLocation;
  private wallSpringConstantLoc!: WebGLUniformLocation;
  private wallSpringDampingLoc!: WebGLUniformLocation;

  // the texture that shows the state of each particle (dead, alive, or
  private particleStateTextures: WebGLTexture[] = [];
  private particleStateFramebuffers: WebGLFramebuffer[] = [];

  // position velocity texture
  private particlePositionVelocityTextures: WebGLTexture[] = [];
  private particlePositionVelocityFramebuffers: WebGLFramebuffer[] = [];

  // Mouse loc
  private mouseLoc!: WebGLUniformLocation;

  private prog_apply_gravity!: WebGLProgram;
  private prog_handle_state!: WebGLProgram;
  private prog_apply_mouse!: WebGLProgram;

  // The index of the mass texture we're using as a source
  private particleStateIndex = 0;
  private particlePositionVelocityIndex = 0;

  // whether we need to reset on the next frame
  private needsReset = true;

  // data
  private state_data = new Int32Array(this.particle_tex_xsize * this.particle_tex_ysize * 4);
  private position_velocity_data = new Float32Array(this.particle_tex_xsize * this.particle_tex_ysize * 4);

  private requestID!: number;

  constructor(props: WebGL2FluidAdvectionDemoProps) {
    super(props);
  }

  componentDidMount() {
    // get webgl
    this.gl = this.particle_canvas.current!.getContext('webgl2')!;
    this.gl.getExtension('EXT_color_buffer_float');

    // create pingpongable textures and frambuffers for the state textures
    for (let i = 0; i < 2; i++) {
      const tex = createRG32ITexture(
        this.gl,
        this.particle_tex_xsize,
        this.particle_tex_ysize,
      )!;
      this.particleStateTextures.push(tex);
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
      this.particleStateFramebuffers.push(fbo);
    }

    // create pingpongable textures and frambuffers for the particle textures
    for (let i = 0; i < 2; i++) {
      const tex = createRGBA32FTexture(
        this.gl,
        this.particle_tex_xsize,
        this.particle_tex_ysize,
        new Float32Array(this.particle_tex_xsize * this.particle_tex_ysize * 4)
      )!;
      this.particlePositionVelocityTextures.push(tex);

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
      this.particlePositionVelocityFramebuffers.push(fbo);
    }

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

    // build apply_gravity
    {
      // create program
      this.prog_apply_gravity = createProgram(
        this.gl,
        [
          createShader(this.gl, this.gl.VERTEX_SHADER, vs),
          createShader(this.gl, this.gl.FRAGMENT_SHADER, apply_gravity_fs),
        ]
      )!;

      const positionLoc = this.gl.getAttribLocation(this.prog_apply_gravity, 'a_position');
      const particleStateTexLoc = this.gl.getUniformLocation(this.prog_apply_gravity, 'u_particle_state_tex');
      const particlePositionVelocityTexLoc = this.gl.getUniformLocation(this.prog_apply_gravity, 'u_particle_position_velocity_tex');

      this.xGravityLoc = this.gl.getUniformLocation(this.prog_apply_gravity, 'u_x_gravity')!;
      this.yGravityLoc = this.gl.getUniformLocation(this.prog_apply_gravity, 'u_y_gravity')!;
      this.viscosityLoc = this.gl.getUniformLocation(this.prog_apply_gravity, 'u_viscosity')!;
      this.attractionLoc = this.gl.getUniformLocation(this.prog_apply_gravity, 'u_attraction')!;
      this.repulsionLoc = this.gl.getUniformLocation(this.prog_apply_gravity, 'u_repulsion')!;
      this.wallSpringConstantLoc = this.gl.getUniformLocation(this.prog_apply_gravity, 'u_wall_spring_constant')!;
      this.wallSpringDampingLoc = this.gl.getUniformLocation(this.prog_apply_gravity, 'u_wall_spring_damping')!;



      // setup our attributes to tell WebGL how to pull
      // the data from the buffer above to the position attribute
      this.gl.enableVertexAttribArray(positionLoc);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
      this.gl.vertexAttribPointer(
        positionLoc,
        2,         // size (num components)
        this.gl.FLOAT,  // type of data in buffer
        false,     // normalize
        0,         // stride (0 = auto)
        0,         // offset
      );

      // bind uniforms
      this.gl.useProgram(this.prog_apply_gravity);

      // set defaults
      this.gl.uniform1f(this.xGravityLoc, this.gravityDefault);
      this.gl.uniform1f(this.yGravityLoc, this.gravityDefault);
      this.gl.uniform1f(this.viscosityLoc, this.viscosityDefault);
      this.gl.uniform1f(this.attractionLoc, this.attractionDefault);
      this.gl.uniform1f(this.repulsionLoc, this.repulsionDefault);
      this.gl.uniform1f(this.wallSpringConstantLoc, this.wallSpringConstantDefault);
      this.gl.uniform1f(this.wallSpringDampingLoc, this.wallSpringDampingDefault);

      const dimensionsLoc = this.gl.getUniformLocation(this.prog_apply_gravity, 'u_dimensions')!;
      this.gl.uniform2f(dimensionsLoc, this.props.xsize, this.props.ysize);


      // Tell the shader to get the state texture from texture unit 0
      this.gl.uniform1i(particleStateTexLoc, 0);
      // Tell the shader to get the position texture from texture unit 1
      this.gl.uniform1i(particlePositionVelocityTexLoc, 1);
    }

    // build the move_particle
    {
      // create program
      this.prog_handle_state = createProgram(
        this.gl,
        [
          createShader(this.gl, this.gl.VERTEX_SHADER, vs),
          createShader(this.gl, this.gl.FRAGMENT_SHADER, handle_state_fs),
        ]
      )!;

      const positionLoc = this.gl.getAttribLocation(this.prog_handle_state, 'a_position');
      const particleStateTexLoc = this.gl.getUniformLocation(this.prog_handle_state, 'u_particle_state_tex');
      const particlePositionVelocityTexLoc = this.gl.getUniformLocation(this.prog_handle_state, 'u_particle_position_velocity_tex');

      // setup our attributes to tell WebGL how to pull
      // the data from the buffer above to the position attribute
      this.gl.enableVertexAttribArray(positionLoc);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
      this.gl.vertexAttribPointer(
        positionLoc,
        2,              // size (num components)
        this.gl.FLOAT,  // type of data in buffer
        false,          // normalize
        0,              // stride (0 = auto)
        0,              // offset
      );

      const dimensionsLoc = this.gl.getUniformLocation(this.prog_handle_state, 'u_dimensions')!;
      this.gl.uniform2f(dimensionsLoc, this.props.xsize, this.props.ysize);

      // bind uniforms
      this.gl.useProgram(this.prog_handle_state);
      // Tell the shader to get the state texture from texture unit 0
      this.gl.uniform1i(particleStateTexLoc, 0);
      // Tell the shader to get the position texture from texture unit 1
      this.gl.uniform1i(particlePositionVelocityTexLoc, 1);

    }

    // build the paint on vel texture program
    {
      // create program
      this.prog_apply_mouse = createProgram(
        this.gl,
        [
          createShader(this.gl, this.gl.VERTEX_SHADER, vs),
          createShader(this.gl, this.gl.FRAGMENT_SHADER, apply_mouse_fs),
        ]
      )!;

      const positionLoc = this.gl.getAttribLocation(this.prog_apply_mouse, 'a_position');
      const particleStateTexLoc = this.gl.getUniformLocation(this.prog_apply_mouse, 'u_particle_state_tex');
      const particlePositionVelocityTexLoc = this.gl.getUniformLocation(this.prog_apply_mouse, 'u_particle_position_velocity_tex');
      this.mouseLoc = this.gl.getUniformLocation(this.prog_apply_mouse, 'u_mouse')!;

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
      this.gl.useProgram(this.prog_apply_mouse);
      // Tell the shader to get the state texture from texture unit 0
      this.gl.uniform1i(particleStateTexLoc, 0);
      // Tell the shader to get the position texture from texture unit 1
      this.gl.uniform1i(particlePositionVelocityTexLoc, 1);
    }

    this.cmt = new CanvasMouseTracker(this.render_canvas.current!);
    //this.cmt.addMouseDownListener(this.handleMouseDown);
    //this.cmt.addMouseMoveListener(this.handleMouseMove);
    //this.cmt.addMouseUpListener(this.handleMouseUp);

    // start animation loop
    this.animationLoop();
  }

  componentWillUnmount() {
    // remove canvas mouse tracker
    this.cmt.cleanup();
    // stop animation loop
    window.cancelAnimationFrame(this.requestID!);
  }

  animationLoop = () => {
    this.requestID = window.requestAnimationFrame(this.animationLoop);


    if (this.needsReset) {
      // give everything state of 0
      const state_data = new Int32Array(this.particle_tex_xsize * this.particle_tex_ysize * 2);
      const position_velocity_data = new Float32Array(this.particle_tex_xsize * this.particle_tex_ysize * 4);
      for (let y = 0; y < this.particle_tex_ysize; y++) {
        for (let x = 0; x < this.particle_tex_xsize; x++) {
          const i = y * this.particle_tex_xsize + x;
          state_data[i * 2] = 0;
          if (x < this.particle_tex_xsize - 0) {
            state_data[i * 2 + 1] = 1;
            position_velocity_data[i * 4 + 0] = x * 4 + 20;
            position_velocity_data[i * 4 + 1] = y * 4 + 20;
          } else {
            state_data[i * 2 + 1] = -1;
            position_velocity_data[i * 4 + 0] = x * 4 + 200;
            position_velocity_data[i * 4 + 1] = y * 4 + 10;
          }
        }
      }

      this.gl.bindTexture(this.gl.TEXTURE_2D, this.particleStateTextures[this.particleStateIndex]);
      overwriteRG32ITexture(this.gl, 0, 0, this.particle_tex_xsize, this.particle_tex_ysize, state_data);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.particlePositionVelocityTextures[this.particlePositionVelocityIndex]);
      overwriteRGBA32FTexture(this.gl, 0, 0, this.particle_tex_xsize, this.particle_tex_ysize, position_velocity_data);

      this.needsReset = false;
    }


    // run the physics code
    const speed = this.range.current!.valueAsNumber;
    const iterations = speed * speed;
    for (let i = 0; i < iterations; i++) {
      // handle drawing
      const mousePos = this.cmt.mousePos;
      if (mousePos) {
        // in order to draw the velocity texture we will execute a program
        this.gl.useProgram(this.prog_apply_mouse);

        // bind the source velocity texture to texture unit 1
        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.particlePositionVelocityTextures[this.particlePositionVelocityIndex]);
        // set the framebuffer to draw at the other velocity texture
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.particlePositionVelocityFramebuffers[(this.particlePositionVelocityIndex + 1) % 2]);

        // set old and new mouse positions
        this.gl.uniform2f(this.mouseLoc,
          clamp(mousePos.current.x, 0, this.props.xsize),
          clamp(mousePos.current.y, 0, this.props.ysize),
        );

        // execute program, doing paint
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        this.particlePositionVelocityIndex = (this.particlePositionVelocityIndex + 1) % 2;
      }



      // we will handle_state now
      {
        // we will handle_state now
        this.gl.useProgram(this.prog_handle_state);

        // bind the position to texture 1
        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.particlePositionVelocityTextures[this.particlePositionVelocityIndex]);

        // bind the state to texture 0
        const tex = this.particleStateTextures[this.particleStateIndex];
        const fbo = this.particleStateFramebuffers[(this.particleStateIndex + 1) % 2];

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, tex);

        // make fbo corresponding to the next texture the current framebuffer
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fbo);

        // execute draw to the next framebuffer
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        this.particleStateIndex = (this.particleStateIndex + 1) % 2;
      }

      // we will apply_gravity now
      {
        // we will apply_gravity now
        this.gl.useProgram(this.prog_apply_gravity);

        // bind the state to texture 0
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.particleStateTextures[this.particleStateIndex]);

        // bind the positionVelocity to texture 1
        const tex = this.particlePositionVelocityTextures[this.particlePositionVelocityIndex];
        const fbo = this.particlePositionVelocityFramebuffers[(this.particlePositionVelocityIndex + 1) % 2];

        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, tex);

        // make fbo corresponding to the next texture the current framebuffer
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fbo);

        // execute draw to the next framebuffer
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        this.particlePositionVelocityIndex = (this.particlePositionVelocityIndex + 1) % 2;
      }
    }

    // read the state data
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.particleStateFramebuffers[this.particleStateIndex]);
    this.gl.readPixels(
      0,  // x
      0,  // y
      this.particle_tex_xsize, // width
      this.particle_tex_ysize, // height
      this.gl.RGBA_INTEGER,    // format
      this.gl.INT,    // type
      this.state_data                    // pixels
    );

    // read the position velocity positions
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.particlePositionVelocityFramebuffers[this.particlePositionVelocityIndex]);
    this.gl.readPixels(
      0,  // x
      0,  // y
      this.particle_tex_xsize, // width
      this.particle_tex_ysize, // height
      this.gl.RGBA, // format
      this.gl.FLOAT, // type
      this.position_velocity_data // pixels
    );

    this.draw(this.state_data, this.position_velocity_data);
  }

  private editData?: { id: number, mass: number, dragging?: Point };

  handleMouseDown = (v: Point) => {
    if (this.editData?.dragging !== undefined) {
      return;
    }

    for (let i = 0; i < this.position_velocity_data.length / 4; i++) {
      if (this.state_data[i * 4] == 0) {
        const r = this.calcRadius(this.state_data[i * 4 + 1]);
        const dist = Math.hypot(
          (v.x - this.position_velocity_data[i * 4 + 0]),
          (v.y - this.position_velocity_data[i * 4 + 1]),
        );
        if (dist < r) {
          const mass = this.state_data[i * 4 + 1];
          this.editData = {
            id: i,
            mass,
            dragging: v
          };
          // set state to dead so that we don't interfere while dragging
          this.gl.activeTexture(this.gl.TEXTURE0);
          this.gl.bindTexture(this.gl.TEXTURE_2D, this.particleStateTextures[this.particleStateIndex]);
          overwriteRG32ITexture(
            this.gl,
            i % this.particle_tex_xsize, // x
            i / this.particle_tex_xsize, // y
            1, // width
            1, // height
            Int32Array.from([1, mass])
          );
          break;
        }
      }
    }

  }

  handleMouseUp = (v: Point) => {
    if (this.editData?.dragging === undefined) {
      return;
    }

    // change location
    this.gl.activeTexture(this.gl.TEXTURE1);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.particlePositionVelocityTextures[this.particlePositionVelocityIndex]);
    overwriteRGBA32FTexture(
      this.gl,
      this.editData.id % this.particle_tex_xsize, // x
      this.editData.id / this.particle_tex_xsize, // y
      1, // width
      1, // height
      Float32Array.from([this.editData.dragging.x, this.editData.dragging.y, 0, 0]) // data
    );

    // set state to live so the particle starts interacting with gravity again
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.particleStateTextures[this.particleStateIndex]);
    overwriteRG32ITexture(
      this.gl,
      this.editData.id % this.particle_tex_xsize, // x
      this.editData.id / this.particle_tex_xsize, // y
      1, // width
      1, // height
      Int32Array.from([0, this.editData.mass]) //data
    );
    this.editData.dragging = undefined;
  }

  handleMouseMove = (v: Point) => {
    if (this.editData?.dragging === undefined) {
      return;
    }

    // change location
    this.editData.dragging = v;

    this.gl.activeTexture(this.gl.TEXTURE1);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.particlePositionVelocityTextures[this.particlePositionVelocityIndex]);
    overwriteRGBA32FTexture(
      this.gl,
      this.editData.id % this.particle_tex_xsize, // x
      this.editData.id / this.particle_tex_xsize, // y
      1, // width
      1, // height
      Float32Array.from([this.editData.dragging.x, this.editData.dragging.y, 0, 0]) // data
    );
  }

  handleChange = () => {
    this.gl.useProgram(this.prog_apply_gravity);
    const xGravity = this.xGravityRange.current!.valueAsNumber;
    const yGravity = this.yGravityRange.current!.valueAsNumber;
    const viscosity = this.viscosityRange.current!.valueAsNumber;
    const attraction = this.attractionRange.current!.valueAsNumber;
    const repulsion = this.repulsionRange.current!.valueAsNumber;
    const wallSpringConstant = this.wallSpringConstantRange.current!.valueAsNumber;
    const wallSpringDamping = this.wallSpringDampingRange.current!.valueAsNumber;

    this.gl.uniform1f(this.xGravityLoc, xGravity);
    this.gl.uniform1f(this.yGravityLoc, yGravity);
    this.gl.uniform1f(this.viscosityLoc, viscosity);
    this.gl.uniform1f(this.attractionLoc, attraction);
    this.gl.uniform1f(this.repulsionLoc, repulsion);
    this.gl.uniform1f(this.wallSpringConstantLoc, wallSpringConstant);
    this.gl.uniform1f(this.wallSpringDampingLoc, wallSpringDamping);
  }

  calcRadius = (m: number) => 1.5 * Math.sqrt(Math.abs(m)) + 5;

  tick = 0;

  draw = (state: Int32Array, position_velocity: Float32Array) => {
    if (this.tick == 0) {
      this.tick = 100;
    } else {
      this.tick--;
    }

    const render_canvas = this.render_canvas.current!
    const ctx = this.render_canvas.current!.getContext("2d")!;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, render_canvas.width, render_canvas.height);
    ctx.strokeStyle = "#FF0000";
    for (let i = 0; i < position_velocity.length / 4; i++) {
      let s = state[i * 4];
      let x = position_velocity[i * 4 + 0];
      let y = position_velocity[i * 4 + 1];
      let m = state[i * 4 + 1]
      let r = Math.sqrt(Math.abs(m));
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      switch (s) {
        case 0:
          if (m < 0) {
            ctx.fillStyle = "#FF00FF";
          } else {
            ctx.fillStyle = "#FFFFFF";
          }
          break;
        default:
          ctx.fillStyle = "#FF0000";
          break;
      }
      ctx.fill();
      // now draw velocity
      //ctx.beginPath()
      //ctx.moveTo(x, y);
      //let vx = velocity[i * 4 + 0];
      //let vy = velocity[i * 4 + 1];
      //ctx.lineTo(x + vx, y + vy);
      //ctx.stroke();
      if (i == this.editData?.id) {
        // draw blue circle around the thing we're editing
        ctx.strokeStyle = "#0000FF";
        ctx.beginPath();
        ctx.arc(x, y, this.calcRadius(m), 0, 2 * Math.PI);
        ctx.stroke();
        ctx.strokeStyle = "#FF0000";
      }
    }
  }

  render() {
    return <div style={this.props.style} className={this.props.className}>
      <div>
        <canvas
          className="border border-dark"
          ref={this.particle_canvas}
          height={this.particle_tex_xsize}
          width={this.particle_tex_ysize}
          hidden
        />
      </div>
      <div className="row">
        <div className="col-md-8 ">
          <canvas
            className="border border-dark"
            ref={this.render_canvas}
            width={this.props.xsize}
            height={this.props.ysize}
          />
        </div>
        <div className="col-md-4">
          <div className="border border-dark p-3 m-3">
            <h6>Controls</h6>
            <div className="form-group mb-3">
              <label className="form-label">Simulation Speed</label>
              <input type="range" className="form-range" min="0" max="15" step={1} defaultValue={1} ref={this.range} />
            </div>
            <div className="form-group mb-3">
              <label className="form-label">X Gravity</label>
              <input type="range" className="form-range"
                min="-0.00001" max="0.00001"
                step="0.000005"
                defaultValue={this.gravityDefault}
                ref={this.xGravityRange} onInput={this.handleChange}
              />
            </div>
            <div className="form-group mb-3">
              <label className="form-label">Y Gravity</label>
              <input type="range" className="form-range"
                min="-0.00001" max="0.00001"
                step="0.000005"
                defaultValue={this.gravityDefault}
                ref={this.yGravityRange} onInput={this.handleChange}
              />
            </div>
            <div className="form-group mb-3">
              <label className="form-label">Viscosity</label>
              <input type="range" className="form-range"
                min="0" max="0.01"
                step="0.001"
                defaultValue={this.viscosityDefault}
                ref={this.viscosityRange} onInput={this.handleChange}
              />
            </div>
            <div className="form-group mb-3">
              <label className="form-label">Repulsion</label>
              <input type="range" className="form-range"
                min="1000" max="10000"
                step="100"
                defaultValue={this.repulsionDefault}
                ref={this.repulsionRange} onInput={this.handleChange}
              />
            </div>
            <div className="form-group mb-3">
              <label className="form-label">Attraction</label>
              <input type="range" className="form-range" min="1" max="5" step="0.1"
                defaultValue={this.attractionDefault}
                ref={this.attractionRange} onInput={this.handleChange}
              />
            </div>
            <div className="form-group mb-3">
              <label className="form-label">Wall Spring Constant</label>
              <input type="range" className="form-range" min="0.00001" max="0.001" step="0.00001"
                defaultValue={this.wallSpringConstantDefault}
                ref={this.wallSpringConstantRange} onInput={this.handleChange}
              />
            </div>
            <div className="form-group mb-3">
              <label className="form-label">Wall Bounciness</label>
              <input type="range" className="form-range" min="0.9" max="0.999" step="0.001"
                defaultValue={this.wallSpringDampingDefault}
                ref={this.wallSpringDampingRange} onInput={this.handleChange}
              />
            </div>
            <div className="form-group mb-3">
              <button className="btn btn-primary btn-sm" onClick={() => this.needsReset = true}>Reset</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  }
}

export default WebGL2FluidAdvectionDemo;
