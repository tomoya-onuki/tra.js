let data = []
for (let t = 0, msec = 1000; t < Math.PI / 2 * 3; t += Math.PI / 120, msec += 10) {
    data.push({
        date: msec,
        lon: Math.cos(t) * 90 + 100,
        lat: -(Math.sin(t) * 90 + 100)
    })
}

const cvs0 = document.querySelector('#cvs0');
Trajs()
    .fetch(data)
    .weight(5)
    .damping(0.99)
    .color(255, 255, 255)
    .canvas(cvs0)
    .draw(3000);