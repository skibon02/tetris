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
    constructor(fixed, loc1, loc2 = null) {
        this.fixed = fixed;
        this.loc1 = loc1;
        if(loc2)
            this.loc2 = loc2;
    }
}

class FixedConstraint extends Constraint {
    constructor(loc, val) {
        super(true, loc);
        this.val = val;
    }
}
class ProportionalConstraint extends Constraint {
    constructor(loc1, loc2, coef) {
        super(false, loc1, loc2);
        this.coef = coef;
    }
}

class Layout {
    constructor(xlines = 2, ylines = 2) {
        this.xlines = xlines;
        this.ylines = ylines;
        this.state = LayoutState.Unbuilt
        this.constraints = [];
        this.resConstraints = [];
    }
    addConstraints(constraints) {
        this.constraints = this.constraints.concat(constraints);
    }

    buildFixed(fixedW, fixedH) {
        // this.state = LayoutState.FreeResize;

        this.resConstraints = [];
        this.resConstraints.push(new FixedConstraint(['x', 0, 2], fixedW));
        this.resConstraints.push(new FixedConstraint(['y', 0, 2], fixedH));

        this.build();

        if(this.type != LayoutType.Fixed)
            throw new Error('Failed to build fixed layout');
    }

    find_groups(groups, vertex_group, fixed, touched = null) {
        for(let i = 0; i < this.resConstraints.length; i++) {
            if(this.resConstraints[i].fixed == fixed) {
                // for every fixed constraint
                let edges = [this.resConstraints[i].loc1];
                if(!fixed)
                    edges.push(this.resConstraints[i].loc2);

                for(let edge of edges) {
                    
                    let axis = edge[0];
                    let v1 = edge[1];
                    let v2 = edge[2];
    
                    if(touched) {
                        touched[axis][v1] = true;
                        touched[axis][v2] = true;
                    }
                    if(v1 in vertex_group[axis] && v2 in vertex_group[axis]) {
                        if(vertex_group[axis][v1] == vertex_group[axis][v2] && fixed) {
                            this.state = LayoutState.Fail;
                            throw new Error('Layout dependency conflict!');
                        }
                        if (vertex_group[axis][v1] != vertex_group[axis][v2]) {
                            let g1 = vertex_group[axis][v1];
                            let g2 = vertex_group[axis][v2];
                            groups[axis][g1] = groups[axis][g1].concat(groups[axis][g2]);
                            for(let v of groups[axis][g2]) {
                                vertex_group[axis][v] = vertex_group[axis][v1];
                            }
                            vertex_group[axis][g2] = null; //deleted
                        }
                    }
                    else if(!(v1 in vertex_group[axis] || v2 in vertex_group[axis])) {
                        groups[axis].push([v1,v2]);
                        vertex_group[axis][v1] = groups[axis].length-1;
                        vertex_group[axis][v2] = groups[axis].length-1;
                    }
                    else {
                        if(v2 in vertex_group[axis]) {
                            let temp = v2;
                            v2 = v1;
                            v1 = temp;
                        }
                        //v1 in group
                        //v2 is a new vertex
                        let g1 = vertex_group[axis][v1];
                        groups[axis][g1].push(v2);
                        vertex_group[axis][v2] = g1;
                    }
                }
            }
        }
    }

    build() {
        if(this.state != LayoutState.Unbuilt)
            throw new Error('Layout is already built!');

        this.resConstraints = this.resConstraints.concat(this.constraints);
        this.resolvedX = [];
        this.resolvedY = [];

        this.F_groups = {x: [], y: []};
        this.vertex_F_group = {x: {}, y: {}};

        let touched_v = {x: Array(this.xlines).fill(false), y: Array(this.ylines).fill(false)};

        //insert algorithm here
        console.log(this.resConstraints);
        this.find_groups(this.F_groups, this.vertex_F_group, true, touched_v);

        this.C_groups = {x: [], y: []};
        this.vertex_C_group = {x: {}, y: {}};
        for(let j in this.F_groups.x) {
            this.C_groups.x.push([]);
            for(let v of this.F_groups.x[j]) {
                this.C_groups.x[j].push(v);
            }
        }
        for(let j in this.F_groups.y) {
            this.C_groups.y.push([]);
            for(let v of this.F_groups.y[j]) {
                this.C_groups.y[j].push(v);
            }
        }

        for(let v in this.vertex_F_group.x)
            this.vertex_C_group.x[v] = this.vertex_F_group.x[v];
        for(let v in this.vertex_F_group.y)
            this.vertex_C_group.y[v] = this.vertex_F_group.y[v];
        debugger;
        this.find_groups(this.C_groups, this.vertex_C_group, false, touched_v);
        
        console.log(this.C_groups);
        console.log(this.vertex_C_group);
        console.log('x singles: ' + touched_v.x.reduce((pr, el) => pr + !el, 0));
        console.log('y singles: ' + touched_v.y.reduce((pr, el) => pr + !el, 0));

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
