
var canvas;
var gl;

var program;

var near = 1;
var far = 100;


var left = -6.0;
var right = 6.0;
var ytop =6.0;
var bottom = -6.0;
animFlag = false;

var lightPosition2 = vec4(100.0, 100.0, 100.0, 1.0 );
var lightPosition = vec4(0.0, 0.0, 100.0, 1.0 );

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 0.4, 0.4, 0.4, 1.0 );
var materialShininess = 40.0;

var ambientColor, diffuseColor, specularColor;

var modelMatrix, viewMatrix, modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var RX = 0;
var RY = 0;
var RZ = 0;

var MS = []; // The modeling matrix stack
var TIME = 0.0; // Realtime
var dt = 0.0
var prevTime = 0.0;
var resetTimerFlag = true;



// These are used to store the current state of objects.
// In animation it is often useful to think of an object as having some DOF
// Then the animation is simply evolving those DOF over time.
var currentRotation = [0,0,0];

var useTextures = 1;

//making a texture image procedurally
//Let's start with a 1-D array
var texSize = 8;
var imageCheckerBoardData = new Array();

// Now for each entry of the array make another array
// 2D array now!
for (var i =0; i<texSize; i++)
	imageCheckerBoardData[i] = new Array();

// Now for each entry in the 2D array make a 4 element array (RGBA! for colour)
for (var i =0; i<texSize; i++)
	for ( var j = 0; j < texSize; j++)
		imageCheckerBoardData[i][j] = new Float32Array(4);

// Now for each entry in the 2D array let's set the colour.
// We could have just as easily done this in the previous loop actually
for (var i =0; i<texSize; i++) 
	for (var j=0; j<texSize; j++) {
		var c = (i + j ) % 2;
		imageCheckerBoardData[i][j] = [c, c, c, 1];
}

//Convert the image to uint8 rather than float.
var imageCheckerboard = new Uint8Array(4*texSize*texSize);

for (var i = 0; i < texSize; i++)
	for (var j = 0; j < texSize; j++)
	   for(var k =0; k<4; k++)
			imageCheckerboard[4*texSize*i+4*j+k] = 255*imageCheckerBoardData[i][j][k];
		
// For this example we are going to store a few different textures here
var textureArray = [] ;
    
// Setting the colour which is needed during illumination of a surface
function setColor(c)
{
    ambientProduct = mult(lightAmbient, c);
    diffuseProduct = mult(lightDiffuse, c);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "lightPosition"),flatten(lightPosition2) );
    gl.uniform1f( gl.getUniformLocation(program, 
                                        "shininess"),materialShininess );
}

// We are going to asynchronously load actual image files this will check if that call if an async call is complete
// You can use this for debugging
function isLoaded(im) {
    if (im.complete) {
        console.log("loaded") ;
        return true ;
    }
    else {
        console.log("still not loaded!!!!") ;
        return false ;
    }
}

// Helper function to load an actual file as a texture
// NOTE: The image is going to be loaded asyncronously (lazy) which could be
// after the program continues to the next functions. OUCH!
function loadFileTexture(tex, filename)
{
	//create and initalize a webgl texture object.
    tex.textureWebGL  = gl.createTexture();
    tex.image = new Image();
    tex.image.src = filename ;
    tex.isTextureReady = false ;
    tex.image.onload = function() { handleTextureLoaded(tex); }
}

