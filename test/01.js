const cvs1 = document.querySelector('#cvs1');
Trajs()
    .fetch(data)
    .weight(5)
    .thinning(0.99)
    .length(1000)
    .damping(0.95)
    .color(3, 152, 252)
    .ticks(100)
    .canvas(cvs1)
    .animation(2, 2, 1000, 4000, true);