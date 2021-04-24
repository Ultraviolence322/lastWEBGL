function normalHelper(gl,ModelVertices,ModelNormal) {

  gl.newNormal = [];

  for(let i = 0; i<= ModelVertices.length; i = i+3){

      var vectorVer = glMatrix.vec3.create();
      vectorVer[0] = ModelVertices[i];
      vectorVer[1] = ModelVertices[i+1];
      vectorVer[2] = ModelVertices[i+2];

      var vectorNormal = glMatrix.vec3.create();
      vectorNormal[0] = ModelNormal[i];
      vectorNormal[1] = ModelNormal[i+1];
      vectorNormal[2] = ModelNormal[i+2];


      glMatrix.vec3.scale(vectorNormal,vectorNormal,0.5);
      glMatrix.vec3.add(vectorNormal,vectorNormal,vectorVer);

      let v = [].concat.apply([], vectorVer);
      let vn = [].concat.apply([], vectorNormal);

      gl.newNormal.push(v);
      gl.newNormal.push(vn);

  }

  return [].concat.apply([], gl.newNormal)
}