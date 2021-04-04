var VSHADER_SOURCE = `
attribute vec3 a_Position;
attribute vec2 a_uv;

uniform mat4 u_Pmatrix;
uniform mat4 u_Mmatrix;
uniform mat4 u_Vmatrix;

varying vec2 v_uv;

void main() {
  v_uv = a_uv;
  gl_Position = u_Pmatrix*u_Vmatrix*u_Mmatrix*vec4(a_Position,1.0);
}
`

var FSHADER_SOURCE = `
precision mediump float;

uniform sampler2D sampler;

varying vec2 v_uv;

void main() {
  gl_FragColor =  texture2D(sampler,v_uv);
}
`

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

function initShaders(gl) {
  var VS = getShader(gl, 'vs', VSHADER_SOURCE);
  var FS = getShader(gl, 'fs', FSHADER_SOURCE);

  let shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, VS);
  gl.attachShader(shaderProgram, FS);
  gl.linkProgram(shaderProgram);
  gl.useProgram(shaderProgram);

  return shaderProgram
}