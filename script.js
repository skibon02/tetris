let lines = [];
let layouts = [];
let views = [];
let bg = [0,0,0];


// error case
// let rootLayout = new Layout(4, 4);
// rootLayout.addConstraints(new ProportionalConstraint(['x', 1, 2], ['y', 1, 2], 1));
// rootLayout.addConstraints(new ProportionalConstraint(['x', 0, 3], ['x', 0, 1], 0.2));
// rootLayout.addConstraints(new ProportionalConstraint(['x', 0, 3], ['x', 0, 2], 0.4));
// rootLayout.addConstraints(new ProportionalConstraint(['y', 0, 3], ['y', 0, 1], 0.3));
// rootLayout.addConstraints(new ProportionalConstraint(['y', 0, 3], ['y', 0, 2], 0.7));

//not implemented case 2
// let rootLayout = new Layout(4, 4);
// rootLayout.addConstraints(new FixedConstraint(['y', 2, 3], 100));
// rootLayout.addConstraints(new ProportionalConstraint(['y', 0, 1], ['y', 1, 2], 3));//probelem here
// rootLayout.addConstraints(new FixedConstraint(['x', 0, 1], 100));
// rootLayout.addConstraints(new ProportionalConstraint(['x', 1, 2], ['x', 2, 3], 3));
// rootLayout.addConstraints(new ProportionalConstraint(['x', 1, 2], ['y', 1, 2], 1));


// let rootLayout = new Layout(3, 2);
// rootLayout.addConstraints(new ProportionalConstraint(['x', 0, 1], ['x', 1, 2], 1));
// rootLayout.addConstraints(new ProportionalConstraint(['x', 0, 2], ['y', 0, 1], 1));


// let rootLayout = new Layout(6, 2);
// rootLayout.addConstraints(new ProportionalConstraint(['x', 0, 1], ['x', 4, 5], 1));// error if first
// rootLayout.addConstraints(new ProportionalConstraint(['x', 1, 4], ['x', 1, 2], 0.2952));
// rootLayout.addConstraints(new ProportionalConstraint(['x', 1, 4], ['x', 1, 3], 0.7048));
// rootLayout.addConstraints(new ProportionalConstraint(['y', 0, 1], ['x', 1, 4], 1.2207));


(async () => {
    let canvas = document.querySelector("#c");
    let gl;
    function createShader(gl, type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }

        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }

    function createProgram(gl, vertexShader, fragmentShader) {
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        var success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            return program;
        }

        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    }
    function createLayout(w, h) {
        let rootLayout = new Layout(6, 2);
        rootLayout.addConstraints(new ProportionalConstraint(['x', 1, 4], ['x', 1, 2], 0.2952));
        rootLayout.addConstraints(new ProportionalConstraint(['x', 1, 4], ['x', 1, 3], 0.7048));
        rootLayout.addConstraints(new ProportionalConstraint(['y', 0, 1], ['x', 1, 4], 1.2207));
        rootLayout.addConstraints(new ProportionalConstraint(['x', 0, 1], ['x', 4, 5], 1));
        try {
            rootLayout.buildFixed(w, h);
        }
        catch(e) {
            bg = [1, 0.3, 0.6];
            console.log(e)
        }
    
        if(rootLayout.getState() == LayoutState.Ok) {
            bg = [1, 0.9, 1];
            console.log('Layout built successfully!');
            lines = rootLayout.getGridLines();
            layouts = rootLayout.getBoundingBox();
            views = rootLayout.getViews();
        }
        //lines buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, linesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lines), gl.STATIC_DRAW);
    
    
        // layout buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, layoutsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(layouts), gl.STATIC_DRAW);
    
        // views buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, viewsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(views), gl.STATIC_DRAW);
    
        return rootLayout;
    }
    function resizeCanvasToDisplaySize(entries) {
        for(let entry of entries) {
            let canvas = entry.target;
            // Lookup the size the browser is displaying the canvas in CSS pixels.
            const dpr = window.devicePixelRatio;
            const displayWidth  = Math.round(canvas.clientWidth * dpr);
            const displayHeight = Math.round(canvas.clientHeight * dpr);

            // Check if the canvas is not the same size.
            const needResize = canvas.width  !== displayWidth || 
                                canvas.height !== displayHeight;

            if (needResize) {
                // Make the canvas the same size
                rootLayout = createLayout(displayWidth, displayHeight);

                canvas.width  = displayWidth;
                canvas.height = displayHeight;
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
                gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
                console.log('Canvas resized: ' + displayWidth + "x" + displayHeight);
            }
        }
    }

    function draw(timestamp) {  

        // Clear the canvas
        gl.clearColor(bg[0], bg[1], bg[2], 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        var primitiveType = gl.LINES;
        var offset = 0;
        
        var count = lines.length/2;
        gl.bindBuffer(gl.ARRAY_BUFFER, linesBuffer);
        var size = 2;          // 2 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            positionAttributeLocation, size, type, normalize, stride, offset);
        gl.uniform3fv(colorUniformLocation, [1.0, 0.5, 1.0]);
        gl.drawArrays(primitiveType, offset, count);

        count = layouts.length/2;
        gl.bindBuffer(gl.ARRAY_BUFFER, layoutsBuffer);
        gl.vertexAttribPointer(
            positionAttributeLocation, size, type, normalize, stride, offset);
        gl.uniform3fv(colorUniformLocation, [1.0, 0.0, 0.5]);
        gl.drawArrays(primitiveType, offset, count);

        count = views.length/2;
        gl.bindBuffer(gl.ARRAY_BUFFER, viewsBuffer);
        gl.vertexAttribPointer(
            positionAttributeLocation, size, type, normalize, stride, offset);
        gl.uniform3fv(colorUniformLocation, [0.0, 1.0, 0.5]);
        gl.drawArrays(primitiveType, offset, count);

        window.requestAnimationFrame(draw);
    }

    const resizeObserver = new ResizeObserver(resizeCanvasToDisplaySize);
    resizeObserver.observe(canvas);

    gl = canvas.getContext("webgl2");
    if (!gl) {
        console.log('No webGL :(');
    }

    var linesBuffer = gl.createBuffer();
    var layoutsBuffer = gl.createBuffer();
    var viewsBuffer = gl.createBuffer();
    let rootLayout = createLayout(canvas.width, canvas.height);
    resizeCanvasToDisplaySize([{target: canvas}]);
        
    //init shaders
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, await fetch("shaders/vert.glsl").then(r=> r.text()));
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, await fetch("shaders/frag.glsl").then(r=> r.text()));

    var program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

    const myVAO = gl.createVertexArray();
    gl.bindVertexArray(myVAO);
    gl.enableVertexAttribArray(positionAttributeLocation);


    //setup the viewport
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    var colorUniformLocation = gl.getUniformLocation(program, "u_color");
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    window.requestAnimationFrame(draw);
})()