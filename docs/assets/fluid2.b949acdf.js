var S=Object.defineProperty;var D=(u,v,l)=>v in u?S(u,v,{enumerable:!0,configurable:!0,writable:!0,value:l}):u[v]=l;var i=(u,v,l)=>(D(u,typeof v!="symbol"?v+"":v,l),l);import"./modulepreload-polyfill.c7c6310f.js";import{a as p,j as e,b as t,F as I}from"./bootstrap.0afc7782.js";import{A as z}from"./ArticleLayout.9ae09534.js";import{S as T}from"./Section.59c5635d.js";import{H as g}from"./HrefLink.bea77805.js";import{i as a}from"./react-katex.m.b96f7ce3.js";import{A as w}from"./AsideCard.d925b07f.js";import{a as N,b as U}from"./Articles.82ce124d.js";import{b as f,d as n,c as y,a as A,o as R,f as F}from"./webgl.1795e08c.js";import{c as m}from"./math.e4175633.js";import{c as C}from"./noise.ab64560a.js";import{C as L}from"./canvas.b09e5cf8.js";import{c as k}from"./client.8e44f6e0.js";import"./mod.a5ac064f.js";const E=`#version 300 es
in vec2 a_position;
out vec2 v_texCoord;

void main() {
  v_texCoord = a_position;

  // convert from 0->1 to 0->2
  // convert from 0->2 to -1->+1 (clip space)
  vec2 clipSpace = (a_position * 2.0) - 1.0;

  gl_Position = vec4(clipSpace, 0, 1);
}
`,M=`#version 300 es
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

    float a = texture(sam, (iuv+vec2(0.5,0.5))/res).r;
    float b = texture(sam, (iuv+vec2(1.5,0.5))/res).r;
    float c = texture(sam, (iuv+vec2(0.5,1.5))/res).r;
    float d = texture(sam, (iuv+vec2(1.5,1.5))/res).r;

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
`,X=`#version 300 es
precision highp float;
precision highp sampler2D;

// the scalar texture
uniform sampler2D u_scalar_tex;

// the velocity texture
uniform sampler2D u_vel_tex;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// the output
out vec4 outColor;

const float ARROW_TILE_SIZE = 16.0;

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

  float scalar_val = texture(u_scalar_tex, v_texCoord).x;
  vec4 field_col = vec4(inferno(scalar_val), 1.0);

  outColor = mix(arrow_col, field_col, arrow_col.a);
}
`,P=`#version 300 es
precision highp float;
precision highp sampler2D;

// the velocity texture
uniform sampler2D u_vel_tex;

// old normalized mouse position
uniform vec2 u_old_mouse;
// new normalized mouse position
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
  // the direction to paint in
  vec2 paintDir = (u_new_mouse - u_old_mouse)*0.001;

  float dist = sdSegment(v_texCoord, u_old_mouse, u_new_mouse);

  if(dist < 0.03) {
    value = texture(u_vel_tex, v_texCoord) + vec4(paintDir, 0.0, 0.0);
  } else {
    value = texture(u_vel_tex, v_texCoord);
  }
}
`;class G extends p.Component{constructor(l){super(l);i(this,"canvas",p.createRef());i(this,"range",p.createRef());i(this,"scalarSelect",p.createRef());i(this,"velocitySelect",p.createRef());i(this,"gl");i(this,"scalarTextures",[]);i(this,"scalarFramebuffers",[]);i(this,"velTextures",[]);i(this,"velFramebuffers",[]);i(this,"newMouseLoc");i(this,"oldMouseLoc");i(this,"prog_advect_scalar");i(this,"prog_render");i(this,"prog_paint_vel");i(this,"scalarIndex",0);i(this,"velIndex",0);i(this,"needsScalarReset",!0);i(this,"needsVelocityReset",!0);i(this,"cmt");i(this,"requestID");i(this,"animationLoop",()=>{var r,o;this.requestID=window.requestAnimationFrame(this.animationLoop);const l=this.cmt.mousePos;if(l){const s=this.props.size;this.gl.useProgram(this.prog_paint_vel),this.gl.activeTexture(this.gl.TEXTURE1),this.gl.bindTexture(this.gl.TEXTURE_2D,this.velTextures[this.velIndex]),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.velFramebuffers[(this.velIndex+1)%2]),this.gl.uniform2f(this.oldMouseLoc,m(l.previous.x,0,s)/s,m(s-l.previous.y,0,s)/s),this.gl.uniform2f(this.newMouseLoc,m(l.current.x,0,s)/s,m(s-l.current.y,0,s)/s),this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.velIndex=(this.velIndex+1)%2}if(this.needsScalarReset){this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,this.scalarTextures[this.scalarIndex]);const s=parseInt((r=this.scalarSelect.current)==null?void 0:r.value),c=new Float32Array(this.props.size*this.props.size);for(let h=0;h<this.props.size;h++){const d=Math.floor(h/(this.props.size/s))%2;for(let _=0;_<this.props.size;_++)Math.floor(_/(this.props.size/s))%2+d==1?c[h*this.props.size+_]=1:c[h*this.props.size+_]=0}R(this.gl,0,0,this.props.size,this.props.size,c),this.needsScalarReset=!1}if(this.needsVelocityReset){this.gl.activeTexture(this.gl.TEXTURE1),this.gl.bindTexture(this.gl.TEXTURE_2D,this.velTextures[this.velIndex]);let s;switch((o=this.velocitySelect.current)==null?void 0:o.value){case"curlnoise":s=C(3,this.props.size,this.props.size,Math.random()*500);break;default:s=new Float32Array(this.props.size*this.props.size*2);break}F(this.gl,0,0,this.props.size,this.props.size,s),this.needsVelocityReset=!1}this.gl.useProgram(this.prog_advect_scalar);for(let s=0;s<this.range.current.valueAsNumber;s++){const c=this.scalarTextures[this.scalarIndex],h=this.scalarFramebuffers[(this.scalarIndex+1)%2];this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,c),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,h),this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.scalarIndex=(this.scalarIndex+1)%2}this.gl.useProgram(this.prog_render),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null),this.gl.drawArrays(this.gl.TRIANGLES,0,6)})}componentDidMount(){this.gl=this.canvas.current.getContext("webgl2"),this.gl.getExtension("EXT_color_buffer_float");const l=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ARRAY_BUFFER,l),this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]),this.gl.STATIC_DRAW);{this.prog_advect_scalar=f(this.gl,[n(this.gl,this.gl.VERTEX_SHADER,E),n(this.gl,this.gl.FRAGMENT_SHADER,M)]);const r=this.gl.getAttribLocation(this.prog_advect_scalar,"a_position"),o=this.gl.getUniformLocation(this.prog_advect_scalar,"u_scalar_tex"),s=this.gl.getUniformLocation(this.prog_advect_scalar,"u_vel_tex");this.gl.enableVertexAttribArray(r),this.gl.vertexAttribPointer(r,2,this.gl.FLOAT,!1,0,0);for(let c=0;c<2;c++){const h=y(this.gl,this.props.size,this.props.size,new Float32Array(this.props.size*this.props.size));this.scalarTextures.push(h);const d=this.gl.createFramebuffer();this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,d),this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,h,0),this.scalarFramebuffers.push(d)}for(let c=0;c<2;c++){new Int32Array(this.props.size*this.props.size*2);const h=A(this.gl,this.props.size,this.props.size,new Float32Array(this.props.size*this.props.size*2));this.velTextures.push(h);const d=this.gl.createFramebuffer();this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,d),this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,h,0),this.velFramebuffers.push(d)}this.gl.useProgram(this.prog_advect_scalar),this.gl.uniform1i(o,0),this.gl.uniform1i(s,1)}{this.prog_render=f(this.gl,[n(this.gl,this.gl.VERTEX_SHADER,E),n(this.gl,this.gl.FRAGMENT_SHADER,X)]);const r=this.gl.getAttribLocation(this.prog_render,"a_position"),o=this.gl.getUniformLocation(this.prog_render,"u_scalar_tex"),s=this.gl.getUniformLocation(this.prog_render,"u_vel_tex");this.gl.enableVertexAttribArray(r),this.gl.vertexAttribPointer(r,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(this.prog_render),this.gl.uniform1i(o,0),this.gl.uniform1i(s,1)}{this.prog_paint_vel=f(this.gl,[n(this.gl,this.gl.VERTEX_SHADER,E),n(this.gl,this.gl.FRAGMENT_SHADER,P)]);const r=this.gl.getAttribLocation(this.prog_paint_vel,"a_position"),o=this.gl.getUniformLocation(this.prog_paint_vel,"u_vel_tex");this.newMouseLoc=this.gl.getUniformLocation(this.prog_paint_vel,"u_new_mouse"),this.oldMouseLoc=this.gl.getUniformLocation(this.prog_paint_vel,"u_old_mouse"),this.gl.enableVertexAttribArray(r),this.gl.vertexAttribPointer(r,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(this.prog_paint_vel),this.gl.uniform1i(o,1)}this.cmt=new L(this.canvas.current),this.animationLoop()}componentWillUnmount(){window.cancelAnimationFrame(this.requestID),this.cmt.cleanup()}render(){return e("div",{style:this.props.style,className:this.props.className,children:t("div",{className:"row",children:[e("div",{className:"col-md-8 d-flex",children:e("canvas",{className:"border border-dark",ref:this.canvas,height:this.props.size,width:this.props.size})}),e("div",{className:"col-md-4",children:t("div",{className:"border border-dark p-3 m-3",children:[e("h6",{children:"Controls"}),t("div",{className:"form-group mb-3",children:[e("label",{className:"form-label",children:"Simulation Speed"}),e("input",{type:"range",className:"form-range",min:"0",max:"5",step:1,defaultValue:1,ref:this.range})]}),t("div",{className:"form-group mb-3",children:[e("label",{className:"form-label",children:"Scalar Field"}),t("select",{className:"form-select mb-3",defaultValue:8,ref:this.scalarSelect,children:[e("option",{value:1,children:"Empty"}),e("option",{value:2,children:"Grid 2"}),e("option",{value:8,children:"Grid 8"}),e("option",{value:64,children:"Grid 64"})]}),e("button",{className:"btn btn-primary btn-sm",onClick:()=>this.needsScalarReset=!0,children:"Reset Scalar"})]}),t("div",{className:"form-group",children:[e("label",{className:"form-label",children:"Velocity Field"}),t("select",{className:"form-select mb-3",defaultValue:8,ref:this.velocitySelect,children:[e("option",{value:"empty",children:"Empty"}),e("option",{value:"curlnoise",children:"Curl Noise"})]}),e("button",{className:"btn btn-primary btn-sm",onClick:()=>this.needsVelocityReset=!0,children:"Reset Velocity"})]})]})})]})})}}const x=`#version 300 es
in vec2 c_position;
out vec2 v_texCoord;

void main() {
  v_texCoord = c_position;

  // convert from 0->1 to 0->2
  // convert from 0->2 to -1->+1 (clip space)
  vec2 clipSpace = (c_position * 2.0) - 1.0;

  gl_Position = vec4(clipSpace, 0, 1);
}
`,V=`#version 300 es
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
`,O=`#version 300 es
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
`,q=`#version 300 es
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
`,B=`#version 300 es
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
`,W=`#version 300 es
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
`,H=`#version 300 es
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

const float ARROW_TILE_SIZE = 16.0;

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
`,Z=`#version 300 es
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
  //vec2 paintDir = 0.01*(u_new_mouse - u_old_mouse)/resolution.y;
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
`;class j extends p.Component{constructor(l){super(l);i(this,"canvas",p.createRef());i(this,"range",p.createRef());i(this,"scalarSelect",p.createRef());i(this,"velocitySelect",p.createRef());i(this,"gl");i(this,"scalarTextures",[]);i(this,"scalarFramebuffers",[]);i(this,"velTextures",[]);i(this,"velFramebuffers",[]);i(this,"divTexture");i(this,"divFramebuffer");i(this,"pressureTextures",[]);i(this,"pressureFramebuffers",[]);i(this,"newMouseLoc");i(this,"oldMouseLoc");i(this,"renderOffset");i(this,"prog_advect_scalar");i(this,"prog_advect_vel");i(this,"prog_divergence");i(this,"prog_solve_pressure");i(this,"prog_apply_pressure_force");i(this,"prog_render");i(this,"prog_paint_vel");i(this,"scalarIndex",0);i(this,"velIndex",0);i(this,"pressureIndex",0);i(this,"needsScalarReset",!0);i(this,"needsVelocityReset",!0);i(this,"cmt");i(this,"viewPressure",!1);i(this,"requestID");i(this,"animationLoop",()=>{var r,o;this.requestID=window.requestAnimationFrame(this.animationLoop);const l=this.cmt.mousePos;if(l&&(this.gl.useProgram(this.prog_paint_vel),this.gl.activeTexture(this.gl.TEXTURE1),this.gl.bindTexture(this.gl.TEXTURE_2D,this.velTextures[this.velIndex]),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.velFramebuffers[(this.velIndex+1)%2]),this.gl.uniform2f(this.oldMouseLoc,m(l.previous.x,0,this.props.xsize),m(this.props.ysize-l.previous.y,0,this.props.ysize)),this.gl.uniform2f(this.newMouseLoc,m(l.current.x,0,this.props.xsize),m(this.props.ysize-l.current.y,0,this.props.ysize)),this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.velIndex=(this.velIndex+1)%2),this.needsScalarReset){const s=this.props.ysize;this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,this.scalarTextures[this.scalarIndex]);const c=parseInt((r=this.scalarSelect.current)==null?void 0:r.value),h=new Float32Array(this.props.xsize*this.props.ysize);for(let d=0;d<this.props.ysize;d++){const _=Math.floor(d/(s/c))%2;for(let b=0;b<this.props.xsize;b++)Math.floor(b/(s/c))%2+_==1?h[d*this.props.xsize+b]=1:h[d*this.props.xsize+b]=0}R(this.gl,0,0,this.props.xsize,this.props.ysize,h),this.needsScalarReset=!1}if(this.needsVelocityReset){this.gl.activeTexture(this.gl.TEXTURE3),this.gl.bindTexture(this.gl.TEXTURE_2D,this.pressureTextures[this.pressureIndex]),R(this.gl,0,0,this.props.xsize,this.props.ysize,new Float32Array(this.props.xsize*this.props.ysize)),this.gl.activeTexture(this.gl.TEXTURE1),this.gl.bindTexture(this.gl.TEXTURE_2D,this.velTextures[this.velIndex]);let s;switch((o=this.velocitySelect.current)==null?void 0:o.value){case"curlnoise":s=C(3,this.props.xsize,this.props.ysize,Math.random()*500);break;default:s=new Float32Array(this.props.xsize*this.props.ysize*2);break}F(this.gl,0,0,this.props.xsize,this.props.ysize,s),this.needsVelocityReset=!1}for(let s=0;s<this.range.current.valueAsNumber;s++){this.gl.useProgram(this.prog_advect_scalar),this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,this.scalarTextures[this.scalarIndex]),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.scalarFramebuffers[(this.scalarIndex+1)%2]),this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.scalarIndex=(this.scalarIndex+1)%2,this.gl.useProgram(this.prog_advect_vel),this.gl.activeTexture(this.gl.TEXTURE1),this.gl.bindTexture(this.gl.TEXTURE_2D,this.velTextures[this.velIndex]),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.velFramebuffers[(this.velIndex+1)%2]),this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.velIndex=(this.velIndex+1)%2,this.gl.useProgram(this.prog_divergence),this.gl.activeTexture(this.gl.TEXTURE1),this.gl.bindTexture(this.gl.TEXTURE_2D,this.velTextures[this.velIndex]),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.divFramebuffer),this.gl.drawArrays(this.gl.TRIANGLES,0,6);{this.gl.useProgram(this.prog_solve_pressure);for(let c=0;c<15;c++)this.gl.activeTexture(this.gl.TEXTURE2),this.gl.bindTexture(this.gl.TEXTURE_2D,this.divTexture),this.gl.activeTexture(this.gl.TEXTURE3),this.gl.bindTexture(this.gl.TEXTURE_2D,this.pressureTextures[this.pressureIndex]),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.pressureFramebuffers[(this.pressureIndex+1)%2]),this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.pressureIndex=(this.pressureIndex+1)%2}this.gl.useProgram(this.prog_apply_pressure_force),this.gl.activeTexture(this.gl.TEXTURE3),this.gl.bindTexture(this.gl.TEXTURE_2D,this.pressureTextures[this.pressureIndex]),this.gl.activeTexture(this.gl.TEXTURE1),this.gl.bindTexture(this.gl.TEXTURE_2D,this.velTextures[this.velIndex]),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.velFramebuffers[(this.velIndex+1)%2]),this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.velIndex=(this.velIndex+1)%2}this.gl.useProgram(this.prog_render),this.viewPressure?(this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,this.pressureTextures[this.pressureIndex]),this.gl.uniform1f(this.renderOffset,.5)):(this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,this.scalarTextures[this.scalarIndex]),this.gl.uniform1f(this.renderOffset,0)),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null),this.gl.drawArrays(this.gl.TRIANGLES,0,6)})}componentDidMount(){this.gl=this.canvas.current.getContext("webgl2"),this.gl.getExtension("EXT_color_buffer_float");const l=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ARRAY_BUFFER,l),this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]),this.gl.STATIC_DRAW);for(let r=0;r<2;r++){const o=y(this.gl,this.props.xsize,this.props.ysize,new Float32Array(this.props.xsize*this.props.ysize));this.scalarTextures.push(o);const s=this.gl.createFramebuffer();this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,s),this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,o,0),this.scalarFramebuffers.push(s)}for(let r=0;r<2;r++){const o=A(this.gl,this.props.xsize,this.props.ysize,new Float32Array(this.props.xsize*this.props.ysize*2));this.velTextures.push(o);const s=this.gl.createFramebuffer();this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,s),this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,o,0),this.velFramebuffers.push(s)}this.divTexture=y(this.gl,this.props.xsize,this.props.ysize,new Float32Array(this.props.xsize*this.props.ysize)),this.divFramebuffer=this.gl.createFramebuffer(),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.divFramebuffer),this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,this.divTexture,0);for(let r=0;r<2;r++){const o=y(this.gl,this.props.xsize,this.props.ysize,new Float32Array(this.props.xsize*this.props.ysize));this.pressureTextures.push(o);const s=this.gl.createFramebuffer();this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,s),this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,o,0),this.pressureFramebuffers.push(s)}{this.prog_advect_scalar=f(this.gl,[n(this.gl,this.gl.VERTEX_SHADER,x),n(this.gl,this.gl.FRAGMENT_SHADER,V)]);const r=this.gl.getAttribLocation(this.prog_advect_scalar,"c_position"),o=this.gl.getUniformLocation(this.prog_advect_scalar,"u_scalar_tex"),s=this.gl.getUniformLocation(this.prog_advect_scalar,"u_vel_tex");this.gl.enableVertexAttribArray(r),this.gl.vertexAttribPointer(r,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(this.prog_advect_scalar),this.gl.uniform1i(o,0),this.gl.uniform1i(s,1)}{this.prog_advect_vel=f(this.gl,[n(this.gl,this.gl.VERTEX_SHADER,x),n(this.gl,this.gl.FRAGMENT_SHADER,O)]);const r=this.gl.getAttribLocation(this.prog_advect_vel,"c_position"),o=this.gl.getUniformLocation(this.prog_advect_vel,"u_vel_tex");this.gl.enableVertexAttribArray(r),this.gl.vertexAttribPointer(r,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(this.prog_advect_vel),this.gl.uniform1i(o,1)}{this.prog_divergence=f(this.gl,[n(this.gl,this.gl.VERTEX_SHADER,x),n(this.gl,this.gl.FRAGMENT_SHADER,q)]);const r=this.gl.getAttribLocation(this.prog_divergence,"c_position"),o=this.gl.getUniformLocation(this.prog_divergence,"u_vel_tex");this.gl.enableVertexAttribArray(r),this.gl.vertexAttribPointer(r,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(this.prog_divergence),this.gl.uniform1i(o,1)}{this.prog_solve_pressure=f(this.gl,[n(this.gl,this.gl.VERTEX_SHADER,x),n(this.gl,this.gl.FRAGMENT_SHADER,B)]);const r=this.gl.getAttribLocation(this.prog_solve_pressure,"c_position"),o=this.gl.getUniformLocation(this.prog_solve_pressure,"u_divergence_tex"),s=this.gl.getUniformLocation(this.prog_solve_pressure,"u_pressure_tex");this.gl.enableVertexAttribArray(r),this.gl.vertexAttribPointer(r,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(this.prog_solve_pressure),this.gl.uniform1i(o,2),this.gl.uniform1i(s,3)}{this.prog_apply_pressure_force=f(this.gl,[n(this.gl,this.gl.VERTEX_SHADER,x),n(this.gl,this.gl.FRAGMENT_SHADER,W)]);const r=this.gl.getAttribLocation(this.prog_apply_pressure_force,"c_position"),o=this.gl.getUniformLocation(this.prog_apply_pressure_force,"u_vel_tex"),s=this.gl.getUniformLocation(this.prog_apply_pressure_force,"u_pressure_tex");this.gl.enableVertexAttribArray(r),this.gl.vertexAttribPointer(r,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(this.prog_apply_pressure_force),this.gl.uniform1i(o,1),this.gl.uniform1i(s,3)}{this.prog_render=f(this.gl,[n(this.gl,this.gl.VERTEX_SHADER,x),n(this.gl,this.gl.FRAGMENT_SHADER,H)]);const r=this.gl.getAttribLocation(this.prog_render,"c_position"),o=this.gl.getUniformLocation(this.prog_render,"u_scalar_tex"),s=this.gl.getUniformLocation(this.prog_render,"u_vel_tex");this.renderOffset=this.gl.getUniformLocation(this.prog_render,"u_offset"),this.gl.enableVertexAttribArray(r),this.gl.vertexAttribPointer(r,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(this.prog_render),this.gl.uniform1i(o,0),this.gl.uniform1i(s,1)}{this.prog_paint_vel=f(this.gl,[n(this.gl,this.gl.VERTEX_SHADER,x),n(this.gl,this.gl.FRAGMENT_SHADER,Z)]);const r=this.gl.getAttribLocation(this.prog_paint_vel,"c_position"),o=this.gl.getUniformLocation(this.prog_paint_vel,"u_vel_tex");this.newMouseLoc=this.gl.getUniformLocation(this.prog_paint_vel,"u_new_mouse"),this.oldMouseLoc=this.gl.getUniformLocation(this.prog_paint_vel,"u_old_mouse"),this.gl.enableVertexAttribArray(r),this.gl.vertexAttribPointer(r,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(this.prog_paint_vel),this.gl.uniform1i(o,1)}this.cmt=new L(this.canvas.current),this.animationLoop()}componentWillUnmount(){this.cmt.cleanup(),window.cancelAnimationFrame(this.requestID)}render(){return e("div",{style:this.props.style,className:this.props.className,children:t("div",{className:"row",children:[e("div",{className:"col-md-8 d-flex",children:e("div",{children:e("canvas",{className:"border border-dark mx-auto my-3",ref:this.canvas,height:this.props.ysize,width:this.props.xsize})})}),e("div",{className:"col-md-4",children:t("div",{className:"border border-dark p-3 m-3",children:[e("h6",{children:"Controls"}),t("div",{className:"form-group mb-3",children:[e("label",{className:"form-label",children:"Simulation Speed"}),e("input",{type:"range",className:"form-range",min:"0",max:"5",step:1,defaultValue:1,ref:this.range})]}),t("div",{className:"form-group mb-3",children:[e("label",{className:"form-label",children:"Scalar Field"}),t("select",{className:"form-select mb-3",defaultValue:8,ref:this.scalarSelect,children:[e("option",{value:1,children:"Empty"}),e("option",{value:2,children:"Grid 2"}),e("option",{value:8,children:"Grid 8"}),e("option",{value:64,children:"Grid 64"})]}),e("button",{className:"btn btn-primary btn-sm",onClick:()=>this.needsScalarReset=!0,children:"Reset Scalar"})]}),t("div",{className:"form-group mb-3",children:[e("label",{className:"form-label",children:"Velocity Field"}),t("select",{className:"form-select mb-3",defaultValue:8,ref:this.velocitySelect,children:[e("option",{value:"empty",children:"Empty"}),e("option",{value:"curlnoise",children:"Curl Noise"})]}),e("button",{className:"btn btn-primary btn-sm",onClick:()=>this.needsVelocityReset=!0,children:"Reset Velocity"})]}),e("div",{className:"form-group",children:t("div",{className:"custom-control custom-checkbox",children:[e("input",{type:"checkbox",className:"custom-control-input",onClick:()=>this.viewPressure=!this.viewPressure}),e("label",{className:"custom-control-label",children:"View Pressure"})]})})]})})]})})}}const Y=()=>e(z,{children:({Citation:u,CitationBank:v})=>t(I,{children:[t(T,{id:"overview",name:"Overview",children:[e("p",{children:"Our goals are to:"}),t("ul",{children:[e("li",{children:"explain simply the math behind fluid simulation"}),e("li",{children:"learn how to use the Navier-Stokes equations to simulate fluids"}),e("li",{children:"provide working code to simulate 2D incompressible flow"})]}),e("p",{children:"Prerequisites:"}),e("ul",{children:e("li",{children:e(N,{a:U.get("fluid1")})})})]}),t(T,{id:"math-fluid-simulation",name:"Math of Fluid Simulation",children:[e("h4",{children:"Prerequisites"}),e("p",{children:"This section makes heavy use of multivariable calculus, matrix multiplication, and systems of equations. so if you're not familiar or need a refresher, I recommend checking out these topics:"}),t("ul",{children:[t("li",{children:["Vector Multiplication and Matrix Multiplication",t("ul",{children:[e("li",{children:e(g,{href:"https://www.mathsisfun.com/algebra/matrix-multiplying.html"})}),e("li",{children:e(g,{href:"https://mathinsight.org/matrix_vector_multiplication"})})]})]}),t("li",{children:["Vector and Scalar Fields",t("ul",{children:[e("li",{children:e(g,{href:"https://www.khanacademy.org/math/multivariable-calculus/thinking-about-multivariable-function/ways-to-represent-multivariable-functions/a/multivariable-functions"})}),e("li",{children:e(g,{href:"https://www.khanacademy.org/math/multivariable-calculus/thinking-about-multivariable-function/ways-to-represent-multivariable-functions/a/vector-fields"})})]})]}),t("li",{children:["Partial Derivatives",e("ul",{children:e("li",{children:e(g,{href:"https://www.khanacademy.org/math/multivariable-calculus/multivariable-derivatives/partial-derivative-and-gradient-articles/a/introduction-to-partial-derivatives"})})})]}),t("li",{children:["The Gradient of Scalar Fields",e("ul",{children:e("li",{children:e(g,{href:"https://www.khanacademy.org/math/multivariable-calculus/multivariable-derivatives/partial-derivative-and-gradient-articles/a/introduction-to-partial-derivatives"})})})]}),t("li",{children:["Divergence of a Vector Field",e("ul",{children:e("li",{children:e(g,{href:"https://www.khanacademy.org/math/multivariable-calculus/multivariable-derivatives/divergence-and-curl-articles/a/divergence"})})})]}),t("li",{children:["Finite Differences",e("ul",{children:e("li",{children:e(g,{href:"https://en.wikipedia.org/wiki/Finite_difference#Relation_with_derivatives"})})})]})]}),e("h4",{children:"Notation"}),e("p",{children:"In this article, we'll use the following notation, which is consistent with that used by Khan Academy:"}),t("ul",{children:[t("li",{children:["Lowercase letters and greek letters for scalars.",e("br",{}),"Examples:",t("ul",{children:[e("li",{children:e(a,{math:"a = 5"})}),e("li",{children:e(a,{math:"y = x^2 + 1"})})]})]}),t("li",{children:["Lowercase letters and greek letters with an arrow on top for vectors.",e("br",{}),"Examples:",t("ul",{children:[e("li",{children:e(a,{math:"\\vec v = \\begin{bmatrix} 1 \\\\ -2 \\end{bmatrix}"})}),e("li",{children:e(a,{math:"\\vec f = \\nabla (x^2 + y^2)"})})]})]})]}),e("h4",{children:"Navier Stokes"}),e("p",{children:"Fluids are complicated. If we wanted to make our simulation perfectly accurate, we would have to simulate at the molecular level, directly handling the elastic collisions of molecules against each other."}),e("p",{children:"Indeed, this intricate level of simulation is often done when dealing with high temperature plasmas. However, there are quite a few downsides to this. First of all, it's really slow. You'd never be able to do this on real time on consumer hardware. And second of all, it's very complicated. We want code that's easy to write and understand, even if you've never had experience in fluid simulation."}),e("p",{children:"The good news is that it's not necessary to go to such lengths to have a fairly realistic fluid simulation. Doing so would be complete overkill for most cases, which never see such extreme conditions. So, we'll make a few choice simplifications to make our simulation both fast and easy to understand:"}),t("ol",{children:[t("li",{children:["We'll assume our fluid is a continuuum",e(u,{source:"https://en.wikipedia.org/wiki/Derivation_of_the_Navier%E2%80%93Stokes_equations#Basic_assumptions"}),".",t("ul",{children:[e("li",{children:"This means that the fluid is a continous substance, and that we can find the derivatives of fluid properties like pressure and velocity."}),e("li",{children:"Since all matter is made out of atoms, this isn't actually true, but the effects of this are negligible on the macroscopic scale."})]})]}),t("li",{children:["We'll assume our fluid is incompressible.",e("ul",{children:t("li",{children:["In reality of course, no fluid is perfectly incompressible, but it's a close enough approximation. For example, water is nearly aways incompressible. Even for air, we only really need to start worrying about compressibility when the flow approaches Mach 0.3",e(u,{source:"https://en.wikipedia.org/wiki/Compressible_flow"}),"."]})})]}),t("li",{children:["We'll assume our fluid has no friction.",e("ul",{children:e("li",{children:`This one is probably the most egregious simplification, but as we'll see, inaccuracies in our simulation give us friction "for free" anyway.`})})]})]}),e("p",{children:"When we take these assumptions and combine them with the rules of conservation of mass, and the conservation of momentum, we get the incompressible Navier Stokes equations:"}),e(a,{block:!0,children:String.raw`
        \begin{gather}
          \frac {\partial \vec{u}} {\partial t} =
          -(\vec{u} \cdot \nabla)\vec{u}
          -\frac {1} {\rho} \nabla{p} \\
          \nabla \cdot \vec{u} = 0
        \end{gather}
      `}),"Where:",t("ul",{children:[t("li",{children:[e(a,{math:"\\vec u"})," is the velocity vector field"]}),t("li",{children:[e(a,{math:"p"})," is the pressure scalar field"]}),t("li",{children:[e(a,{math:"\\rho"})," is the density of the fluid"]}),t("li",{children:[e(a,{math:"\\frac {\\partial \\vec{u}} {\\partial t}"})," is the derivative of the velocity vector field with respect to time"]})]}),t("p",{children:["In our case, since we're neglecting friction, we've technically listed the Euler equations, which are a special case of the Navier-Stokes equations when the viscosity of the fluid is zero throughout.",e(u,{source:"https://en.wikipedia.org/wiki/Euler_equations_(fluid_dynamics)"}),". However, most what we're saying applies equally to the Navier-Stokes equations."]}),t("p",{children:["If you're interested, a derivation of Navier Stokes can be found on Wikipedia here: ",e(g,{href:"https://en.wikipedia.org/wiki/Derivation_of_the_Navier%E2%80%93Stokes_equations"}),", but it's not necessary to understand in order to implement a simulation of it."]}),e("h4",{children:"Understanding the Equations"}),e("p",{children:"The equations, despite being quite short, are pretty confusing."}),e("p",{children:"First, we have to understand what's even going on. These equations, as written, are a set of equalities that we can try to apply to a scenario that has:"}),t("ul",{children:[e("li",{children:"A vector field representing velocity at any given point"}),e("li",{children:"A vector field representing the derivative of this field with respect to time"}),e("li",{children:"A scalar field representing the pressure at any given point"}),e("li",{children:"A single scalar value that represents the density of the fluid"})]}),e("p",{children:"If we have all 4 of these values, then we can check if they satisfy the equations. To do this, imagine we visit every single position on the coordinate plane, and ask: Do the fields at this position satisfy equation 1? Do they satisfy equation 2?"}),t("ul",{children:[t("li",{children:["If the answer is yes, ",e("i",{children:"for every single point on the coordinate plane"}),', then we can say "yeah, these fields can represent an incompressible fluid"']}),t("li",{children:["If the answer is no, ",e("i",{children:"for even a single point"}),`, then we must say "no, these fields don't represent an incompressible fluid"`]})]}),e("p",{children:"That's literally everything these equations let us do right now, mathematically speaking."}),e("p",{children:"But wait, if we have 3 values, shouldn't we be able to solve for the 4th?"}),t("p",{children:["As it turns out, no. The Navier-Stokes equations are notoriously unsolvable in the general case. Given arbitrary initial conditions, we don't even yet know if a globally defined smooth pressure and velocity field that solves the equation exists. This problem, known as Navier-Stokes existence and smoothness, was designated one of the 7 Millenium Prize Problems, and anyone who solves it will recieve a million dollar prize",e(u,{source:"https://www.claymath.org/sites/default/files/navierstokes.pdf"}),"."]}),e("p",{children:"That being said, it's definitely possible to numerically approximate solutions, and this is indeed what we have to do. Numerically approximated solutions are never 100% accurate, and since the Navier-Stokes equations are chaotic, we'll eventually diverge from the true state of the fluid."}),e("p",{children:"For certain applications, like weather forecasting, this can be a real problem. For others, like video games, it's not as big of a deal. We're focusing on the second use case for now, so we won't worry too much about accuracy, especially where it conflicts with performance."}),t(w,{title:"Simulating a solution to Navier-Stokes",children:[e("p",{children:"Let's walk through what we are going to do to in our simulation."}),e("ol",{}),t("p",{children:["In our case, we already have ",e(a,{math:"{\\vec u}_{t=0}"}),", ",e(a,{math:"p_{t=0}"})," and ",e(a,{math:"\\rho"}),", and we want to find ",e(a,{math:"{\\frac {\\partial \\vec{u}} {\\partial t}}_{t=0}"}),". Then, we'll approximate the velocity field one timestep in the future by adding ",e(a,{math:"{\\frac {\\partial \\vec{u}} {\\partial t}}_{t=0}"})," to ",e(a,{math:"{\\vec u}_{t=0}"})," to get ",e(a,{math:"{\\vec u}_{t=1}"}),'(This method is sometimes called the "Forward Euler Method"',e(u,{source:"https://en.wikipedia.org/wiki/Euler_method"}),", and it's one of the simplest and most intuitive ways to solve a differential equation.)"]}),t("p",{children:["We then use ",e(a,{math:"{\\vec u}_{t=1}"})," to find ",e(a,{math:"{p}_{t=1}"}),". We will see that the pressure field can be found directly from velocity field without needing either ",e(a,{math:"\\frac {\\partial \\vec{u}} {\\partial t}"})," or ",e(a,{math:"\\rho"}),"."]})]}),e("h5",{children:"Equation 1"}),e(a,{block:!0,math:String.raw`\frac {\partial \vec{u}} {\partial t} = -(\vec{u} \cdot \nabla)\vec{u} -\frac {1} {\rho} \nabla{p}`}),e("ul",{children:t("li",{children:[e(a,{math:String.raw`\frac {\partial \vec{u}} {\partial t}`})," is key here. It"]})})]}),t(T,{id:"webgl2-advection",name:"Fluid Advection with WebGL2",children:[e("p",{children:"Now, we'll approach the heat equation"}),e(w,{title:"Fluid Advection",id:"fluid-advection-demo",children:e(G,{className:"mx-auto",style:{maxWidth:"40em"},size:400})})]}),t(T,{id:"webgl2-incompressible",name:"Incompressible Fluid with WebGL2",children:[e("p",{children:"Now, we'll approach the heat equation"}),e(w,{title:"Fluid Advection",id:"fluid-advection-demo",children:e(j,{className:"mx-auto",style:{maxWidth:"40em"},xsize:400,ysize:800})})]}),e(T,{id:"sources",name:"Sources",children:e(v,{})})]})}),$=k(document.getElementById("root"));$.render(e(p.StrictMode,{children:e(Y,{})}));
