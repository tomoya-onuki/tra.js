"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trajectory = void 0;
const Map_1 = require("./Map");
const Projection_1 = require("./Projection");
const utils_1 = require("./utils");
class Trajectory {
    // mapColor = '000';
    constructor() {
        this.data = [];
        this.startDate = 0;
        this.endDate = 0;
        this._weight = 1;
        this.rgb = [0, 0, 0];
        this._lenMillis = 0;
        this._damping = 1;
        this._roundCap = true;
        this._ticks = 0;
        this._opacity = 1;
        this._thinning = 1;
        this._label = '';
        this._labelStyle = {
            font: 'Arial', size: 10, color: '000', offset: 0
        };
        this.animationRun = true;
        this._cvs = null;
        this._ctx = null;
        this.cvsmode = false;
        this.svgmode = false;
        this.prj = new Projection_1.Projection();
        this.mapList = [];
        this.mapColor = '000';
        this.mapFill = false;
        this.mapStroke = true;
        return this;
    }
    trajectory(data) {
        this.data = data;
        this._lenMillis = data[data.length - 1].date - data[0].date;
        this.startDate = data[0].date;
        this.endDate = data[data.length - 1].date;
        return this;
    }
    color(r, g, b) {
        this.rgb = [r, g, b];
        return this;
    }
    weight(w) {
        this._weight = w;
        return this;
    }
    thinning(t) {
        if (t >= 1)
            t = 1;
        if (t < 0)
            t = 0;
        this._thinning = t;
        return this;
    }
    length(len) {
        this._lenMillis = len;
        return this;
    }
    damping(d) {
        if (d >= 1)
            d = 1;
        if (d < 0)
            d = 0;
        this._damping = d;
        return this;
    }
    roundCap(flag) {
        this._roundCap = Boolean(flag);
        return this;
    }
    ticks(t) {
        this._ticks = t;
        return this;
    }
    opacity(o) {
        this._opacity = o;
        return this;
    }
    label(t) {
        this._label = t;
        return this;
    }
    labelStyle(s) {
        this._labelStyle = s;
        return this;
    }
    canvas(cvs) {
        this._cvs = cvs;
        this._ctx = cvs.getContext('2d');
        this.cvsmode = true;
        this.svgmode = false;
        return this;
    }
    svg(svg) {
        this._svg = svg;
        this.cvsmode = false;
        this.svgmode = true;
        return this;
    }
    draw(...param) {
        // console.log(crntDate.length)
        this.drawMap();
        if (param.length === 1) {
            const crntDate = Number(param[0]);
            this.drawTraj(crntDate);
        }
    }
    drawTraj(crntDate) {
        if (this.data.length < 1 || crntDate < this.startDate) {
            return;
        }
        if (this.data.length > 0) {
            let idx = utils_1.findIdx(0, this.data.length - 1, crntDate, this.data) - 1;
            let opacity = this._opacity;
            let weight = this._weight;
            if (0 <= idx && idx < this.data.length - 1) {
                let date0 = this.data[idx].date;
                let x0 = this.prj.x(this.data[idx].lon);
                let y0 = this.prj.y(this.data[idx].lat);
                let date1 = this.data[idx + 1].date;
                let x1 = this.prj.x(this.data[idx + 1].lon);
                let y1 = this.prj.y(this.data[idx + 1].lat);
                let headRatio = (crntDate - date0) / (date1 - date0);
                let headx = (1 - headRatio) * x0 + headRatio * x1;
                let heady = (1 - headRatio) * y0 + headRatio * y1;
                let tailx = x0;
                let taily = y0;
                let segLenMillis = crntDate - date0;
                if (segLenMillis > this._lenMillis) {
                    let tailRatio = (segLenMillis - this._lenMillis) / (date1 - date0);
                    tailx = (1 - tailRatio) * x0 + tailRatio * x1;
                    taily = (1 - tailRatio) * y0 + tailRatio * y1;
                }
                else {
                    tailx = x0;
                    taily = y0;
                }
                let c0 = `rgba(${this.rgb[0]}, ${this.rgb[1]}, ${this.rgb[2]}, ${opacity})`;
                opacity *= this._damping;
                let c1 = `rgba(${this.rgb[0]}, ${this.rgb[1]}, ${this.rgb[2]}, ${opacity})`;
                if (this.cvsmode && !this.svgmode) {
                    if (this._ctx !== null) {
                        this._ctx.beginPath();
                        this._ctx.moveTo(headx, heady);
                        this._ctx.lineTo(tailx, taily);
                        this._ctx.lineWidth = weight;
                        this._ctx.lineCap = this._roundCap ? 'round' : 'butt';
                        if (!headx && !heady && !tailx && !taily) {
                            const color = this._ctx.createLinearGradient(headx, heady, tailx, taily);
                            color.addColorStop(0.0, c0);
                            color.addColorStop(1.0, c1);
                            this._ctx.strokeStyle = color;
                        }
                        else {
                            this._ctx.strokeStyle = c0;
                        }
                        this._ctx.stroke();
                    }
                }
                else if (!this.cvsmode && this.svgmode) {
                    this._svg.append("line")
                        .attr("x1", headx)
                        .attr("y1", heady)
                        .attr("x2", tailx)
                        .attr("y2", taily)
                        .attr("stroke-width", weight)
                        .attr("stroke-linecap", this._roundCap ? 'round' : 'butt')
                        .attr("stroke", c0);
                }
                let tickDate = this.endDate;
                if (this._ticks > 0) {
                    let vx = x1 - x0; // 方向ベクトル
                    let vy = y1 - y0;
                    let size = Math.sqrt(vx * vx + vy * vy);
                    let nx = -vy / size * weight; // 法線ベクトル
                    let ny = vx / size * weight;
                    while (tickDate > date0) {
                        if (tickDate <= crntDate) {
                            let ratio = (tickDate - date0) / (date1 - date0);
                            ratio = Math.round(ratio * 100) / 100;
                            let tx = (1.0 - ratio) * x0 + ratio * x1;
                            let ty = (1.0 - ratio) * y0 + ratio * y1;
                            if (this.cvsmode && !this.svgmode) {
                                if (this._ctx !== null) {
                                    this._ctx.beginPath();
                                    this._ctx.moveTo(tx - nx, ty - ny);
                                    this._ctx.lineTo(tx + nx, ty + ny);
                                    this._ctx.strokeStyle = `rgba(${this.rgb[0]}, ${this.rgb[1]}, ${this.rgb[2]}, ${opacity})`;
                                    this._ctx.lineWidth = 1.0;
                                    this._ctx.stroke();
                                }
                            }
                            else if (!this.cvsmode && this.svgmode) {
                                this._svg.append("line")
                                    .attr("x1", tx - nx)
                                    .attr("y1", ty - ny)
                                    .attr("x2", tx + nx)
                                    .attr("y2", ty + ny)
                                    .attr("stroke-width", 1.0)
                                    .attr("stroke", `rgba(${this.rgb[0]}, ${this.rgb[1]}, ${this.rgb[2]}, ${opacity})`);
                            }
                        }
                        tickDate -= this._ticks;
                    }
                }
                weight *= this._thinning;
                if (this._lenMillis >= segLenMillis) {
                    this.drawSegment(idx - 1, opacity, weight, this._lenMillis - segLenMillis, tickDate, crntDate);
                }
                if (this._label) {
                    if (this.cvsmode && !this.svgmode) {
                        if (this._ctx !== null) {
                            this._ctx.font = `${this._labelStyle.size}pt ${this._labelStyle.font}`;
                            this._ctx.fillStyle = this._labelStyle.color;
                            this._ctx.fillText(this._label, headx + this._labelStyle.offset, heady + this._labelStyle.offset);
                        }
                    }
                    else if (!this.cvsmode && this.svgmode) {
                        this._svg.append("text")
                            .attr("x", headx + this._labelStyle.offset)
                            .attr("y", heady + this._labelStyle.offset)
                            .attr("font-family", this._labelStyle.font)
                            .attr("font-size", `${this._labelStyle.size}pt`)
                            .attr("fill", this._labelStyle.color)
                            .text(this._label);
                    }
                }
            }
            else {
                let tickDate = this.endDate;
                idx = this.data.length - 2;
                let date0 = this.data[idx].date;
                let segLenMillis = crntDate - date0;
                opacity *= this._damping;
                weight *= this._thinning;
                if (this._lenMillis >= segLenMillis) {
                    this.drawSegment(idx - 1, opacity, weight, this._lenMillis - segLenMillis, tickDate, crntDate);
                    if (this._label) {
                        let x = this.prj.x(this.data[idx].lon);
                        let y = this.prj.y(this.data[idx].lat);
                        if (this.cvsmode && !this.svgmode) {
                            if (this._ctx !== null) {
                                this._ctx.font = `${this._labelStyle.size}pt ${this._labelStyle.font}`;
                                this._ctx.fillStyle = this._labelStyle.color;
                                this._ctx.fillText(this._label, x + this._labelStyle.offset, y + this._labelStyle.offset);
                            }
                        }
                        else if (!this.cvsmode && this.svgmode) {
                            this._svg.append("text")
                                .attr("x", x + this._labelStyle.offset)
                                .attr("y", y + this._labelStyle.offset)
                                .attr("font-family", this._labelStyle.font)
                                .attr("font-size", `${this._labelStyle.size}pt`)
                                .attr("fill", this._labelStyle.color)
                                .text(this._label);
                        }
                    }
                }
            }
        }
    }
    drawSegment(idx, opacity, weight, trajLenMillis, tickDate, crntDate) {
        if (0 <= idx) {
            let date0 = this.data[idx].date;
            let x0 = this.prj.x(this.data[idx].lon);
            let y0 = this.prj.y(this.data[idx].lat);
            let date1 = this.data[idx + 1].date;
            let x1 = this.prj.x(this.data[idx + 1].lon);
            let y1 = this.prj.y(this.data[idx + 1].lat);
            let headx = x1;
            let heady = y1;
            let tailx = x0;
            let taily = y0;
            let segLenMillis = date1 - date0;
            if (segLenMillis > trajLenMillis) {
                let tailRatio = (segLenMillis - trajLenMillis) / (date1 - date0);
                tailx = (1 - tailRatio) * x0 + tailRatio * x1;
                taily = (1 - tailRatio) * y0 + tailRatio * y1;
            }
            else {
                tailx = x0;
                taily = y0;
            }
            let c0 = `rgba(${this.rgb[0]}, ${this.rgb[1]}, ${this.rgb[2]}, ${opacity})`;
            opacity *= this._damping;
            let c1 = `rgba(${this.rgb[0]}, ${this.rgb[1]}, ${this.rgb[2]}, ${opacity})`;
            if (this.cvsmode && !this.svgmode) {
                if (this._ctx !== null) {
                    this._ctx.beginPath();
                    this._ctx.moveTo(headx, heady);
                    this._ctx.lineTo(tailx, taily);
                    this._ctx.lineWidth = weight;
                    this._ctx.lineCap = this._roundCap ? 'round' : 'butt';
                    let color = this._ctx.createLinearGradient(headx, heady, tailx, taily);
                    color.addColorStop(0.0, c0);
                    color.addColorStop(1.0, c1);
                    this._ctx.strokeStyle = color;
                    this._ctx.stroke();
                }
            }
            else if (!this.cvsmode && this.svgmode) {
                this._svg.append("line")
                    .attr("x1", headx)
                    .attr("y1", heady)
                    .attr("x2", tailx)
                    .attr("y2", taily)
                    .attr("stroke-width", weight)
                    .attr("stroke-linecap", this._roundCap ? 'round' : 'butt')
                    .attr("stroke", c0);
            }
            let tailDate = segLenMillis > trajLenMillis ? date1 - trajLenMillis : date0;
            if (this._ticks > 0) {
                let vx = x1 - x0; // 方向ベクトル
                let vy = y1 - y0;
                let size = Math.sqrt(vx * vx + vy * vy);
                let nx = -vy / size * weight; // 法線ベクトル
                let ny = vx / size * weight;
                while (tickDate > tailDate) {
                    if (tickDate <= crntDate) {
                        let ratio = (tickDate - date0) / (date1 - date0);
                        ratio = Math.round(ratio * 100) / 100;
                        let tx = (1.0 - ratio) * x0 + ratio * x1;
                        let ty = (1.0 - ratio) * y0 + ratio * y1;
                        if (this.cvsmode && !this.svgmode) {
                            if (this._ctx !== null) {
                                this._ctx.beginPath();
                                this._ctx.moveTo(tx - nx, ty - ny);
                                this._ctx.lineTo(tx + nx, ty + ny);
                                this._ctx.lineWidth = 1.0;
                                this._ctx.strokeStyle = `rgba(${this.rgb[0]}, ${this.rgb[1]}, ${this.rgb[2]}, ${opacity})`;
                                this._ctx.stroke();
                            }
                        }
                        else if (!this.cvsmode && this.svgmode) {
                            this._svg.append("line")
                                .attr("x1", tx - nx)
                                .attr("y1", ty - ny)
                                .attr("x2", tx + nx)
                                .attr("y2", ty + ny)
                                .attr("stroke-width", 1.0)
                                .attr("stroke", `rgba(${this.rgb[0]}, ${this.rgb[1]}, ${this.rgb[2]}, ${opacity})`);
                        }
                    }
                    tickDate -= this._ticks;
                }
            }
            weight *= this._thinning;
            if (trajLenMillis >= segLenMillis) {
                this.drawSegment(idx - 1, opacity, weight, trajLenMillis - segLenMillis, tickDate, crntDate);
            }
        }
        return this;
    }
    start() {
        this.animationRun = true;
        return this;
    }
    pause() {
        this.animationRun = false;
        return this;
    }
    animation(frameRate, step, start, end, loop) {
        const me = this;
        let crntDate = start;
        let animation = setInterval(function () {
            if (me.cvsmode && !me.svgmode) {
                if (me._cvs !== null && me._ctx !== null) {
                    const w = me._cvs.width;
                    const h = me._cvs.height;
                    me._ctx.clearRect(0, 0, w, h);
                }
            }
            else if (!me.cvsmode && me.svgmode) {
                me._svg.selectAll('line').remove();
                me._svg.selectAll('text').remove();
            }
            me.drawMap();
            me.drawTraj(crntDate);
            if (me.animationRun)
                crntDate += step;
            if (crntDate > end)
                if (loop)
                    crntDate = start;
                else
                    clearInterval(animation);
        }, frameRate);
        return this;
    }
    transform(obj) {
        this.prj.scale(obj.scale);
        this.prj.center(obj.center.lon, obj.center.lat);
        this.prj.mode(obj.projection);
        if (this.cvsmode && !this.svgmode) {
            if (this._cvs !== null) {
                this.prj.h = this._cvs.height;
                this.prj.w = this._cvs.width;
            }
        }
        else if (!this.cvsmode && this.svgmode) {
            this.prj.h = this._svg.attr('height');
            this.prj.w = this._svg.attr('width');
        }
        return this;
    }
    map(topojson) {
        if (this.cvsmode && !this.svgmode) {
            const map = new Map_1.Map();
            map.topojson(topojson);
            this.mapList.push(map);
        }
        return this;
    }
    mapStyle(obj) {
        this.mapList.forEach(m => {
            if (obj.color)
                this.mapColor = obj.color;
            if (obj.stroke)
                this.mapStroke = obj.stroke;
            if (obj.fill)
                this.mapFill = obj.fill;
        });
        return this;
    }
    drawMap() {
        if (this.mapList.length > 0) {
            this.mapList.forEach(map => {
                if (this._ctx !== null) {
                    map.draw(this._ctx, this.prj, this.mapColor, this.mapFill, this.mapStroke);
                }
            });
        }
    }
}
exports.Trajectory = Trajectory;
