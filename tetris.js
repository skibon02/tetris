class Tetris {
    constructor(name, addScore) {
        this.name = name;
        this.addScore = addScore;
        this.score = 0;
        this.bg = [0,0,0];
        this.baseTickPeriod = 1000;
        this.touchTickPeriod = 500;
        this.tickPeriod = this.baseTickPeriod;
        this.oneLevelHoldPeriod = 3000;
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
            [[0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]],
            [[0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]],
            [[1, 0, 0],
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
        this.piecesH = [2, 2, 2, 2, 1, 2, 2];
        this.piecesYoffs = [0,0,0,0,1,0,0];

        this.rightRotateKickData = [
            [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]], // 3 -> 0
            [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]], // 0 -> 1
            [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]], // 1 -> 2
            [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]], // 2 -> 3
        ]
        this.leftRotateKickData = [
            [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]], // 1 -> 0
            [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]], // 2 -> 1 
            [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]], // 3 -> 2
            [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]], // 0 -> 3 
        ]
        this.halfRotateKickData = [
            [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]], // 2 -> 0
            [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]], // 3 -> 1
            [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]], // 0 -> 2
            [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]], // 1 -> 3
        ]
        this.rightRotateKickDataI = [
            [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]], // 3 -> 0
            [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]], // 0 -> 1
            [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]], // 1 -> 2
            [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]], // 2 -> 3
        ]
        this.leftRotateKickDataI = [
            [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]], // 1 -> 0
            [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]], // 2 -> 1
            [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]], // 3 -> 2
            [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]], // 0 -> 3
        ]
        this.halfRotateKickDataI = [
            [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]], // 2 -> 0
            [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]], // 3 -> 1
            [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]], // 0 -> 2
            [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]], // 1 -> 3
        ]

        this.touchingGroundInputsReset = 15;
        this.nextPieceQueue = [];

        this.oneLevelHoldPossible = true;
        this.oneLevelHoldtm = null;
        this.softDropActive = false;
        this.touchingGround = false;
        this.touchingGroundInputs = this.touchingGroundInputsReset;
        this.curPiece = this.extractPiece();
        this.curRotation = 0;
        this.pieceLoc = [4, 0];
        this.holdPiece = null;
        this.holdUsed = false;


        this.field = new Array(10);
        for(let i = 0; i < this.field.length; i++) {
            this.field[i] = new Array(20);
            for(let j = 0; j < this.field[i].length; j++) {
                this.field[i][j] = -1;
            }
        }

        this.init();
        this.DAStm = null;
        this.ARRint = null;

        this.DAS = 160;
        this.ARR = 30;
        this.SDF = 1000;
        this.ticktm = setTimeout(() => this.tick(), this.tickPeriod);
    }
    appendRandomPieces() {
        let pieces = [0, 1, 2, 3, 4, 5, 6];
        let shuffled = pieces
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value)
        for(let i = 0; i < 7; i++) {            
            let col = shuffled[i];
            let piece = {piece: [...this.pieces[col]], color: col};
            this.nextPieceQueue = [piece, ...this.nextPieceQueue];
        }
    }

    extractPiece() {
        if(this.nextPieceQueue.length < 7) {
           this.appendRandomPieces();
        }
        return this.nextPieceQueue.pop();
    }

    testIntersection(testLoc) {
        let piece = this.curPiece.piece;
        let loc = testLoc || this.pieceLoc;
        for(let i = 0; i < piece.length; i++) {
            for(let j = 0; j < piece[i].length; j++) {
                if(loc[0] + j < 0 || loc[0] + j > 9 || loc[1] + i > 19) {
                    if(piece[i][j] == 1) {
                        return true;
                    }
                } else if(loc[1] + i >= 0) {
                    if(piece[i][j] == 1 && this.field[loc[0] + j][loc[1] + i] != -1) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    clearLines() {
        let lines = 0;
        for(let i = 0; i < this.field[0].length; i++) {
            let full = true;
            for(let j = 0; j < this.field.length; j++) {
                if(this.field[j][i] == -1) {
                    full = false;
                    break;
                }
            }
            if(full) {
                lines++;
                for(let j = 0; j < this.field.length; j++) {
                    this.field[j].splice(i, 1);
                    this.field[j].unshift(-1);
                }
            }
        }
    }
    setupPiece() {
        if(this.DAStm){
            clearTimeout(this.DAStm);
            this.setDAStm();
        }
        if(this.ARRint) {
            clearInterval(this.ARRint);
            this.ARRint = null;
        }

        this.pieceLoc = [3, 0];
        if( this.curPiece.color == 0) {
            this.pieceLoc = [4, 0];
        }
        this.holdUsed = false;
        this.curRotation = 0;
        this.tickPeriod = this.baseTickPeriod;
        this.softDropActive = false;
        this.touchingGroundInputs = this.touchingGroundInputsReset;
        
        clearTimeout(this.ticktm);
        this.ticktm = setTimeout(() => this.tick(), this.tickPeriod);
    }
    placePiece() {
        let piece = this.curPiece.piece;
        let loc = this.pieceLoc;
        for(let i = 0; i < piece.length; i++) {
            for(let j = 0; j < piece[i].length; j++) {
                if(piece[i][j] == 1) {
                    this.field[loc[0] + j][loc[1] + i] = this.curPiece.color;
                }
            }
        }
        this.clearLines();

        this.curPiece = this.extractPiece();
        this.setupPiece();
    }
    harddrop() {
        while(this.pieceLoc[1] < 20) {
            if(this.testIntersection())
                break;
            this.pieceLoc[1]++;
        }
        this.pieceLoc[1]--;

        this.placePiece();
    }
    movePiece(action) {
        let leftbound = 10;
        let rightbound = -1;
        let piece = this.curPiece.piece;
        for(let i = 0; i < piece.length; i++) {
            let colTouched = false;
            for(let j = 0; j < piece[i].length; j++) {
                if(piece[j][i] == 1) {
                    colTouched = true;
                    break;
                }
            }
            if(colTouched) {
                if(leftbound > i) {
                    leftbound = i;
                }
                if(rightbound < i) {
                    rightbound = i;
                }
            }
        }

        if(action == -1 && this.pieceLoc[0] + leftbound == 0) return;
        if(action == 1 && this.pieceLoc[0] + rightbound == 9) return;
        let actionPerformed = true;
        this.pieceLoc[0] += action;
        if(this.testIntersection()) {
            this.pieceLoc[0] -= action;
            actionPerformed = false;
        }

        if(actionPerformed)
            this.postMoveAction();
    }
    setDAStm() {
        if(this.prevMove == undefined)
            return;
        this.DAStm = setTimeout(() => {
            this.ARRint = setInterval(() => {
                this.movePiece(this.prevMove);
            }, this.ARR);
        }, this.DAS);
    }
    keydown(e) {
        if(e.repeat) return;
        var code = e.keyCode;
        let action = 0;
        switch (code) {
            case 37: 
                action = -1; break; //Left key
            case 39: 
                action = 1; break; //Right key
            case 40: // Down key
                action = 'sd'; break; //softdrop
            case 70:
            case 38:
            case 88: // key f, up, x
                action = 'r'; break;
            case 90:
            case 68: // key z, d
                action = 'l'; break;
            case 83: // key s
                action = 'll'; break; 
            case 32: //space
                action = 'hd'; break; //harddrop
            case 67:
            case 65:
            case 16: // key c, a, shift
                action = 'h'; break; //hold
                

            default: console.log('Unknown key code: ', code); break;
        }

        if(action === 1 || action === -1) {
            this.prevMove = action;
            this.movePiece(action);

            clearTimeout(this.DAStm);
            if(this.ARRint)
                clearInterval(this.ARRint);

            this.setDAStm();
        }
        else if(action === 'l' || action === 'r' || action === 'll') {
            //rotate piece
            let actionPerformed = true;
            let piece = this.curPiece.piece;
            let rotation = this.curRotation;
            let newPiece = new Array(piece[0].length);
            for(let i = 0; i < newPiece.length; i++) {
                newPiece[i] = new Array(piece.length);
            }
            switch (action) {
                case 'l':
                    this.curRotation--;
                    break;
                case 'r':
                    this.curRotation++;
                    break;
                case 'll':
                    this.curRotation += 2;
                    break;
            }
            for(let i = 0; i < piece.length; i++) {
                for(let j = 0; j < piece[i].length; j++) {
                    if(action === 'r') newPiece[j][piece.length - 1 - i] = piece[i][j];
                    else if(action === 'l') newPiece[piece[i].length - 1 - j][i] = piece[i][j];
                    else if(action === 'll') newPiece[piece[i].length - 1 - i][piece[i].length - 1 - j] = piece[i][j];
                }
            }
            this.curRotation = (this.curRotation + 4) % 4;
            
            this.curPiece.piece = newPiece;

            if(this.curPiece.color != 0) {
                let found = false;
                for(let i = 0; i < 5; i++) {
                    let locOffset;
                    if(this.curPiece.color == 4) {
                        //I piece
                        if(action === 'r')
                            locOffset = this.rightRotateKickDataI[this.curRotation][i];
                        if(action === 'l')
                            locOffset = this.leftRotateKickDataI[this.curRotation][i];
                        if(action === 'll')
                            locOffset = this.halfRotateKickDataI[this.curRotation][i];
                    }
                    else {
                        //all other pieces
                        if(action === 'r')
                            locOffset = this.rightRotateKickData[this.curRotation][i];
                        if(action === 'l')
                            locOffset = this.leftRotateKickData[this.curRotation][i];
                        if(action === 'll')
                            locOffset = this.halfRotateKickData[this.curRotation][i];
                    }
                    this.pieceLoc[0] += locOffset[0];
                    this.pieceLoc[1] -= locOffset[1];
                    if(this.testIntersection()) {
                        this.pieceLoc[0] -= locOffset[0];
                        this.pieceLoc[1] += locOffset[1];
                    }
                    else {
                        found = true;
                        break;
                    }
                }  
                if(!found) {
                    //cance rotation
                    this.curPiece.piece = piece;
                    this.curRotation = rotation;
                    actionPerformed = false;
                }
            }        
            if(actionPerformed)
                this.postMoveAction();
        }
        else if(action === 'hd') {
            this.harddrop();
        }
        else if(action === 'sd') {
            this.softDropActive = true;
            this.tickPeriod = this.baseTickPeriod / this.SDF;
            if(!this.touchingGround) {
                clearTimeout(this.ticktm);
                this.tick();
            }
                
        }
        else if (action == 'h') {
            if (this.holdPiece == null) {
                this.holdPiece = this.curPiece.color;
                this.curPiece = this.extractPiece();
                this.setupPiece();
                this.holdUsed = true;
                console.log(this.holdPiece);
            }
            else {
                if (!this.holdUsed) {
                    let temp = this.curPiece.color;
                    this.curPiece = {piece: [...this.pieces[this.holdPiece]], color: this.holdPiece};
                    this.holdPiece = temp;
                    this.setupPiece();
                    this.holdUsed = true;
                    console.log(this.holdPiece);
                }
            }
        }

    }
    postMoveAction() {
        if(this.touchingGround) {
            //on touch ground
            if(this.oneLevelHoldPossible && this.oneLevelHoldtm == null) {
                this.tickPeriod = this.baseTickPeriod;
                this.oneLevelHoldtm = setTimeout((() => {
                    this.oneLevelHoldPossible = false;
                    console.log('one level hold expired. next move will trigger game tick');
                }).bind(this), this.oneLevelHoldPeriod);
            }

            //on input if acton performed and touching ground
            this.touchingGroundInputs--;
            clearTimeout(this.ticktm);
            if(this.touchingGroundInputs > 0) {
                this.ticktm = setTimeout(() => this.tick(), this.touchTickPeriod);
            }
            else{
                this.tick();
            }
        }
        this.updateTouchingGround();
        //on input
        if(!this.oneLevelHoldPossible && !this.touchingGround) {
            console.log('Too long input. Game tick triggered');
            this.tick();
        }
    }
    keyup(e) {
        if(e.repeat) return;
        var code = e.keyCode;
        let action = 0;
        switch (code) {
            case 40: action = 'sd'; break; //softdrop
            case 39: action = 1; break;
            case 37: action = -1; break; 
        }

        if(action == 'sd') {
            if(this.softDropActive) {
                this.softDropActive = false;
                this.tickPeriod = this.baseTickPeriod;
                if(!this.touchingGround) {
                    clearTimeout(this.ticktm);
                    this.ticktm = setTimeout(() => this.tick(), this.tickPeriod);
                }
            }
        }
        if(action === 1 || action === -1) {
            
            clearTimeout(this.DAStm);
            if(this.ARRint && this.prevMove === action) {
                clearInterval(this.ARRint);
                this.ARRint = null;
            }
            this.DAStm = null;
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
        var vertexShader = this.createShader(gl.VERTEX_SHADER, await fetch("shaders/vert.glsl").then(r=> r.text()));
        var fragmentShader = this.createShader(gl.FRAGMENT_SHADER, await fetch("shaders/frag.glsl").then(r=> r.text()));
    
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
        
        this.texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + 0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 255, 255]));

        // Asynchronously load an image
        var image = new Image();
        image.src = "resources/quad.png";
        image.addEventListener('load', (function() {
        // Now that the image has loaded make copy it to the texture.
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_2D);
        }).bind(this));

        this.bgtexture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + 1);
        gl.bindTexture(gl.TEXTURE_2D, this.bgtexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 255, 255]));
 
        var imagebg = new Image();
        imagebg.src = "resources/field.png";
        imagebg.addEventListener('load', (function() {
        // Now that the image has loaded make copy it to the texture.
            gl.bindTexture(gl.TEXTURE_2D, this.bgtexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imagebg);
            gl.generateMipmap(gl.TEXTURE_2D);
        }).bind(this));
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
        //hold x
        // 0.0974576271186441
        // 0.2768361581920904

        //hold y
        // 0.0603448275862069
        // 0.1862068965517241
        // 0.3120689655172414
        // 0.4379310344827586
        // 0.5637931034482759
        // 0.6896551724137931


        // queue x
        // 0.7217514124293785
        // 0.9011304347826087


        this.rootLayout = new Layout(10, 8);
        //hold place
        this.rootLayout.addConstraints(new ProportionalConstraint(['x', 1, 8], ['x', 1, 2], 0.0974576));
        this.rootLayout.addConstraints(new ProportionalConstraint(['x', 1, 8], ['x', 1, 3], 0.2768361));

        //glass
        this.rootLayout.addConstraints(new ProportionalConstraint(['x', 1, 8], ['x', 1, 4], 0.2952));
        this.rootLayout.addConstraints(new ProportionalConstraint(['x', 1, 8], ['x', 1, 5], 0.7048));
        
        //queue
        this.rootLayout.addConstraints(new ProportionalConstraint(['x', 1, 8], ['x', 1, 6], 0.72175141));
        this.rootLayout.addConstraints(new ProportionalConstraint(['x', 1, 8], ['x', 1, 7], 0.9011304347826087));

        //queue y
        this.rootLayout.addConstraints(new ProportionalConstraint(['y', 0, 7], ['y', 0, 1], 0.0603448));
        this.rootLayout.addConstraints(new ProportionalConstraint(['y', 0, 7], ['y', 0, 2], 0.1862068));
        this.rootLayout.addConstraints(new ProportionalConstraint(['y', 0, 7], ['y', 0, 3], 0.3120689));
        this.rootLayout.addConstraints(new ProportionalConstraint(['y', 0, 7], ['y', 0, 4], 0.4379310));
        this.rootLayout.addConstraints(new ProportionalConstraint(['y', 0, 7], ['y', 0, 5], 0.5637931));
        this.rootLayout.addConstraints(new ProportionalConstraint(['y', 0, 7], ['y', 0, 6], 0.6896551));

        //image proportions
        this.rootLayout.addConstraints(new ProportionalConstraint(['y', 0, 7], ['x', 1, 8], 1.2207));

        // horisontal centering
        this.rootLayout.addConstraints(new ProportionalConstraint(['x', 0, 1], ['x', 8, 9], 1));
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
        let fieldWidth = this.rootLayout.resolvedX[5] - this.rootLayout.resolvedX[4];
        let sqWidth = fieldWidth / 10;

        let xoffs = this.rootLayout.resolvedX[4];

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
    getSlotVertices(xcoord, ycoord, i, j) {
        let fieldWidth = this.rootLayout.resolvedX[5] - this.rootLayout.resolvedX[4];
        let sqWidth = fieldWidth / 10;
        
        let v1x = xcoord + sqWidth * i;
        let v1y = ycoord + sqWidth * j;
        let v2x = xcoord + sqWidth * (i+1);
        let v2y = ycoord + sqWidth * (j);
        let v3x = xcoord + sqWidth * (i);
        let v3y = ycoord + sqWidth * (j+1);
        let v4x = xcoord + sqWidth * (i+1);
        let v4y = ycoord + sqWidth * (j+1);
        return [
            v1x, v1y,
            v2x, v2y,
            v3x, v3y,
            v2x, v2y,
            v3x, v3y,
            v4x, v4y
        ];
        
    }

    getBgQuad() {
        let xoffs = this.rootLayout.resolvedX[1];
        let fieldWidth = this.rootLayout.resolvedX[8] - this.rootLayout.resolvedX[1];
        let fieldHeight = this.rootLayout.resolvedY[this.rootLayout.resolvedY.length-1] - this.rootLayout.resolvedY[0];
        return [
            xoffs, 0,
            xoffs + fieldWidth, 0,
            xoffs, fieldHeight,
            xoffs, fieldHeight,
            xoffs + fieldWidth, 0,
            xoffs + fieldWidth, fieldHeight
        ];
    }

    updateTouchingGround() {
        this.pieceLoc[1]++;
        this.touchingGround = this.testIntersection();
        this.pieceLoc[1]--;
    }

    getGhostPieceLoc() {
        let ghostLoc = [this.pieceLoc[0], this.pieceLoc[1]];
        while(!this.testIntersection(ghostLoc)) {
            ghostLoc[1]++;
        }
        ghostLoc[1]--;
        return ghostLoc;
    }
    draw(timestamp) {  
        // Clear the canvas
        this.gl.clearColor(this.bg[0], this.bg[1], this.bg[2], 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        
        var primitiveType = this.gl.TRIANGLES;
        var offset = 0;
        
        
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.bgtexture);
        this.gl.uniform4f(this.colorUniformLocation, 1, 1, 1, 1);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.getBgQuad()), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(primitiveType, offset, 6);

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        // draw field
        for(let i = 0; i < this.field.length; i++) {
            for(let j = 0; j < this.field[i].length; j++) {
                if(this.field[i][j] == -1) {
                    continue;
                }
                let color = this.colors[this.field[i][j]];
                this.gl.uniform4f(this.colorUniformLocation, color[0], color[1], color[2], 1);
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.getVertices(i, j)), this.gl.STATIC_DRAW);
                this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
                this.gl.drawArrays(primitiveType, offset, 6);
            }
        }
        
        //draw piece shadow
        this.gl.uniform4f(this.colorUniformLocation, 0.5, 0.5, 0.5, 0.3);
        let ghostLoc = this.getGhostPieceLoc();
        for(let i = 0; i < this.curPiece.piece.length; i++) {
            for(let j = 0; j < this.curPiece.piece[i].length; j++) {
                if(this.curPiece.piece[i][j] == 0) {
                    continue;
                }
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.getVertices(j + ghostLoc[0], i + ghostLoc[1])), this.gl.STATIC_DRAW);
                this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
                this.gl.drawArrays(primitiveType, offset, 6);
            }
        }

        //draw piece
        for(let i = 0; i < this.curPiece.piece.length; i++) {
            for(let j = 0; j < this.curPiece.piece[i].length; j++) {
                if(this.curPiece.piece[i][j] == 0) {
                    continue;
                }
                let color = this.colors[this.curPiece.color];
                this.gl.uniform4f(this.colorUniformLocation, color[0], color[1], color[2], 1);
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.getVertices(j + this.pieceLoc[0], i + this.pieceLoc[1])), this.gl.STATIC_DRAW);
                this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
                this.gl.drawArrays(primitiveType, offset, 6);
            }
        }

        //hold
        if(this.holdPiece != null && !this.holdPieceUsed) {
            this.drawAt(2, 3, 1, 2, this.pieces[this.holdPiece], this.holdPiece);
        }
        
        //queue
        if(this.nextPieceQueue.length > 5) {
            for(let i = this.nextPieceQueue.length-1; i >= this.nextPieceQueue.length-5; i--) {

                this.drawAt(6, 7, this.nextPieceQueue.length-1 - i + 1, this.nextPieceQueue.length-1 - i +2, this.nextPieceQueue[i].piece, this.nextPieceQueue[i].color);
            }
        }

        window.requestAnimationFrame(this.draw.bind(this));
    }
    drawAt(x, x2, y, y2, piece, color = 0) {
        let fieldWidth = this.rootLayout.resolvedX[5] - this.rootLayout.resolvedX[4];
        let sqWidth = fieldWidth / 10;
        
        let xoffs = this.rootLayout.resolvedX[x];
        let yoffs = this.rootLayout.resolvedY[y];
        xoffs += (this.rootLayout.resolvedX[x2] - xoffs) / 2 - sqWidth * piece.length/2;
        yoffs += (this.rootLayout.resolvedY[y2] - yoffs) / 2 - sqWidth * this.piecesH[color]/2 - this.piecesYoffs[color] * sqWidth;
        

        for(let i = 0; i < piece.length; i++) {
            for(let j = 0; j < piece[i].length; j++) {
                if(piece[i][j] == 0) {
                    continue;
                }
                this.gl.uniform4f(this.colorUniformLocation, this.colors[color][0], this.colors[color][1], this.colors[color][2], 1);
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.getSlotVertices(xoffs, yoffs, j, i)), this.gl.STATIC_DRAW);
                this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
                this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
            }
        }
    }

    tick() {
        clearTimeout(this.ticktm);

        this.pieceLoc[1]++;
        if (this.testIntersection()) {
            this.pieceLoc[1]--;
            //if(this.softDropActive && this.touchingGroundInputs == 0 || !this.softDropActive) {  
                this.placePiece();
            //}
        }
        else {
            this.updateTouchingGround();
        }
        if(this.oneLevelHoldtm)
            clearTimeout(this.oneLevelHoldtm);
        this.oneLevelHoldPossible = true;
        if(this.touchingGround){
            //on touch ground
            this.oneLevelHoldtm = setTimeout((() => {
                this.oneLevelHoldPossible = false;
                console.log("one level hold is expired. next input will trigger tick.");
            }).bind(this), this.oneLevelHoldPeriod);

            this.ticktm = setTimeout(() => this.tick(), this.touchTickPeriod);
        }
        else{
            this.ticktm = setTimeout(() => this.tick(), this.tickPeriod);
        }
    }
}