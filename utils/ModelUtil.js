
   function  get_texture(gl,image_URL){

    var image = new Image();
    image.src = image_URL;
    image.webGLtexture = false;

    image.onload = function (e) {

        var texture = gl.createTexture();
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
        gl.bindTexture(gl.TEXTURE_2D,texture);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);

        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D,null);

        image.webGLtexture = texture;

    };

    return image;

}


   function loadJSON(gl,modelURL) {
       var xhr = new XMLHttpRequest();
       var model;

       xhr.open('GET', modelURL, false);
       xhr.onload = function () {
           if (xhr.status != 200) {

               alert('LOAD' + xhr.status + ': ' + xhr.statusText);
           } else {

               gl.model = JSON.parse(xhr.responseText);
           }
       }
       xhr.send();
   }

