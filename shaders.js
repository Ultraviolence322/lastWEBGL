

function getShader(gl, id, str) {
  var shader;
  if (id == 'vs') {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else if (id == 'fs') {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  }

  gl.shaderSource(shader, str);
  gl.compileShader(shader);

  return shader;
}

function initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE) {
  var VS = getShader(gl, 'vs', VSHADER_SOURCE);
  var FS = getShader(gl, 'fs', FSHADER_SOURCE);

  let shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, VS);
  gl.attachShader(shaderProgram, FS);
  gl.linkProgram(shaderProgram);
  gl.useProgram(shaderProgram);

  return shaderProgram
}