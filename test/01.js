import { Trajs } from "../tra.js";

let data = []
for (let t = 0, msec = 1000; t < Math.PI / 2 * 3; t += Math.PI / 120, msec += 10) {
    data.push({
        date: msec,
        lon: Math.cos(t) * 90 + 100,
        lat: -(Math.sin(t) * 90 + 100)
    })
}
const cvs1 = document.querySelector('#cvs1');
Trajs()
    .trajectory(data)
    .weight(5)
    .thinning(0.99)
    .length(1000)
    .damping(0.95)
    .color(3, 152, 252)
    .ticks(100)
    .canvas(cvs1)
    .animation(2, 2, 1000, 4000, true);