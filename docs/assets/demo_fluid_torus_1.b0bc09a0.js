var R=Object.defineProperty;var E=(v,u,o)=>u in v?R(v,u,{enumerable:!0,configurable:!0,writable:!0,value:o}):v[u]=o;var e=(v,u,o)=>(E(v,typeof u!="symbol"?u+"":u,o),o);import"./modulepreload-polyfill.c7c6310f.js";import{a as n,j as r,b as l,R as A}from"./bootstrap.0afc7782.js";import{c as _,a as y,b as c,d as a,e as F,o as x,f as C,u as L}from"./webgl.1795e08c.js";import{c as m}from"./math.e4175633.js";import{c as w}from"./noise.ab64560a.js";import{g as D}from"./uvplane.f50bfeae.js";import{T as G}from"./camera.41b5ef12.js";import{C as N}from"./canvas.b09e5cf8.js";import"./mod.a5ac064f.js";const p=`#version 300 es
in vec2 c_position;
out vec2 v_texCoord;

void main() {
  v_texCoord = c_position;

  // convert from 0->1 to 0->2
  // convert from 0->2 to -1->+1 (clip space)
  vec2 clipSpace = (c_position * 2.0) - 1.0;

  gl_Position = vec4(clipSpace, 0, 1);
}
`,U=`#version 300 es
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
`,S=`#version 300 es
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
`,z=`#version 300 es
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
`,I=`#version 300 es
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
`,M=`#version 300 es
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
`,P=`#version 300 es
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
    mag_v = clamp(mag_v, 5.0, ARROW_TILE_SIZE * 0.5);

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

  outColor = mix(arrow_col, field_col, arrow_col.a);
}
`,X=`#version 300 es
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
`,V=`#version 300 es
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
   float theta = (a_position.x * u_minorAlpha + 0.5) * 2.0 * PI;
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
`,j=`#version 300 es
precision highp float;
precision highp sampler2D;

// the rendered texture
uniform sampler2D u_render_tex;

in vec2 v_texCoord;

out vec4 v_outColor;

void main() {
  // color: 0xEBDBB2,
  // v_outColor = vec4(0.922,0.859,0.698, 1.0);
  v_outColor = texture(u_render_tex, v_texCoord.yx);
}
`,B=20,O=20,T=D(B,O);class H extends n.Component{constructor(o){super(o);e(this,"canvas",n.createRef());e(this,"range",n.createRef());e(this,"scalarSelect",n.createRef());e(this,"velocitySelect",n.createRef());e(this,"gl");e(this,"scalarTextures",[]);e(this,"scalarFramebuffers",[]);e(this,"velTextures",[]);e(this,"velFramebuffers",[]);e(this,"divTexture");e(this,"divFramebuffer");e(this,"pressureTextures",[]);e(this,"pressureFramebuffers",[]);e(this,"newMouseLoc");e(this,"oldMouseLoc");e(this,"renderOffset");e(this,"prog_advect_scalar");e(this,"prog_advect_vel");e(this,"prog_divergence");e(this,"prog_solve_pressure");e(this,"prog_apply_pressure_force");e(this,"prog_render");e(this,"prog_paint_vel");e(this,"scalarIndex",0);e(this,"velIndex",0);e(this,"pressureIndex",0);e(this,"needsScalarReset",!0);e(this,"needsVelocityReset",!0);e(this,"cmt");e(this,"viewPressure",!1);e(this,"requestID");e(this,"torusnessRange",n.createRef());e(this,"majorRange",n.createRef());e(this,"minorRange",n.createRef());e(this,"lerpRange",n.createRef());e(this,"torusCanvas",n.createRef());e(this,"torusGl");e(this,"camera");e(this,"torusTexture");e(this,"torusWorldViewProjectionLoc");e(this,"torusMajorAlpha");e(this,"torusMinorAlpha");e(this,"torusLerpAlpha");e(this,"handleTorusChange",()=>{const o=this.torusnessRange.current.valueAsNumber;this.majorRange.current.valueAsNumber=o,this.minorRange.current.valueAsNumber=o,this.lerpRange.current.valueAsNumber=Math.min(o*1.5,1),this.handleCircularityChange()});e(this,"handleCircularityChange",()=>{const o=this.majorRange.current.valueAsNumber,t=this.minorRange.current.valueAsNumber,s=this.lerpRange.current.valueAsNumber;this.torusGl.uniform1f(this.torusMajorAlpha,o),this.torusGl.uniform1f(this.torusMinorAlpha,t),this.torusGl.uniform1f(this.torusLerpAlpha,s)});e(this,"animationLoop",()=>{var t,s;this.requestID=window.requestAnimationFrame(this.animationLoop),this.camera.update();const o=this.cmt.mousePos;if(o&&(this.gl.useProgram(this.prog_paint_vel),this.gl.activeTexture(this.gl.TEXTURE1),this.gl.bindTexture(this.gl.TEXTURE_2D,this.velTextures[this.velIndex]),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.velFramebuffers[(this.velIndex+1)%2]),this.gl.uniform2f(this.oldMouseLoc,m(o.previous.x,0,this.props.xsize),m(this.props.ysize-o.previous.y,0,this.props.ysize)),this.gl.uniform2f(this.newMouseLoc,m(o.current.x,0,this.props.xsize),m(this.props.ysize-o.current.y,0,this.props.ysize)),this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.velIndex=(this.velIndex+1)%2),this.needsScalarReset){const i=this.props.ysize;this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,this.scalarTextures[this.scalarIndex]);const h=parseInt((t=this.scalarSelect.current)==null?void 0:t.value),g=new Float32Array(this.props.xsize*this.props.ysize);for(let d=0;d<this.props.ysize;d++){const b=Math.floor(d/(i/h))%2;for(let f=0;f<this.props.xsize;f++)Math.floor(f/(i/h))%2+b==1?g[d*this.props.xsize+f]=1:g[d*this.props.xsize+f]=0}x(this.gl,0,0,this.props.xsize,this.props.ysize,g),this.needsScalarReset=!1}if(this.needsVelocityReset){this.gl.activeTexture(this.gl.TEXTURE3),this.gl.bindTexture(this.gl.TEXTURE_2D,this.pressureTextures[this.pressureIndex]),x(this.gl,0,0,this.props.xsize,this.props.ysize,new Float32Array(this.props.xsize*this.props.ysize)),this.gl.activeTexture(this.gl.TEXTURE1),this.gl.bindTexture(this.gl.TEXTURE_2D,this.velTextures[this.velIndex]);let i;switch((s=this.velocitySelect.current)==null?void 0:s.value){case"curlnoise":i=w(3,this.props.xsize,this.props.ysize,Math.random()*500);break;default:i=new Float32Array(this.props.xsize*this.props.ysize*2);break}C(this.gl,0,0,this.props.xsize,this.props.ysize,i),this.needsVelocityReset=!1}for(let i=0;i<this.range.current.valueAsNumber;i++){this.gl.useProgram(this.prog_advect_scalar),this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,this.scalarTextures[this.scalarIndex]),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.scalarFramebuffers[(this.scalarIndex+1)%2]),this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.scalarIndex=(this.scalarIndex+1)%2,this.gl.useProgram(this.prog_advect_vel),this.gl.activeTexture(this.gl.TEXTURE1),this.gl.bindTexture(this.gl.TEXTURE_2D,this.velTextures[this.velIndex]),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.velFramebuffers[(this.velIndex+1)%2]),this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.velIndex=(this.velIndex+1)%2,this.gl.useProgram(this.prog_divergence),this.gl.activeTexture(this.gl.TEXTURE1),this.gl.bindTexture(this.gl.TEXTURE_2D,this.velTextures[this.velIndex]),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.divFramebuffer),this.gl.drawArrays(this.gl.TRIANGLES,0,6);{this.gl.useProgram(this.prog_solve_pressure);for(let h=0;h<15;h++)this.gl.activeTexture(this.gl.TEXTURE2),this.gl.bindTexture(this.gl.TEXTURE_2D,this.divTexture),this.gl.activeTexture(this.gl.TEXTURE3),this.gl.bindTexture(this.gl.TEXTURE_2D,this.pressureTextures[this.pressureIndex]),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.pressureFramebuffers[(this.pressureIndex+1)%2]),this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.pressureIndex=(this.pressureIndex+1)%2}this.gl.useProgram(this.prog_apply_pressure_force),this.gl.activeTexture(this.gl.TEXTURE3),this.gl.bindTexture(this.gl.TEXTURE_2D,this.pressureTextures[this.pressureIndex]),this.gl.activeTexture(this.gl.TEXTURE1),this.gl.bindTexture(this.gl.TEXTURE_2D,this.velTextures[this.velIndex]),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.velFramebuffers[(this.velIndex+1)%2]),this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.velIndex=(this.velIndex+1)%2}this.gl.useProgram(this.prog_render),this.viewPressure?(this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,this.pressureTextures[this.pressureIndex]),this.gl.uniform1f(this.renderOffset,.5)):(this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,this.scalarTextures[this.scalarIndex]),this.gl.uniform1f(this.renderOffset,0)),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null),this.gl.drawArrays(this.gl.TRIANGLES,0,6);{const i=this.camera.getTrackballCameraMatrix(this.props.torussize,this.props.torussize);this.torusGl.uniformMatrix4fv(this.torusWorldViewProjectionLoc,!1,i),L(this.torusGl,this.torusTexture,this.canvas.current),this.torusGl.activeTexture(this.torusGl.TEXTURE0),this.torusGl.bindTexture(this.torusGl.TEXTURE_2D,this.torusTexture),this.torusGl.enable(this.torusGl.BLEND),this.torusGl.blendFunc(this.torusGl.SRC_ALPHA,this.torusGl.ONE_MINUS_SRC_ALPHA),this.torusGl.drawArrays(this.torusGl.TRIANGLES,0,T.length)}})}componentDidMount(){this.gl=this.canvas.current.getContext("webgl2"),this.gl.getExtension("EXT_color_buffer_float");const o=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ARRAY_BUFFER,o),this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]),this.gl.STATIC_DRAW);for(let t=0;t<2;t++){const s=_(this.gl,this.props.xsize,this.props.ysize,new Float32Array(this.props.xsize*this.props.ysize));this.scalarTextures.push(s);const i=this.gl.createFramebuffer();this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,i),this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,s,0),this.scalarFramebuffers.push(i)}for(let t=0;t<2;t++){const s=y(this.gl,this.props.xsize,this.props.ysize,new Float32Array(this.props.xsize*this.props.ysize*2));this.velTextures.push(s);const i=this.gl.createFramebuffer();this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,i),this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,s,0),this.velFramebuffers.push(i)}this.divTexture=_(this.gl,this.props.xsize,this.props.ysize,new Float32Array(this.props.xsize*this.props.ysize)),this.divFramebuffer=this.gl.createFramebuffer(),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.divFramebuffer),this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,this.divTexture,0);for(let t=0;t<2;t++){const s=_(this.gl,this.props.xsize,this.props.ysize,new Float32Array(this.props.xsize*this.props.ysize));this.pressureTextures.push(s);const i=this.gl.createFramebuffer();this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,i),this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,s,0),this.pressureFramebuffers.push(i)}{this.prog_advect_scalar=c(this.gl,[a(this.gl,this.gl.VERTEX_SHADER,p),a(this.gl,this.gl.FRAGMENT_SHADER,U)]);const t=this.gl.getAttribLocation(this.prog_advect_scalar,"c_position"),s=this.gl.getUniformLocation(this.prog_advect_scalar,"u_scalar_tex"),i=this.gl.getUniformLocation(this.prog_advect_scalar,"u_vel_tex");this.gl.enableVertexAttribArray(t),this.gl.vertexAttribPointer(t,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(this.prog_advect_scalar),this.gl.uniform1i(s,0),this.gl.uniform1i(i,1)}{this.prog_advect_vel=c(this.gl,[a(this.gl,this.gl.VERTEX_SHADER,p),a(this.gl,this.gl.FRAGMENT_SHADER,S)]);const t=this.gl.getAttribLocation(this.prog_advect_vel,"c_position"),s=this.gl.getUniformLocation(this.prog_advect_vel,"u_vel_tex");this.gl.enableVertexAttribArray(t),this.gl.vertexAttribPointer(t,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(this.prog_advect_vel),this.gl.uniform1i(s,1)}{this.prog_divergence=c(this.gl,[a(this.gl,this.gl.VERTEX_SHADER,p),a(this.gl,this.gl.FRAGMENT_SHADER,z)]);const t=this.gl.getAttribLocation(this.prog_divergence,"c_position"),s=this.gl.getUniformLocation(this.prog_divergence,"u_vel_tex");this.gl.enableVertexAttribArray(t),this.gl.vertexAttribPointer(t,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(this.prog_divergence),this.gl.uniform1i(s,1)}{this.prog_solve_pressure=c(this.gl,[a(this.gl,this.gl.VERTEX_SHADER,p),a(this.gl,this.gl.FRAGMENT_SHADER,I)]);const t=this.gl.getAttribLocation(this.prog_solve_pressure,"c_position"),s=this.gl.getUniformLocation(this.prog_solve_pressure,"u_divergence_tex"),i=this.gl.getUniformLocation(this.prog_solve_pressure,"u_pressure_tex");this.gl.enableVertexAttribArray(t),this.gl.vertexAttribPointer(t,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(this.prog_solve_pressure),this.gl.uniform1i(s,2),this.gl.uniform1i(i,3)}{this.prog_apply_pressure_force=c(this.gl,[a(this.gl,this.gl.VERTEX_SHADER,p),a(this.gl,this.gl.FRAGMENT_SHADER,M)]);const t=this.gl.getAttribLocation(this.prog_apply_pressure_force,"c_position"),s=this.gl.getUniformLocation(this.prog_apply_pressure_force,"u_vel_tex"),i=this.gl.getUniformLocation(this.prog_apply_pressure_force,"u_pressure_tex");this.gl.enableVertexAttribArray(t),this.gl.vertexAttribPointer(t,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(this.prog_apply_pressure_force),this.gl.uniform1i(s,1),this.gl.uniform1i(i,3)}{this.prog_render=c(this.gl,[a(this.gl,this.gl.VERTEX_SHADER,p),a(this.gl,this.gl.FRAGMENT_SHADER,P)]);const t=this.gl.getAttribLocation(this.prog_render,"c_position"),s=this.gl.getUniformLocation(this.prog_render,"u_scalar_tex"),i=this.gl.getUniformLocation(this.prog_render,"u_vel_tex");this.renderOffset=this.gl.getUniformLocation(this.prog_render,"u_offset"),this.gl.enableVertexAttribArray(t),this.gl.vertexAttribPointer(t,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(this.prog_render),this.gl.uniform1i(s,0),this.gl.uniform1i(i,1)}{this.prog_paint_vel=c(this.gl,[a(this.gl,this.gl.VERTEX_SHADER,p),a(this.gl,this.gl.FRAGMENT_SHADER,X)]);const t=this.gl.getAttribLocation(this.prog_paint_vel,"c_position"),s=this.gl.getUniformLocation(this.prog_paint_vel,"u_vel_tex");this.newMouseLoc=this.gl.getUniformLocation(this.prog_paint_vel,"u_new_mouse"),this.oldMouseLoc=this.gl.getUniformLocation(this.prog_paint_vel,"u_old_mouse"),this.gl.enableVertexAttribArray(t),this.gl.vertexAttribPointer(t,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(this.prog_paint_vel),this.gl.uniform1i(s,1)}{this.camera=new G(this.torusCanvas.current,{}),this.torusGl=this.torusCanvas.current.getContext("webgl2",{premultipliedAlpha:!1}),this.torusGl.enable(this.torusGl.DEPTH_TEST),this.torusTexture=F(this.torusGl,this.props.torussize,this.props.torussize);const t=c(this.torusGl,[a(this.torusGl,this.torusGl.VERTEX_SHADER,V),a(this.torusGl,this.torusGl.FRAGMENT_SHADER,j)]),s=this.torusGl.getAttribLocation(t,"a_position"),i=this.torusGl.getUniformLocation(t,"u_render_tex");this.torusMajorAlpha=this.torusGl.getUniformLocation(t,"u_majorAlpha"),this.torusMinorAlpha=this.torusGl.getUniformLocation(t,"u_minorAlpha"),this.torusLerpAlpha=this.torusGl.getUniformLocation(t,"u_lerpAlpha"),this.torusWorldViewProjectionLoc=this.torusGl.getUniformLocation(t,"u_worldViewProjection");const h=this.torusGl.createBuffer();this.torusGl.bindBuffer(this.torusGl.ARRAY_BUFFER,h),this.torusGl.bufferData(this.torusGl.ARRAY_BUFFER,new Float32Array(T.flatMap(g=>[g[0],g[1]])),this.torusGl.STATIC_DRAW),this.torusGl.enableVertexAttribArray(s),this.torusGl.vertexAttribPointer(s,2,this.torusGl.FLOAT,!1,0,0),this.torusGl.useProgram(t),this.torusGl.uniform1f(this.torusMajorAlpha,0),this.torusGl.uniform1f(this.torusMinorAlpha,0),this.torusGl.uniform1f(this.torusLerpAlpha,0),this.torusGl.uniform1i(i,0)}this.torusnessRange.current.addEventListener("input",this.handleTorusChange),this.majorRange.current.addEventListener("input",this.handleCircularityChange),this.minorRange.current.addEventListener("input",this.handleCircularityChange),this.lerpRange.current.addEventListener("input",this.handleCircularityChange),this.cmt=new N(this.canvas.current),this.animationLoop()}getMousePos(o,t){const s=o.getBoundingClientRect(),i=o.width/s.width,h=o.height/s.height;return{x:(t.clientX-s.left)*i,y:(t.clientY-s.top)*h}}componentWillUnmount(){this.cmt.cleanup(),this.torusnessRange.current.removeEventListener("input",this.handleTorusChange),this.majorRange.current.removeEventListener("input",this.handleCircularityChange),this.minorRange.current.removeEventListener("input",this.handleCircularityChange),this.lerpRange.current.removeEventListener("input",this.handleCircularityChange),window.cancelAnimationFrame(this.requestID),this.camera.cleanup()}render(){return r("div",{style:this.props.style,className:this.props.className,children:l("div",{className:"row",children:[r("div",{className:"col-md-8 d-flex",children:l("div",{children:[r("canvas",{className:"border border-dark mx-3 my-3",ref:this.canvas,width:this.props.xsize,height:this.props.ysize}),r("canvas",{className:"border border-dark mx-3 my-3",ref:this.torusCanvas,width:this.props.torussize,height:this.props.torussize})]})}),l("div",{className:"col-md-4",children:[l("div",{className:"border border-dark p-3 m-3",children:[l("div",{className:"form-group mb-3",children:[r("label",{className:"form-label",children:"Simulation Speed"}),r("input",{type:"range",className:"form-range",min:"0",max:"5",step:1,defaultValue:1,ref:this.range})]}),l("div",{className:"form-group mb-3",children:[r("label",{className:"form-label",children:"Scalar Field"}),l("select",{className:"form-select mb-3",defaultValue:8,ref:this.scalarSelect,children:[r("option",{value:1,children:"Empty"}),r("option",{value:2,children:"Grid 2"}),r("option",{value:8,children:"Grid 8"}),r("option",{value:64,children:"Grid 64"})]}),r("button",{className:"btn btn-primary btn-sm",onClick:()=>this.needsScalarReset=!0,children:"Reset Scalar"})]}),l("div",{className:"form-group mb-3",children:[r("label",{className:"form-label",children:"Velocity Field"}),l("select",{className:"form-select mb-3",defaultValue:8,ref:this.velocitySelect,children:[r("option",{value:"empty",children:"Empty"}),r("option",{value:"curlnoise",children:"Curl Noise"})]}),r("button",{className:"btn btn-primary btn-sm",onClick:()=>this.needsVelocityReset=!0,children:"Reset Velocity"})]}),r("div",{className:"form-group mb-3",children:l("div",{className:"form-check",children:[r("input",{type:"checkbox",className:"form-check-input",onClick:()=>this.viewPressure=!this.viewPressure}),r("label",{className:"form-check-label",children:"View Pressure"})]})})]}),l("div",{className:"border border-dark p-3 m-3",children:[l("div",{className:"form-group mb-3",children:[r("label",{className:"form-label",children:"Torusness"}),r("input",{type:"range",className:"form-range",min:"0",max:"1",step:"0.05",defaultValue:"0",ref:this.torusnessRange})]}),r("div",{className:"form-group mb-3",children:l("details",{children:[r("summary",{children:"Advanced Torus Controls"}),l("div",{className:"mx-auto d-block flex-grow-1 ",children:[r("label",{className:"form-label",children:"Join Major"}),r("input",{type:"range",className:"form-range",min:"0",max:"1",step:"0.05",defaultValue:"0",ref:this.majorRange})]}),l("div",{className:"mx-auto d-block flex-grow-1 ",children:[r("label",{className:"form-label",children:"Join Minor"}),r("input",{type:"range",className:"form-range",min:"0",max:"1",step:"0.05",defaultValue:"0",ref:this.minorRange})]}),l("div",{className:"mx-auto d-block flex-grow-1 ",children:[r("label",{className:"form-label",children:"Alpha"}),r("input",{type:"range",className:"form-range",min:"0",max:"1",step:"0.05",defaultValue:"0",ref:this.lerpRange})]})]})})]})]})]})})}}function k(){return r("div",{style:{display:"flex",height:"100vh"},children:r(H,{className:"mx-auto",xsize:400,ysize:400,torussize:400})})}A.render(r(n.StrictMode,{children:r(k,{})}),document.getElementById("root"));
