export declare class Projection {
    private cLat;
    private cLon;
    private _scale;
    private _mode;
    private _h;
    private _w;
    constructor();
    x(lon: number): number;
    y(lat: number): number;
    center(lon: number, lat: number): void;
    scale(s: number): void;
    mode(m: string): void;
    mercator(): void;
    set w(w: number);
    set h(h: number);
}
