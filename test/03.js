import { Trajs } from "../tra.js";
let data = []
for (let t = 0, msec = 1000; t < Math.PI / 2 * 3; t += Math.PI / 120, msec += 10) {
    data.push({
        date: msec,
        lon: Math.cos(t) * 90 + 100,
        lat: -(Math.sin(t) * 90 + 100)
    })
}
const cvs3 = document.querySelector('#cvs3');
const trajs3 = Trajs()
    .trajectory(data)
    .weight(2)
    .color(237, 9, 59)
    .canvas(cvs3);

const ctx = cvs3.getContext('2d');
let start = 1000;
let end = 3000;
let crntDate = start;
setInterval(function () {
    ctx.clearRect(0, 0, 200, 200);
    trajs3.draw(crntDate)
    crntDate++
let data = []
for (let t = 0, msec = 1000; t < Math.PI / 2 * 3; t += Math.PI / 120, msec += 10) {
    data.push({
        date: msec,
        lon: Math.cos(t) * 90 + 100,
        lat: -(Math.sin(t) * 90 + 100)
    })
}
    if (crntDate > end)
        crntDate = start
}, 1);