// Once the above image file loaded with loadFileTexture is actually loaded,
// this funcion is the onload handler and will be called.
function handleTextureLoaded(textureObj) {
	//Binds a texture to a target. Target is then used in future calls.
		//Targets:
			// TEXTURE_2D           - A two-dimensional texture.
			// TEXTURE_CUBE_MAP     - A cube-mapped texture.
			// TEXTURE_3D           - A three-dimensional texture.
			// TEXTURE_2D_ARRAY     - A two-dimensional array texture.
    gl.bindTexture(gl.TEXTURE_2D, textureObj.textureWebGL);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // otherwise the image would be flipped upsdide down
	
	//texImage2D(Target, internalformat, width, height, border, format, type, ImageData source)
    //Internal Format: What type of format is the data in? We are using a vec4 with format [r,g,b,a].
        //Other formats: RGB, LUMINANCE_ALPHA, LUMINANCE, ALPHA
    //Border: Width of image border. Adds padding.
    //Format: Similar to Internal format. But this responds to the texel data, or what kind of data the shader gets.
    //Type: Data type of the texel data
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureObj.image);
	
	//Set texture parameters.
    //texParameteri(GLenum target, GLenum pname, GLint param);
    //pname: Texture parameter to set.
        // TEXTURE_MAG_FILTER : Texture Magnification Filter. What happens when you zoom into the texture
        // TEXTURE_MIN_FILTER : Texture minification filter. What happens when you zoom out of the texture
    //param: What to set it to.
        //For the Mag Filter: gl.LINEAR (default value), gl.NEAREST
        //For the Min Filter: 
            //gl.LINEAR, gl.NEAREST, gl.NEAREST_MIPMAP_NEAREST, gl.LINEAR_MIPMAP_NEAREST, gl.NEAREST_MIPMAP_LINEAR (default value), gl.LINEAR_MIPMAP_LINEAR.
    //Full list at: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
	
	//Generates a set of mipmaps for the texture object.
        /*
            Mipmaps are used to create distance with objects. 
        A higher-resolution mipmap is used for objects that are closer, 
        and a lower-resolution mipmap is used for objects that are farther away. 
        It starts with the resolution of the texture image and halves the resolution 
        until a 1x1 dimension texture image is created.
        */
    gl.generateMipmap(gl.TEXTURE_2D);
	
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating)
    gl.bindTexture(gl.TEXTURE_2D, null);
    console.log(textureObj.image.src) ;
    
    textureObj.isTextureReady = true ;
}

// Takes an array of textures and calls render if the textures are created/loaded
// This is useful if you have a bunch of textures, to ensure that those files are
// actually loaded from disk you can wait and delay the render function call
// Notice how we call this at the end of init instead of just calling requestAnimFrame like before
function waitForTextures(texs) {
    setTimeout(
		function() {
			   var n = 0 ;
               for ( var i = 0 ; i < texs.length ; i++ )
               {
                    console.log(texs[i].image.src) ;
                    n = n+texs[i].isTextureReady ;
               }
               wtime = (new Date()).getTime() ;
               if( n != texs.length )
               {
               		console.log(wtime + " not ready yet") ;
               		waitForTextures(texs) ;
               }
               else
               {
               		console.log("ready to render") ;
					render(0);
               }
		},
	5) ;
}

// This will use an array of existing image data to load and set parameters for a texture
// We'll use this function for procedural textures, since there is no async loading to deal with
function loadImageTexture(tex, image) {
	//create and initalize a webgl texture object.
    tex.textureWebGL  = gl.createTexture();
    tex.image = new Image();

	//Binds a texture to a target. Target is then used in future calls.
		//Targets:
			// TEXTURE_2D           - A two-dimensional texture.
			// TEXTURE_CUBE_MAP     - A cube-mapped texture.
			// TEXTURE_3D           - A three-dimensional texture.
			// TEXTURE_2D_ARRAY     - A two-dimensional array texture.
    gl.bindTexture(gl.TEXTURE_2D, tex.textureWebGL);

	//texImage2D(Target, internalformat, width, height, border, format, type, ImageData source)
    //Internal Format: What type of format is the data in? We are using a vec4 with format [r,g,b,a].
        //Other formats: RGB, LUMINANCE_ALPHA, LUMINANCE, ALPHA
    //Border: Width of image border. Adds padding.
    //Format: Similar to Internal format. But this responds to the texel data, or what kind of data the shader gets.
    //Type: Data type of the texel data
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
	
	//Generates a set of mipmaps for the texture object.
        /*
            Mipmaps are used to create distance with objects. 
        A higher-resolution mipmap is used for objects that are closer, 
        and a lower-resolution mipmap is used for objects that are farther away. 
        It starts with the resolution of the texture image and halves the resolution 
        until a 1x1 dimension texture image is created.
        */
    gl.generateMipmap(gl.TEXTURE_2D);
	
	//Set texture parameters.
    //texParameteri(GLenum target, GLenum pname, GLint param);
    //pname: Texture parameter to set.
        // TEXTURE_MAG_FILTER : Texture Magnification Filter. What happens when you zoom into the texture
        // TEXTURE_MIN_FILTER : Texture minification filter. What happens when you zoom out of the texture
    //param: What to set it to.
        //For the Mag Filter: gl.LINEAR (default value), gl.NEAREST
        //For the Min Filter: 
            //gl.LINEAR, gl.NEAREST, gl.NEAREST_MIPMAP_NEAREST, gl.LINEAR_MIPMAP_NEAREST, gl.NEAREST_MIPMAP_LINEAR (default value), gl.LINEAR_MIPMAP_LINEAR.
    //Full list at: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating)
    gl.bindTexture(gl.TEXTURE_2D, null);

    tex.isTextureReady = true;
}

