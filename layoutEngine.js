function Rect(x, y, w,h) {
    let x1 = x+w;
    let y1 = y+h;
    return [x, y, x1, y,
            x, y1, x1, y1,
            x, y, x, y1,
            x1, y, x1, y1];
}

const LayoutState = {
    Unbuilt: 'Unbuilt',
    FixedRatio: 'FixedRatio',
    FreeResize: 'FreeResize',
    Fixed: 'Fixed'
}

const ConstraintOp = {
    eq1: 'eq1',
    pr1: 'pr1',
}

class Constraint {
    constructor() {

    }
}

class FixedConstraint extends Constraint {
    constructor() {
        super();
    }
}

class Layout {
    constructor(xlines = 2, ylines = 2) {
        this.xlines = xlines;
        this.ylines = ylines;
        this.state = LayoutState.Unbuilt
        this.constraints = [];
    }

    buildFixed(fixedW, fixedH) {
        // this.state = LayoutState.FreeResize;
        this.constraints = [];
        this.constraints.push(new FixedConstraint({a: ['x', 0, 1], prop: 'eq1', val: fixedW}));
        this.constraints.push(new FixedConstraint({a: ['y', 0, 1], prop: 'eq1', val: fixedH}));

        this.resolvedX = [];
        this.resolvedY = [];

        this.resolvedX[0] = 0;
        this.resolvedY[0] = 0;


    }
    getState() {
        return this.state;
    }

    getGridLines() {
        return [0,-1000,0,10000,
                500, -1000, 500, 1000,
                -1000,0, 1000, 0,
                -1000, 500, 1000, 500];
    }

    getBoundingBox() {
        return Rect(0,0,500,500);
    }

    getViews() {
        return Rect(100,100,200,200);
    }
}