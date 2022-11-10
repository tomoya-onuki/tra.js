const svg1 = d3.select("#d3-view1")
    .append("svg")
    .attr("width", 200)
    .attr("height", 200);

Trajs()
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
    .svg(svg1)
    .animation(2, 2, 1000, 4000, true);