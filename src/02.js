
const cvs2 = document.querySelector('#cvs2');
w = cvs2.width * devicePixelRatio;
h = cvs2.height * devicePixelRatio;
cvs2.width = w;
cvs2.height = h;
cvs2.style.width = String(w / devicePixelRatio) + 'px';
cvs2.style.height = String(h / devicePixelRatio) + 'px';
const trajs2 = Trajs()
    .trajectory(data)
    .weight(10)
    .thinning(0.95)
    .length(1000)
    .damping(0.9)
    .color(242, 169, 51)
    .roundCap(true)
    .label('text')
    .labelStyle({
        font: 'Arial', size: 10 * devicePixelRatio, color: '#FFF', offset: 5
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