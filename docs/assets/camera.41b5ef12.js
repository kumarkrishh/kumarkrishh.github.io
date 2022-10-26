var D=Object.defineProperty;var P=(r,n,e)=>n in r?D(r,n,{enumerable:!0,configurable:!0,writable:!0,value:e}):r[n]=e;var m=(r,n,e)=>(P(r,typeof n!="symbol"?n+"":n,e),e);var I=1e-6,g=typeof Float32Array<"u"?Float32Array:Array;Math.hypot||(Math.hypot=function(){for(var r=0,n=arguments.length;n--;)r+=arguments[n]*arguments[n];return Math.sqrt(r)});function V(){var r=new g(9);return g!=Float32Array&&(r[1]=0,r[2]=0,r[3]=0,r[5]=0,r[6]=0,r[7]=0),r[0]=1,r[4]=1,r[8]=1,r}function $(){var r=new g(16);return g!=Float32Array&&(r[1]=0,r[2]=0,r[3]=0,r[4]=0,r[6]=0,r[7]=0,r[8]=0,r[9]=0,r[11]=0,r[12]=0,r[13]=0,r[14]=0),r[0]=1,r[5]=1,r[10]=1,r[15]=1,r}function Y(r,n,e){var t=n[0],a=n[1],i=n[2],s=n[3],c=n[4],h=n[5],o=n[6],v=n[7],w=n[8],L=n[9],M=n[10],E=n[11],y=n[12],p=n[13],x=n[14],T=n[15],l=e[0],u=e[1],f=e[2],d=e[3];return r[0]=l*t+u*c+f*w+d*y,r[1]=l*a+u*h+f*L+d*p,r[2]=l*i+u*o+f*M+d*x,r[3]=l*s+u*v+f*E+d*T,l=e[4],u=e[5],f=e[6],d=e[7],r[4]=l*t+u*c+f*w+d*y,r[5]=l*a+u*h+f*L+d*p,r[6]=l*i+u*o+f*M+d*x,r[7]=l*s+u*v+f*E+d*T,l=e[8],u=e[9],f=e[10],d=e[11],r[8]=l*t+u*c+f*w+d*y,r[9]=l*a+u*h+f*L+d*p,r[10]=l*i+u*o+f*M+d*x,r[11]=l*s+u*v+f*E+d*T,l=e[12],u=e[13],f=e[14],d=e[15],r[12]=l*t+u*c+f*w+d*y,r[13]=l*a+u*h+f*L+d*p,r[14]=l*i+u*o+f*M+d*x,r[15]=l*s+u*v+f*E+d*T,r}function _(r,n){var e=n[0],t=n[1],a=n[2],i=n[3],s=e+e,c=t+t,h=a+a,o=e*s,v=t*s,w=t*c,L=a*s,M=a*c,E=a*h,y=i*s,p=i*c,x=i*h;return r[0]=1-w-E,r[1]=v+x,r[2]=L-p,r[3]=0,r[4]=v-x,r[5]=1-o-E,r[6]=M+y,r[7]=0,r[8]=L+p,r[9]=M-y,r[10]=1-o-w,r[11]=0,r[12]=0,r[13]=0,r[14]=0,r[15]=1,r}function O(r,n,e,t,a,i,s){var c=1/(n-e),h=1/(t-a),o=1/(i-s);return r[0]=-2*c,r[1]=0,r[2]=0,r[3]=0,r[4]=0,r[5]=-2*h,r[6]=0,r[7]=0,r[8]=0,r[9]=0,r[10]=2*o,r[11]=0,r[12]=(n+e)*c,r[13]=(a+t)*h,r[14]=(s+i)*o,r[15]=1,r}var B=O,S=Y;function N(){var r=new g(3);return g!=Float32Array&&(r[0]=0,r[1]=0,r[2]=0),r}function rr(r){var n=new g(3);return n[0]=r[0],n[1]=r[1],n[2]=r[2],n}function X(r){var n=r[0],e=r[1],t=r[2];return Math.hypot(n,e,t)}function C(r,n,e){var t=new g(3);return t[0]=r,t[1]=n,t[2]=e,t}function Q(r,n){var e=n[0],t=n[1],a=n[2],i=e*e+t*t+a*a;return i>0&&(i=1/Math.sqrt(i)),r[0]=n[0]*i,r[1]=n[1]*i,r[2]=n[2]*i,r}function G(r,n){return r[0]*n[0]+r[1]*n[1]+r[2]*n[2]}function b(r,n,e){var t=n[0],a=n[1],i=n[2],s=e[0],c=e[1],h=e[2];return r[0]=a*h-i*c,r[1]=i*s-t*h,r[2]=t*c-a*s,r}var H=X;(function(){var r=N();return function(n,e,t,a,i,s){var c,h;for(e||(e=3),t||(t=0),a?h=Math.min(a*e+t,n.length):h=n.length,c=t;c<h;c+=e)r[0]=n[c],r[1]=n[c+1],r[2]=n[c+2],i(r,r,s),n[c]=r[0],n[c+1]=r[1],n[c+2]=r[2];return n}})();function J(){var r=new g(4);return g!=Float32Array&&(r[0]=0,r[1]=0,r[2]=0,r[3]=0),r}function K(r,n){var e=n[0],t=n[1],a=n[2],i=n[3],s=e*e+t*t+a*a+i*i;return s>0&&(s=1/Math.sqrt(s)),r[0]=e*s,r[1]=t*s,r[2]=a*s,r[3]=i*s,r}(function(){var r=J();return function(n,e,t,a,i,s){var c,h;for(e||(e=4),t||(t=0),a?h=Math.min(a*e+t,n.length):h=n.length,c=t;c<h;c+=e)r[0]=n[c],r[1]=n[c+1],r[2]=n[c+2],r[3]=n[c+3],i(r,r,s),n[c]=r[0],n[c+1]=r[1],n[c+2]=r[2],n[c+3]=r[3];return n}})();function z(){var r=new g(4);return g!=Float32Array&&(r[0]=0,r[1]=0,r[2]=0),r[3]=1,r}function W(r,n,e){e=e*.5;var t=Math.sin(e);return r[0]=t*n[0],r[1]=t*n[1],r[2]=t*n[2],r[3]=Math.cos(e),r}function Z(r,n,e){var t=n[0],a=n[1],i=n[2],s=n[3],c=e[0],h=e[1],o=e[2],v=e[3];return r[0]=t*v+s*c+a*o-i*h,r[1]=a*v+s*h+i*c-t*o,r[2]=i*v+s*o+t*h-a*c,r[3]=s*v-t*c-a*h-i*o,r}function F(r,n,e,t){var a=n[0],i=n[1],s=n[2],c=n[3],h=e[0],o=e[1],v=e[2],w=e[3],L,M,E,y,p;return M=a*h+i*o+s*v+c*w,M<0&&(M=-M,h=-h,o=-o,v=-v,w=-w),1-M>I?(L=Math.acos(M),E=Math.sin(L),y=Math.sin((1-t)*L)/E,p=Math.sin(t*L)/E):(y=1-t,p=t),r[0]=y*a+p*h,r[1]=y*i+p*o,r[2]=y*s+p*v,r[3]=y*c+p*w,r}function k(r,n){var e=n[0]+n[4]+n[8],t;if(e>0)t=Math.sqrt(e+1),r[3]=.5*t,t=.5/t,r[0]=(n[5]-n[7])*t,r[1]=(n[6]-n[2])*t,r[2]=(n[1]-n[3])*t;else{var a=0;n[4]>n[0]&&(a=1),n[8]>n[a*3+a]&&(a=2);var i=(a+1)%3,s=(a+2)%3;t=Math.sqrt(n[a*3+a]-n[i*3+i]-n[s*3+s]+1),r[a]=.5*t,t=.5/t,r[3]=(n[i*3+s]-n[s*3+i])*t,r[i]=(n[i*3+a]+n[a*3+i])*t,r[s]=(n[s*3+a]+n[a*3+s])*t}return r}function nr(r,n,e,t){var a=.5*Math.PI/180;n*=a,e*=a,t*=a;var i=Math.sin(n),s=Math.cos(n),c=Math.sin(e),h=Math.cos(e),o=Math.sin(t),v=Math.cos(t);return r[0]=i*h*v-s*c*o,r[1]=s*c*v+i*h*o,r[2]=s*h*o-i*c*v,r[3]=s*h*v+i*c*o,r}var q=Z,U=K,R=function(){var r=N(),n=C(1,0,0),e=C(0,1,0);return function(t,a,i){var s=G(a,i);return s<-.999999?(b(r,n,a),H(r)<1e-6&&b(r,e,a),Q(r,r),W(t,r,Math.PI),t):s>.999999?(t[0]=0,t[1]=0,t[2]=0,t[3]=1,t):(b(r,a,i),t[0]=r[0],t[1]=r[1],t[2]=r[2],t[3]=1+s,U(t,t))}}();(function(){var r=z(),n=z();return function(e,t,a,i,s,c){return F(r,t,s,c),F(n,a,i,c),F(e,r,n,2*c*(1-c)),e}})();(function(){var r=V();return function(n,e,t,a){return r[0]=t[0],r[3]=t[1],r[6]=t[2],r[1]=a[0],r[4]=a[1],r[7]=a[2],r[2]=-e[0],r[5]=-e[1],r[8]=-e[2],U(n,k(n,r))}})();function A(r){const n=r.x,e=r.y,t=1;let a;return n*n+e*e<=t*t/2?a=Math.sqrt(t*t-n*n-e*e):a=t*t/2/Math.sqrt(n*n+e*e),new Float32Array([n,-e,a])}class er{constructor(n,e){m(this,"ortho");m(this,"rotationQ");m(this,"dampingFactor");m(this,"canvas");m(this,"mouseLoc",null);m(this,"baseQ",z());m(this,"currQ",z());m(this,"momentumQ",z());m(this,"currentMomentumLevel",0);m(this,"getNormalizedMouseCoords",n=>{const e=this.canvas.getBoundingClientRect(),t=(e.left+e.right)/2,a=(e.top+e.bottom)/2,i=e.right-e.left,s=e.bottom-e.top,c=Math.min(i,s);return{x:2*(n.clientX-t)/c,y:2*(n.clientY-a)/c}});m(this,"handleMouseDown",n=>{const e=this.getNormalizedMouseCoords(n);this.mouseLoc={start:e,current:e,previous:e}});m(this,"handleMouseMove",n=>{if(this.mouseLoc===null)return;this.mouseLoc.previous=this.mouseLoc.current,this.mouseLoc.current=this.getNormalizedMouseCoords(n);const e=A(this.mouseLoc.start),t=A(this.mouseLoc.current);Q(e,e),Q(t,t),R(this.currQ,e,t)});m(this,"handleMouseUp",n=>{if(this.mouseLoc===null)return;const e=A(this.mouseLoc.previous),t=A(this.mouseLoc.current);Q(e,e),Q(t,t),R(this.momentumQ,e,t),q(this.baseQ,this.currQ,this.baseQ),this.currQ=z(),this.mouseLoc=null,this.currentMomentumLevel=1});m(this,"discardTouchEvent",n=>n.preventDefault());m(this,"cleanup",()=>{this.canvas.removeEventListener("pointerdown",this.handleMouseDown),window.removeEventListener("pointermove",this.handleMouseMove),window.removeEventListener("pointerup",this.handleMouseUp),this.canvas.removeEventListener("touchstart",this.discardTouchEvent),this.canvas.removeEventListener("touchmove",this.discardTouchEvent),this.canvas.removeEventListener("touchend",this.discardTouchEvent),this.canvas.removeEventListener("touchcancel",this.discardTouchEvent)});m(this,"update",()=>{if(this.mouseLoc===null){const n=F(z(),this.rotationQ,this.momentumQ,this.currentMomentumLevel);this.currentMomentumLevel*=this.dampingFactor,q(this.baseQ,n,this.baseQ)}});m(this,"getTrackballCameraMatrix",(n,e)=>{const t=q(z(),this.currQ,this.baseQ),a=$();_(a,t);const i=$(),s=this.ortho;B(i,s.left,s.right,s.bottom,s.top,s.near,s.far);const c=$();return S(c,i,a),c});e.ortho?this.ortho=e.ortho:this.ortho={left:-1,right:1,bottom:-1,top:1,near:-1,far:1},e.rotation?this.rotationQ=e.rotation:this.rotationQ=z(),e.dampingFactor!==void 0?this.dampingFactor=e.dampingFactor:this.dampingFactor=.9,this.canvas=n,this.canvas.addEventListener("pointerdown",this.handleMouseDown),window.addEventListener("pointermove",this.handleMouseMove),window.addEventListener("pointerup",this.handleMouseUp),this.canvas.addEventListener("touchstart",this.discardTouchEvent),this.canvas.addEventListener("touchmove",this.discardTouchEvent),this.canvas.addEventListener("touchend",this.discardTouchEvent),this.canvas.addEventListener("touchcancel",this.discardTouchEvent)}}export{g as A,er as T,nr as a,z as b,rr as c,C as f};
