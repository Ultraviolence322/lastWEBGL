import boxCoords from "./textures/box.js"
import pieceCoords from "./textures/triangle.js"

const canvas = document.getElementById('app');
const gl = canvas.getContext('webgl');

let boxDestroyed = false
let piecesFalling = false
let piecesPos = []
let piecesMatrix = []

let xPosPaddle = 0
let bannanaWidth = 0.273 / 2

let xPosBall = 0
let yPosBall = 0
let ballRadius =  0.01

// MAIN SHADER

let shaderProgram = initShaders(gl, 'main')

let  u_Pmatrix = gl.getUniformLocation(shaderProgram,'u_Pmatrix');
let  u_Mmatrix = gl.getUniformLocation(shaderProgram,'u_Mmatrix');
let  u_Vmatrix = gl.getUniformLocation(shaderProgram,'u_Vmatrix');

let  u_view_direction = gl.getUniformLocation(shaderProgram,'u_view_direction');
let  u_source_direction = gl.getUniformLocation(shaderProgram,'u_source_direction');
let  u_shininess = gl.getUniformLocation(shaderProgram,'u_shininess');

let  a_Position  = gl.getAttribLocation(shaderProgram,'a_Position');
let  a_normal    = gl.getAttribLocation(shaderProgram,'a_normal');
let  a_uv        = gl.getAttribLocation(shaderProgram,'a_uv');

// PIECE SHADER

let shaderProgramPiece = initShaders(gl, 'piece')

var a_Position_piece = gl.getAttribLocation(shaderProgramPiece, 'a_Position');
var a_Color = gl.getAttribLocation(shaderProgramPiece, 'a_Color');

let  u_Pmatrix_piece = gl.getUniformLocation(shaderProgramPiece,'u_Pmatrix');
let  u_Mmatrix_piece = gl.getUniformLocation(shaderProgramPiece,'u_Mmatrix');
let  u_Vmatrix_piece = gl.getUniformLocation(shaderProgramPiece,'u_Vmatrix');

// NORMAL SHADER

let shaderProgramNormal = initShaders(gl, 'normal')

let  u_Pmatrix_normal = gl.getUniformLocation(shaderProgramNormal,'u_Pmatrix');
let  u_Mmatrix_normal = gl.getUniformLocation(shaderProgramNormal,'u_Mmatrix');
let  u_Vmatrix_normal = gl.getUniformLocation(shaderProgramNormal,'u_Vmatrix');

let  a_Position_normal  = gl.getAttribLocation(shaderProgramNormal,'a_Position');


gl.enableVertexAttribArray(a_Position);
gl.enableVertexAttribArray(a_normal);
gl.enableVertexAttribArray(a_uv);

gl.enableVertexAttribArray(a_Position_piece);
gl.enableVertexAttribArray(a_Color);

gl.enableVertexAttribArray(a_Position_normal);

// BANNANA

let bannanaTexture =  get_texture(gl,"./textures/bannana.jpg");

loadJSON(gl,"./textures/bannana.json");

let bannanaVertices   =  gl.model.meshes[0].vertices;
bannanaVertices = bannanaVertices.map(e => e / 600)

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

// NORMAL FOR BANNANA

let bannanaNormal = gl.model.meshes[0].normals
bannanaNormal = bannanaNormal.map(e => e / 20)

let newBannanaNormal = normalHelper(gl, bannanaVertices, bannanaNormal);

let  TRIANGLE_NORMAL = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,TRIANGLE_NORMAL);
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(newBannanaNormal),gl.DYNAMIC_DRAW);

// BALL

let ballTexture =  get_texture(gl,"./textures/ball.jpg");

loadJSON(gl,'./textures/ball.json');

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

// BOX

let boxTexture =  get_texture(gl,"./textures/box.jpg");

let  box_VERTEX = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,box_VERTEX);
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(boxCoords.vertexes),gl.STATIC_DRAW);

let  box_FACES = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,box_FACES);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(boxCoords.indexes),gl.STATIC_DRAW);

// PIECE

var piece_VERTEX = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, piece_VERTEX);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pieceCoords), gl.STATIC_DRAW);

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


// BOX MATRIX

