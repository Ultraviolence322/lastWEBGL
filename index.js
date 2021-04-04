const canvas = document.getElementById('app');
const gl = canvas.getContext('webgl');

let xPosPaddle = 0

let MouseContr = new MouseController(gl);
let shaderProgram = initShaders(gl)

let  u_Pmatrix = gl.getUniformLocation(shaderProgram,'u_Pmatrix');
let  u_Mmatrix = gl.getUniformLocation(shaderProgram,'u_Mmatrix');
let  u_Vmatrix = gl.getUniformLocation(shaderProgram,'u_Vmatrix');

let  a_Position  = gl.getAttribLocation(shaderProgram,'a_Position');
let  a_uv        = gl.getAttribLocation(shaderProgram,'a_uv');
let  u_sampler   = gl.getUniformLocation(shaderProgram,'sampler');

gl.uniform1i(u_sampler, 0);

gl.enableVertexAttribArray(a_Position);
gl.enableVertexAttribArray(a_uv);
gl.useProgram(shaderProgram);

// BANNANA

let bannanaTexture =  get_texture(gl,"bannana.jpg");

loadJSON(gl,'bannana.json');

let bannanaVertices   =  gl.model.meshes[0].vertices;
bannanaVertices = bannanaVertices.map(e => e / 600)
localStorage.setItem('verts', JSON.stringify(bannanaVertices))
// console.log('bannanaVertices', bannanaVertices);

let bannanaIndices    =  [].concat.apply([], gl.model.meshes[0].faces);
let bannanaCoords  =  gl.model.meshes[0].texturecoords[0];

let  BANNANA_VERTEX = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,BANNANA_VERTEX);
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(bannanaVertices),gl.STATIC_DRAW);

let  BANNANA_UV = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,BANNANA_UV);
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(bannanaCoords),gl.STATIC_DRAW);

let  BANNANA_FACES = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,BANNANA_FACES);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(bannanaIndices),gl.STATIC_DRAW);

// BALL

let ballTexture =  get_texture(gl,"ball.jpg");

loadJSON(gl,'ball.json');

let ballVertices   =  gl.model.meshes[0].vertices;
ballVertices = ballVertices.map(e => e / 2000)

let ballIndices    =  [].concat.apply([], gl.model.meshes[0].faces);
let ballCoords  =  gl.model.meshes[0].texturecoords[0];

let  ball_VERTEX = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,ball_VERTEX);
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(ballVertices),gl.STATIC_DRAW);

let  ball_UV = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,ball_UV);
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(ballCoords),gl.STATIC_DRAW);

let  ball_FACES = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ball_FACES);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(ballIndices),gl.STATIC_DRAW);

// BANNANA MATRIX

let  bannanaProjMat = glMatrix.mat4.create();
let  bannanaModelMat = glMatrix.mat4.create();
let  bannanaViewMat  = glMatrix.mat4.create();

glMatrix.mat4.perspective(bannanaProjMat, 50 * Math.PI / 180, canvas.width/canvas.height, 1, 100);
glMatrix.mat4.identity(bannanaModelMat);
glMatrix.mat4.identity(bannanaViewMat);

glMatrix.mat4.translate(bannanaModelMat, bannanaModelMat, [0.0, 0.0, -2]);

// BALL MATRIX

let  ballProjMat = glMatrix.mat4.create();
let  ballModelMat = glMatrix.mat4.create();
let  ballViewMat  = glMatrix.mat4.create();

glMatrix.mat4.perspective(ballProjMat, 50 * Math.PI / 180, canvas.width/canvas.height, 1, 100);
glMatrix.mat4.identity(ballModelMat);
glMatrix.mat4.identity(ballViewMat);

// RENDER

gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);
gl.clearDepth(1.0);

function animate(){

  gl.clearColor(0.5, 0.5, 0.5, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // BANNANA

  glMatrix.mat4.identity(bannanaModelMat);
  glMatrix.mat4.translate(bannanaModelMat,bannanaModelMat, [xPosPaddle , -0.85, -2]);
  glMatrix.mat4.rotateX(bannanaModelMat,bannanaModelMat , 220 * Math.PI / 180);
  glMatrix.mat4.rotateY(bannanaModelMat,bannanaModelMat , 110 * Math.PI / 180);

  gl.uniformMatrix4fv(u_Pmatrix, false, bannanaProjMat);
  gl.uniformMatrix4fv(u_Mmatrix, false, bannanaModelMat);
  gl.uniformMatrix4fv(u_Vmatrix, false, bannanaViewMat);

  if (bannanaTexture.webGLtexture) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, bannanaTexture.webGLtexture);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, BANNANA_VERTEX);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 4 * (3), 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, BANNANA_UV);
  gl.vertexAttribPointer(a_uv, 2, gl.FLOAT, false, 4 * (2), 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, BANNANA_FACES);
  gl.drawElements(gl.TRIANGLES, bannanaIndices.length, gl.UNSIGNED_SHORT, 0);

  // BALL

  glMatrix.mat4.identity(ballModelMat);
  glMatrix.mat4.translate(ballModelMat,ballModelMat, [0.5, 0.0, -2]);

  gl.uniformMatrix4fv(u_Pmatrix, false, ballProjMat);
  gl.uniformMatrix4fv(u_Mmatrix, false, ballModelMat);
  gl.uniformMatrix4fv(u_Vmatrix, false, ballViewMat);


  if (ballTexture.webGLtexture) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, ballTexture.webGLtexture);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, ball_VERTEX);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 4 * (3), 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, ball_UV);
  gl.vertexAttribPointer(a_uv, 2, gl.FLOAT, false, 4 * (2), 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ball_FACES);
  gl.drawElements(gl.TRIANGLES, ballIndices.length, gl.UNSIGNED_SHORT, 0);

  gl.flush();
  window.requestAnimationFrame(animate);
};
animate();



































