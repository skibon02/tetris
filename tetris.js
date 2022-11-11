class Tetris {
    constructor(name, addScore) {
        this.name = name;
        this.addScore = addScore;
        this.score = 0;
        this.bg = [0,0,0];
        this.tickPeriod = 1000;
        this.colors = [
            [1, 1, 0],
            [1, 0, 1],
            [1, 0.5, 0],
            [0, 0, 1],
            [0, 1, 1],
            [1, 0, 0],
            [0, 1, 0]
        ]

        this.pieces = [
            [[1, 1],
            [1, 1]],
            [[1, 1, 1],
            [0, 1, 0],
            [0, 0, 0]],
            [[1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]],
            [[0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]],
            [[0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]],
            [[1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]],
            [[0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]]
        ]

        this.curPiece = this.getRandomPiece();
        this.pieceLoc = [4, 0];

        this.field = new Array(10);
        for(let i = 0; i < this.field.length; i++) {
            this.field[i] = new Array(20);
            for(let j = 0; j < this.field[i].length; j++) {
                this.field[i][j] = -1;
            }
        }

        this.init();
        this.ticktm = setTimeout(() => this.tick(), this.tickPeriod);
    }
    getRandomPiece() {
        let n = Math.floor(Math.random() * this.pieces.length);
        let piece = {piece: [...this.pieces[n]], color: n};
        return piece;
    }
    harddrop() {

    }
    keydown(e) {
        var code = e.keyCode;
        let action = 0;
        switch (code) {
            case 37: action = -1; break; //Left key
            case 39: action = 1; break; //Right key
            case 40: action = 'sd'; break; //softdrop
            case 83: action = 'l'; break; //rotate left
            case 70: action = 'r'; break; //rotate left
            case 32: action = 'hd'; break; //harddrop

            default: console.log(code); break;
        }

        if(action === 1 || action === -1) {
            if(action == -1 && this.pieceLoc[0] == 0) return;
            if(action == 1 && this.pieceLoc[0] == 10 - this.pieces[this.curPiece].length) return;
            this.pieceLoc[0] += action;
        }
        else if(action === 'l' || action === 'r') {
        }
        else if(action === 'hd') {
            this.harddrop();
        }
        else if(action === 'sd') {
            this.tickPeriod = 100;
            clearInterval(this.ticktm);
            this.ticktm = setTimeout(() => this.tick(), this.tickPeriod);
        }

    }
    keyup(e) {
        var code = e.keyCode;
        let action = 0;
        switch (code) {
            case 40: action = 'sd'; break; //softdrop
        }

        if(action == 'sd') {
            this.tickPeriod = 1000;
        }
    }
    async init() {
        let canvas = document.querySelector("#c");
        window.addEventListener('keydown',this.keydown.bind(this),false);
        window.addEventListener('keyup',this.keyup.bind(this),false);
       
        const resizeObserver = new ResizeObserver(this.resizeCanvasToDisplaySize.bind(this));
        resizeObserver.observe(canvas);
    
        this.gl = canvas.getContext("webgl2");
        let gl = this.gl;

        if (!gl) {
            console.log('No webGL :(');
        }
        this.rootLayout = this.updateLayout(canvas.width, canvas.height);
        this.resizeCanvasToDisplaySize([{target: canvas}]);
            
        //init shaders
        var vertexShader = this.createShader(gl.VERTEX_SHADER, await fetch("/shaders/vert.glsl").then(r=> r.text()));
        var fragmentShader = this.createShader(gl.FRAGMENT_SHADER, await fetch("/shaders/frag.glsl").then(r=> r.text()));
    
        var program = this.createProgram(vertexShader, fragmentShader);
        gl.useProgram(program);

        var vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        
        this.positionAttributeLocation = gl.getAttribLocation(program, "a_position");
        this.texcoordAttributeLocation  = gl.getAttribLocation(program, "a_texcoord");

        this.texcoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
        let texcoords = [
            0.0,  0.0,
            1.0,  0.0,
            0.0,  1.0,
            0.0,  1.0,
            1.0,  0.0,
            1.0,  1.0,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(this.texcoordAttributeLocation);
        
        let texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + 0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 255, 255]));

        // Asynchronously load an image
        var image = new Image();
        image.src = "/resources/quad.png";
        image.addEventListener('load', function() {
        // Now that the image has loaded make copy it to the texture.
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_2D);
        });
 
        // Tell the attribute how to get data out of texcoordBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floating point values
        var normalize = true;  // convert from 0-255 to 0.0-1.0
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next texcoord
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
        this.texcoordAttributeLocation, size, type, normalize, stride, offset);
    
        gl.enableVertexAttribArray(this.positionAttributeLocation);
    
    
        //setup the viewport
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    
        this.resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
        this.colorUniformLocation = gl.getUniformLocation(program, "u_color");
        gl.uniform2f(this.resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        

        this.vertexBuffer = this.gl.createBuffer();


        //start rendering cycle
        window.requestAnimationFrame(this.draw.bind(this));
    }

    createShader( type, source) {
        var shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        var success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }

        console.log(this.gl.getShaderInfoLog(shader));
        this.gl.deleteShader(shader);
    }

    createProgram( vertexShader, fragmentShader) {
        var program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        var success = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
        if (success) {
            return program;
        }

        console.log(this.gl.getProgramInfoLog(program));
        this.gl.deleteProgram(program);
    }
    updateLayout(w, h) {
        this.rootLayout = new Layout(6, 2);
        this.rootLayout.addConstraints(new ProportionalConstraint(['x', 1, 4], ['x', 1, 2], 0.2952));
        this.rootLayout.addConstraints(new ProportionalConstraint(['x', 1, 4], ['x', 1, 3], 0.7048));
        this.rootLayout.addConstraints(new ProportionalConstraint(['y', 0, 1], ['x', 1, 4], 1.2207));
        this.rootLayout.addConstraints(new ProportionalConstraint(['x', 0, 1], ['x', 4, 5], 1));
        try {
            this.rootLayout.buildFixed(w, h);
        }
        catch(e) {
            this.bg = [1, 0.3, 0.6];
            console.log(e)
        }
    
        if(this.rootLayout.getState() == LayoutState.Ok) {
            this.bg = [1, 0.9, 1];
            console.log('Layout built successfully!');
        }
    }
    resizeCanvasToDisplaySize(entries) {
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
                this.updateLayout(displayWidth, displayHeight);

                canvas.width  = displayWidth;
                canvas.height = displayHeight;
                this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
                this.gl.uniform2f(this.resolutionUniformLocation, this.gl.canvas.width, this.gl.canvas.height);
                console.log('Canvas resized: ' + displayWidth + "x" + displayHeight);
            }
        }
    }

    getVertices(i, j) {
        let fieldWidth = this.rootLayout.resolvedX[3] - this.rootLayout.resolvedX[2];
        // let fieldHeight = this.rootLayout.resolvedY[1] - this.rootLayout.resolvedY[0];

        let xoffs = this.rootLayout.resolvedX[2];
        let sqWidth = fieldWidth / 10;
        let v1x = xoffs + sqWidth * i;
        let v1y = sqWidth * j;
        let v2x = xoffs + sqWidth * (i+1);
        let v2y = sqWidth * (j);
        let v3x = xoffs + sqWidth * (i);
        let v3y = sqWidth * (j+1);
        let v4x = xoffs + sqWidth * (i+1);
        let v4y = sqWidth * (j+1);
        return [
            v1x, v1y,
            v2x, v2y,
            v3x, v3y,
            v2x, v2y,
            v3x, v3y,
            v4x, v4y
        ];
    }

    draw(timestamp) {  
        // Clear the canvas
        this.gl.clearColor(this.bg[0], this.bg[1], this.bg[2], 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        
        var primitiveType = this.gl.TRIANGLES;
        var offset = 0;
        
        var count = 0;
        for(let i = 0; i < this.field.length; i++) {
            for(let j = 0; j < this.field[i].length; j++) {
                if(this.field[i][j] == -1) {
                    continue;
                }
                let color = this.colors[this.field[i][j]];
                this.gl.uniform3f(this.colorUniformLocation, color[0], color[1], color[2]);
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.getVertices(i, j)), this.gl.STATIC_DRAW);
                this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
                this.gl.drawArrays(primitiveType, offset, 6);
                count++;
            }
        }
        for(let i = 0; i < this.curPiece.piece.length; i++) {
            for(let j = 0; j < this.curPiece.piece[i].length; j++) {
                if(this.curPiece.piece[i][j] == 0) {
                    continue;
                }
                let color = this.colors[this.curPiece.color];
                this.gl.uniform3f(this.colorUniformLocation, color[0], color[1], color[2]);
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.getVertices(j + this.pieceLoc[0], i + this.pieceLoc[1])), this.gl.STATIC_DRAW);
                this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
                this.gl.drawArrays(primitiveType, offset, 6);
                count++;
            }
        }
        // gl.bindBuffer(gl.ARRAY_BUFFER, linesBuffer);
        // var size = 2;          // 2 components per iteration
        // var type = gl.FLOAT;   // the data is 32bit floats
        // var normalize = false; // don't normalize the data
        // var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        // var offset = 0;        // start at the beginning of the buffer

        // count = views.length/2;
        // gl.bindBuffer(gl.ARRAY_BUFFER, viewsBuffer);
        // gl.vertexAttribPointer(
        //     positionAttributeLocation, size, type, normalize, stride, offset);
        // gl.uniform3fv(colorUniformLocation, [0.0, 1.0, 0.5]);
        // gl.drawArrays(primitiveType, offset, count);

        window.requestAnimationFrame(this.draw.bind(this));
    }

    tick() {
        this.pieceLoc[1]++;


        this.ticktm = setTimeout(() => this.tick(), this.tickPeriod);
    }
}