let  boxProjMat = glMatrix.mat4.create();
let  boxModelMat = glMatrix.mat4.create();
let  boxViewMat  = glMatrix.mat4.create();

glMatrix.mat4.perspective(boxProjMat, 50 * Math.PI / 180, canvas.width/canvas.height, 1, 100);
glMatrix.mat4.identity(boxModelMat);
glMatrix.mat4.identity(boxViewMat);

// PIECE MATRIX

for (let i = 0; i < 20; i++) {
  piecesMatrix.push({})

  piecesMatrix[i].proj = glMatrix.mat4.create();
  piecesMatrix[i].model = glMatrix.mat4.create();
  piecesMatrix[i].view = glMatrix.mat4.create();
  
  glMatrix.mat4.perspective(piecesMatrix[i].proj, 50 * Math.PI / 180, canvas.width/canvas.height, 1, 100);
  glMatrix.mat4.identity(piecesMatrix[i].model) 
  glMatrix.mat4.identity(piecesMatrix[i].view)
}  

console.log('piecesMatrix', piecesMatrix);

// RENDER

gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);
gl.clearDepth(1.0);

function animate(){

  gl.clearColor(0.5, 0.5, 0.5, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(shaderProgram);

  // LIGHT
  let source_direction = glMatrix.vec3.create();
  glMatrix.vec3.set(source_direction,0, 0, 0);

  gl.uniform3fv(u_source_direction, source_direction);

  let view_direction = glMatrix.vec3.create();
  glMatrix.vec3.set(view_direction, xPosBall, -yPosBall * 2, -3);
  glMatrix.vec3.transformMat4(view_direction, view_direction, bannanaViewMat);
  gl.uniform3fv(u_view_direction, view_direction);

  gl.uniform1f(u_shininess, 10);

  // BANNANA

  glMatrix.mat4.identity(bannanaModelMat);
  glMatrix.mat4.translate(bannanaModelMat,bannanaModelMat, [xPosPaddle - bannanaWidth , -0.85, -2]);
  glMatrix.mat4.rotateX(bannanaModelMat,bannanaModelMat , 220 * Math.PI / 180);
  glMatrix.mat4.rotateY(bannanaModelMat,bannanaModelMat , 110 * Math.PI / 180);
  glMatrix.mat4.scale(bannanaModelMat,bannanaModelMat ,[1.0,1.0,1.0]);

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
  gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_NORMAL);
  gl.vertexAttribPointer(a_normal, 3, gl.FLOAT, false, 4 * (3), 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, BANNANA_FACES);
  gl.drawElements(gl.TRIANGLES, bannanaIndices.length, gl.UNSIGNED_SHORT, 0);

  // BALL

  glMatrix.mat4.identity(ballModelMat);
  glMatrix.mat4.translate(ballModelMat,ballModelMat, [xPosBall - ballRadius, -yPosBall + ballRadius * 2, -2]);

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

  if(!boxDestroyed){
    // BOX

    glMatrix.mat4.identity(boxModelMat);
    glMatrix.mat4.translate(boxModelMat,boxModelMat, [0, 0.8, -2]);

    gl.uniformMatrix4fv(u_Pmatrix, false, boxProjMat);
    gl.uniformMatrix4fv(u_Mmatrix, false, boxModelMat);
    gl.uniformMatrix4fv(u_Vmatrix, false, boxViewMat);


    if (boxTexture.webGLtexture) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, boxTexture.webGLtexture);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, box_VERTEX);
    gl.vertexAttribPointer(a_Position,3,gl.FLOAT,false,4*(3+2),0);
    gl.vertexAttribPointer(a_uv,2,gl.FLOAT,false,4*(3+2),3*4);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, box_FACES);
    gl.drawElements(gl.TRIANGLES, boxCoords.indexes.length, gl.UNSIGNED_SHORT, 0);
  } else if (piecesFalling) {

    console.log('piecesPos', piecesPos.length);

    if (piecesPos.length == 20) {
      for (let i = 0; i < 20; i++) {
        gl.useProgram(shaderProgramPiece);
      
        glMatrix.mat4.identity(piecesMatrix[i].model);
        glMatrix.mat4.translate(piecesMatrix[i].model,piecesMatrix[i].model, [piecesPos[i].x , -piecesPos[i].y, -2]);
      
        gl.uniformMatrix4fv(u_Mmatrix_piece, false, piecesMatrix[i].model);
        gl.uniformMatrix4fv(u_Pmatrix_piece, false, piecesMatrix[i].proj);
        gl.uniformMatrix4fv(u_Vmatrix_piece, false, piecesMatrix[i].view);
      
        gl.bindBuffer(gl.ARRAY_BUFFER, piece_VERTEX);
        gl.vertexAttribPointer(a_Position_piece, 2, gl.FLOAT, false, 4 * (2 + 3), 0);
        gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 4 * (2 + 3), 2 * 4);
      
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
    }
  }

  // NORMAL

  // gl.useProgram(shaderProgramNormal);

  // gl.uniformMatrix4fv(u_Pmatrix_normal, false, bannanaProjMat);
  // gl.uniformMatrix4fv(u_Mmatrix_normal, false, bannanaModelMat);
  // gl.uniformMatrix4fv(u_Vmatrix_normal, false, bannanaViewMat);
 
  // gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_NORMAL);
  // gl.vertexAttribPointer(a_Position_normal, 3, gl.FLOAT, false, 4 * (3), 0);
  // gl.drawArrays(gl.LINES, 0, newBannanaNormal.length/3);

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

  let destroyedElementsBox2D = []

  world = new b2World(new b2Vec2(0, 0), true);
    
  var fixDef = new b2FixtureDef;
  fixDef.density = 1.0;
  fixDef.friction = 1;
  fixDef.restitution = 1;
  
  var bodyDef = new b2BodyDef;
  
  bodyDef.type = b2Body.b2_staticBody;

  //create bottom
  bodyDef.position.x = 0;
  bodyDef.position.y = 22.5;
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

  //create box
  var fixDef4 = new b2FixtureDef;
  fixDef4.density = 1.0;
  fixDef4.friction = 1;
  fixDef4.restitution = 1;
  
  var bodyDef4 = new b2BodyDef;
  
  bodyDef4.type = b2Body.b2_staticBody;

  bodyDef4.position.x = centerX;
  bodyDef4.position.y = centerY - 9;
  fixDef4.shape = new b2PolygonShape;
  fixDef4.shape.SetAsBox(1, 1);
  var box=world.CreateBody(bodyDef4);
  box.CreateFixture(fixDef4);

  //create paddle
  var fixDef2 = new b2FixtureDef;
  fixDef2.density = 1.0;
  fixDef2.friction = 0;
  fixDef2.restitution = 0;
   var bodyDef2 = new b2BodyDef;
  bodyDef2.type = b2Body.b2_dynamicBody;

  fixDef2.shape = new b2CircleShape(1.8);
  bodyDef2.position.x = centerX + 0;
  bodyDef2.position.y = centerY + 11;
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
    if(box.GetContactList()) {
      setTimeout(() => {
        world.DestroyBody(box);

        boxDestroyed = true
        piecesFalling = true

        for(let i = 0; i < 5; i++) {
          if(destroyedElementsBox2D.length <= 20) {         
            fixDef2.shape = new b2CircleShape(Math.random() / 5 + 0.1);
  
            bodyDef2.position.x = centerX + 0;
            bodyDef2.position.y = centerY - 9;
            bodyDef2.fixedRotation = true;

            let piece = world.CreateBody(bodyDef2);
            piece.CreateFixture(fixDef2);
            piece.SetLinearVelocity(new b2Vec2(0, 10))	

            destroyedElementsBox2D.push(piece)
          }
        }
        
      }, 100)
    }
    

    if (destroyedElementsBox2D[0]?.GetPosition().y >= centerY) {
      destroyedElementsBox2D.forEach(e => world.DestroyBody(e))
      destroyedElementsBox2D = []
      piecesFalling = false
    } else if (piecesFalling) {
      piecesPos = destroyedElementsBox2D.map(e => {
        return {
          size: e.m_mass,
          x: (e.GetPosition().x - centerX) / 10,
          y: (e.GetPosition().y -centerY) / 10,
        }
      })
    }

    xPosPaddle = (paddle.GetPosition().x - centerX) / 10

    xPosBall = (ball.GetPosition().x - centerX) / 10
    yPosBall = (ball.GetPosition().y - centerY) / 10

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