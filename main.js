window.onload = () => {
    let data = []
    for (let t = 0, msec = 1000; t < Math.PI / 2 * 3; t += Math.PI / 120, msec += 10) {
        data.push({
            date: msec,
            x: Math.cos(t) * 90 + 100,
            y: Math.sin(t) * 90 + 100
        })
    }

    const cvs0 = document.querySelector('#cvs0');
    new Trajs()
        .fetch(data)
        .weight(5)
        .damping(0.99)
        .color(255, 255, 255)
        .draw(cvs0, 3000);

    const cvs1 = document.querySelector('#cvs1');
    new Trajs()
        .fetch(data)
        .weight(5)
        .thinning(0.99)
        .length(1000)
        .damping(0.95)
        .color(3, 152, 252)
        .ticks(100)
        .transition(cvs1, 2, 1000, 4000, true);


    let data2 = []
    for (let t = 0, msec = 1000; t < Math.PI * 2; t += Math.PI / 120, msec += 10) {
        data2.push({
            date: msec,
            x: Math.cos(t) * 90 + 100,
            y: Math.sin(t) * 90 + 100
        })
    }
    const cvs2 = document.querySelector('#cvs2');
    const trajs2 = new Trajs()
        .fetch(data)
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
        .transition(cvs2, 5, 1000, 3400, true);

    document.querySelector('#start')
        .addEventListener('click', function () {
            trajs2.start()
        })
    document.querySelector('#pause')
        .addEventListener('click', function () {
            trajs2.pause()
        })


    const cvs3 = document.querySelector('#cvs3');
    const trajs3 = new Trajs()
        .fetch(data)
        .weight(2)
        .color(237, 9, 59);

    const ctx = cvs3.getContext('2d');
    let start = 1000;
    let end = 3000;
    let crntDate = start;
    setInterval(function () {
        ctx.clearRect(0, 0, 200, 200);
        trajs3.draw(cvs3, crntDate)
        crntDate++

        if (crntDate > end)
            crntDate = start
    }, 1);




    const svg0 = d3.select("#d3-view0")
        .append("svg")
        .attr("width", 200)
        .attr("height", 200);

    new TrajsD3()
        .fetch(data)
        .weight(5)
        .damping(0.99)
        .color(255, 255, 255)
        .draw(svg0, 3000);

    const svg1 = d3.select("#d3-view1")
        .append("svg")
        .attr("width", 200)
        .attr("height", 200);

    new TrajsD3()
        .fetch(data)
        .weight(5)
        .thinning(0.99)
        .length(1000)
        .damping(0.95)
        .color(3, 152, 252)
        .ticks(100)
        .label('D3.js')
        .labelStyle({
            font: 'Arial', size: 10, color: '#FFF', offset: 5
        })
        .roundCap(true)
        .transition(svg1, 2, 1000, 4000, true);
}