// This just calls the appropriate texture loads for this example adn puts the textures in an array
function initTexturesForExample() {

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length-1],"stars.png");
    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length-1],"sun.png");
    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length-1],"stars2.jpg");
    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length-1],"earth.jpg");
    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length-1],"moon.jpg");
    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length-1],"StoneFloorTexture.png");

    for (let i = 0; i < 9; i++) {
        textureArray.push({}) ;
        loadFileTexture(textureArray[textureArray.length-1],"Explosion/E"+i+".png") ;
    }

    loadFileTexture(textureArray[textureArray.length-1],"roofing.jpg");
    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length-1],"roofing2.jpg");
    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length-1],"roofing2.jpg");
    textureArray.push({});
  /*  
    textureArray.push({}) ;
    loadImageTexture(textureArray[textureArray.length-1],imageCheckerboard) ;
    */
}

// Changes which texture is active in the array of texture examples (see initTexturesForExample)
function toggleTextures() {
    useTextures = (useTextures + 1) % 2
	gl.uniform1i(gl.getUniformLocation(program, "useTextures"), useTextures);
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    setColor(materialDiffuse);
	
	// Initialize some shapes, note that the curved ones are procedural which allows you to parameterize how nice they look
	// Those number will correspond to how many sides are used to "estimate" a curved surface. More = smoother
    Cube.init(program);
    Cylinder.init(20,program);
    Cone.init(20,program);
    Sphere.init(36,program);

    // Matrix uniforms
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    
    // Lighting Uniforms
    gl.uniform4fv( gl.getUniformLocation(program, 
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "specularProduct"),flatten(specularProduct) );	
    gl.uniform4fv( gl.getUniformLocation(program, 
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
       "shininess"),materialShininess );
    
    document.getElementById("textureToggleButton").onclick = function() {
        toggleTextures() ;
        window.requestAnimFrame(render);
    };
    document.getElementById("animToggleButton").onclick = function() {
        if( animFlag ) {
            animFlag = false;
        }
        else {
            animFlag = true  ;
            resetTimerFlag = true ;
            window.requestAnimFrame(render);
        }
    };

	// Helper function just for this example to load the set of textures
    initTexturesForExample() ;

    waitForTextures(textureArray);
}




// Sets the modelview and normal matrix in the shaders
function setMV() {
    modelViewMatrix = mult(viewMatrix,modelMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    normalMatrix = inverseTranspose(modelViewMatrix);
    gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix) );
}

// Sets the projection, modelview and normal matrix in the shaders
function setAllMatrices() {
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    setMV();   
}

// Draws a 2x2x2 cube center at the origin
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawCube() {
    setMV();
    Cube.draw();
}

// Draws a sphere centered at the origin of radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawSphere() {
    setMV();
    Sphere.draw();
}

// Draws a cylinder along z of height 1 centered at the origin
// and radius 0.5.
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawCylinder() {
    setMV();
    Cylinder.draw();
}

// Draws a cone along z of height 1 centered at the origin
// and base radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawCone() {
    setMV();
    Cone.draw();
}

// Post multiples the modelview matrix with a translation matrix
// and replaces the modeling matrix with the result
function gTranslate(x,y,z) {
    modelMatrix = mult(modelMatrix,translate([x,y,z]));
}

// Post multiples the modelview matrix with a rotation matrix
// and replaces the modeling matrix with the result
function gRotate(theta,x,y,z) {
    modelMatrix = mult(modelMatrix,rotate(theta,[x,y,z]));
}

// Post multiples the modelview matrix with a scaling matrix
// and replaces the modeling matrix with the result
function gScale(sx,sy,sz) {
    modelMatrix = mult(modelMatrix,scale(sx,sy,sz));
}

// Pops MS and stores the result as the current modelMatrix
function gPop() {
    modelMatrix = MS.pop();
}

// pushes the current modelViewMatrix in the stack MS
function gPush() {
    MS.push(modelMatrix);
}



