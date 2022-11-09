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

const TreeEdgeType = {
    Fixed: 'Fixed',
    Var: 'Variable'
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

function swap(fir, sec) {
    let tmp = fir;
    fir = sec;
    sec = tmp;
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

    find_groups(groups, vertex_group, touched = null) {
        for(let i = 0; i < this.resConstraints.length; i++) {
            if(this.resConstraints[i].fixed) {
                // for every fixed constraint
                let edge = this.resConstraints[i].loc1;

                let axis = edge[0];
                let v1 = edge[1];
                let v2 = edge[2];

                if(touched) {
                    touched[axis][v1] = true;
                    touched[axis][v2] = true;
                }
                if(v1 in vertex_group[axis] && v2 in vertex_group[axis]) {
                    if(vertex_group[axis][v1] == vertex_group[axis][v2]) {
                        this.state = LayoutState.Fail;
                        throw new Error('Layout dependency conflict!');
                    }
                    else {
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
                        swap(v1, v2);
                    }
                    //v1 in group
                    //v2 is a new vertex
                    let g1 = vertex_group[axis][v1];
                    groups[axis][g1].push(v2);
                    vertex_group[axis][v2] = g1;
                }
                this.resTree[axis][[Math.min(v1,v2), Math.max(v1,v2)]] = {type: TreeEdgeType.Fixed, dir: v2>v1 ? 1 : -1, value: this.resConstraints[i].val};
            }
        }
    }

    getFixedValue(edge) {
        let axis = edge[0];
        let v1 = edge[1];
        let v2 = edge[2];
        if(v1 == v2)
            return 0;

        this.vertex_F_group[axis][v1];
        if(this.resTree[axis][[Math.min(v2, v1), Math.max(v2, v1)]]) {
            let treeEdge = this.resTree[axis][[Math.min(v2, v1), Math.max(v2, v1)]];
            return treeEdge.value * treeEdge.dir;
        }
        else {
            throw new Error('Failed to get fixed value. Tree search is not implemented yet.');
        }
    }

    build() {
        if(this.state != LayoutState.Unbuilt)
            throw new Error('Layout is already built!');

        this.resConstraints = this.resConstraints.concat(this.constraints);
        this.resolvedX = [];
        this.resolvedY = [];    
        this.resTree = {x: [], y: []};

        this.F_groups = {x: [], y: []};
        this.vertex_F_group = {x: {}, y: {}};

        let touched_v = {x: Array(this.xlines).fill(false), y: Array(this.ylines).fill(false)};

        //insert algorithm here
        console.log(this.resConstraints);
        this.find_groups(this.F_groups, this.vertex_F_group, touched_v);

        // this.C_groups = {x: [], y: []};
        // this.vertex_C_group = {x: {}, y: {}};
        // for(let j in this.F_groups.x) {
        //     this.C_groups.x.push([]);
        //     for(let v of this.F_groups.x[j]) {
        //         this.C_groups.x[j].push(v);
        //     }
        // }
        // for(let j in this.F_groups.y) {
        //     this.C_groups.y.push([]);
        //     for(let v of this.F_groups.y[j]) {
        //         this.C_groups.y[j].push(v);
        //     }
        // }

        // for(let v in this.vertex_F_group.x)
        //     this.vertex_C_group.x[v] = this.vertex_F_group.x[v];
        // for(let v in this.vertex_F_group.y)
        //     this.vertex_C_group.y[v] = this.vertex_F_group.y[v];
        // this.find_groups(this.C_groups, this.vertex_C_group, false);
        
        console.log('x singles: ' + touched_v.x.reduce((pr, el) => pr + !el, 0));
        console.log('y singles: ' + touched_v.y.reduce((pr, el) => pr + !el, 0));

        // as known as variables
        let P_groups = [];
        let edge_P_group = {}
        let fg_edge_P_group = {};
        // fg_edge_P_group[fg_edge] -> edge_P_group[edge] -> P_groups[P_group]

        if(!this.F_groups.x[0] || !this.F_groups.y[0]) {
            this.state = LayoutState.Fail;
            throw new Error('All verticies are separate! TODO: implement correct behaviour');
        }
        for(let i = 0; i < touched_v.x.length; i++ ) {
            if(!touched_v.x[i]) {
                //for isolated vertex i
                //create new F_group
                this.F_groups.x.push([i]);
                this.vertex_F_group.x[i] = this.F_groups.x.length-1;

                //create new P_group
                P_groups.push({fixed: false});
                let minv = Math.min(i, this.F_groups.x[0][0]);
                let maxv = Math.max(i, this.F_groups.x[0][0]);
                console.log('adding edge x ' + minv + ' ' + maxv);
                edge_P_group[['x', minv, maxv]] = P_groups.length-1; //create new edge between i and any vertex from existing group (F_groups.x[0][0])
            }
        }
        for(let i = 0; i < touched_v.y.length; i++ ) {
            if(!touched_v.y[i]) {
                //for isolated vertex i
                //create new F_group
                this.F_groups.y.push([i]);
                this.vertex_F_group.y[i] = this.F_groups.y.length-1;

                //create new P_group
                P_groups.push({fixed: false});
                let minv = Math.min(i, this.F_groups.y[0][0]);
                let maxv = Math.max(i, this.F_groups.y[0][0]);
                console.log('adding edge y ' + minv + ' ' + maxv);
                edge_P_group[['y', minv, maxv]] = P_groups.length-1; //create new edge between i and any vertex from existing group (F_groups.y[0][0])
            }
        }

        for(let constraint of this.resConstraints) {
            if(!constraint.fixed) {
                let axis1 = constraint.loc1[0];
                let v1 = constraint.loc1[1];
                let v2 = constraint.loc1[2];
                if(v1 > v2) {
                    swap(v1, v2);
                }
                let axis2 = constraint.loc1[0];
                let v3 = constraint.loc2[1];
                let v4 = constraint.loc2[2];
                let coef = constraint.coef;
                if(v3 > v4) {
                    swap(v3, v4);
                }

                // edge-edge or point-edge or edge-point or point-point
                let g1 = this.vertex_F_group[axis1][v1];
                let g2 = this.vertex_F_group[axis1][v2];
                let g3 = this.vertex_F_group[axis2][v3];
                let g4 = this.vertex_F_group[axis2][v4];

                let fg_edge1 = [axis1, Math.min(g1, g2), Math.max(g1, g2)];
                let fg_edge2 = [axis2, Math.min(g3, g4), Math.max(g3, g4)];
                let edge1 = [axis1, v1, v2];
                let edge2 = [axis2, v3, v4];

                let fir_point = g1 == g2;
                let sec_point = g3 == g4;
                if(fir_point && sec_point) {
                    // point-point is not allowed
                    this.state = LayoutState.Fail;
                    throw new Error('Layout dependency conflict! Proportional constraint connected between fixed edges! Constraint: ' + constraint);
                }

                if(!fir_point && !sec_point) {
                    // edge-edge

                    if(fg_edge1 == "" + fg_edge2) {
                        // constraint between same F_groups
                        if(fg_edge1 in fg_edge_P_group && fg_edge2 in fg_edge_P_group) {
                            // constraint between edges in same P_group
                            // transform P_group into fixed
                            throw new Error('TODO: implement correct behaviour');

                        } else {
                            // constraint between new two edges
                            // create a new fixed P_group with edge1, set it as fixed
                            
                            let calculated_value = 0;
                            if(g1 == g3) {
                                calculated_value = this.getFixedValue([axis1, edge1[1], edge2[1]]) - this.getFixedValue([axis1, edge1[2], edge2[2]]);
                            }
                            else {
                                calculated_value = this.getFixedValue([axis1, edge1[1], edge2[2]]) - this.getFixedValue([axis1, edge1[2], edge2[1]]);
                            }
                            calculated_value /= coef+1;
                            P_groups.push({fixed: true, source: edge1, value: calculated_value});
                            edge_P_group[edge1] = {group: P_groups.length-1, coef: 1, b: 0};
                            fg_edge_P_group[fg_edge1] = edge1;
                        }
                    }
                    else {
                        if(fg_edge1 in fg_edge_P_group && fg_edge2 in fg_edge_P_group) {
                            // both edges are in a P_group

                            let P_group1 = edge_P_group[edge1].group;
                            let P_group2 = edge_P_group[edge2].group;
                            
                            if(P_group1 == P_group2) {
                                this.state = LayoutState.Fail;
                                throw new Error('Layout dependency conflict! Proportional constraint connected between fixed edges! Constraint: ' + constraint);
                            }

                            // different P_groups
                            // merge second edge's P_group into first edge's P_group
                            let coef1 = edge_P_group[edge1].coef * coef / edge_P_group[edge2].coef;
                            if(edge1 + "" == fg_edge_P_group[fg_edge1] && edge2 + "" == fg_edge_P_group[fg_edge2]) {
                                for(let edge in edge_P_group) {
                                    if(edge_P_group[edge].group == P_group2) {
                                        edge_P_group[edge]= {group: P_group1, coef: coef1 * edge_P_group[edge].coef, b: 0};
                                    }
                                }
                            }
                            else {
                                //edges have offset
                                //TODO: implement
                                this.state = LayoutState.Fail;
                                throw new Error('Not inplemented! Offset detected between proportianal edges. Constraint: ' + constraint);
                            }

                        }
                        else if(!(fg_edge1 in fg_edge_P_group && (!(fg_edge2 in fg_edge_P_group)))) {
                            // both edges are not in a P_group
                            // create a new P_group
                            P_groups.push({fixed: false});
                            let P_group = P_groups.length - 1;
                            edge_P_group[edge1] = {group: P_group, coef: 1, b: 0};
                            edge_P_group[edge2] = {group: P_group, coef: coef, b: 0};
                            fg_edge_P_group[fg_edge1] = edge1;
                            fg_edge_P_group[fg_edge2] = edge2;
                        }
                        else {
                            // only first edge is in a P_group
                            // add second edge to first edge's P_group

                            let P_group = edge_P_group[edge1].group;
                            let coef1 = edge_P_group[edge1].coef * coef;
                            if(edge1 + "" == fg_edge_P_group[fg_edge1]) {
                                edge_P_group[edge2] = {group: P_group, coef: coef1, b: 0};
                                fg_edge_P_group[fg_edge2] = edge2;
                            }
                            else {
                                //edges have offset
                                //TODO: implement
                                this.state = LayoutState.Fail;
                                throw new Error('Not inplemented! Offset detected between proportianal edges. Constraint: ' + constraint);
                            }
                        }
                    }
                }
                else {
                    // point-edge
                    let edge_edge = fir_point ? edge2 : edge1;
                    let fg_edge_edge = fir_point ? fg_edge2 : fg_edge1;
                    if(sec_point) {
                        coef = 1 / coef;
                    }
                    let edge_point = fir_point ? edge1 : edge2;
                    let fg_edge_point = fir_point ? fg_edge1 : fg_edge2; //usless, because groups are the same


                    if(fg_edge_edge in fg_edge_P_group) {
                        // edge is in a P_group
                        // transform P_group into fixed

                        if(P_groups[edge_P_group[edge_edge]].fixed) {
                            this.state = LayoutState.Fail;
                            throw new Error('Layout dependency conflict! Two or more fixed sources in P-group! Constraint: ' + constraint);
                        }

                        P_groups[edge_P_group[edge_edge]].fixed = true;
                        P_groups[edge_P_group[edge_edge]].source = edge_point;
                        P_groups[edge_P_group[edge_edge]].value = this.getFixedValue(edge_point) * edge_P_group[edge_edge].coef * coef;

                    }
                    else {
                        // edge is not in a P_group
                        // create a new fixed P_group

                        P_groups.push({fixed: true, source: edge_point, coef: coef});
                        let P_group = P_groups.length - 1;
                        edge_P_group[edge_edge] = {group: P_group, coef: 1, b: 0};
                        fg_edge_P_group[fg_edge_edge] = edge_edge;
                    }

                }
            }
        }

        for(let i = 0; i < P_groups.length; i++) {
            if(P_groups[i].fixed) {
                // calculate value for group edges
                let value = P_groups[i].value;
                for(let edge of Object.keys(edge_P_group)) {
                    edge = edge.split(',');
                    if(edge_P_group[edge].group == i) {
                        edge_P_group[edge].calculated_value = edge_P_group[edge].coef * value;
                        this.resTree[edge[0]][[Math.min(edge[1], edge[2]), Math.max(edge[1], edge[2])]] = {type: TreeEdgeType.Fixed, dir: 1, value: edge_P_group[edge].calculated_value};
                    }
                }
            }
        }

        console.log(this.resTree);
        // TODO: implement DFS to calculate final values for layout
        this.resolvedX[0] = 0;
        this.resolvedY[0] = 0;
        for(let edge in this.resTree.x) {
            this.resTree.x[edge].visited = false;
        }
        for(let edge in this.resTree.y) {
            this.resTree.y[edge].visited = false;
        }
        this.dfsSolve('x', 0, 0);
        this.dfsSolve('y', 0, 0);

        this.state = LayoutState.Ok;
        this.type = LayoutType.Fixed;
    }

    dfsSolve(axis, v) {
        for(let edge of Object.keys(this.resTree[axis])) {
            edge = edge.split(',');
            if((edge[0] == v || edge[1] == v) && this.resTree[axis][edge].visited == false) {
                let dir = edge[0] == v ? 1 : -1;
                let next = edge[0] == v ? edge[1] : edge[0];
                if(this.resTree[axis][edge].type == TreeEdgeType.Fixed) {
                    if(axis == 'x') {
                        this.resolvedX[next] = this.resolvedX[v] + dir * this.resTree[axis][edge].value;
                    } else {
                        this.resolvedY[next] = this.resolvedY[v] + dir * this.resTree[axis][edge].value;
                    }
                    this.resTree[axis][edge].visited = true;
                    this.dfsSolve(axis, next);
                }
                else {
                    throw new Error('Not implemented! Variable edge detected!');
                }
            }
        }
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
