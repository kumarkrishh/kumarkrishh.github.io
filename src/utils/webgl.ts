// code from https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html


export function createShader(gl: WebGL2RenderingContext, shader_type: number, source: string) {
  const shader = gl.createShader(shader_type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

export function createProgram(gl: WebGL2RenderingContext, shaders: WebGLShader[]) {
  const program = gl.createProgram()!;
  for (const shader of shaders) {
    gl.attachShader(program, shader);
  }

  gl.linkProgram(program);
  const linkSuccess = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linkSuccess) {
    let errorMessage = "";
    for (const shader of shaders) {
      const shaderSuccess = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
      if (!shaderSuccess) {
        console.log(gl.getShaderInfoLog(shader));
      }
      gl.deleteShader(shader);
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  } else {
    return program;
  }
}


export function createTexture(gl: WebGL2RenderingContext, width: number, height: number) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1); // see https://webglfundamentals.org/webgl/lessons/webgl-data-textures.html
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,                // mip level
    gl.RGBA,          // internal format
    width,
    height,
    0,                // border
    gl.RGBA,          // format
    gl.UNSIGNED_BYTE, // type
    new Uint8Array(width * height * 4)
  );
  return tex;
}

export function updateTextureFromCanvas(gl: WebGL2RenderingContext, tex: WebGLTexture, canvas: HTMLCanvasElement) {
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1); // see https://webglfundamentals.org/webgl/lessons/webgl-data-textures.html
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,                // mip level
    gl.RGBA,          // internal format
    canvas.width,     // width
    canvas.height,    // height
    0,                // border
    gl.RGBA,          // format
    gl.UNSIGNED_BYTE, // type
    canvas
  );
  return tex;
}


export function createR32UITexture(gl: WebGL2RenderingContext, width: number, height: number) {
  const data = new Uint32Array(width * height);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1); // see https://webglfundamentals.org/webgl/lessons/webgl-data-textures.html
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,                 // mip level
    gl.R32UI,          // internal format
    width,
    height,
    0,                // border
    gl.RED_INTEGER,   // format
    gl.UNSIGNED_INT,  // type
    data
  );
  return tex;
}

export function overwriteR32UITexture(gl: WebGL2RenderingContext, xoff: number, yoff: number, width: number, height: number, data: Uint32Array) {
  gl.texSubImage2D(
    gl.TEXTURE_2D,
    0,                // mip level
    xoff,             // xoffset
    yoff,             // yoffset
    width,            // width
    height,           // height
    gl.RED_INTEGER,   // format
    gl.UNSIGNED_INT,  // type
    data
  );
}


export function createRG32ITexture(gl: WebGL2RenderingContext, width: number, height: number) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1); // see https://webglfundamentals.org/webgl/lessons/webgl-data-textures.html
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,                 // mip level
    gl.RG32I,          // internal format
    width,
    height,
    0,                // border
    gl.RG_INTEGER,   // format
    gl.INT,  // type
    null
  );
  return tex;
}

export function overwriteRG32ITexture(gl: WebGL2RenderingContext, xoff: number, yoff: number, width: number, height: number, data: Int32Array) {
  gl.texSubImage2D(
    gl.TEXTURE_2D,
    0,                // mip level
    xoff,             // xoffset
    yoff,             // yoffset
    width,            // width
    height,           // height
    gl.RG_INTEGER,   // format
    gl.INT,  // type
    data
  );
}

export function overwriteTexture(gl: WebGL2RenderingContext, xoff: number, yoff: number, data: ImageData) {
  gl.texSubImage2D(
    gl.TEXTURE_2D,
    0,                // mip level
    xoff,             // xoffset
    yoff,             // yoffset
    gl.RGBA,          // format
    gl.UNSIGNED_BYTE, // type
    data
  );
}


export function createR32FTexture(gl: WebGL2RenderingContext, width: number, height: number, data: Float32Array) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1); // see https://webglfundamentals.org/webgl/lessons/webgl-data-textures.html
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,                // mip level
    gl.R32F,          // internal format
    width,
    height,
    0,                // border
    gl.RED,           // format
    gl.FLOAT,         // type
    data
  );
  return tex;
}

export function overwriteR32FTexture(gl: WebGL2RenderingContext, xoff: number, yoff: number, width: number, height: number, data: Float32Array) {
  gl.texSubImage2D(
    gl.TEXTURE_2D,
    0,                // mip level
    xoff,             // xoffset
    yoff,             // yoffset
    width,            // width
    height,           // height
    gl.RED,           // format
    gl.FLOAT,         // type
    data
  );
}

export function createRG32FTexture(gl: WebGL2RenderingContext, width: number, height: number, data: Float32Array) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1); // see https://webglfundamentals.org/webgl/lessons/webgl-data-textures.html
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,                // mip level
    gl.RG32F,         // internal format
    width,
    height,
    0,                // border
    gl.RG,            // format
    gl.FLOAT,         // type
    data
  );
  return tex;
}

export function overwriteRG32FTexture(gl: WebGL2RenderingContext, xoff: number, yoff: number, width: number, height: number, data: Float32Array) {
  gl.texSubImage2D(
    gl.TEXTURE_2D,
    0,                // mip level
    xoff,             // xoffset
    yoff,             // yoffset
    width,            // width
    height,           // height
    gl.RG,            // format
    gl.FLOAT,         // type
    data
  );
}


export function createRGBA32FTexture(gl: WebGL2RenderingContext, width: number, height: number, data: Float32Array) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1); // see https://webglfundamentals.org/webgl/lessons/webgl-data-textures.html
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,                // mip level
    gl.RGBA32F,          // internal format
    width,
    height,
    0,                // border
    gl.RGBA,           // format
    gl.FLOAT,         // type
    data
  );
  return tex;
}

export function overwriteRGBA32FTexture(gl: WebGL2RenderingContext, xoff: number, yoff: number, width: number, height: number, data: Float32Array) {
  gl.texSubImage2D(
    gl.TEXTURE_2D,
    0,                // mip level
    xoff,             // xoffset
    yoff,             // yoffset
    width,            // width
    height,           // height
    gl.RGBA,           // format
    gl.FLOAT,         // type
    data
  );
}

