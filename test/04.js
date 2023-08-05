import { Trajs } from "../tra.js";
let data = []
for (let t = 0, msec = 1000; t < Math.PI / 2 * 3; t += Math.PI / 120, msec += 10) {
    data.push({
        date: msec,
        lon: Math.cos(t) * 90 + 100,
        lat: -(Math.sin(t) * 90 + 100)
    })
}
fetch("../data/my/jpn.topojson")
    .then(response => response.text())
    .then(topojson => {
        const transformParam = {
            center: { lon: 137.7, lat: 37.5 },
            scale: 500,
            projection: 'mercator'
        };
        const cvs4 = document.querySelector('#cvs4');
        Trajs()
            .canvas(cvs4)
            .transform(transformParam)
            .map(topojson)
            .mapStyle({
                color: "#fff",
                fill: false,
                stroke: true
            })
            .draw();
    })