import { Trajs } from "../tra.js";


let data2 = []
for (let t = 0, msec = 1000; t < Math.PI * 2; t += Math.PI / 120, msec += 10) {
    data2.push({
        date: msec,
        lon: Math.cos(t) * 90 + 100,
        lat: (Math.sin(t) * 90 + 100) * -1
    })
}
const cvs2 = document.querySelector('#cvs2');
const trajs2 = Trajs()
    .trajectory(data2)
    .weight(10)
    .thinning(0.95)
    .length(1000)
    .damping(0.9)
    .color(242, 169, 51)
    .roundCap(true)
    .label('text')
    .labelStyle({
        font: 'Arial', size: 10, color: '#FFF', offset: 5
    })
    .canvas(cvs2)
    .animation(5, 5, 1000, 3400, true);

document.querySelector('#start')
    .addEventListener('click', function () {
        trajs2.start()
    })
document.querySelector('#pause')
    .addEventListener('click', function () {
        trajs2.pause()
    })