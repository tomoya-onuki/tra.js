const cvs3 = document.querySelector('#cvs3');
const trajs3 = Trajs()
    .fetch(data)
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

    if (crntDate > end)
        crntDate = start
}, 1);