function space(){ 
    gPush()
    {
        setColor(vec4(0.0,0.0,0.0,1.0))
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, textureArray[0].textureWebGL)
        gl.uniform1i(gl.getUniformLocation(program, "map1"), 0)
       gl.activeTexture(gl.TEXTURE2)
       gl.bindTexture(gl.TEXTURE_2D, textureArray[2].textureWebGL)
       gl.uniform1i(gl.getUniformLocation(program, "starMap"), 2)        
        gl.uniform1i(gl.getUniformLocation(program, "stars"), 1)
        
        gScale(15,15,15)
        drawCube()
        gl.uniform1i(gl.getUniformLocation(program, "stars"), 0)
    }
    gPop();
}


var angle = 0.0
function sun(){
    gPush()
    {
        if (animFlag) {
            // The UFO will move when TIME is greater than a certain threshold (e.g., 5 seconds)                
                angle+= 0.01
        }
        gRotate(angle, 0, 1, 0) ;// Move the UFO along the X-axis based on TIME
        // Update the UFO position to move it to the right
        gScale(2, 2, 2)

        setColor(vec4(1.0,1.0,0.0,1.0))
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, textureArray[1].textureWebGL)
        gl.uniform1i(gl.getUniformLocation(program, "map1"), 1)

        drawSphere()
    }

    gPop()
}


//function for earth and moon
    function earthMoon(){
        gPush()
        {
            gRotate(30*TIME, 0,1,0);
            gScale(0.7,0.7,0.7)
          
            setColor(vec4(1,1,1,1))
            gl.activeTexture(gl.TEXTURE3)
            gl.bindTexture(gl.TEXTURE_2D, textureArray[3].textureWebGL)
            gl.uniform1i(gl.getUniformLocation(program, "map1"), 3)
            //earth
            gPush()
            {
                gTranslate(-7.5,0,0) ;
                gRotate(-90, 1, 0,0) ;
                gRotate(-TIME*100, 0, 0,1) ;
    
            
                if ( TIME < 30 ){
                    drawSphere()
                }
    
                //Moon
                gPush()
                {
                    gRotate(-TIME*50, 0, 0,1) ;
    
                    setColor(vec4(1, 1, 1, 1))
    
                    gl.activeTexture(gl.TEXTURE4)
                    gl.bindTexture(gl.TEXTURE_2D, textureArray[4].textureWebGL)
                    gl.uniform1i(gl.getUniformLocation(program, "map1"), 4)
    
                    if ( TIME < 30)
                    {
                        gPush()
                        {
                            gTranslate(-5/2,0,0) ;
                            gScale(0.7/2, 0.7/2, 0.7/2)
                            drawSphere()
                        }
                        gPop()
                    }
                }
                gPop()
            }
            gPop()
        }
        gPop()
    }
  
    let ufoPosX = -3.5;  // Initial X position of the UFO
let ufoSpeed = 0.001;  // Speed at which the UFO moves to the right
let timeFactor = 0.5;  // A factor for controlling the speed of oscillation and sway

// Function to create a hierarchical UFO with 3 levels, showing movement between them
function ufo() {
    gPush(); 

    if (animFlag) {
        if (TIME > 0) {
            ufoPosX += 0.0013;  
        }
    }

    // First Level: Body of the UFO (Root level)
    gTranslate(ufoPosX, 4, 0);  
    gRotate(15, 0, 1, 0); 

    gPush(); 
    {
        gl.activeTexture(gl.TEXTURE14);
        gl.bindTexture(gl.TEXTURE_2D, textureArray[14].textureWebGL);
        gl.uniform1i(gl.getUniformLocation(program, "map1"), 14);
        gScale(2, 0.4, 2);  
        setColor(vec4(1, 1, 1, 1.0));  
        drawSphere(); 
    }
    gPop();  

    // Second Level: Dome on top of the UFO
    gPush();  
    {
        let domeMovement = Math.sin(TIME * timeFactor) * 0.2;  

        gl.activeTexture(gl.TEXTURE15);
        gl.bindTexture(gl.TEXTURE_2D, textureArray[15].textureWebGL);
        gl.uniform1i(gl.getUniformLocation(program, "map1"), 15);
        gTranslate(0, 0.3 + domeMovement, 0);  
        gScale(1.2, 0.5, 1.2);  
        setColor(vec4(0.9, 0.9, 0.9, 1.0));  
        drawSphere();  
    }
    gPop(); 

    // Third Level: Bottom tentacles or lights on the UFO
    gPush();  
    {

        let swayMovement = Math.cos(TIME * timeFactor) * 0.3;  

        gl.activeTexture(gl.TEXTURE16);
        gl.bindTexture(gl.TEXTURE_2D, textureArray[16].textureWebGL);
        gl.uniform1i(gl.getUniformLocation(program, "map1"), 16);
        
        gTranslate(swayMovement, -0.5, 0);  
        gScale(0.2, 0.5, 0.2);
        setColor(vec4(0.8, 0.8, 1.0, 1.0));  
        drawSphere();  
    }
    gPop();  

    gPop();  
}

    
    



