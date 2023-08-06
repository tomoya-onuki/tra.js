const cvs3 = document.querySelector('#cvs3');
const trajs3 = Trajs()
    .trajectory(data)
    .weight(2 * devicePixelRatio)
    .color(237, 9, 59)
    .canvas(cvs3);

const ctx = cvs3.getContext('2d');
w = cvs3.width * devicePixelRatio;
h = cvs3.height * devicePixelRatio;
cvs3.width = w;
cvs3.height = h;
cvs3.style.width = String(w / devicePixelRatio) + 'px';
cvs3.style.height = String(h / devicePixelRatio) + 'px';
let start = 1000;
let end = 3000;
let crntDate = start;
setInterval(function () {
    ctx.clearRect(0, 0, 200, 200);
    trajs3.draw(crntDate);
    crntDate++;

    if (crntDate > end)
        crntDate = start;
}, 1);