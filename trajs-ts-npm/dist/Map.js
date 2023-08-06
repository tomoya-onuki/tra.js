"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Map = void 0;
class Map {
    constructor() {
        this.topoGeometrysList = [];
    }
    topojson(jsonString) {
        const topoJsonData = JSON.parse(jsonString);
        // topojsonのデータを緯度経度の絶対座標に変換する
        Object.keys(topoJsonData.objects).forEach(key => {
            this.topoGeometrysList.push(topoJsonData.objects[key].geometries);
        });
        // topoGeometryList = topoJsonData.objects[key].geometries;
        this.topoArcList = this.decodeArcs(topoJsonData, topoJsonData.arcs);
    }
    decodeArc(topology, arc) {
        let x = 0, y = 0;
        return arc.map((position) => {
            x += position[0];
            y += position[1];
            if (topology.transform != undefined) {
                const lon = x * topology.transform.scale[0] + topology.transform.translate[0];
                const lat = y * topology.transform.scale[1] + topology.transform.translate[1];
                return { lon: lon, lat: lat };
            }
            else {
                const lon = x;
                const lat = y;
                return { lon: lon, lat: lat };
            }
        });
    }
    decodeArcs(topology, arcs) {
        return arcs.map((arc) => this.decodeArc(topology, arc));
    }
    draw(ctx, prj, color, fill, stroke) {
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.0;
        this.topoGeometrysList.forEach(g => {
            this.drawMap(g, ctx, prj, fill, stroke);
        });
    }
    drawMap(topoGeometryList, ctx, prj, fill, stroke) {
        if (topoGeometryList.length > 0) {
            // topoJsonで区切られた地域ごとに面を作る
            topoGeometryList.forEach((geo) => {
                if (geo.type === 'Polygon') {
                    const arcs = geo.arcs;
                    arcs.forEach((arcIdxList) => {
                        this.drawGeometry(ctx, prj, arcIdxList, this.topoArcList, fill, stroke);
                    });
                }
                else if (geo.type === 'MultiPolygon') {
                    const arcs = geo.arcs;
                    arcs.forEach(arc => {
                        arc.forEach((arcIdxList) => {
                            this.drawGeometry(ctx, prj, arcIdxList, this.topoArcList, fill, stroke);
                        });
                    });
                }
                else if (geo.type === 'LineString') {
                    const arcIdxList = geo.arcs;
                    this.drawGeometry(ctx, prj, arcIdxList, this.topoArcList, fill, stroke);
                }
            });
        }
    }
    drawGeometry(ctx, prj, arcIdxList, arcList, fill, stroke) {
        let firstPoint = true;
        ctx.beginPath();
        arcIdxList.forEach((arcIndex) => {
            if (arcIndex >= 0) {
                const arc = arcList[arcIndex];
                for (let i = 0; i < arc.length; i++) {
                    // prj.center(this.centerLon, this.centerLat);
                    const x = prj.x(arc[i].lon);
                    const y = prj.y(arc[i].lat);
                    if (firstPoint) {
                        ctx.moveTo(x, y);
                        firstPoint = false;
                    }
                    else {
                        ctx.lineTo(x, y);
                    }
                }
            }
            else {
                const arc = arcList[~arcIndex];
                for (let i = arc.length - 1; i >= 0; i--) {
                    // prj.center(this.centerLon, this.centerLat);
                    const x = prj.x(arc[i].lon);
                    const y = prj.y(arc[i].lat);
                    if (firstPoint) {
                        ctx.moveTo(x, y);
                        firstPoint = false;
                    }
                    else {
                        ctx.lineTo(x, y);
                    }
                }
            }
        });
        if (stroke)
            ctx.stroke();
        if (fill)
            ctx.fill();
    }
}
exports.Map = Map;
