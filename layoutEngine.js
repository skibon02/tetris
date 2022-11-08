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
    Ok: 'Ok',
    Fail: 'Fail',
}
const LayoutType = {
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
    constructor(loc, val) {
        super();
        this.loc1 = loc;
        this.val = val;
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
        this.constraints.push(new FixedConstraint(['x', 0, 2], fixedW));
        this.constraints.push(new FixedConstraint(['y', 0, 2], fixedH));

        this.build();

        if(this.type != LayoutType.Fixed)
            throw new Error('Failed to build fixed layout');
    }

    build() {
        if(this.state != LayoutState.Unbuilt)
            throw new Error('Layout is already built!');
            

        this.resolvedX = [];
        this.resolvedY = [];

        //insert algorithm here

        //manually filled data: (temp)
        this.resolvedX[0] = 0;
        this.resolvedY[0] = 0;
        this.resolvedX[1] = this.constraints[0].val/2;
        this.resolvedY[1] = this.constraints[1].val/2;
        this.resolvedX[2] = this.constraints[0].val;
        this.resolvedY[2] = this.constraints[1].val;

        this.state = LayoutState.Ok;
        this.type = LayoutType.Fixed;
    }
    getState() {
        return this.state;
    }

    getGridLines() {
        let x1 = this.resolvedX[0] - 100;
        let x2 = this.resolvedX[this.xlines-1] + 100;
        let y1 = this.resolvedY[0] - 100;
        let y2 = this.resolvedY[this.ylines-1] + 100;
        let res = [];
        for(let i = 0; i < this.xlines; i++) {
            res = res.concat([this.resolvedX[i], y1, this.resolvedX[i], y2]);
        }
        for(let i = 0; i < this.ylines; i++) {
            res = res.concat([x1, this.resolvedY[i], x2, this.resolvedY[i]]);
        }
        return res;
    }

    getBoundingBox() {
        return Rect(this.resolvedX[0],this.resolvedY[0],this.resolvedX[this.xlines-1]-this.resolvedX[0],this.resolvedY[this.xlines-1]-this.resolvedY[0]);
    }

    getViews() {
        return [];
    }
}
