let data = []
for (let t = 0, msec = 1000; t < Math.PI / 2 * 3; t += Math.PI / 120, msec += 10) {
    data.push({
        date: msec,
        lon: (Math.cos(t) * 90 + 100) * devicePixelRatio,
        lat: -(Math.sin(t) * 90 + 100) * devicePixelRatio
    })
}

const cvs0 = document.querySelector('#cvs0');
let w = cvs0.width * devicePixelRatio;
let h = cvs0.height * devicePixelRatio;
cvs0.width = w;
cvs0.height = h;
cvs0.style.width = String(w / devicePixelRatio) + 'px';
cvs0.style.height = String(h / devicePixelRatio) + 'px';
Trajs()
    .trajectory(data)
    .weight(5)
    .damping(0.99)
    .color(255, 255, 255)
    .canvas(cvs0)
    .draw(3000);