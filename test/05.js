const svg0 = d3.select("#d3-view0")
    .append("svg")
    .attr("width", 200)
    .attr("height", 200);

Trajs()
    .fetch(data)
    .weight(5)
    .damping(0.99)
    .color(255, 255, 255)
    .svg(svg0)
    .draw(3000);