//function to make an asteroid
    function asteroid(){
        setColor(vec4(1, 1, 1, 1))
        gl.activeTexture(gl.TEXTURE5)
        gl.bindTexture(gl.TEXTURE_2D, textureArray[5].textureWebGL)
        gl.uniform1i(gl.getUniformLocation(program, "map1"), 5)
        if(TIME<30){
            gPush()
            {
                gTranslate(5, 19-TIME/1.65, 0)
                gScale(0.5,0.3,0.5)
                gRotate(90,0,1,0)
                drawSphere()
            }
            gPop()
        }
    }


    //function for explosion
let explosionActive = true;
    function explosion(){
        if ( TIME > 30)
            if(explosionActive)
            {
                setColor(vec4(1,1,1,1))
                if (index == 8){
                    index = 0
                }
        
                gTranslate(5,0,0) ;
                
                gl.activeTexture(gl["TEXTURE"+(6+index)])
                gl.bindTexture(gl.TEXTURE_2D, textureArray[6+index].textureWebGL)
                gl.uniform1i(gl.getUniformLocation(program, "map1"), (6+index))
        
                gPush()
                {
                    
                    if (TIME < 30)
                    {
                        gRotate(-TIME*10, 0, 1, 0)
                    }
                    gScale(1.2,1.2,0.01)
                    drawCube()
                }
                gPop()
        
                if (TIME - j > .1){
                    j = TIME
                    index++
                }
    }
    if(TIME>40){
        explosionActive = false
    }
    
}
index = 0
j = 0


function render(timestamp) {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    eye = vec3(0,2,10);
    MS = []; // Initialize modeling matrix stack
   
	// initialize the modeling matrix to identity
    modelMatrix = mat4();
    
    // set the camera matrix
    viewMatrix = lookAt(eye, at, up);
   
    // set the projection matrix
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    if (TIME > 45) {
        RY = (TIME * 10) % 360;  // 360-degree spin effect based on TIME
        gRotate(RY, 0, 1, 0);     // Apply the final Y-axis spin
    }
        
    eye = vec3(0,0,1);
    at = vec3(0, Math.sin(TIME/5), 0);
    setMV()
  
    // set all the matrices
    setAllMatrices();
    var curTime ;
    if( animFlag )
    {
        curTime = (new Date()).getTime() /1000 ;
        if( resetTimerFlag ) {
            prevTime = curTime ;
            resetTimerFlag = false ;
        }
        TIME = TIME + curTime - prevTime ;
        prevTime = curTime ;
    }

    

    // turn off star effect by default
    gl.uniform1i(gl.getUniformLocation(program, "stars"), 0)

    // pass in TIME to fragment shader to use for blinking stars
    gl.uniform1f(gl.getUniformLocation(program, "time"), TIME/2)
    
	// dt is the change in time or delta time from the last frame to this one
	// in animation typically we have some property or degree of freedom we want to evolve over time
	// For example imagine x is the position of a thing.
	// To get the new position of a thing we do something called integration
	// the simpelst form of this looks like:
	// x_new = x + v*dt
	// That is the new position equals the current position + the rate of of change of that position (often a velocity or speed), times the change in time
	// We can do this with angles or positions, the whole x,y,z position or just one dimension. It is up to us!
	
	
	// We need to bind our textures, ensure the right one is active before we draw
	//Activate a specified "texture unit".
    //Texture units are of form gl.TEXTUREi | where i is an integer.
	// You may be wondering where the texture coordinates are!
	// We've modified the object.js to add in support for this attribute array!
	
    space();
    sun();
	earthMoon();
    ufo();
    asteroid();
    explosion();
    
    window.requestAnimFrame(render);
}



/*A Medieval Windmill Scene
A rotating windmill (hierarchy)
Textured stone house, grass ground
A novel shader for glowing windows at night
Camera flyaround capturing the scene*/

