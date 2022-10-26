var y=Object.defineProperty;var F=(_,p,i)=>p in _?y(_,p,{enumerable:!0,configurable:!0,writable:!0,value:i}):_[p]=i;var t=(_,p,i)=>(F(_,typeof p!="symbol"?p+"":p,i),i);import"./modulepreload-polyfill.c7c6310f.js";import{a as n,j as s,b as o,R as C,F as w}from"./bootstrap.0afc7782.js";import{A as L}from"./ArticleLayout.9ae09534.js";import{S as f}from"./Section.59c5635d.js";import{A as S}from"./AsideCard.d925b07f.js";import{c as b,a as D,b as u,d as l,e as I,o as T,f as G,u as U}from"./webgl.1795e08c.js";import{c as g}from"./math.e4175633.js";import{c as N}from"./noise.ab64560a.js";import{g as E}from"./uvplane.f50bfeae.js";import{T as P}from"./camera.41b5ef12.js";import{C as z}from"./canvas.b09e5cf8.js";import"./mod.a5ac064f.js";const v=`#version 300 es
in vec2 c_position;
out vec2 v_texCoord;

void main() {
  v_texCoord = c_position;

  // convert from 0->1 to 0->2
  // convert from 0->2 to -1->+1 (clip space)
  vec2 clipSpace = (c_position * 2.0) - 1.0;

  gl_Position = vec4(clipSpace, 0, 1);
}
`,M=String.raw`#version 300 es
precision highp float;
precision highp sampler2D;

const float PI = 3.1415926538;
const float r = 100.0;

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
    // uv in pixels
    vec2 uv_px_raw = uv*vec2(res) - 0.5;

    vec2 uv_px_base = floor(uv_px_raw);
    vec2 uv_px_fract = fract(uv_px_raw);

    float uv_px_base_x_min = mod(uv_px_base.x, res.x);
    float uv_px_base_x_max = mod(uv_px_base.x+1.0, res.x);
    float uv_px_base_y_min = uv_px_base.y;
    float uv_px_base_y_max = uv_px_base.y+1.0;

    if(uv_px_base_y_min < 0.0 || uv_px_base_y_max > res.y) {
        return 0.0;
    }

    float a = texelFetch(sam, ivec2(uv_px_base_x_min,uv_px_base_y_min), 0).r;
    float b = texelFetch(sam, ivec2(uv_px_base_x_max,uv_px_base_y_min), 0).r;
    float c = texelFetch(sam, ivec2(uv_px_base_x_min,uv_px_base_y_max), 0).r;
    float d = texelFetch(sam, ivec2(uv_px_base_x_max,uv_px_base_y_max), 0).r;

    return mix( mix( a, b, uv_px_fract.x),
                mix( c, d, uv_px_fract.x), uv_px_fract.y );
}

void main() {
  float theta = v_texCoord.x * 2.0 * PI - PI;
  float phi = v_texCoord.y * PI;

  // get the floatwise velocity in spherical coordinates
  vec2 vel_sph = texture(u_vel_tex, v_texCoord).xy;

  // get cartesian position
  vec3 pos_crt = vec3(
        r*cos(theta)*sin(phi),
        r*sin(theta)*sin(phi),
        r*cos(phi)
  );

  // 2 basis vectors
  vec3 e_theta_hat = vec3(
      -sin(theta),
      cos(theta),
      0.0
  );

  vec3 e_phi_hat = vec3(
      cos(theta)*cos(phi),
      sin(theta)*cos(phi),
      -sin(phi)
  );

  // https://dynref.engr.illinois.edu/rvs.html
  // v = (dr/dt)*e_r_hat + r*(dtheta/dt)*sin(phi)*e_theta_hat + r*(dphi/dt)*e_phi_hat

  vec3 vel_crt = r*vel_sph.x*sin(phi)*e_theta_hat + r*vel_sph.y*e_phi_hat;

  // we extrapolate the cartesian position the point would have been at a while back
  // (semi lagrangian method)
  vec3 old_pos_crt = pos_crt - vel_crt;

  // convert back to spherical coordinates
  float extrapolated_old_theta = atan(old_pos_crt.y, old_pos_crt.x);
  float extrapolated_old_phi = atan(length(old_pos_crt.xy), old_pos_crt.z);

  vec2 normalized_old_pos_sph = vec2(
      (extrapolated_old_theta + PI)/(2.0*PI),
      extrapolated_old_phi/PI
  );

  // now we advect the scalar field:
  // we calculate the scalar value that will be at this location at the next timestep
  float val = textureGood(u_scalar_tex, normalized_old_pos_sph);

  value = vec4(val, 0.0, 0.0, 0.0);
}
`,V=`#version 300 es
precision highp float;
precision highp sampler2D;

const float PI = 3.1415926538;
const float r = 1.0;


// the velocity texture
uniform sampler2D u_vel_tex;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// the output
out vec4 value;

vec2 textureGood(sampler2D sam, vec2 uv) {
    vec2 res = vec2(textureSize(sam, 0));
    // uv in pixels
    vec2 uv_px_raw = uv*vec2(res) - 0.5;

    vec2 uv_px_base = floor(uv_px_raw);
    vec2 uv_px_fract = fract(uv_px_raw);

    float uv_px_base_x_min = mod(uv_px_base.x, res.x);
    float uv_px_base_x_max = mod(uv_px_base.x+1.0, res.x);
    float uv_px_base_y_min = uv_px_base.y;
    float uv_px_base_y_max = uv_px_base.y+1.0;

    if(uv_px_base_y_min < 0.0 || uv_px_base_y_max > res.y) {
        return vec2(0.0, 0.0);
    }

    vec2 a = texelFetch(sam, ivec2(uv_px_base_x_min,uv_px_base_y_min), 0).rg;
    vec2 b = texelFetch(sam, ivec2(uv_px_base_x_max,uv_px_base_y_min), 0).rg;
    vec2 c = texelFetch(sam, ivec2(uv_px_base_x_min,uv_px_base_y_max), 0).rg;
    vec2 d = texelFetch(sam, ivec2(uv_px_base_x_max,uv_px_base_y_max), 0).rg;

    return mix( mix( a, b, uv_px_fract.x),
                mix( c, d, uv_px_fract.x), uv_px_fract.y );
}

void main() {

  // // TODO: this makes it crash: why?
  // value = texture(u_vel_tex, v_texCoord);
  // return;

  float theta = v_texCoord.x * 2.0 * PI - PI;
  float phi = v_texCoord.y * PI;

  // get the floatwise velocity in spherical coordinates
  vec2 vel_sph = texture(u_vel_tex, v_texCoord).xy;

  // get cartesian position
  vec3 pos_crt = vec3(
        r*cos(theta)*sin(phi),
        r*sin(theta)*sin(phi),
        r*cos(phi)
  );

  // 2 basis vectors
  vec3 e_theta_hat = vec3(
      -sin(theta),
      cos(theta),
      0.0
  );

  vec3 e_phi_hat = vec3(
      cos(theta)*cos(phi),
      sin(theta)*cos(phi),
      -sin(phi)
  );

  // https://dynref.engr.illinois.edu/rvs.html
  // v = (dr/dt)*e_r_hat + r*(dtheta/dt)*sin(phi)*e_theta_hat + r*(dphi/dt)*e_phi_hat

  vec3 vel_crt = r*vel_sph.x*sin(phi)*e_theta_hat + r*vel_sph.y*e_phi_hat;

  // we extrapolate the cartesian position the point would have been at a while back
  // (semi lagrangian method)
  vec3 old_pos_crt = pos_crt - vel_crt;

  // convert back to spherical coordinates
  float extrapolated_old_phi = atan(length(old_pos_crt.xy), old_pos_crt.z);
  float extrapolated_old_theta = atan(old_pos_crt.y, old_pos_crt.x);

  // normalize from 0-1
  vec2 normalized_old_pos_sph = vec2(
      (extrapolated_old_theta+PI)/(2.0*PI),
      extrapolated_old_phi/PI
  );

  // now we advect the scalar field:
  // we calculate the scalar value that will be at this location at the next timestep
  vec2 val = textureGood(u_vel_tex, normalized_old_pos_sph);

  value = vec4(val, 0, 0);
}
`,X=`#version 300 es
precision highp float;
precision highp sampler2D;

const float PI = 3.1415926538;
const float r = 100.0;

// the velocity texture
uniform sampler2D u_vel_tex;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// the output
out vec4 value;

vec2 sampleVec2(sampler2D sam, vec2 res, vec2 uv_px) {
    uv_px.x = mod(uv_px.x, res.x);
    if(uv_px.y < 0.0 || uv_px.y > res.y) {
        return vec2(0.0, 0.0);
    }
    return texelFetch(sam, ivec2(uv_px), 0).xy;
}


void main() {
  // get neighboring cell distances
  vec2 res = vec2(textureSize(u_vel_tex, 0));
  vec2 v_px = v_texCoord * res;
  float x_off = 1.0/res.x;
  float y_off = 1.0/res.y;

  // get data
  vec2 v01 = sampleVec2(u_vel_tex, res, v_px + vec2(-1.0,+0.0));
  vec2 v10 = sampleVec2(u_vel_tex, res, v_px + vec2(+0.0,-1.0));
  vec2 v12 = sampleVec2(u_vel_tex, res, v_px + vec2(+0.0,+1.0));
  vec2 v21 = sampleVec2(u_vel_tex, res, v_px + vec2(+1.0,+0.0));

  // // calculate divergence using finite differences
  // float d_theta = (v01.x - v21.x)/(2.0*x_off);
  // float d_phi_sin_phi = (v10.y - v12.y)/(2.0*y_off);
  // float r_sin_phi = r*sin(v_texCoord.y*PI) + 0.01;
  // float divergence = d_theta/r_sin_phi + d_phi_sin_phi/r_sin_phi;

  float divergence = (v01.x - v21.x)/(2.0*x_off) + (v10.y - v12.y)/(2.0*y_off);

  // return divergence
  value = vec4(divergence, 0.0, 0.0, 0.0);
}
`,O=`#version 300 es
precision highp float;
precision highp sampler2D;

const float PI = 3.1415926538;
const float r = 100.0;

// the divergence texture
uniform sampler2D u_divergence_tex;

// the pressure texture of the last iteration
uniform sampler2D u_pressure_tex;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// the output
out vec4 value;

float sampleFloat(sampler2D sam, vec2 res, vec2 uv_px) {
    uv_px.x = mod(uv_px.x, res.x);
    if(uv_px.y < 0.0 || uv_px.y > res.y) {
        return 0.0;
    }
    return texelFetch(sam, ivec2(uv_px), 0).x;
}

void main() {
  // get neighboring cell distances
  vec2 res = vec2(textureSize(u_divergence_tex, 0));
  vec2 v_px = v_texCoord * res;

  // get previous iteration pressure data
  float p01 = sampleFloat(u_pressure_tex, res, v_px + vec2(-1.0,+0.0));
  float p10 = sampleFloat(u_pressure_tex, res, v_px + vec2(+0.0,-1.0));
  float p12 = sampleFloat(u_pressure_tex, res, v_px + vec2(+0.0,+1.0));
  float p21 = sampleFloat(u_pressure_tex, res, v_px + vec2(+1.0,+0.0));

  // get divergence
  float d11 = texture(u_divergence_tex , v_texCoord).x;

  // use the jacobi method to derive the next iteration of pressure at this location
  float p_next = (d11 + p01 + p10 + p12 + p21)/4.0;

  value = vec4(p_next, 0.0, 0.0, 0.0);
}
`,B=`#version 300 es
precision highp float;
precision highp sampler2D;

const float PI = 3.1415926538;
const float r = 100.0;

// the velocity texture
uniform sampler2D u_vel_tex;

// the pressure texture
uniform sampler2D u_pressure_tex;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// the output
out vec4 value;

float sampleFloat(sampler2D sam, vec2 res, vec2 uv_px) {
    uv_px.x = mod(uv_px.x, res.x);
    //if(uv_px.y < 0.0 || uv_px.y > res.y) {
    //    return 0.0;
    //}
    uv_px.y = clamp(uv_px.y, 0.0, res.y);
    return texelFetch(sam, ivec2(uv_px), 0).x;
}

void main() {
  // get neighboring cell distances
  vec2 res = vec2(textureSize(u_pressure_tex, 0));
  vec2 v_px = v_texCoord * res;

  // get previous iteration pressure data
  float p01 = sampleFloat(u_pressure_tex, res, v_px + vec2(-1.0,+0.0));
  float p10 = sampleFloat(u_pressure_tex, res, v_px + vec2(+0.0,-1.0));
  float p12 = sampleFloat(u_pressure_tex, res, v_px + vec2(+0.0,+1.0));
  float p21 = sampleFloat(u_pressure_tex, res, v_px + vec2(+1.0,+0.0));

  // calculate the gradient
  // remember, the gradient in spherical coordinates is [(1/(r*sin(phi))) * (df/dtheta), (1/r) * (df/dphi)]

  float phi= PI*v_texCoord.y;

  // vec2 pGradient = vec2(
  //     (1.0/(r*sin(phi)))*(p21 - p01)/res.x,
  //     (1.0/r)*(p12 - p10)/res.y
  // );

  vec2 pGradient = vec2(
      (p21 - p01)/res.x,
      (p12 - p10)/res.y
  );


  // adjust the velocity by the pressure gradient
  vec2 vel = texture(u_vel_tex, v_texCoord).xy - pGradient;

  value = vec4(vel, 0, 0);
}
`,k=`#version 300 es
precision highp float;
precision highp sampler2D;

// the scalar texture
uniform sampler2D u_scalar_tex;

// multipler
uniform float u_multiplier;

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

  float scalar_val = clamp(texture(u_scalar_tex, v_texCoord).x*u_multiplier + u_offset, 0.0, 1.0);
  vec4 field_col = vec4(inferno(scalar_val), 1.0);

  outColor = mix(arrow_col, field_col, arrow_col.a);
}
`,H=`#version 300 es
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
`,j=`#version 300 es
#define PI 3.1415926538

in vec2 a_position;
out vec2 v_texCoord;

const float u_radius = 0.5;

uniform float u_phiAlpha;
uniform float u_thetaAlpha;
uniform float u_lerpAlpha;

uniform mat4 u_worldViewProjection;


void main() {
   float theta = a_position.x * u_thetaAlpha * 2.0 * PI;
   float phi = a_position.y * u_phiAlpha * PI;

   v_texCoord = a_position;

   vec3 oldpos = vec3(a_position - 0.5, 0.0);
   vec3 newpos = vec3(
       u_radius * cos(theta) * sin(phi),
       u_radius * sin(theta) * sin(phi),
       u_radius * cos(phi)
    );

   vec3 lerpedPos = mix(oldpos, newpos, u_lerpAlpha);

   gl_Position = u_worldViewProjection * vec4(lerpedPos, 1.0);
}
`,W=`#version 300 es
precision highp float;
precision highp sampler2D;

// the rendered texture
uniform sampler2D u_render_tex;

in vec2 v_texCoord;

out vec4 v_outColor;

void main() {
  // color: 0xEBDBB2,
  // v_outColor = vec4(0.922,0.859,0.698, 1.0);
  v_outColor = texture(u_render_tex, vec2(v_texCoord.x, -v_texCoord.y));
}
`,Y=20,Z=20,R=E(Y,Z);class q extends n.Component{constructor(i){super(i);t(this,"canvas",n.createRef());t(this,"range",n.createRef());t(this,"scalarSelect",n.createRef());t(this,"viewSelect",n.createRef());t(this,"velocitySelect",n.createRef());t(this,"gl");t(this,"scalarTextures",[]);t(this,"scalarFramebuffers",[]);t(this,"velTextures",[]);t(this,"velFramebuffers",[]);t(this,"divTexture");t(this,"divFramebuffer");t(this,"pressureTextures",[]);t(this,"pressureFramebuffers",[]);t(this,"newMouseLoc");t(this,"oldMouseLoc");t(this,"renderMultiplier");t(this,"renderOffset");t(this,"prog_advect_scalar");t(this,"prog_advect_vel");t(this,"prog_divergence");t(this,"prog_solve_pressure");t(this,"prog_apply_pressure_force");t(this,"prog_render");t(this,"prog_paint_vel");t(this,"scalarIndex",0);t(this,"velIndex",0);t(this,"pressureIndex",0);t(this,"needsScalarReset",!0);t(this,"needsVelocityReset",!0);t(this,"cmt");t(this,"requestID");t(this,"spherenessRange",n.createRef());t(this,"thetaRange",n.createRef());t(this,"phiRange",n.createRef());t(this,"lerpRange",n.createRef());t(this,"sphereCanvas",n.createRef());t(this,"sphereGl");t(this,"camera");t(this,"sphereTexture");t(this,"sphereWorldViewProjectionLoc");t(this,"sphereThetaAlpha");t(this,"spherePhiAlpha");t(this,"sphereLerpAlpha");t(this,"handleSphereChange",()=>{const i=this.spherenessRange.current.valueAsNumber;this.thetaRange.current.valueAsNumber=i,this.phiRange.current.valueAsNumber=i,this.lerpRange.current.valueAsNumber=Math.min(i*1.5,1),this.handleCircularityChange()});t(this,"handleCircularityChange",()=>{const i=this.thetaRange.current.valueAsNumber,e=this.phiRange.current.valueAsNumber,r=this.lerpRange.current.valueAsNumber;this.sphereGl.uniform1f(this.sphereThetaAlpha,i),this.sphereGl.uniform1f(this.spherePhiAlpha,e),this.sphereGl.uniform1f(this.sphereLerpAlpha,r)});t(this,"animationLoop",()=>{var e,r,a;this.requestID=window.requestAnimationFrame(this.animationLoop),this.camera.update();const i=this.cmt.mousePos;if(i&&(this.gl.useProgram(this.prog_paint_vel),this.gl.activeTexture(this.gl.TEXTURE1),this.gl.bindTexture(this.gl.TEXTURE_2D,this.velTextures[this.velIndex]),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.velFramebuffers[(this.velIndex+1)%2]),this.gl.uniform2f(this.oldMouseLoc,g(i.previous.x,0,this.props.xsize),g(this.props.ysize-i.previous.y,0,this.props.ysize)),this.gl.uniform2f(this.newMouseLoc,g(i.current.x,0,this.props.xsize),g(this.props.ysize-i.current.y,0,this.props.ysize)),this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.velIndex=(this.velIndex+1)%2),this.needsScalarReset){const h=this.props.ysize;this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,this.scalarTextures[this.scalarIndex]);const c=parseInt((e=this.scalarSelect.current)==null?void 0:e.value),m=new Float32Array(this.props.xsize*this.props.ysize);for(let d=0;d<this.props.ysize;d++){const A=Math.floor(d/(h/c))%2;for(let x=0;x<this.props.xsize;x++)Math.floor(x/(h/c))%2+A==1?m[d*this.props.xsize+x]=1:m[d*this.props.xsize+x]=0}T(this.gl,0,0,this.props.xsize,this.props.ysize,m),this.needsScalarReset=!1}if(this.needsVelocityReset){this.gl.activeTexture(this.gl.TEXTURE3),this.gl.bindTexture(this.gl.TEXTURE_2D,this.pressureTextures[this.pressureIndex]),T(this.gl,0,0,this.props.xsize,this.props.ysize,new Float32Array(this.props.xsize*this.props.ysize)),this.gl.activeTexture(this.gl.TEXTURE1),this.gl.bindTexture(this.gl.TEXTURE_2D,this.velTextures[this.velIndex]);let h;switch((r=this.velocitySelect.current)==null?void 0:r.value){case"curlnoise":h=N(3,this.props.xsize,this.props.ysize,Math.random()*500);break;default:h=new Float32Array(this.props.xsize*this.props.ysize*2);break}G(this.gl,0,0,this.props.xsize,this.props.ysize,h),this.needsVelocityReset=!1}for(let h=0;h<this.range.current.valueAsNumber;h++){this.gl.useProgram(this.prog_advect_scalar),this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,this.scalarTextures[this.scalarIndex]),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.scalarFramebuffers[(this.scalarIndex+1)%2]),this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.scalarIndex=(this.scalarIndex+1)%2,this.gl.useProgram(this.prog_advect_vel),this.gl.activeTexture(this.gl.TEXTURE1),this.gl.bindTexture(this.gl.TEXTURE_2D,this.velTextures[this.velIndex]),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.velFramebuffers[(this.velIndex+1)%2]),this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.velIndex=(this.velIndex+1)%2,this.gl.useProgram(this.prog_divergence),this.gl.activeTexture(this.gl.TEXTURE1),this.gl.bindTexture(this.gl.TEXTURE_2D,this.velTextures[this.velIndex]),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.divFramebuffer),this.gl.drawArrays(this.gl.TRIANGLES,0,6);{this.gl.useProgram(this.prog_solve_pressure);for(let c=0;c<15;c++)this.gl.activeTexture(this.gl.TEXTURE2),this.gl.bindTexture(this.gl.TEXTURE_2D,this.divTexture),this.gl.activeTexture(this.gl.TEXTURE3),this.gl.bindTexture(this.gl.TEXTURE_2D,this.pressureTextures[this.pressureIndex]),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.pressureFramebuffers[(this.pressureIndex+1)%2]),this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.pressureIndex=(this.pressureIndex+1)%2}this.gl.useProgram(this.prog_apply_pressure_force),this.gl.activeTexture(this.gl.TEXTURE3),this.gl.bindTexture(this.gl.TEXTURE_2D,this.pressureTextures[this.pressureIndex]),this.gl.activeTexture(this.gl.TEXTURE1),this.gl.bindTexture(this.gl.TEXTURE_2D,this.velTextures[this.velIndex]),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.velFramebuffers[(this.velIndex+1)%2]),this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.velIndex=(this.velIndex+1)%2}{switch(this.gl.useProgram(this.prog_render),this.gl.activeTexture(this.gl.TEXTURE0),(a=this.viewSelect.current)==null?void 0:a.value){case"PRESSURE":{this.gl.bindTexture(this.gl.TEXTURE_2D,this.pressureTextures[this.pressureIndex]),this.gl.uniform1f(this.renderMultiplier,1),this.gl.uniform1f(this.renderOffset,.5);break}case"DIVERGENCE":{this.gl.bindTexture(this.gl.TEXTURE_2D,this.divTexture),this.gl.uniform1f(this.renderMultiplier,100),this.gl.uniform1f(this.renderOffset,.5);break}case"SCALAR":default:{this.gl.bindTexture(this.gl.TEXTURE_2D,this.scalarTextures[this.scalarIndex]),this.gl.uniform1f(this.renderMultiplier,1),this.gl.uniform1f(this.renderOffset,0);break}}this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null),this.gl.drawArrays(this.gl.TRIANGLES,0,6)}{const h=this.camera.getTrackballCameraMatrix(this.props.spheresize,this.props.spheresize);this.sphereGl.uniformMatrix4fv(this.sphereWorldViewProjectionLoc,!1,h),U(this.sphereGl,this.sphereTexture,this.canvas.current),this.sphereGl.activeTexture(this.sphereGl.TEXTURE0),this.sphereGl.bindTexture(this.sphereGl.TEXTURE_2D,this.sphereTexture),this.sphereGl.enable(this.sphereGl.BLEND),this.sphereGl.blendFunc(this.sphereGl.SRC_ALPHA,this.sphereGl.ONE_MINUS_SRC_ALPHA),this.sphereGl.drawArrays(this.sphereGl.TRIANGLES,0,R.length)}})}componentDidMount(){this.gl=this.canvas.current.getContext("webgl2"),this.gl.getExtension("EXT_color_buffer_float");const i=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ARRAY_BUFFER,i),this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(E(1,1).flatMap(e=>[e[0],e[1]])),this.gl.STATIC_DRAW);for(let e=0;e<2;e++){const r=b(this.gl,this.props.xsize,this.props.ysize,new Float32Array(this.props.xsize*this.props.ysize));this.scalarTextures.push(r);const a=this.gl.createFramebuffer();this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,a),this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,r,0),this.scalarFramebuffers.push(a)}for(let e=0;e<2;e++){const r=D(this.gl,this.props.xsize,this.props.ysize,new Float32Array(this.props.xsize*this.props.ysize*2));this.velTextures.push(r);const a=this.gl.createFramebuffer();this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,a),this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,r,0),this.velFramebuffers.push(a)}this.divTexture=b(this.gl,this.props.xsize,this.props.ysize,new Float32Array(this.props.xsize*this.props.ysize)),this.divFramebuffer=this.gl.createFramebuffer(),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.divFramebuffer),this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,this.divTexture,0);for(let e=0;e<2;e++){const r=b(this.gl,this.props.xsize,this.props.ysize,new Float32Array(this.props.xsize*this.props.ysize));this.pressureTextures.push(r);const a=this.gl.createFramebuffer();this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,a),this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,r,0),this.pressureFramebuffers.push(a)}{this.prog_advect_scalar=u(this.gl,[l(this.gl,this.gl.VERTEX_SHADER,v),l(this.gl,this.gl.FRAGMENT_SHADER,M)]);const e=this.gl.getAttribLocation(this.prog_advect_scalar,"c_position"),r=this.gl.getUniformLocation(this.prog_advect_scalar,"u_scalar_tex"),a=this.gl.getUniformLocation(this.prog_advect_scalar,"u_vel_tex");this.gl.enableVertexAttribArray(e),this.gl.vertexAttribPointer(e,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(this.prog_advect_scalar),this.gl.uniform1i(r,0),this.gl.uniform1i(a,1)}{this.prog_advect_vel=u(this.gl,[l(this.gl,this.gl.VERTEX_SHADER,v),l(this.gl,this.gl.FRAGMENT_SHADER,V)]);const e=this.gl.getAttribLocation(this.prog_advect_vel,"c_position"),r=this.gl.getUniformLocation(this.prog_advect_vel,"u_vel_tex");this.gl.enableVertexAttribArray(e),this.gl.vertexAttribPointer(e,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(this.prog_advect_vel),this.gl.uniform1i(r,1)}{this.prog_divergence=u(this.gl,[l(this.gl,this.gl.VERTEX_SHADER,v),l(this.gl,this.gl.FRAGMENT_SHADER,X)]);const e=this.gl.getAttribLocation(this.prog_divergence,"c_position"),r=this.gl.getUniformLocation(this.prog_divergence,"u_vel_tex");this.gl.enableVertexAttribArray(e),this.gl.vertexAttribPointer(e,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(this.prog_divergence),this.gl.uniform1i(r,1)}{this.prog_solve_pressure=u(this.gl,[l(this.gl,this.gl.VERTEX_SHADER,v),l(this.gl,this.gl.FRAGMENT_SHADER,O)]);const e=this.gl.getAttribLocation(this.prog_solve_pressure,"c_position"),r=this.gl.getUniformLocation(this.prog_solve_pressure,"u_divergence_tex"),a=this.gl.getUniformLocation(this.prog_solve_pressure,"u_pressure_tex");this.gl.enableVertexAttribArray(e),this.gl.vertexAttribPointer(e,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(this.prog_solve_pressure),this.gl.uniform1i(r,2),this.gl.uniform1i(a,3)}{this.prog_apply_pressure_force=u(this.gl,[l(this.gl,this.gl.VERTEX_SHADER,v),l(this.gl,this.gl.FRAGMENT_SHADER,B)]);const e=this.gl.getAttribLocation(this.prog_apply_pressure_force,"c_position"),r=this.gl.getUniformLocation(this.prog_apply_pressure_force,"u_vel_tex"),a=this.gl.getUniformLocation(this.prog_apply_pressure_force,"u_pressure_tex");this.gl.enableVertexAttribArray(e),this.gl.vertexAttribPointer(e,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(this.prog_apply_pressure_force),this.gl.uniform1i(r,1),this.gl.uniform1i(a,3)}{this.prog_render=u(this.gl,[l(this.gl,this.gl.VERTEX_SHADER,v),l(this.gl,this.gl.FRAGMENT_SHADER,k)]);const e=this.gl.getAttribLocation(this.prog_render,"c_position"),r=this.gl.getUniformLocation(this.prog_render,"u_scalar_tex"),a=this.gl.getUniformLocation(this.prog_render,"u_vel_tex");this.renderMultiplier=this.gl.getUniformLocation(this.prog_render,"u_multiplier"),this.renderOffset=this.gl.getUniformLocation(this.prog_render,"u_offset"),this.gl.enableVertexAttribArray(e),this.gl.vertexAttribPointer(e,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(this.prog_render),this.gl.uniform1i(r,0),this.gl.uniform1i(a,1)}{this.prog_paint_vel=u(this.gl,[l(this.gl,this.gl.VERTEX_SHADER,v),l(this.gl,this.gl.FRAGMENT_SHADER,H)]);const e=this.gl.getAttribLocation(this.prog_paint_vel,"c_position"),r=this.gl.getUniformLocation(this.prog_paint_vel,"u_vel_tex");this.newMouseLoc=this.gl.getUniformLocation(this.prog_paint_vel,"u_new_mouse"),this.oldMouseLoc=this.gl.getUniformLocation(this.prog_paint_vel,"u_old_mouse"),this.gl.enableVertexAttribArray(e),this.gl.vertexAttribPointer(e,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(this.prog_paint_vel),this.gl.uniform1i(r,1)}{this.camera=new P(this.sphereCanvas.current,{}),this.sphereGl=this.sphereCanvas.current.getContext("webgl2",{premultipliedAlpha:!1}),this.sphereGl.enable(this.sphereGl.DEPTH_TEST),this.sphereTexture=I(this.sphereGl,this.props.spheresize,this.props.spheresize);const e=u(this.sphereGl,[l(this.sphereGl,this.sphereGl.VERTEX_SHADER,j),l(this.sphereGl,this.sphereGl.FRAGMENT_SHADER,W)]),r=this.sphereGl.getAttribLocation(e,"a_position"),a=this.sphereGl.getUniformLocation(e,"u_render_tex");this.sphereThetaAlpha=this.sphereGl.getUniformLocation(e,"u_thetaAlpha"),this.spherePhiAlpha=this.sphereGl.getUniformLocation(e,"u_phiAlpha"),this.sphereLerpAlpha=this.sphereGl.getUniformLocation(e,"u_lerpAlpha"),this.sphereWorldViewProjectionLoc=this.sphereGl.getUniformLocation(e,"u_worldViewProjection");const h=this.sphereGl.createBuffer();this.sphereGl.bindBuffer(this.sphereGl.ARRAY_BUFFER,h),this.sphereGl.bufferData(this.sphereGl.ARRAY_BUFFER,new Float32Array(R.flatMap(c=>[c[0],c[1]])),this.sphereGl.STATIC_DRAW),this.sphereGl.enableVertexAttribArray(r),this.sphereGl.vertexAttribPointer(r,2,this.sphereGl.FLOAT,!1,0,0),this.sphereGl.useProgram(e),this.sphereGl.uniform1f(this.sphereThetaAlpha,0),this.sphereGl.uniform1f(this.spherePhiAlpha,0),this.sphereGl.uniform1f(this.sphereLerpAlpha,0),this.sphereGl.uniform1i(a,0)}this.spherenessRange.current.addEventListener("input",this.handleSphereChange),this.thetaRange.current.addEventListener("input",this.handleCircularityChange),this.phiRange.current.addEventListener("input",this.handleCircularityChange),this.lerpRange.current.addEventListener("input",this.handleCircularityChange),this.cmt=new z(this.canvas.current),this.animationLoop()}getMousePos(i,e){const r=i.getBoundingClientRect(),a=i.width/r.width,h=i.height/r.height;return{x:(e.clientX-r.left)*a,y:(e.clientY-r.top)*h}}componentWillUnmount(){this.cmt.cleanup(),this.spherenessRange.current.removeEventListener("input",this.handleSphereChange),this.thetaRange.current.removeEventListener("input",this.handleCircularityChange),this.phiRange.current.removeEventListener("input",this.handleCircularityChange),this.lerpRange.current.removeEventListener("input",this.handleCircularityChange),window.cancelAnimationFrame(this.requestID),this.camera.cleanup()}render(){return s("div",{style:this.props.style,className:this.props.className,children:o("div",{className:"row",children:[s("div",{className:"col-md-8 d-flex",children:o("div",{children:[s("canvas",{className:"border border-dark mx-3 my-3",ref:this.canvas,width:this.props.xsize,height:this.props.ysize}),s("canvas",{className:"border border-dark mx-3 my-3",ref:this.sphereCanvas,width:this.props.spheresize,height:this.props.spheresize})]})}),o("div",{className:"col-md-4",children:[o("div",{className:"border border-dark p-3 m-3",children:[o("div",{className:"form-group mb-3",children:[s("label",{className:"form-label",children:"Simulation Speed"}),s("input",{type:"range",className:"form-range",min:"0",max:"5",step:1,defaultValue:1,ref:this.range})]}),o("div",{className:"form-group mb-3",children:[s("label",{className:"form-label",children:"Scalar Field"}),o("select",{className:"form-select mb-3",defaultValue:8,ref:this.scalarSelect,children:[s("option",{value:1,children:"Empty"}),s("option",{value:2,children:"Grid 2"}),s("option",{value:8,children:"Grid 8"}),s("option",{value:64,children:"Grid 64"})]}),s("button",{className:"btn btn-primary btn-sm",onClick:()=>this.needsScalarReset=!0,children:"Reset Scalar"})]}),o("div",{className:"form-group mb-3",children:[s("label",{className:"form-label",children:"Velocity Field"}),o("select",{className:"form-select mb-3",defaultValue:8,ref:this.velocitySelect,children:[s("option",{value:"empty",children:"Empty"}),s("option",{value:"curlnoise",children:"Curl Noise"})]}),s("button",{className:"btn btn-primary btn-sm",onClick:()=>this.needsVelocityReset=!0,children:"Reset Velocity"})]}),o("div",{className:"form-group mb-3",children:[s("label",{className:"form-label",children:"View Field"}),o("select",{className:"form-select",defaultValue:"SCALAR",ref:this.viewSelect,children:[s("option",{value:"SCALAR",children:"Scalar"}),s("option",{value:"PRESSURE",children:"Pressure"}),s("option",{value:"DIVERGENCE",children:"Divergence"})]})]})]}),o("div",{className:"border border-dark p-3 m-3",children:[o("div",{className:"form-group mb-3",children:[s("label",{className:"form-label",children:"Sphereness"}),s("input",{type:"range",className:"form-range",min:"0",max:"1",step:"0.05",defaultValue:"0",ref:this.spherenessRange})]}),s("div",{className:"form-group mb-3",children:o("details",{children:[s("summary",{children:"Advanced Sphere Controls"}),o("div",{className:"mx-auto d-block flex-grow-1 ",children:[s("label",{className:"form-label",children:"Join Major"}),s("input",{type:"range",className:"form-range",min:"0",max:"1",step:"0.05",defaultValue:"0",ref:this.thetaRange})]}),o("div",{className:"mx-auto d-block flex-grow-1 ",children:[s("label",{className:"form-label",children:"Join Minor"}),s("input",{type:"range",className:"form-range",min:"0",max:"1",step:"0.05",defaultValue:"0",ref:this.phiRange})]}),o("div",{className:"mx-auto d-block flex-grow-1 ",children:[s("label",{className:"form-label",children:"Alpha"}),s("input",{type:"range",className:"form-range",min:"0",max:"1",step:"0.05",defaultValue:"0",ref:this.lerpRange})]})]})})]})]})]})})}}const J=()=>s(L,{children:({Citation:_,CitationBank:p})=>o(w,{children:[o(f,{id:"overview",name:"Overview",children:[s("p",{children:"Our goals are to:"}),o("ul",{children:[s("li",{children:"Map the fluid simulation onto a sphere."}),s("li",{children:"Make the fluid simulation 3D."})]})]}),o(f,{id:"Fluid3-unmapped-sphere",name:"Incompressible Fluid on a Sphere",children:[s("p",{children:"Incompressible"}),s(S,{title:"Canvas Setup",id:"canvas-setup-demo",children:s(q,{className:"mx-auto",style:{maxWidth:"40em"},xsize:400,ysize:400,spheresize:400})})]}),s(f,{id:"sources",name:"Sources",children:s(p,{})})]})});C.render(s(n.StrictMode,{children:s(J,{})}),document.getElementById("root"));
