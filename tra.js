(function () {
    "use strict";

    function Trajs() {
        return new Trajectory();
    }

    class Trajectory {
        #data = [];
        #startDate = 0;
        #endDate = 0;
        #weight = 1;
        #rgb = [0, 0, 0]
        #lenMillis;
        #damping = 1;
        #roundCap = true;
        #ticks = 0;
        #opacity = 1;
        #thinning = 1;
        #label = '';
        #labelStyle = {
            font: 'Arial', size: 10, color: '#000', offset: 0
        }
        #animationRun = true;

        #cvs;
        #ctx;
        #cvsmode = false;
        #svg;
        #svgmode = false;

        #prj = new Projection();
        #mapList = [];
        #mapColor = '#000';
        #mapFill = false;
        #mapStroke = true;
        // #mapColor = '#000';

        constructor() {
            return this
        }

        trajectory(data) {
            this.#data = data;
            this.#lenMillis = data[data.length - 1].date - data[0].date
            this.#startDate = data[0].date
            this.#endDate = data[data.length - 1].date
            return this;
        }

        color(r, g, b) {
            this.#rgb = [r, g, b];
            return this;
        }

        weight(w) {
            this.#weight = w;
            return this;
        }

        thinning(t) {
            if (t >= 1) t = 1;
            if (t < 0) t = 0;
            this.#thinning = t;
            return this;
        }

        length(len) {
            this.#lenMillis = len;
            return this;
        }
        damping(d) {
            if (d >= 1) d = 1;
            if (d < 0) d = 0;
            this.#damping = d;
            return this;
        }

        roundCap(flag) {
            this.#roundCap = Boolean(flag);
            return this;
        }

        ticks(t) {
            this.#ticks = t;
            return this;
        }

        opacity(o) {
            this.#opacity = o;
            return this;
        }

        label(t) {
            this.#label = t;
            return this;
        }
        labelStyle(s) {
            this.#labelStyle = s;
            return this;
        }


        canvas(cvs) {
            this.#cvs = cvs;
            this.#ctx = cvs.getContext('2d');
            this.#cvsmode = true;
            this.#svgmode = false;
            return this;
        }
        svg(svg) {
            this.#svg = svg;
            this.#cvsmode = false;
            this.#svgmode = true;
            return this;
        }


        draw(...param) {
            // console.log(crntDate.length)
            this.#drawMap();
            if (param.length === 1) {
                const crntDate = param[0];
                this.#drawTraj(crntDate);
            }
        }
        #drawTraj(crntDate) {
            if (this.#data.length < 1 || crntDate < this.#startDate) {
                return;
            }

            if (this.#data.length > 0) {
                let idx = findIdx(0, this.#data.length - 1, crntDate, this.#data) - 1;
                let opacity = this.#opacity;
                let weight = this.#weight;

                if (0 <= idx && idx < this.#data.length - 1) {
                    let date0 = this.#data[idx].date;
                    let x0 = this.#prj.x(this.#data[idx].lon);
                    let y0 = this.#prj.y(this.#data[idx].lat);

                    let date1 = this.#data[idx + 1].date;
                    let x1 = this.#prj.x(this.#data[idx + 1].lon);
                    let y1 = this.#prj.y(this.#data[idx + 1].lat);

                    let headRatio = (crntDate - date0) / (date1 - date0);
                    let headx = (1 - headRatio) * x0 + headRatio * x1;
                    let heady = (1 - headRatio) * y0 + headRatio * y1;

                    let tailx = x0;
                    let taily = y0;

                    let segLenMillis = crntDate - date0;
                    if (segLenMillis > this.#lenMillis) {
                        let tailRatio = (segLenMillis - this.#lenMillis) / (date1 - date0);
                        tailx = (1 - tailRatio) * x0 + tailRatio * x1;
                        taily = (1 - tailRatio) * y0 + tailRatio * y1;
                    } else {
                        tailx = x0;
                        taily = y0;
                    }


                    let c0 = `rgba(${this.#rgb[0]}, ${this.#rgb[1]}, ${this.#rgb[2]}, ${opacity})`;
                    opacity *= this.#damping
                    let c1 = `rgba(${this.#rgb[0]}, ${this.#rgb[1]}, ${this.#rgb[2]}, ${opacity})`;

                    if (this.#cvsmode && !this.#svgmode) {
                        this.#ctx.beginPath();
                        this.#ctx.moveTo(headx, heady);
                        this.#ctx.lineTo(tailx, taily)
                        this.#ctx.lineWidth = weight;
                        this.#ctx.lineCap = this.#roundCap ? 'round' : 'butt';

                        let color = c0;
                        if (!headx && !heady && !tailx && !taily) {
                            color = this.#ctx.createLinearGradient(headx, heady, tailx, taily);
                            color.addColorStop(0.0, c0);
                            color.addColorStop(1.0, c1);
                        }
                        this.#ctx.strokeStyle = color;
                        this.#ctx.stroke();
                    }
                    else if (!this.#cvsmode && this.#svgmode) {
                        this.#svg.append("line")
                            .attr("x1", headx)
                            .attr("y1", heady)
                            .attr("x2", tailx)
                            .attr("y2", taily)
                            .attr("stroke-width", weight)
                            .attr("stroke-linecap", this.#roundCap ? 'round' : 'butt')
                            .attr("stroke", c0);
                    }



                    let tickDate = this.#endDate;
                    if (this.#ticks > 0) {
                        let vx = x1 - x0 // 方向ベクトル
                        let vy = y1 - y0
                        let size = Math.sqrt(vx * vx + vy * vy);
                        let nx = -vy / size * weight;   // 法線ベクトル
                        let ny = vx / size * weight;
                        while (tickDate > date0) {
                            if (tickDate <= crntDate) {
                                let ratio = (tickDate - date0) / (date1 - date0);
                                ratio = Math.round(ratio * 100) / 100

                                let tx = (1.0 - ratio) * x0 + ratio * x1
                                let ty = (1.0 - ratio) * y0 + ratio * y1


                                if (this.#cvsmode && !this.#svgmode) {
                                    this.#ctx.beginPath();
                                    this.#ctx.moveTo(tx - nx, ty - ny);
                                    this.#ctx.lineTo(tx + nx, ty + ny);
                                    this.#ctx.strokeStyle = `rgba(${this.#rgb[0]}, ${this.#rgb[1]}, ${this.#rgb[2]}, ${opacity})`;
                                    this.#ctx.lineWidth = 1.0;
                                    this.#ctx.stroke();
                                }
                                else if (!this.#cvsmode && this.#svgmode) {
                                    this.#svg.append("line")
                                        .attr("x1", tx - nx)
                                        .attr("y1", ty - ny)
                                        .attr("x2", tx + nx)
                                        .attr("y2", ty + ny)
                                        .attr("stroke-width", 1.0)
                                        .attr("stroke", `rgba(${this.#rgb[0]}, ${this.#rgb[1]}, ${this.#rgb[2]}, ${opacity})`);
                                }
                            }
                            tickDate -= this.#ticks
                        }
                    }

                    weight *= this.#thinning
                    if (this.#lenMillis >= segLenMillis) {
                        this.#drawSegment(idx - 1, opacity, weight, this.#lenMillis - segLenMillis, tickDate, crntDate)
                    }

                    if (this.#label) {
                        if (this.#cvsmode && !this.#svgmode) {
                            this.#ctx.font = `${this.#labelStyle.size}pt ${this.#labelStyle.font}`;
                            this.#ctx.fillStyle = this.#labelStyle.color;
                            this.#ctx.fillText(this.#label, headx + this.#labelStyle.offset, heady + this.#labelStyle.offset);
                        }
                        else if (!this.#cvsmode && this.#svgmode) {
                            this.#svg.append("text")
                                .attr("x", headx + this.#labelStyle.offset)
                                .attr("y", heady + this.#labelStyle.offset)
                                .attr("font-family", this.#labelStyle.font)
                                .attr("font-size", `${this.#labelStyle.size}pt`)
                                .attr("fill", this.#labelStyle.color)
                                .text(this.#label);
                        }
                    }
                }
                else {
                    let tickDate = this.#endDate;
                    idx = this.#data.length - 2
                    let date0 = this.#data[idx].date
                    let segLenMillis = crntDate - date0;
                    opacity *= this.#damping
                    weight *= this.#thinning
                    if (this.#lenMillis >= segLenMillis) {
                        this.#drawSegment(idx - 1, opacity, weight, this.#lenMillis - segLenMillis, tickDate, crntDate);

                        if (this.#label) {
                            let x = this.#prj.x(this.#data[idx].lon)
                            let y = this.#prj.y(this.#data[idx].lat)
                            if (this.#cvsmode && !this.#svgmode) {
                                this.#ctx.font = `${this.#labelStyle.size}pt ${this.#labelStyle.font}`;
                                this.#ctx.fillStyle = this.#labelStyle.color;
                                this.#ctx.fillText(this.#label, x + this.#labelStyle.offset, y + this.#labelStyle.offset);
                            }
                            else if (!this.#cvsmode && this.#svgmode) {
                                this.#svg.append("text")
                                    .attr("x", x + this.#labelStyle.offset)
                                    .attr("y", y + this.#labelStyle.offset)
                                    .attr("font-family", this.#labelStyle.font)
                                    .attr("font-size", `${this.#labelStyle.size}pt`)
                                    .attr("fill", this.#labelStyle.color)
                                    .text(this.#label);
                            }
                        }
                    }
                }
            }
        }


        #drawSegment(idx, opacity, weight, trajLenMillis, tickDate, crntDate) {

            if (0 <= idx) {
                let date0 = this.#data[idx].date;
                let x0 = this.#prj.x(this.#data[idx].lon);
                let y0 = this.#prj.y(this.#data[idx].lat);

                let date1 = this.#data[idx + 1].date;
                let x1 = this.#prj.x(this.#data[idx + 1].lon);
                let y1 = this.#prj.y(this.#data[idx + 1].lat);

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

                let c0 = `rgba(${this.#rgb[0]}, ${this.#rgb[1]}, ${this.#rgb[2]}, ${opacity})`;
                opacity *= this.#damping
                let c1 = `rgba(${this.#rgb[0]}, ${this.#rgb[1]}, ${this.#rgb[2]}, ${opacity})`;
                if (this.#cvsmode && !this.#svgmode) {
                    this.#ctx.beginPath();
                    this.#ctx.moveTo(headx, heady);
                    this.#ctx.lineTo(tailx, taily)
                    this.#ctx.lineWidth = weight;
                    this.#ctx.lineCap = this.#roundCap ? 'round' : 'butt';

                    let color = this.#ctx.createLinearGradient(headx, heady, tailx, taily);
                    color.addColorStop(0.0, c0);
                    color.addColorStop(1.0, c1);

                    this.#ctx.strokeStyle = color;
                    this.#ctx.stroke();
                }
                else if (!this.#cvsmode && this.#svgmode) {
                    this.#svg.append("line")
                        .attr("x1", headx)
                        .attr("y1", heady)
                        .attr("x2", tailx)
                        .attr("y2", taily)
                        .attr("stroke-width", weight)
                        .attr("stroke-linecap", this.#roundCap ? 'round' : 'butt')
                        .attr("stroke", c0);
                }



                let tailDate = segLenMillis > trajLenMillis ? date1 - trajLenMillis : date0
                if (this.#ticks > 0) {
                    let vx = x1 - x0 // 方向ベクトル
                    let vy = y1 - y0
                    let size = Math.sqrt(vx * vx + vy * vy);
                    let nx = -vy / size * weight;   // 法線ベクトル
                    let ny = vx / size * weight;
                    while (tickDate > tailDate) {
                        if (tickDate <= crntDate) {
                            let ratio = (tickDate - date0) / (date1 - date0);
                            ratio = Math.round(ratio * 100) / 100

                            let tx = (1.0 - ratio) * x0 + ratio * x1
                            let ty = (1.0 - ratio) * y0 + ratio * y1

                            if (this.#cvsmode && !this.#svgmode) {
                                this.#ctx.beginPath();
                                this.#ctx.moveTo(tx - nx, ty - ny);
                                this.#ctx.lineTo(tx + nx, ty + ny)
                                this.#ctx.lineWidth = 1.0
                                this.#ctx.strokeStyle = `rgba(${this.#rgb[0]}, ${this.#rgb[1]}, ${this.#rgb[2]}, ${opacity})`;
                                this.#ctx.stroke();
                            }
                            else if (!this.#cvsmode && this.#svgmode) {
                                this.#svg.append("line")
                                    .attr("x1", tx - nx)
                                    .attr("y1", ty - ny)
                                    .attr("x2", tx + nx)
                                    .attr("y2", ty + ny)
                                    .attr("stroke-width", 1.0)
                                    .attr("stroke", `rgba(${this.#rgb[0]}, ${this.#rgb[1]}, ${this.#rgb[2]}, ${opacity})`);
                            }
                        }
                        tickDate -= this.#ticks
                    }
                }

                weight *= this.#thinning
                if (trajLenMillis >= segLenMillis) {
                    this.#drawSegment(idx - 1, opacity, weight, trajLenMillis - segLenMillis, tickDate, crntDate)
                }
            }
            return this;
        }


        start() {
            this.#animationRun = true;
            return this;
        }

        pause() {
            this.#animationRun = false;
            return this;
        }

        animation(frameRate, step, start, end, loop) {
            const me = this;
            let crntDate = start;

            let animation = setInterval(function () {
                if (me.#cvsmode && !me.#svgmode) {
                    const w = me.#cvs.width;
                    const h = me.#cvs.height;
                    me.#ctx.clearRect(0, 0, w, h);
                }
                else if (!me.#cvsmode && me.#svgmode) {
                    me.#svg.selectAll('line').remove()
                    me.#svg.selectAll('text').remove()
                }

                me.#drawMap();
                me.#drawTraj(crntDate);

                if (me.#animationRun)
                    crntDate += step;

                if (crntDate > end)
                    if (loop) crntDate = start;
                    else clearInterval(animation);
            }, frameRate);
            return this;
        }


        transform(obj) {
            this.#prj.scale(obj.scale);
            this.#prj.center(obj.center.lon, obj.center.lat);
            this.#prj.mode(obj.projection);
            if (this.#cvsmode && !this.#svgmode) {
                this.#prj.h = this.#cvs.height;
                this.#prj.w = this.#cvs.width;
            }
            else if (!this.#cvsmode && this.#svgmode) {
                this.#prj.h = this.#svg.attr('height');
                this.#prj.w = this.#svg.attr('width');
            }
            return this;
        }

        map(topojson) {
            if (this.#cvsmode && !this.#svgmode) {
                const map = new Map();
                map.topojson(topojson);
                this.#mapList.push(map)
            }
            return this;
        }
        mapStyle(obj) {
            this.#mapList.forEach(m => {
                if (obj.color) this.#mapColor = obj.color;
                if (obj.stroke) this.#mapStroke = obj.stroke;
                if (obj.fill) this.#mapFill = obj.fill;
            })
            return this;
        }
        #drawMap() {
            if (this.#mapList.length > 0) {
                this.#mapList.forEach(map => map.draw(this.#ctx, this.#prj, this.#mapColor, this.#mapFill, this.#mapStroke))
            }
        }

    }

    function diff(x0, y0, x1, y1) {
        return Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
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



    class Projection {
        #cLat = 0;
        #cLon = 0;
        #scale = 1;
        #mode = 'liner';
        h = 0;
        w = 0;

        constructor() {

        }

        x(lon) {
            // lon *= -1;
            if (this.#mode === 'liner') {
                return (lon - this.#cLon) * this.#scale + this.w / 2;
            }
            else if (this.#mode === 'mercator') {
                let x = lon * (Math.PI / 180);
                let cx = this.#cLon * (Math.PI / 180);
                return (x - cx) * this.#scale + this.w / 2;
            }

            return 0;
        }
        y(lat) {
            lat *= -1;
            if (this.#mode === 'liner') {
                return (lat - this.#cLat) * this.#scale + this.h / 2;
            }
            else if (this.#mode === 'mercator') {
                let y = Math.log(Math.tan(Math.PI / 4 + lat * (Math.PI / 180) / 2));
                let cy = Math.log(Math.tan(Math.PI / 4 + this.#cLat * (Math.PI / 180) / 2));
                return (y - cy) * this.#scale + this.h / 2;
            }
            return 0;
        }

        center(lon, lat) {
            this.#cLon = lon;
            this.#cLat = -lat;
        }

        scale(s) {
            this.#scale = s;
        }

        mode(m) {
            this.#mode = m;
        }

        mercator() {
            this.#mode = 'mercator';
        }
    }


    class Map {

        topoGeometrysList = [];

        constructor() {
        }

        topojson(jsonString) {
            const topoJsonData = JSON.parse(jsonString);

            // topojsonのデータを緯度経度の絶対座標に変換する
            Object.keys(topoJsonData.objects).forEach(key => {
                this.topoGeometrysList.push(topoJsonData.objects[key].geometries);
            })
            // topoGeometryList = topoJsonData.objects[key].geometries;
            this.topoArcList = this.#decodeArcs(topoJsonData, topoJsonData.arcs);
        }

        #decodeArc(topology, arc) {
            let x = 0, y = 0;
            return arc.map((position) => {
                x += position[0];
                y += position[1];
                if (topology.transform != undefined) {
                    const lon = x * topology.transform.scale[0] + topology.transform.translate[0];
                    const lat = y * topology.transform.scale[1] + topology.transform.translate[1];
                    return { lon: lon, lat: lat };
                } else {
                    const lon = x
                    const lat = y
                    return { lon: lon, lat: lat };
                }

            });
        }

        #decodeArcs(topology, arcs) {
            return arcs.map((arc) => this.#decodeArc(topology, arc));
        }

        draw(ctx, prj, color, fill, stroke) {
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.0;

            this.topoGeometrysList.forEach(g => {
                this.#drawMap(g, ctx, prj, fill, stroke)
            })
        }

        #drawMap(topoGeometryList, ctx, prj, fill, stroke) {
            if (topoGeometryList.length > 0) {

                // topoJsonで区切られた地域ごとに面を作る
                topoGeometryList.forEach((geo) => {
                    if (geo.type === 'Polygon') {
                        const arcs = geo.arcs;
                        arcs.forEach((arcIdxList) => {
                            this.#drawGeometry(ctx, prj, arcIdxList, this.topoArcList, fill, stroke);
                        });
                    }
                    else if (geo.type === 'MultiPolygon') {
                        const arcs = geo.arcs;
                        arcs.forEach(arc => {
                            arc.forEach((arcIdxList) => {
                                this.#drawGeometry(ctx, prj, arcIdxList, this.topoArcList, fill, stroke);
                            })
                        })

                    }
                    else if (geo.type === 'LineString') {
                        const arcIdxList = geo.arcs;
                        this.#drawGeometry(ctx, prj, arcIdxList, this.topoArcList, fill, stroke);
                    }
                });
            }
        }

        #drawGeometry(ctx, prj, arcIdxList, arcList, fill, stroke) {
            let firstPoint = true;
            ctx.beginPath();
            arcIdxList.forEach((arcIndex) => {
                if (arcIndex >= 0) {
                    const arc = arcList[arcIndex];
                    for (let i = 0; i < arc.length; i++) {
                        const x = prj.x(arc[i].lon, this.centerLon)
                        const y = prj.y(arc[i].lat, this.centerLat)
                        if (firstPoint) {
                            ctx.moveTo(x, y);
                            firstPoint = false;
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                } else {
                    const arc = arcList[~arcIndex];
                    for (let i = arc.length - 1; i >= 0; i--) {
                        const x = prj.x(arc[i].lon, this.centerLon)
                        const y = prj.y(arc[i].lat, this.centerLat)
                        if (firstPoint) {
                            ctx.moveTo(x, y);
                            firstPoint = false;
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                }
            })
            if (stroke) ctx.stroke();
            if (fill) ctx.fill();
        }
    }


    if (typeof module === "undefined") {
        self.Trajs = Trajs;
    } else {
        module.exports = Trajs;
    }
})();