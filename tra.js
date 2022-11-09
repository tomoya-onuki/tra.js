(function () {
    "use strict";

    class Trajs {
        _data = [];
        _startDate = 0;
        _endDate = 0;
        _weight = 1;
        _rgb = [0, 0, 0]
        _lenMillis;
        _damping = 1;
        _roundCap = false;
        _ticks = 0;
        _opacity = 1;
        _thinning = 1;
        _label = '';
        _labelStyle = {
            font: 'Arial', size: 10, color: '#000', offset: 0
        }
        _animationRun = true;
        _crntDate = 0;

        constructor() {
            return this;
        }

        fetch(data) {
            this._data = data;
            this._lenMillis = data[data.length - 1].date - data[0].date
            this._startDate = data[0].date
            this._endDate = data[data.length - 1].date
            return this;
        }

        color(r, g, b) {
            this._rgb = [r, g, b];
            return this;
        }

        weight(w) {
            this._weight = w;
            return this;
        }

        thinning(t) {
            if (t >= 1) t = 1;
            if (t < 0) t = 0;
            this._thinning = t;
            return this;
        }

        length(len) {
            this._lenMillis = len;
            return this;
        }
        damping(d) {
            if (d >= 1) d = 1;
            if (d < 0) d = 0;
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


        draw(cvs, crntDate) {
            if (this._data.length < 1 || crntDate < this._startDate) {
                return;
            }

            this._crntDate = crntDate;

            if (this._data.length > 0) {
                const ctx = cvs.getContext('2d');
                let idx = findIdx(0, this._data.length - 1, crntDate, this._data) - 1;
                let opacity = this._opacity;
                let weight = this._weight;

                if (0 <= idx && idx < this._data.length - 1) {
                    let date0 = this._data[idx].date;
                    let x0 = this._data[idx].x;
                    let y0 = this._data[idx].y;

                    let date1 = this._data[idx + 1].date;
                    let x1 = this._data[idx + 1].x;
                    let y1 = this._data[idx + 1].y;

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
                    } else {
                        tailx = x0;
                        taily = y0;
                    }

                    ctx.beginPath();
                    ctx.moveTo(headx, heady);
                    ctx.lineTo(tailx, taily)
                    ctx.lineWidth = weight;
                    ctx.lineCap = this._roundCap ? 'round' : 'butt';

                    let color = ctx.createLinearGradient(headx, heady, tailx, taily);
                    color.addColorStop(0.0, `rgba(${this._rgb[0]}, ${this._rgb[1]}, ${this._rgb[2]}, ${opacity})`);
                    opacity *= this._damping
                    color.addColorStop(1.0, `rgba(${this._rgb[0]}, ${this._rgb[1]}, ${this._rgb[2]}, ${opacity})`);

                    ctx.strokeStyle = color;
                    ctx.stroke();

                    let tickDate = this._endDate;
                    if (this._ticks > 0) {
                        let vx = x1 - x0 // 方向ベクトル
                        let vy = y1 - y0
                        let nx = -vy * 0.5 * this._weight   // 法線ベクトル
                        let ny = vx * 0.5 * this._weight
                        while (tickDate > date0) {
                            if (tickDate <= crntDate) {
                                let ratio = (tickDate - date0) / (date1 - date0);
                                ratio = Math.round(ratio * 100) / 100

                                let tx = (1.0 - ratio) * x0 + ratio * x1
                                let ty = (1.0 - ratio) * y0 + ratio * y1

                                ctx.beginPath();
                                ctx.moveTo(tx - nx, ty - ny);
                                ctx.lineTo(tx + nx, ty + ny);
                                ctx.strokeStyle = `rgba(${this._rgb[0]}, ${this._rgb[1]}, ${this._rgb[2]}, ${opacity})`;
                                ctx.lineWidth = 1.0;
                                ctx.stroke();
                            }
                            tickDate -= this._ticks
                        }
                    }

                    weight *= this._thinning
                    if (this._lenMillis >= segLenMillis) {
                        drawSegmentCanvas(ctx, idx - 1, this._data, this._rgb, opacity, weight, this._roundCap, this._damping, this._thinning, this._lenMillis - segLenMillis, tickDate, this._ticks, crntDate)
                    }

                    if (this._label) {
                        ctx.font = `${this._labelStyle.size}pt ${this._labelStyle.font}`;
                        ctx.fillStyle = this._labelStyle.color;
                        ctx.fillText(this._label, headx + this._labelStyle.offset, heady + this._labelStyle.offset)
                    }
                }
                else {
                    let tickDate = this._endDate;
                    idx = this._data.length - 2
                    let date0 = this._data[idx].date
                    let segLenMillis = crntDate - date0;
                    opacity *= this._damping
                    weight *= this._thinning
                    if (this._lenMillis >= segLenMillis) {
                        drawSegmentCanvas(ctx, idx - 1, this._data, this._rgb, opacity, weight, this._roundCap, this._damping, this._thinning, this._lenMillis - segLenMillis, this._endDate, this._ticks, tickDate)

                        if (this._label) {
                            let x = this._data[idx].x
                            let y = this._data[idx].y
                            ctx.font = `${this._labelStyle.size}pt ${this._labelStyle.font}`;
                            ctx.fillStyle = this._labelStyle.color;
                            ctx.fillText(this._label, x + this._labelStyle.offset, y + this._labelStyle.offset)
                        }
                    }
                }
            }
            return this;
        }


        start() {
            this._animationRun = true;
            return this;
        }

        pause() {
            this._animationRun = false;
            return this;
        }

        now() {
            // return crntDate;
        }

        transition(cvs, frameRate, step, start, end, loop) {
            const me = this;
            const ctx = cvs.getContext('2d');
            const w = cvs.width;
            const h = cvs.height;
            let crntDate = start;

            let animation = setInterval(function () {
                ctx.clearRect(0, 0, w, h);
                me.draw(cvs, crntDate);
                // console.log(crntDate)

                if (me._animationRun)
                    crntDate += step;

                if (crntDate > end)
                    if (loop) crntDate = start;
                    else clearInterval(animation);
            }, frameRate);
            return this;
        }
    }

    class TrajsD3 extends Trajs {
        draw(svg, crntDate) {
            if (this._data.length < 1 || crntDate < this._startDate) {
                return;
            }

            if (this._data.length > 0) {
                let idx = findIdx(0, this._data.length - 1, crntDate, this._data) - 1;
                let opacity = this._opacity;
                let weight = this._weight;

                if (0 <= idx && idx < this._data.length - 1) {
                    let date0 = this._data[idx].date;
                    let x0 = this._data[idx].x;
                    let y0 = this._data[idx].y;

                    let date1 = this._data[idx + 1].date;
                    let x1 = this._data[idx + 1].x;
                    let y1 = this._data[idx + 1].y;

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
                    } else {
                        tailx = x0;
                        taily = y0;
                    }

                    let c0 = `rgba(${this._rgb[0]}, ${this._rgb[1]}, ${this._rgb[2]}, ${opacity})`;
                    opacity *= this._damping
                    let c1 = `rgba(${this._rgb[0]}, ${this._rgb[1]}, ${this._rgb[2]}, ${opacity})`;

                    svg.append("line")
                        .attr("x1", headx)
                        .attr("y1", heady)
                        .attr("x2", tailx)
                        .attr("y2", taily)
                        .attr("stroke-width", weight)
                        .attr("stroke-linecap", this._roundCap ? 'round' : 'butt')
                        .attr("stroke", c0);

                    let tickDate = this._endDate;
                    if (this._ticks > 0) {
                        let vx = x1 - x0 // 方向ベクトル
                        let vy = y1 - y0
                        let nx = -vy * 0.5 * this._weight   // 法線ベクトル
                        let ny = vx * 0.5 * this._weight
                        while (tickDate > date0) {
                            if (tickDate <= crntDate) {
                                let ratio = (tickDate - date0) / (date1 - date0);
                                ratio = Math.round(ratio * 100) / 100

                                let tx = (1.0 - ratio) * x0 + ratio * x1
                                let ty = (1.0 - ratio) * y0 + ratio * y1

                                svg.append("line")
                                    .attr("x1", tx - nx)
                                    .attr("y1", ty - ny)
                                    .attr("x2", tx + nx)
                                    .attr("y2", ty + ny)
                                    .attr("stroke-width", 1.0)
                                    .attr("stroke", `rgba(${this._rgb[0]}, ${this._rgb[1]}, ${this._rgb[2]}, ${opacity})`);
                            }
                            tickDate -= this._ticks
                        }
                    }

                    weight *= this._thinning
                    if (this._lenMillis >= segLenMillis) {
                        drawSegmentSvg(svg, idx - 1, this._data, this._rgb, opacity, weight, this._roundCap, this._damping, this._thinning, this._lenMillis - segLenMillis, tickDate, this._ticks, crntDate)
                    }

                    if (this._label) {
                        svg.append("text")
                            .attr("x", headx + this._labelStyle.offset)
                            .attr("y", heady + this._labelStyle.offset)
                            .attr("font-family", this._labelStyle.font)
                            .attr("font-size", `${this._labelStyle.size}pt`)
                            .attr("fill", this._labelStyle.color)
                            .text(this._label);
                    }
                }
                else {
                    let tickDate = this._endDate;
                    idx = this._data.length - 2
                    let date0 = this._data[idx].date
                    let segLenMillis = crntDate - date0;
                    opacity *= this._damping
                    weight *= this._thinning
                    if (this._lenMillis >= segLenMillis) {
                        drawSegmentSvg(svg, idx - 1, this._data, this._rgb, opacity, weight, this._roundCap, this._damping, this._thinning, this._lenMillis - segLenMillis, this._endDate, this._ticks, tickDate)

                        if (this._label) {
                            let x = this._data[idx].x
                            let y = this._data[idx].y
                            svg.append("text")
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
            return this;
        }

        transition(svg, frameRate, step, start, end, loop) {
            const me = this;
            let crntDate = start;

            setInterval(function () {
                svg.selectAll('line').remove()
                svg.selectAll('text').remove()
                me.draw(svg, crntDate);

                if (me._animationRun)
                    crntDate += step;

                if (loop && crntDate > end)
                    crntDate = start
            }, frameRate);
            return this;
        }
    }

    function drawSegmentCanvas(ctx, idx, data, rgb, opacity, weight, roundCap, damping, thinning, trajLenMillis, tickDate, ticks, crntDate) {

        if (0 <= idx) {
            let date0 = data[idx].date;
            let x0 = data[idx].x;
            let y0 = data[idx].y;

            let date1 = data[idx + 1].date;
            let x1 = data[idx + 1].x;
            let y1 = data[idx + 1].y;

            let headx = x1;
            let heady = y1;

            let tailx = x0;
            let taily = y0;

            let segLenMillis = date1 - date0;
            if (segLenMillis > trajLenMillis) {
                let tailRatio = (segLenMillis - trajLenMillis) / (date1 - date0);
                tailx = (1 - tailRatio) * x0 + tailRatio * x1;
                taily = (1 - tailRatio) * y0 + tailRatio * y1;
            } else {
                tailx = x0;
                taily = y0;
            }

            ctx.beginPath();
            ctx.moveTo(headx, heady);
            ctx.lineTo(tailx, taily)
            ctx.lineWidth = weight;
            ctx.lineCap = roundCap ? 'round' : 'butt';

            let color = ctx.createLinearGradient(headx, heady, tailx, taily);
            color.addColorStop(0.0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`);
            opacity *= damping
            color.addColorStop(1.0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`);

            ctx.strokeStyle = color;
            ctx.stroke();


            let tailDate = segLenMillis > trajLenMillis ? date1 - trajLenMillis : date0
            if (ticks > 0) {
                let vx = x1 - x0 // 方向ベクトル
                let vy = y1 - y0
                let nx = -vy * 0.5 * weight   // 法線ベクトル
                let ny = vx * 0.5 * weight
                while (tickDate > tailDate) {
                    if (tickDate <= crntDate) {
                        let ratio = (tickDate - date0) / (date1 - date0);
                        ratio = Math.round(ratio * 100) / 100

                        let tx = (1.0 - ratio) * x0 + ratio * x1
                        let ty = (1.0 - ratio) * y0 + ratio * y1

                        ctx.beginPath();
                        ctx.moveTo(tx - nx, ty - ny);
                        ctx.lineTo(tx + nx, ty + ny)
                        ctx.lineWidth = 1.0
                        ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`;
                        ctx.stroke();
                    }
                    tickDate -= ticks
                }
            }

            weight *= thinning
            if (trajLenMillis >= segLenMillis) {
                drawSegmentCanvas(ctx, idx - 1, data, rgb, opacity, weight, roundCap, damping, thinning, trajLenMillis - segLenMillis, tickDate, ticks, crntDate)
            }
        }
    }

    function drawSegmentSvg(svg, idx, data, rgb, opacity, weight, roundCap, damping, thinning, trajLenMillis, tickDate, ticks, crntDate) {

        if (0 <= idx) {
            let date0 = data[idx].date;
            let x0 = data[idx].x;
            let y0 = data[idx].y;

            let date1 = data[idx + 1].date;
            let x1 = data[idx + 1].x;
            let y1 = data[idx + 1].y;

            let headx = x1;
            let heady = y1;

            let tailx = x0;
            let taily = y0;

            let segLenMillis = date1 - date0;
            if (segLenMillis > trajLenMillis) {
                let tailRatio = (segLenMillis - trajLenMillis) / (date1 - date0);
                tailx = (1 - tailRatio) * x0 + tailRatio * x1;
                taily = (1 - tailRatio) * y0 + tailRatio * y1;
            } else {
                tailx = x0;
                taily = y0;
            }

            let c0 = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`;
            opacity *= damping
            let c1 = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`;
            svg.append("line")
                .attr("x1", headx)
                .attr("y1", heady)
                .attr("x2", tailx)
                .attr("y2", taily)
                .attr("stroke-width", weight)
                .attr("stroke-linecap", roundCap ? 'round' : 'butt')
                .attr("stroke", c0);
            // .attr("stroke", `linear-gradient(90deg, ${c0} 0%, ${c1} 100%)`);



            let tailDate = segLenMillis > trajLenMillis ? date1 - trajLenMillis : date0
            if (ticks > 0) {
                let vx = x1 - x0 // 方向ベクトル
                let vy = y1 - y0
                let nx = -vy * 0.5 * weight   // 法線ベクトル
                let ny = vx * 0.5 * weight
                while (tickDate > tailDate) {
                    if (tickDate <= crntDate) {
                        let ratio = (tickDate - date0) / (date1 - date0);
                        ratio = Math.round(ratio * 100) / 100

                        let tx = (1.0 - ratio) * x0 + ratio * x1
                        let ty = (1.0 - ratio) * y0 + ratio * y1

                        svg.append("line")
                            .attr("x1", tx - nx)
                            .attr("y1", ty - ny)
                            .attr("x2", tx + nx)
                            .attr("y2", ty + ny)
                            .attr("stroke-width", 1.0)
                            .attr("stroke", `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`);
                    }
                    tickDate -= ticks
                }
            }

            weight *= thinning
            if (trajLenMillis >= segLenMillis) {
                drawSegmentSvg(svg, idx - 1, data, rgb, opacity, weight, roundCap, damping, thinning, trajLenMillis - segLenMillis, tickDate, ticks, crntDate)
            }
        }
    }


    // Binary Search
    function findIdx(minIdx, maxIdx, targetDate, list) {
        if (minIdx <= maxIdx) {
            let midIdx = Math.ceil(minIdx + (maxIdx - minIdx) / 2); // Intにする
            let date = list[midIdx].date;
            if (date > targetDate) {
                return findIdx(minIdx, midIdx - 1, targetDate, list);
            } else if (date < targetDate) {
                return findIdx(midIdx + 1, maxIdx, targetDate, list);
            } else {
                return midIdx;
            }
        } else {
            return minIdx;
        }
    }

    if (typeof module === "undefined") {
        self.Trajs = Trajs;
        self.TrajsD3 = TrajsD3;
    } else {
        module.exports = Trajs;
        module.exports = TrajsD3;
    }
})();