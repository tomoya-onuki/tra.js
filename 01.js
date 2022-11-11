const cvs1 = document.querySelector('#cvs1');
w = cvs1.width * devicePixelRatio;
h = cvs1.height * devicePixelRatio;
cvs1.width = w;
cvs1.height = h;
cvs1.style.width = String(w / devicePixelRatio) + 'px';
cvs1.style.height = String(h / devicePixelRatio) + 'px';
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