import { Trajs } from "./index";
import chroma from "chroma-js";
import * as d3 from 'd3';
import dayjs from "dayjs";

type Pos = {
    lat: number;
    lon: number;
};

window.onload = () => {
    d3.csv("../../data/my/stops.csv", function (data) {
        return data;
    }).then(function (data) {
        let posData: { [key: string]: Pos } = {};
        data.forEach(d => {
            posData[String(d.stop_id)] = { lat: Number(d.lat), lon: Number(d.lon) }
        })

        d3.csv("../../data/my/stop_times2.csv", function (data) {
            return data;

        }).then(function (timeData) {

            let data: { [key: string]: any } = {};
            timeData.forEach(d => {
                let msec = dayjs(`2022-01-01 ${d.arrival_time}`).valueOf();
                let pos = posData[String(d.stop_id)];

                if (!Object.keys(data).includes(String(d.trip_id))) {
                    // console.log(d.trip_id)
                    data[String(d.trip_id)] = [];
                }

                data[String(d.trip_id)].push({
                    date: msec,
                    lon: pos.lon,
                    lat: pos.lat
                });
            })

            // console.log(data)


            fetch("../../data/my/map.topojson")
                .then(response => response.text())
                .then(topojson => {

                    const transformParam = {
                        center: { lon: 139.69, lat: 35.665 },
                        scale: 300000 * devicePixelRatio,
                        projection: 'mercator'
                    };
                    const cvs = <HTMLCanvasElement>document.querySelector('#cvs');
                    const w = cvs.width * devicePixelRatio;
                    const h = cvs.height * devicePixelRatio;
                    cvs.width = w;
                    cvs.height = h;
                    cvs.style.width = String(w / devicePixelRatio) + 'px';
                    cvs.style.height = String(h / devicePixelRatio) + 'px';

                    var map = Trajs()
                        .canvas(cvs)
                        .transform(transformParam)
                        .map(topojson)
                        .mapStyle({
                            color: "#fff",
                            fill: false,
                            stroke: true
                        });

                    let keyList = Object.keys(data);
                    let colorList: { [key: string]: number[] } = {};
                    let tmp = Array.from(new Set(keyList.map(key => key.split('_')[2])));
                    tmp.forEach((key, i) => {
                        let h = i / tmp.length * 360;
                        colorList[key] = chroma.hsv(h, 0.5, 1.0).rgb();
                    })
                    let trajsList: Trajs[] = [];
                    keyList.forEach(key => {
                        let label = key.split('_')[2];
                        let rgb = colorList[label];
                        let trajs = Trajs()
                            .trajectory(data[key])
                            .weight(3 * devicePixelRatio)
                            .damping(0.8)
                            .thinning(0.8)
                            .color(rgb[0], rgb[1], rgb[2])
                            .label(label)
                            .labelStyle({
                                font: 'Arial',
                                size: 6 * devicePixelRatio,
                                color: '#FFF',
                                offset: 5
                            })
                            .canvas(cvs)
                            .transform(transformParam);
                        trajsList.push(trajs)
                    })

                    let startData = data[keyList[0]]
                    let start = startData[0].date
                    let endData = data[keyList[keyList.length - 1]]
                    let end = endData[endData.length - 1].date

                    let crnt = start;
                    const ctx: CanvasRenderingContext2D = <CanvasRenderingContext2D>cvs.getContext('2d');

                    let speed = 6000;
                    const busSpeedElem: HTMLInputElement = <HTMLInputElement>document.querySelector('#bus-speed');
                    if (busSpeedElem !== null) {
                        busSpeedElem.addEventListener('input', () => {
                            speed = Number(busSpeedElem.value) * 1000;
                        });
                    }

                    const busWeightElem: HTMLInputElement = <HTMLInputElement>document.querySelector('#bus-weight');
                    if(busWeightElem !== null) {
                        busWeightElem.addEventListener('input', () => {
                            let w = Number(busWeightElem.value) * devicePixelRatio;
                            trajsList.forEach(t => t.weight(w));
                        });
                    }

                    const busDumpElem: HTMLInputElement = <HTMLInputElement>document.querySelector('#bus-damp');
                    if (busDumpElem !== null) {
                        busDumpElem.addEventListener('input', () => {
                            let d: number = Number(busDumpElem.value);
                            trajsList.forEach(t => t.damping(d));
                        });
                    }

                    const busThinElem: HTMLInputElement = <HTMLInputElement>document.querySelector('#bus-thin');
                    if (busThinElem !== null) {   
                        busThinElem.addEventListener('input', () => {
                            let v: number = Number(busThinElem.value);
                            trajsList.forEach(t => t.thinning(v));
                        });
                    }

                    setInterval(() => {
                        ctx.clearRect(0, 0, w, h);
                        map.draw();

                        ctx.font = `${12 * devicePixelRatio}px Arial`
                        ctx.fillStyle = '#FFF'
                        ctx.fillText(dayjs(crnt).format('HH:mm:ss'), 50, 50);

                        if (start <= crnt && crnt <= end) {
                            trajsList.forEach(t => t.draw(crnt));
                        } else if (crnt > end) {
                            crnt = start;
                        }

                        crnt += speed;
                    }, 10);
                })
        })
    });


}