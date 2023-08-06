export class Projection {
    private cLat: number = 0;
    private cLon: number = 0;
    private _scale: number = 1;
    private _mode: string = 'liner';
    private _h: number = 0;
    private _w: number = 0;

    constructor() {

    }

    public x(lon: number) {
        // lon *= -1;
        if (this._mode === 'liner') {
            return (lon - this.cLon) * this._scale + this._w / 2;
        }
        else if (this._mode === 'mercator') {
            let x = lon * (Math.PI / 180);
            let cx = this.cLon * (Math.PI / 180);
            return (x - cx) * this._scale + this._w / 2;
        }

        return 0;
    }
    public y(lat: number) {
        lat *= -1;
        if (this._mode === 'liner') {
            return (lat - this.cLat) * this._scale + this._h / 2;
        }
        else if (this._mode === 'mercator') {
            let y = Math.log(Math.tan(Math.PI / 4 + lat * (Math.PI / 180) / 2));
            let cy = Math.log(Math.tan(Math.PI / 4 + this.cLat * (Math.PI / 180) / 2));
            return (y - cy) * this._scale + this._h / 2;
        }
        return 0;
    }

    public center(lon: number, lat: number) {
        this.cLon = lon;
        this.cLat = -lat;
    }

    public scale(s: number) {
        this._scale = s;
    }

    public mode(m: string) {
        this._mode = m;
    }

    public mercator() {
        this._mode = 'mercator';
    }

    public set w(w: number) {
        this._w = w;
    }
    public set h(h: number) {
        this._h = h;
    }
}
