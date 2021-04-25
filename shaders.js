const VSHADER_SOURCE = `
attribute vec3 a_Position;
attribute vec2 a_uv;
attribute vec3 a_normal;

uniform mat4 u_Pmatrix;
uniform mat4 u_Mmatrix;
uniform mat4 u_Vmatrix;

uniform vec3 u_source_direction;
uniform vec3 u_view_direction;
uniform float u_shininess;

varying vec2 v_uv;
varying vec3 v_color;

const vec3 source_diffuse_color  = vec3(1.0,1.0,1.0);
const vec3 source_ambient_color  = vec3(0.2,0.2,0.2);
const vec3 source_specular_color = vec3(1.0,1.0,1.0);

void main() {
  v_uv = a_uv;

  vec3 N = normalize(a_normal);
  N = (vec4(a_normal,1.0)).xyz;

  vec3 vertPos     = (u_Vmatrix * u_Mmatrix*vec4(a_Position,1.0)).xyz;
  vec3 lightDir    = normalize(u_source_direction - vertPos);

  vec3 L = normalize(lightDir);
  vec3 V = normalize(u_view_direction);
  vec3 R = normalize(reflect(-L,N));
  
  float S = dot(V,R);
  S = clamp(S,0.0,1.0);
  S = pow(S,u_shininess);
  
  vec3 color =  (S * source_specular_color) + source_ambient_color + source_diffuse_color * max(0.0,dot(N,L));

  v_color = color;

  gl_Position = u_Pmatrix*u_Vmatrix*u_Mmatrix*vec4(a_Position,1.0);
}
`

const FSHADER_SOURCE = `
precision highp float;

uniform sampler2D sampler;

varying vec2 v_uv;
varying vec3 v_color;

void main() {
  vec3 colorTex = vec3(texture2D(sampler,v_uv));
  gl_FragColor =  vec4(v_color * colorTex,1.0);
}

`

// NORMAL

const VSHADER_SOURCE_NORMAL = `
attribute vec3 a_Position;

uniform mat4 u_Pmatrix;
uniform mat4 u_Mmatrix;
uniform mat4 u_Vmatrix;

void main() {
  gl_PointSize = 5.0;
gl_Position = u_Pmatrix*u_Vmatrix*u_Mmatrix*vec4(a_Position,1.0);

}
`
const FSHADER_SOURCE_NORMAL = `
precision mediump float;

void main() {

gl_FragColor = vec4(0.0,0.1,0.5,1.0);

}
`

// PIECE

const VSHADER_SOURCE_PIECE = `
attribute vec2 a_Position;
attribute vec3 a_Color;
varying vec3 v_Color;

uniform mat4 u_Pmatrix;
uniform mat4 u_Mmatrix;
uniform mat4 u_Vmatrix;

void main() {
  v_Color = a_Color;
  gl_Position = u_Pmatrix*u_Vmatrix*u_Mmatrix*vec4(a_Position,0.0,1.0);
}  
`

const FSHADER_SOURCE_PIECE = `
precision mediump float;
varying vec3 v_Color;

void main() {
  gl_FragColor = vec4(v_Color,1.0);
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

function initShaders(gl, way) {
  let vs = null
  let fs = null

  if (way === 'main') {
    vs = VSHADER_SOURCE
    fs = FSHADER_SOURCE
  } else if (way === 'normal') {
    vs = VSHADER_SOURCE_NORMAL
    fs = FSHADER_SOURCE_NORMAL
  } else if (way === 'piece') {
    vs = VSHADER_SOURCE_PIECE
    fs = FSHADER_SOURCE_PIECE
  }

  let shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, getShader(gl, 'vs', vs));
  gl.attachShader(shaderProgram, getShader(gl, 'fs', fs));
  gl.linkProgram(shaderProgram);
  gl.useProgram(shaderProgram);

  return shaderProgram
}