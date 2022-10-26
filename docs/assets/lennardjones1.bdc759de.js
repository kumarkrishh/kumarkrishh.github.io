var F=Object.defineProperty;var D=(g,p,r)=>p in g?F(g,p,{enumerable:!0,configurable:!0,writable:!0,value:r}):g[p]=r;var t=(g,p,r)=>(D(g,typeof p!="symbol"?p+"":p,r),r);import"./modulepreload-polyfill.c7c6310f.js";import{a as n,b as c,j as s,F as E}from"./bootstrap.0afc7782.js";import{S as A}from"./Section.59c5635d.js";import{H as R}from"./HrefLink.bea77805.js";import{A as S}from"./ArticleLayout.9ae09534.js";import{A as L}from"./AsideCard.d925b07f.js";import{i as w,j as C,b as m,d as _,k as f,l as d}from"./webgl.1795e08c.js";import{c as b}from"./math.e4175633.js";import{C as z}from"./canvas.b09e5cf8.js";import{c as N}from"./client.8e44f6e0.js";const x=`#version 300 es
in vec2 a_position;
out vec2 v_texCoord;

void main() {
  v_texCoord = a_position;

  // convert from 0->1 to 0->2
  // convert from 0->2 to -1->+1 (clip space)
  vec2 clipSpace = (a_position * 2.0) - 1.0;

  gl_Position = vec4(clipSpace, 0, 1);
}
`,U=`#version 300 es
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
`,P=`#version 300 es
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
`,I=`#version 300 es
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
`;class V extends n.Component{constructor(r){super(r);t(this,"xsize",40);t(this,"ysize",40);t(this,"particle_tex_xsize",40);t(this,"particle_tex_ysize",40);t(this,"particle_canvas",n.createRef());t(this,"cmt");t(this,"render_canvas",n.createRef());t(this,"range",n.createRef());t(this,"gravityDefault",0);t(this,"viscosityDefault",0);t(this,"attractionDefault",1);t(this,"repulsionDefault",5e3);t(this,"wallSpringConstantDefault",.001);t(this,"wallSpringDampingDefault",.99);t(this,"xGravityRange",n.createRef());t(this,"yGravityRange",n.createRef());t(this,"viscosityRange",n.createRef());t(this,"attractionRange",n.createRef());t(this,"repulsionRange",n.createRef());t(this,"wallSpringConstantRange",n.createRef());t(this,"wallSpringDampingRange",n.createRef());t(this,"scalarSelect",n.createRef());t(this,"velocitySelect",n.createRef());t(this,"gl");t(this,"xGravityLoc");t(this,"yGravityLoc");t(this,"viscosityLoc");t(this,"attractionLoc");t(this,"repulsionLoc");t(this,"wallSpringConstantLoc");t(this,"wallSpringDampingLoc");t(this,"particleStateTextures",[]);t(this,"particleStateFramebuffers",[]);t(this,"particlePositionVelocityTextures",[]);t(this,"particlePositionVelocityFramebuffers",[]);t(this,"mouseLoc");t(this,"prog_apply_gravity");t(this,"prog_handle_state");t(this,"prog_apply_mouse");t(this,"particleStateIndex",0);t(this,"particlePositionVelocityIndex",0);t(this,"needsReset",!0);t(this,"state_data",new Int32Array(this.particle_tex_xsize*this.particle_tex_ysize*4));t(this,"position_velocity_data",new Float32Array(this.particle_tex_xsize*this.particle_tex_ysize*4));t(this,"requestID");t(this,"animationLoop",()=>{if(this.requestID=window.requestAnimationFrame(this.animationLoop),this.needsReset){const e=new Int32Array(this.particle_tex_xsize*this.particle_tex_ysize*2),i=new Float32Array(this.particle_tex_xsize*this.particle_tex_ysize*4);for(let l=0;l<this.particle_tex_ysize;l++)for(let o=0;o<this.particle_tex_xsize;o++){const h=l*this.particle_tex_xsize+o;e[h*2]=0,o<this.particle_tex_xsize-0?(e[h*2+1]=1,i[h*4+0]=o*4+20,i[h*4+1]=l*4+20):(e[h*2+1]=-1,i[h*4+0]=o*4+200,i[h*4+1]=l*4+10)}this.gl.bindTexture(this.gl.TEXTURE_2D,this.particleStateTextures[this.particleStateIndex]),f(this.gl,0,0,this.particle_tex_xsize,this.particle_tex_ysize,e),this.gl.bindTexture(this.gl.TEXTURE_2D,this.particlePositionVelocityTextures[this.particlePositionVelocityIndex]),d(this.gl,0,0,this.particle_tex_xsize,this.particle_tex_ysize,i),this.needsReset=!1}const r=this.range.current.valueAsNumber,a=r*r;for(let e=0;e<a;e++){const i=this.cmt.mousePos;i&&(this.gl.useProgram(this.prog_apply_mouse),this.gl.activeTexture(this.gl.TEXTURE1),this.gl.bindTexture(this.gl.TEXTURE_2D,this.particlePositionVelocityTextures[this.particlePositionVelocityIndex]),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.particlePositionVelocityFramebuffers[(this.particlePositionVelocityIndex+1)%2]),this.gl.uniform2f(this.mouseLoc,b(i.current.x,0,this.props.xsize),b(i.current.y,0,this.props.ysize)),this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.particlePositionVelocityIndex=(this.particlePositionVelocityIndex+1)%2);{this.gl.useProgram(this.prog_handle_state),this.gl.activeTexture(this.gl.TEXTURE1),this.gl.bindTexture(this.gl.TEXTURE_2D,this.particlePositionVelocityTextures[this.particlePositionVelocityIndex]);const l=this.particleStateTextures[this.particleStateIndex],o=this.particleStateFramebuffers[(this.particleStateIndex+1)%2];this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,l),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,o),this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.particleStateIndex=(this.particleStateIndex+1)%2}{this.gl.useProgram(this.prog_apply_gravity),this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,this.particleStateTextures[this.particleStateIndex]);const l=this.particlePositionVelocityTextures[this.particlePositionVelocityIndex],o=this.particlePositionVelocityFramebuffers[(this.particlePositionVelocityIndex+1)%2];this.gl.activeTexture(this.gl.TEXTURE1),this.gl.bindTexture(this.gl.TEXTURE_2D,l),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,o),this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.particlePositionVelocityIndex=(this.particlePositionVelocityIndex+1)%2}}this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.particleStateFramebuffers[this.particleStateIndex]),this.gl.readPixels(0,0,this.particle_tex_xsize,this.particle_tex_ysize,this.gl.RGBA_INTEGER,this.gl.INT,this.state_data),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.particlePositionVelocityFramebuffers[this.particlePositionVelocityIndex]),this.gl.readPixels(0,0,this.particle_tex_xsize,this.particle_tex_ysize,this.gl.RGBA,this.gl.FLOAT,this.position_velocity_data),this.draw(this.state_data,this.position_velocity_data)});t(this,"editData");t(this,"handleMouseDown",r=>{var a;if(((a=this.editData)==null?void 0:a.dragging)===void 0){for(let e=0;e<this.position_velocity_data.length/4;e++)if(this.state_data[e*4]==0){const i=this.calcRadius(this.state_data[e*4+1]);if(Math.hypot(r.x-this.position_velocity_data[e*4+0],r.y-this.position_velocity_data[e*4+1])<i){const o=this.state_data[e*4+1];this.editData={id:e,mass:o,dragging:r},this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,this.particleStateTextures[this.particleStateIndex]),f(this.gl,e%this.particle_tex_xsize,e/this.particle_tex_xsize,1,1,Int32Array.from([1,o]));break}}}});t(this,"handleMouseUp",r=>{var a;((a=this.editData)==null?void 0:a.dragging)!==void 0&&(this.gl.activeTexture(this.gl.TEXTURE1),this.gl.bindTexture(this.gl.TEXTURE_2D,this.particlePositionVelocityTextures[this.particlePositionVelocityIndex]),d(this.gl,this.editData.id%this.particle_tex_xsize,this.editData.id/this.particle_tex_xsize,1,1,Float32Array.from([this.editData.dragging.x,this.editData.dragging.y,0,0])),this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,this.particleStateTextures[this.particleStateIndex]),f(this.gl,this.editData.id%this.particle_tex_xsize,this.editData.id/this.particle_tex_xsize,1,1,Int32Array.from([0,this.editData.mass])),this.editData.dragging=void 0)});t(this,"handleMouseMove",r=>{var a;((a=this.editData)==null?void 0:a.dragging)!==void 0&&(this.editData.dragging=r,this.gl.activeTexture(this.gl.TEXTURE1),this.gl.bindTexture(this.gl.TEXTURE_2D,this.particlePositionVelocityTextures[this.particlePositionVelocityIndex]),d(this.gl,this.editData.id%this.particle_tex_xsize,this.editData.id/this.particle_tex_xsize,1,1,Float32Array.from([this.editData.dragging.x,this.editData.dragging.y,0,0])))});t(this,"handleChange",()=>{this.gl.useProgram(this.prog_apply_gravity);const r=this.xGravityRange.current.valueAsNumber,a=this.yGravityRange.current.valueAsNumber,e=this.viscosityRange.current.valueAsNumber,i=this.attractionRange.current.valueAsNumber,l=this.repulsionRange.current.valueAsNumber,o=this.wallSpringConstantRange.current.valueAsNumber,h=this.wallSpringDampingRange.current.valueAsNumber;this.gl.uniform1f(this.xGravityLoc,r),this.gl.uniform1f(this.yGravityLoc,a),this.gl.uniform1f(this.viscosityLoc,e),this.gl.uniform1f(this.attractionLoc,i),this.gl.uniform1f(this.repulsionLoc,l),this.gl.uniform1f(this.wallSpringConstantLoc,o),this.gl.uniform1f(this.wallSpringDampingLoc,h)});t(this,"calcRadius",r=>1.5*Math.sqrt(Math.abs(r))+5);t(this,"tick",0);t(this,"draw",(r,a)=>{var l;this.tick==0?this.tick=100:this.tick--;const e=this.render_canvas.current,i=this.render_canvas.current.getContext("2d");i.fillStyle="#000000",i.fillRect(0,0,e.width,e.height),i.strokeStyle="#FF0000";for(let o=0;o<a.length/4;o++){let h=r[o*4],y=a[o*4+0],v=a[o*4+1],u=r[o*4+1],T=Math.sqrt(Math.abs(u));switch(i.beginPath(),i.arc(y,v,T,0,2*Math.PI),h){case 0:u<0?i.fillStyle="#FF00FF":i.fillStyle="#FFFFFF";break;default:i.fillStyle="#FF0000";break}i.fill(),o==((l=this.editData)==null?void 0:l.id)&&(i.strokeStyle="#0000FF",i.beginPath(),i.arc(y,v,this.calcRadius(u),0,2*Math.PI),i.stroke(),i.strokeStyle="#FF0000")}})}componentDidMount(){this.gl=this.particle_canvas.current.getContext("webgl2"),this.gl.getExtension("EXT_color_buffer_float");for(let a=0;a<2;a++){const e=w(this.gl,this.particle_tex_xsize,this.particle_tex_ysize);this.particleStateTextures.push(e);const i=this.gl.createFramebuffer();this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,i),this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,e,0),this.particleStateFramebuffers.push(i)}for(let a=0;a<2;a++){const e=C(this.gl,this.particle_tex_xsize,this.particle_tex_ysize,new Float32Array(this.particle_tex_xsize*this.particle_tex_ysize*4));this.particlePositionVelocityTextures.push(e);const i=this.gl.createFramebuffer();this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,i),this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,e,0),this.particlePositionVelocityFramebuffers.push(i)}const r=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ARRAY_BUFFER,r),this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]),this.gl.STATIC_DRAW);{this.prog_apply_gravity=m(this.gl,[_(this.gl,this.gl.VERTEX_SHADER,x),_(this.gl,this.gl.FRAGMENT_SHADER,U)]);const a=this.gl.getAttribLocation(this.prog_apply_gravity,"a_position"),e=this.gl.getUniformLocation(this.prog_apply_gravity,"u_particle_state_tex"),i=this.gl.getUniformLocation(this.prog_apply_gravity,"u_particle_position_velocity_tex");this.xGravityLoc=this.gl.getUniformLocation(this.prog_apply_gravity,"u_x_gravity"),this.yGravityLoc=this.gl.getUniformLocation(this.prog_apply_gravity,"u_y_gravity"),this.viscosityLoc=this.gl.getUniformLocation(this.prog_apply_gravity,"u_viscosity"),this.attractionLoc=this.gl.getUniformLocation(this.prog_apply_gravity,"u_attraction"),this.repulsionLoc=this.gl.getUniformLocation(this.prog_apply_gravity,"u_repulsion"),this.wallSpringConstantLoc=this.gl.getUniformLocation(this.prog_apply_gravity,"u_wall_spring_constant"),this.wallSpringDampingLoc=this.gl.getUniformLocation(this.prog_apply_gravity,"u_wall_spring_damping"),this.gl.enableVertexAttribArray(a),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,r),this.gl.vertexAttribPointer(a,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(this.prog_apply_gravity),this.gl.uniform1f(this.xGravityLoc,this.gravityDefault),this.gl.uniform1f(this.yGravityLoc,this.gravityDefault),this.gl.uniform1f(this.viscosityLoc,this.viscosityDefault),this.gl.uniform1f(this.attractionLoc,this.attractionDefault),this.gl.uniform1f(this.repulsionLoc,this.repulsionDefault),this.gl.uniform1f(this.wallSpringConstantLoc,this.wallSpringConstantDefault),this.gl.uniform1f(this.wallSpringDampingLoc,this.wallSpringDampingDefault);const l=this.gl.getUniformLocation(this.prog_apply_gravity,"u_dimensions");this.gl.uniform2f(l,this.props.xsize,this.props.ysize),this.gl.uniform1i(e,0),this.gl.uniform1i(i,1)}{this.prog_handle_state=m(this.gl,[_(this.gl,this.gl.VERTEX_SHADER,x),_(this.gl,this.gl.FRAGMENT_SHADER,I)]);const a=this.gl.getAttribLocation(this.prog_handle_state,"a_position"),e=this.gl.getUniformLocation(this.prog_handle_state,"u_particle_state_tex"),i=this.gl.getUniformLocation(this.prog_handle_state,"u_particle_position_velocity_tex");this.gl.enableVertexAttribArray(a),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,r),this.gl.vertexAttribPointer(a,2,this.gl.FLOAT,!1,0,0);const l=this.gl.getUniformLocation(this.prog_handle_state,"u_dimensions");this.gl.uniform2f(l,this.props.xsize,this.props.ysize),this.gl.useProgram(this.prog_handle_state),this.gl.uniform1i(e,0),this.gl.uniform1i(i,1)}{this.prog_apply_mouse=m(this.gl,[_(this.gl,this.gl.VERTEX_SHADER,x),_(this.gl,this.gl.FRAGMENT_SHADER,P)]);const a=this.gl.getAttribLocation(this.prog_apply_mouse,"a_position"),e=this.gl.getUniformLocation(this.prog_apply_mouse,"u_particle_state_tex"),i=this.gl.getUniformLocation(this.prog_apply_mouse,"u_particle_position_velocity_tex");this.mouseLoc=this.gl.getUniformLocation(this.prog_apply_mouse,"u_mouse"),this.gl.enableVertexAttribArray(a),this.gl.vertexAttribPointer(a,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(this.prog_apply_mouse),this.gl.uniform1i(e,0),this.gl.uniform1i(i,1)}this.cmt=new z(this.render_canvas.current),this.animationLoop()}componentWillUnmount(){this.cmt.cleanup(),window.cancelAnimationFrame(this.requestID)}render(){return c("div",{style:this.props.style,className:this.props.className,children:[s("div",{children:s("canvas",{className:"border border-dark",ref:this.particle_canvas,height:this.particle_tex_xsize,width:this.particle_tex_ysize,hidden:!0})}),c("div",{className:"row",children:[s("div",{className:"col-md-8 ",children:s("canvas",{className:"border border-dark",ref:this.render_canvas,width:this.props.xsize,height:this.props.ysize})}),s("div",{className:"col-md-4",children:c("div",{className:"border border-dark p-3 m-3",children:[s("h6",{children:"Controls"}),c("div",{className:"form-group mb-3",children:[s("label",{className:"form-label",children:"Simulation Speed"}),s("input",{type:"range",className:"form-range",min:"0",max:"15",step:1,defaultValue:1,ref:this.range})]}),c("div",{className:"form-group mb-3",children:[s("label",{className:"form-label",children:"X Gravity"}),s("input",{type:"range",className:"form-range",min:"-0.00001",max:"0.00001",step:"0.000005",defaultValue:this.gravityDefault,ref:this.xGravityRange,onInput:this.handleChange})]}),c("div",{className:"form-group mb-3",children:[s("label",{className:"form-label",children:"Y Gravity"}),s("input",{type:"range",className:"form-range",min:"-0.00001",max:"0.00001",step:"0.000005",defaultValue:this.gravityDefault,ref:this.yGravityRange,onInput:this.handleChange})]}),c("div",{className:"form-group mb-3",children:[s("label",{className:"form-label",children:"Viscosity"}),s("input",{type:"range",className:"form-range",min:"0",max:"0.01",step:"0.001",defaultValue:this.viscosityDefault,ref:this.viscosityRange,onInput:this.handleChange})]}),c("div",{className:"form-group mb-3",children:[s("label",{className:"form-label",children:"Repulsion"}),s("input",{type:"range",className:"form-range",min:"1000",max:"10000",step:"100",defaultValue:this.repulsionDefault,ref:this.repulsionRange,onInput:this.handleChange})]}),c("div",{className:"form-group mb-3",children:[s("label",{className:"form-label",children:"Attraction"}),s("input",{type:"range",className:"form-range",min:"1",max:"5",step:"0.1",defaultValue:this.attractionDefault,ref:this.attractionRange,onInput:this.handleChange})]}),c("div",{className:"form-group mb-3",children:[s("label",{className:"form-label",children:"Wall Spring Constant"}),s("input",{type:"range",className:"form-range",min:"0.00001",max:"0.001",step:"0.00001",defaultValue:this.wallSpringConstantDefault,ref:this.wallSpringConstantRange,onInput:this.handleChange})]}),c("div",{className:"form-group mb-3",children:[s("label",{className:"form-label",children:"Wall Bounciness"}),s("input",{type:"range",className:"form-range",min:"0.9",max:"0.999",step:"0.001",defaultValue:this.wallSpringDampingDefault,ref:this.wallSpringDampingRange,onInput:this.handleChange})]}),s("div",{className:"form-group mb-3",children:s("button",{className:"btn btn-primary btn-sm",onClick:()=>this.needsReset=!0,children:"Reset"})})]})})]})]})}}const G=()=>s(S,{children:({Citation:g,CitationBank:p})=>s(E,{children:c(A,{name:"Spacewar",id:"spacewar",children:[s("p",{children:s(R,{href:"https://github.com/pimpale/spacewar"})}),s("p",{children:s(R,{href:"https://github.com/pimpale/GravitySimulator"})}),s(L,{title:"Canvas Setup",id:"canvas-setup-demo",children:s(V,{className:"mx-auto",style:{maxWidth:"50em"},xsize:512,ysize:512})})]})})}),M=N(document.getElementById("root"));M.render(s(n.StrictMode,{children:s(G,{})}));