var world;
      
const M = 30
const centerX = 600 / 30 / 2
const centerY = 600 / 30 / 2

let paddlePosX = 0

function init() {
  let b2Vec2 = Box2D.Common.Math.b2Vec2
  let b2BodyDef = Box2D.Dynamics.b2BodyDef
  let b2Body = Box2D.Dynamics.b2Body
  let b2FixtureDef = Box2D.Dynamics.b2FixtureDef
  let b2Fixture = Box2D.Dynamics.b2Fixture
  let b2World = Box2D.Dynamics.b2World
  let b2_dynamicBody=b2Body.b2_dynamicBody
  let b2_staticBody=b2Body.b2_staticBody
  let b2MassData = Box2D.Collision.Shapes.b2MassData
  let b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
  let b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
  let b2DebugDraw = Box2D.Dynamics.b2DebugDraw
  let b2RevoluteJointDef=Box2D.Dynamics.Joints.b2RevoluteJointDef
  let b2ContactListener=Box2D.Dynamics.b2ContactListener

  world = new b2World(new b2Vec2(0, 0), true);
    
  var fixDef = new b2FixtureDef;
  fixDef.density = 1.0;
  fixDef.friction = 1;
  fixDef.restitution = 1;
  
  var bodyDef = new b2BodyDef;
  
  bodyDef.type = b2Body.b2_staticBody;

  //create bottom
  bodyDef.position.x = 0;
  bodyDef.position.y = 20;
  fixDef.shape = new b2PolygonShape;
  fixDef.shape.SetAsBox(20, 0.1);
  world.CreateBody(bodyDef).CreateFixture(fixDef);

  //create left
  bodyDef.position.x = 0;
  bodyDef.position.y = 0;
  fixDef.shape = new b2PolygonShape;
  fixDef.shape.SetAsBox(0.1, 20);
  world.CreateBody(bodyDef).CreateFixture(fixDef);

  //create top
  bodyDef.position.x = 0;
  bodyDef.position.y = 0;
  fixDef.shape = new b2PolygonShape;
  fixDef.shape.SetAsBox(20, 0.1);
  world.CreateBody(bodyDef).CreateFixture(fixDef);

  //create right
  bodyDef.position.x = 20;
  bodyDef.position.y = 0;
  fixDef.shape = new b2PolygonShape;
  fixDef.shape.SetAsBox(0.1, 20);
  world.CreateBody(bodyDef).CreateFixture(fixDef);

  //create paddle
  var fixDef2 = new b2FixtureDef;
  fixDef2.density = 1.0;
  fixDef2.friction = 0;
  fixDef2.restitution = 0;
   var bodyDef2 = new b2BodyDef;
  bodyDef2.type = b2Body.b2_dynamicBody;

  fixDef2.shape = new b2CircleShape(1.8);
  bodyDef2.position.x = centerX + 0.5;
  bodyDef2.position.y = centerY + 9.5;
  bodyDef2.fixedRotation = true;
  var paddle=world.CreateBody(bodyDef2);
  paddle.CreateFixture(fixDef2);
  
  //create ball
  var fixDef3 = new b2FixtureDef;
  fixDef3.density = 0;
  fixDef3.friction = 0;
  fixDef3.restitution = 1;
   var bodyDef3 = new b2BodyDef;
  bodyDef3.type = b2Body.b2_dynamicBody;

  fixDef3.shape = new b2CircleShape(0.3);
  bodyDef3.position.x = centerX + 0;
  bodyDef3.position.y = centerY + 0;
  bodyDef3.fixedRotation = true;
  var ball=world.CreateBody(bodyDef3);
  ball.CreateFixture(fixDef3);

  //setup debug draw
  var debugDraw = new b2DebugDraw();
  debugDraw.SetSprite(document.getElementById("canvas").getContext("2d"));
  debugDraw.SetDrawScale(30.0);
  debugDraw.SetFillAlpha(0.3);
  debugDraw.SetLineThickness(1.0);
  debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
  world.SetDebugDraw(debugDraw);

  ball.SetLinearVelocity(new b2Vec2(0, 10))	
  
  window.setInterval(()=> {
    xPosPaddle = (paddle.GetPosition().x - centerX) / 10
    update()
  }, 1000 / 30);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      var forceRight=new b2Vec2(10,0);
      paddle.SetLinearVelocity(forceRight)	
    }
    if (e.key === 'ArrowLeft') {
      var forceLeft=new b2Vec2(-10,0);
      paddle.SetLinearVelocity(forceLeft)	

    }
  })

  document.addEventListener('keyup', (e) => {
    var stop = new b2Vec2(0.1,0);
    if (e.key === 'ArrowRight') {
      paddle.SetLinearVelocity(stop)	
    }
    if (e.key === 'ArrowLeft') {
      paddle.SetLinearVelocity(stop)	
    }
  })

};

function update() {
  world.Step(1 / 60, 10, 10);
  world.DrawDebugData();
  world.ClearForces();
};

init()


// https://kyucon.com/doc/box2d/
// http://www.jeremyhubble.com/box2d.html
// https://www.box2dflash.org/docs/2.0.2/manual