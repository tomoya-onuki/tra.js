import { Projection } from "./Projection";
export declare class Map {
    private topoGeometrysList;
    private topoArcList;
    constructor();
    topojson(jsonString: string): void;
    decodeArc(topology: any, arc: number[][]): {
        lon: any;
        lat: any;
    }[];
    decodeArcs(topology: any, arcs: number[][][]): {
        lon: any;
        lat: any;
    }[][];
    draw(ctx: CanvasRenderingContext2D, prj: Projection, color: string, fill: boolean, stroke: boolean): void;
    drawMap(topoGeometryList: any, ctx: CanvasRenderingContext2D, prj: Projection, fill: boolean, stroke: boolean): void;
    drawGeometry(ctx: CanvasRenderingContext2D, prj: Projection, arcIdxList: number[], arcList: any, fill: boolean, stroke: boolean): void;
}
