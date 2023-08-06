"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Projection = void 0;
class Projection {
    constructor() {
        this.cLat = 0;
        this.cLon = 0;
        this._scale = 1;
        this._mode = 'liner';
        this._h = 0;
        this._w = 0;
    }
    x(lon) {
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
    y(lat) {
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
    center(lon, lat) {
        this.cLon = lon;
        this.cLat = -lat;
    }
    scale(s) {
        this._scale = s;
    }
    mode(m) {
        this._mode = m;
    }
    mercator() {
        this._mode = 'mercator';
    }
    set w(w) {
        this._w = w;
    }
    set h(h) {
        this._h = h;
    }
}
exports.Projection = Projection;
