var U=Object.defineProperty;var D=(_,h,s)=>h in _?U(_,h,{enumerable:!0,configurable:!0,writable:!0,value:s}):_[h]=s;var i=(_,h,s)=>(D(_,typeof h!="symbol"?h+"":h,s),s);import"./modulepreload-polyfill.c7c6310f.js";import{a as u,b as g,j as o,F as L}from"./bootstrap.0afc7782.js";import{S as z}from"./Section.59c5635d.js";import{H as R}from"./HrefLink.bea77805.js";import{A as S}from"./ArticleLayout.9ae09534.js";import{A as P}from"./AsideCard.d925b07f.js";import{g as I,c as X,a as F,b as f,d as p,h as E,o as w,f as T}from"./webgl.1795e08c.js";import{c as C}from"./client.8e44f6e0.js";const v=`#version 300 es
in vec2 a_position;
out vec2 v_texCoord;

void main() {
  v_texCoord = a_position;

  // convert from 0->1 to 0->2
  // convert from 0->2 to -1->+1 (clip space)
  vec2 clipSpace = (a_position * 2.0) - 1.0;

  gl_Position = vec4(clipSpace, 0, 1);
}
`,B=`#version 300 es
precision highp float;
precision highp sampler2D;
precision highp usampler2D;

// the particle texture
uniform usampler2D u_particle_state_tex;

// the particle texture
uniform sampler2D u_particle_mass_tex;

// the position texture
uniform sampler2D u_particle_position_tex;

// the momentum texture
uniform sampler2D u_particle_momentum_tex;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// the output
out vec4 value;

const float G = 0.001;

void main() {
  // get the resolution
  ivec2 resolution = textureSize(u_particle_mass_tex, 0);

  float x_off = 1.0/float(resolution.x);
  float y_off = 1.0/float(resolution.y);

  // our current position
  vec2 pos1 = texture(u_particle_position_tex, v_texCoord).xy;

  vec2 p = texture(u_particle_momentum_tex, v_texCoord).xy;

  uint state1 = texture(u_particle_state_tex, v_texCoord).x;
  if(state1 == 0u) {
    for(int y = 0; y < resolution.y; y++) {
      for(int x = 0; x < resolution.x; x++) {
        vec2 loc = vec2(float(x)*x_off, float(y)*y_off);
        uint state2 = texture(u_particle_state_tex, loc).x;
        if(state2 == 0u) {
          float m2 = texture(u_particle_mass_tex, loc).x;
          vec2 pos2 = texture(u_particle_position_tex, loc).xy;
          vec2 r_vec = pos2-pos1;
          float r_mag = length(r_vec);
          vec2 r_hat = r_vec/r_mag;
          vec2 accel = G*m2*r_hat/(r_mag*r_mag);
          if(!isnan(accel.x) && !isnan(accel.y)) {
            p += accel;
          }
        }
      }
    }
  }

  // apply momentum
  value = vec4(p, 0, 0);
}
`,N=`#version 300 es
precision highp float;
precision highp sampler2D;
precision highp usampler2D;

// the particle texture
uniform usampler2D u_particle_state_tex;

// the particle texture
uniform sampler2D u_particle_mass_tex;

// the position texture
uniform sampler2D u_particle_position_tex;

// the momentum texture
uniform sampler2D u_particle_momentum_tex;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// the output
out vec4 value;

void main() {
  uint state = texture(u_particle_state_tex, v_texCoord).x;
  float mass = texture(u_particle_mass_tex, v_texCoord).x;
  vec2 position = texture(u_particle_position_tex, v_texCoord).xy;
  vec2 momentum = texture(u_particle_momentum_tex, v_texCoord).xy;

  // change position only if live
  if(state == 0u) {
    position = position + momentum/mass;
  }

  value = vec4(position , 0, 1);
}
`,G=`#version 300 es
precision highp float;
precision highp sampler2D;
precision highp usampler2D;

// the particle texture
uniform usampler2D u_particle_state_tex;

// the particle texture
uniform sampler2D u_particle_mass_tex;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// the output
out vec4 value;

void main() {
  float mass = texture(u_particle_mass_tex, v_texCoord).x;
  value = vec4(mass, 0, 0, 1);
}
`,O=`#version 300 es
precision highp float;
precision highp sampler2D;
precision highp usampler2D;

// the state texture
uniform usampler2D u_particle_state_tex;

// the particle texture
uniform sampler2D u_particle_mass_tex;

// the position texture
uniform sampler2D u_particle_position_tex;

// the momentum texture
uniform sampler2D u_particle_momentum_tex;


// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// the output
out uvec4 value;

const vec2 upperCorner = vec2(0, 0);
const vec2 lowerCorner = vec2(512, 512);

void main() {
  uint state = texture(u_particle_state_tex, v_texCoord).x;
  vec2 position = texture(u_particle_position_tex, v_texCoord).xy;
  if(position == clamp(position, upperCorner, lowerCorner)) {
    value = uvec4(state, 0, 0, 1);
  } else {
    value = uvec4(1, 0, 0, 1);
  }
}
`;class k extends u.Component{constructor(s){super(s);i(this,"particle_tex_xsize",2);i(this,"particle_tex_ysize",2);i(this,"particle_canvas",u.createRef());i(this,"render_canvas",u.createRef());i(this,"range",u.createRef());i(this,"scalarSelect",u.createRef());i(this,"velocitySelect",u.createRef());i(this,"gl");i(this,"particleStateTextures",[]);i(this,"particleStateFramebuffers",[]);i(this,"particleMassTextures",[]);i(this,"particleMassFramebuffers",[]);i(this,"particlePositionTextures",[]);i(this,"particlePositionFramebuffers",[]);i(this,"particleMomentumTextures",[]);i(this,"particleMomentumFramebuffers",[]);i(this,"prog_apply_gravity");i(this,"prog_move_particle");i(this,"prog_handle_mass");i(this,"prog_handle_state");i(this,"particleStateIndex",0);i(this,"particleMassIndex",0);i(this,"particlePositionIndex",0);i(this,"particleMomentumIndex",0);i(this,"needsReset",!0);i(this,"mousePos",null);i(this,"state_data",new Uint32Array(this.particle_tex_xsize*this.particle_tex_ysize*4));i(this,"mass_data",new Float32Array(this.particle_tex_xsize*this.particle_tex_ysize*4));i(this,"position_data",new Float32Array(this.particle_tex_xsize*this.particle_tex_ysize*4));i(this,"momentum_data",new Float32Array(this.particle_tex_xsize*this.particle_tex_ysize*4));i(this,"requestID");i(this,"animationLoop",()=>{if(this.requestID=window.requestAnimationFrame(this.animationLoop),this.needsReset){const s=new Uint32Array(this.particle_tex_xsize*this.particle_tex_ysize);for(let l=0;l<s.length;l++)s[l]=0;this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,this.particleStateTextures[this.particleStateIndex]),E(this.gl,0,0,this.particle_tex_xsize,this.particle_tex_ysize,s);const e=new Float32Array(this.particle_tex_xsize*this.particle_tex_ysize);for(let l=0;l<e.length;l++)e[l]=Math.random()*50;this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,this.particleMassTextures[this.particleMassIndex]),w(this.gl,0,0,this.particle_tex_xsize,this.particle_tex_ysize,e);const t=new Float32Array(this.particle_tex_xsize*this.particle_tex_ysize*2);for(let l=0;l<this.particle_tex_ysize;l++)for(let r=0;r<this.particle_tex_xsize;r++){const c=l*this.particle_tex_xsize+r;t[c*2+0]=r*20+32,t[c*2+1]=l*20+32}this.gl.activeTexture(this.gl.TEXTURE1),this.gl.bindTexture(this.gl.TEXTURE_2D,this.particlePositionTextures[this.particlePositionIndex]),T(this.gl,0,0,this.particle_tex_xsize,this.particle_tex_ysize,t);const a=new Float32Array(this.particle_tex_xsize*this.particle_tex_ysize*2);for(let l=0;l<this.particle_tex_ysize;l++)for(let r=0;r<this.particle_tex_xsize;r++){const c=l*this.particle_tex_xsize+r;a[c*2+0]=(Math.random()-.5)*0,a[c*2+1]=(Math.random()-.5)*0}this.gl.activeTexture(this.gl.TEXTURE2),this.gl.bindTexture(this.gl.TEXTURE_2D,this.particleMomentumTextures[this.particleMomentumIndex]),T(this.gl,0,0,this.particle_tex_xsize,this.particle_tex_ysize,a),this.needsReset=!1}for(let s=0;s<this.range.current.valueAsNumber;s++){{this.gl.useProgram(this.prog_handle_state),this.gl.activeTexture(this.gl.TEXTURE1),this.gl.bindTexture(this.gl.TEXTURE_2D,this.particleMassTextures[this.particleMassIndex]),this.gl.activeTexture(this.gl.TEXTURE2),this.gl.bindTexture(this.gl.TEXTURE_2D,this.particlePositionTextures[this.particlePositionIndex]),this.gl.activeTexture(this.gl.TEXTURE3),this.gl.bindTexture(this.gl.TEXTURE_2D,this.particleMomentumTextures[this.particleMomentumIndex]);const e=this.particleStateTextures[this.particleStateIndex],t=this.particleStateFramebuffers[(this.particleStateIndex+1)%2];this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,e),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,t),this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.particleStateIndex=(this.particleStateIndex+1)%2}{this.gl.useProgram(this.prog_handle_mass),this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,this.particleStateTextures[this.particleStateIndex]);const e=this.particleMassTextures[this.particleMassIndex],t=this.particleMassFramebuffers[(this.particleMassIndex+1)%2];this.gl.activeTexture(this.gl.TEXTURE1),this.gl.bindTexture(this.gl.TEXTURE_2D,e),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,t),this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.particleMassIndex=(this.particleMassIndex+1)%2}{this.gl.useProgram(this.prog_apply_gravity),this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,this.particleStateTextures[this.particleStateIndex]),this.gl.activeTexture(this.gl.TEXTURE1),this.gl.bindTexture(this.gl.TEXTURE_2D,this.particleMassTextures[this.particleMassIndex]),this.gl.activeTexture(this.gl.TEXTURE2),this.gl.bindTexture(this.gl.TEXTURE_2D,this.particlePositionTextures[this.particlePositionIndex]);const e=this.particleMomentumTextures[this.particleMomentumIndex],t=this.particleMomentumFramebuffers[(this.particleMomentumIndex+1)%2];this.gl.activeTexture(this.gl.TEXTURE3),this.gl.bindTexture(this.gl.TEXTURE_2D,e),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,t),this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.particleMomentumIndex=(this.particleMomentumIndex+1)%2}{this.gl.useProgram(this.prog_move_particle),this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,this.particleStateTextures[this.particleStateIndex]),this.gl.activeTexture(this.gl.TEXTURE1),this.gl.bindTexture(this.gl.TEXTURE_2D,this.particleMassTextures[this.particleMassIndex]),this.gl.activeTexture(this.gl.TEXTURE3),this.gl.bindTexture(this.gl.TEXTURE_2D,this.particleMomentumTextures[this.particleMomentumIndex]);const e=this.particlePositionTextures[this.particlePositionIndex],t=this.particlePositionFramebuffers[(this.particlePositionIndex+1)%2];this.gl.activeTexture(this.gl.TEXTURE2),this.gl.bindTexture(this.gl.TEXTURE_2D,e),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,t),this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.particlePositionIndex=(this.particlePositionIndex+1)%2}}this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.particleStateFramebuffers[this.particleStateIndex]),this.gl.readPixels(0,0,this.particle_tex_xsize,this.particle_tex_ysize,this.gl.RGBA_INTEGER,this.gl.UNSIGNED_INT,this.state_data),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.particleMassFramebuffers[this.particleMassIndex]),this.gl.readPixels(0,0,this.particle_tex_xsize,this.particle_tex_ysize,this.gl.RGBA,this.gl.FLOAT,this.mass_data),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.particlePositionFramebuffers[this.particlePositionIndex]),this.gl.readPixels(0,0,this.particle_tex_xsize,this.particle_tex_ysize,this.gl.RGBA,this.gl.FLOAT,this.position_data),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.particleMomentumFramebuffers[this.particleMomentumIndex]),this.gl.readPixels(0,0,this.particle_tex_xsize,this.particle_tex_ysize,this.gl.RGBA,this.gl.FLOAT,this.momentum_data),this.draw(this.state_data,this.mass_data,this.position_data,this.momentum_data)});i(this,"editData",null);i(this,"handleMouseDown",s=>{const e=this.getMousePos(this.render_canvas.current,s);this.mousePos={current:e,previous:e};for(let t=0;t<this.position_data.length/4;t++)if(this.state_data[t*4]==0){const a=this.calcRadius(this.mass_data[t*4]);if(Math.hypot(e.x-this.position_data[t*4+0],e.y-this.position_data[t*4+1])<a){this.editData={id:t,dragging:e},this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,this.particleStateTextures[this.particleStateIndex]),E(this.gl,t%this.particle_tex_xsize,t/this.particle_tex_xsize,1,1,Uint32Array.from([1]));break}}});i(this,"handleMouseUp",s=>{var e;(e=this.editData)!=null&&e.dragging&&(this.gl.activeTexture(this.gl.TEXTURE2),this.gl.bindTexture(this.gl.TEXTURE_2D,this.particlePositionTextures[this.particlePositionIndex]),T(this.gl,this.editData.id%this.particle_tex_xsize,this.editData.id/this.particle_tex_xsize,1,1,Float32Array.from([this.editData.dragging.x,this.editData.dragging.y])),this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,this.particleStateTextures[this.particleStateIndex]),E(this.gl,this.editData.id%this.particle_tex_xsize,this.editData.id/this.particle_tex_xsize,1,1,Uint32Array.from([0])),this.editData.dragging=null),this.mousePos=null});i(this,"handleMouseMove",s=>{var t;if(!this.mousePos)return;const e=this.getMousePos(this.render_canvas.current,s);this.mousePos={current:e,previous:this.mousePos.current},(t=this.editData)!=null&&t.dragging&&(this.editData.dragging=e,this.gl.activeTexture(this.gl.TEXTURE2),this.gl.bindTexture(this.gl.TEXTURE_2D,this.particlePositionTextures[this.particlePositionIndex]),T(this.gl,this.editData.id%this.particle_tex_xsize,this.editData.id/this.particle_tex_xsize,1,1,Float32Array.from([this.editData.dragging.x,this.editData.dragging.y])))});i(this,"discardTouchEvent",s=>s.preventDefault());i(this,"calcRadius",s=>1.5*Math.sqrt(s)+5);i(this,"draw",(s,e,t,a)=>{var c;const l=this.render_canvas.current,r=this.render_canvas.current.getContext("2d");r.fillStyle="#000000",r.fillRect(0,0,l.width,l.height),r.strokeStyle="#FF0000";for(let n=0;n<t.length/4;n++){let b=s[n*4],x=t[n*4+0],m=t[n*4+1],d=e[n*4],y=Math.sqrt(d);switch(r.beginPath(),r.arc(x,m,y,0,2*Math.PI),b){case 0:r.fillStyle="#FFFFFF";break;default:r.fillStyle="#FF0000";break}r.fill(),r.beginPath(),r.moveTo(x,m);let A=a[n*4+0]/d,M=a[n*4+1]/d;r.lineTo(x+A,m+M),r.stroke(),n==((c=this.editData)==null?void 0:c.id)&&(r.strokeStyle="#0000FF",r.beginPath(),r.arc(x,m,this.calcRadius(d),0,2*Math.PI),r.stroke(),r.strokeStyle="#FF0000")}})}componentDidMount(){this.gl=this.particle_canvas.current.getContext("webgl2"),this.gl.getExtension("EXT_color_buffer_float");for(let e=0;e<2;e++){const t=I(this.gl,this.particle_tex_xsize,this.particle_tex_ysize);this.particleStateTextures.push(t);const a=this.gl.createFramebuffer();this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,a),this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,t,0),this.particleStateFramebuffers.push(a)}for(let e=0;e<2;e++){const t=X(this.gl,this.particle_tex_xsize,this.particle_tex_ysize,new Float32Array(this.particle_tex_xsize*this.particle_tex_ysize));this.particleMassTextures.push(t);const a=this.gl.createFramebuffer();this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,a),this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,t,0),this.particleMassFramebuffers.push(a)}for(let e=0;e<2;e++){const t=F(this.gl,this.particle_tex_xsize,this.particle_tex_ysize,new Float32Array(this.particle_tex_xsize*this.particle_tex_ysize*2));this.particlePositionTextures.push(t);const a=this.gl.createFramebuffer();this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,a),this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,t,0),this.particlePositionFramebuffers.push(a)}for(let e=0;e<2;e++){const t=F(this.gl,this.particle_tex_xsize,this.particle_tex_ysize,new Float32Array(this.particle_tex_xsize*this.particle_tex_ysize*2));this.particleMomentumTextures.push(t);const a=this.gl.createFramebuffer();this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,a),this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,t,0),this.particleMomentumFramebuffers.push(a)}const s=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ARRAY_BUFFER,s),this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]),this.gl.STATIC_DRAW);{this.prog_apply_gravity=f(this.gl,[p(this.gl,this.gl.VERTEX_SHADER,v),p(this.gl,this.gl.FRAGMENT_SHADER,B)]);const e=this.gl.getAttribLocation(this.prog_apply_gravity,"a_position"),t=this.gl.getUniformLocation(this.prog_apply_gravity,"u_particle_state_tex"),a=this.gl.getUniformLocation(this.prog_apply_gravity,"u_particle_mass_tex"),l=this.gl.getUniformLocation(this.prog_apply_gravity,"u_particle_position_tex"),r=this.gl.getUniformLocation(this.prog_apply_gravity,"u_particle_momentum_tex");this.gl.enableVertexAttribArray(e),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,s),this.gl.vertexAttribPointer(e,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(this.prog_apply_gravity),this.gl.uniform1i(t,0),this.gl.uniform1i(a,1),this.gl.uniform1i(l,2),this.gl.uniform1i(r,3)}{this.prog_move_particle=f(this.gl,[p(this.gl,this.gl.VERTEX_SHADER,v),p(this.gl,this.gl.FRAGMENT_SHADER,N)]);const e=this.gl.getAttribLocation(this.prog_move_particle,"a_position"),t=this.gl.getUniformLocation(this.prog_move_particle,"u_particle_state_tex"),a=this.gl.getUniformLocation(this.prog_move_particle,"u_particle_mass_tex"),l=this.gl.getUniformLocation(this.prog_move_particle,"u_particle_position_tex"),r=this.gl.getUniformLocation(this.prog_move_particle,"u_particle_momentum_tex");this.gl.enableVertexAttribArray(e),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,s),this.gl.vertexAttribPointer(e,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(this.prog_move_particle),this.gl.uniform1i(t,0),this.gl.uniform1i(a,1),this.gl.uniform1i(l,2),this.gl.uniform1i(r,3)}{this.prog_handle_mass=f(this.gl,[p(this.gl,this.gl.VERTEX_SHADER,v),p(this.gl,this.gl.FRAGMENT_SHADER,G)]);const e=this.gl.getAttribLocation(this.prog_handle_mass,"a_position"),t=this.gl.getUniformLocation(this.prog_handle_mass,"u_particle_state_tex"),a=this.gl.getUniformLocation(this.prog_handle_mass,"u_particle_mass_tex");this.gl.enableVertexAttribArray(e),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,s),this.gl.vertexAttribPointer(e,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(this.prog_handle_mass),this.gl.uniform1i(t,0),this.gl.uniform1i(a,1)}{this.prog_handle_state=f(this.gl,[p(this.gl,this.gl.VERTEX_SHADER,v),p(this.gl,this.gl.FRAGMENT_SHADER,O)]);const e=this.gl.getAttribLocation(this.prog_handle_state,"a_position"),t=this.gl.getUniformLocation(this.prog_handle_state,"u_particle_state_tex"),a=this.gl.getUniformLocation(this.prog_handle_state,"u_particle_mass_tex"),l=this.gl.getUniformLocation(this.prog_handle_state,"u_particle_position_tex"),r=this.gl.getUniformLocation(this.prog_handle_state,"u_particle_momentum_tex");this.gl.enableVertexAttribArray(e),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,s),this.gl.vertexAttribPointer(e,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(this.prog_handle_state),this.gl.uniform1i(t,0),this.gl.uniform1i(a,1),this.gl.uniform1i(l,2),this.gl.uniform1i(r,3)}this.render_canvas.current.addEventListener("pointerdown",this.handleMouseDown),this.render_canvas.current.addEventListener("pointermove",this.handleMouseMove),window.addEventListener("pointerup",this.handleMouseUp),this.render_canvas.current.addEventListener("touchstart",this.discardTouchEvent),this.render_canvas.current.addEventListener("touchmove",this.discardTouchEvent),this.render_canvas.current.addEventListener("touchend",this.discardTouchEvent),this.render_canvas.current.addEventListener("touchcancel",this.discardTouchEvent),this.animationLoop()}getMousePos(s,e){const t=s.getBoundingClientRect(),a=s.width/t.width,l=s.height/t.height;return{x:(e.clientX-t.left)*a,y:(e.clientY-t.top)*l}}componentWillUnmount(){this.render_canvas.current.removeEventListener("pointerdown",this.handleMouseDown),this.render_canvas.current.removeEventListener("pointermove",this.handleMouseMove),window.removeEventListener("pointerup",this.handleMouseUp),this.render_canvas.current.removeEventListener("touchstart",this.discardTouchEvent),this.render_canvas.current.removeEventListener("touchmove",this.discardTouchEvent),this.render_canvas.current.removeEventListener("touchend",this.discardTouchEvent),this.render_canvas.current.removeEventListener("touchcancel",this.discardTouchEvent),window.cancelAnimationFrame(this.requestID)}render(){return g("div",{style:this.props.style,className:this.props.className,children:[o("div",{children:o("canvas",{className:"border border-dark",ref:this.particle_canvas,height:this.particle_tex_xsize,width:this.particle_tex_ysize,hidden:!0})}),g("div",{className:"row",children:[o("div",{className:"col-md-8 d-flex",children:o("canvas",{className:"border border-dark",ref:this.render_canvas,height:this.props.size,width:this.props.size})}),o("div",{className:"col-md-4",children:g("div",{className:"border border-dark p-3 m-3",children:[o("h6",{children:"Controls"}),g("div",{className:"form-group mb-3",children:[o("label",{className:"form-label",children:"Simulation Speed"}),o("input",{type:"range",className:"form-range",min:"0",max:"5",step:1,defaultValue:1,ref:this.range})]}),g("div",{className:"form-group mb-3",children:[o("label",{className:"form-label",children:"Scalar Field"}),g("select",{className:"form-select mb-3",defaultValue:8,ref:this.scalarSelect,children:[o("option",{value:32,children:"2^6: 64"}),o("option",{value:32,children:"2^6: 64"}),o("option",{value:16,children:"2^8 64"})]}),o("button",{className:"btn btn-primary btn-sm",onClick:()=>this.needsReset=!0,children:"Reset"})]})]})})]})]})}}const H=()=>o(S,{children:({Citation:_,CitationBank:h})=>o(L,{children:g(z,{name:"Spacewar",id:"spacewar",children:[o("p",{children:o(R,{href:"https://github.com/pimpale/spacewar"})}),o("p",{children:o(R,{href:"https://github.com/pimpale/GravitySimulator"})}),o(P,{title:"Canvas Setup",id:"canvas-setup-demo",children:o(k,{className:"mx-auto",style:{maxWidth:"50em"},size:512})})]})})}),V=C(document.getElementById("root"));V.render(o(u.StrictMode,{children:o(H,{})}));
