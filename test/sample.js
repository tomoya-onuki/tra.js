window.onload = () => {

    const width = 400;
    const height = 400;

    const lon2x = (lon) => {
        // let x = lon * (Math.PI / 180);
        // let cx = 139.63 * (Math.PI / 180);
        // return (x - cx) * 200000;
        return (lon - 139.65) * 5000;
    }
    const lat2y = (lat) => {
        // let y = Math.log(Math.tan(Math.PI / 4 + lat * (Math.PI / 180) / 2));
        // let cy = Math.log(Math.tan(Math.PI / 4 + 35.60 * (Math.PI / 180) / 2));
        // return (y - cy) * 200000;
        return (lat - 35.65) * 5000;
    }


    d3.csv("../data/my/stops.csv", function (data) {
        return data;
    }).then(function (data) {
        let posData = {}
        data.forEach(d => {
            posData[d.stop_id] = { lat: Number(d.lat), lon: Number(d.lon) }
        })

        d3.csv("../data/my/stop_times.csv", function (data) {
            return data;

        }).then(function (timeData) {

            let data = timeData.map(d => {
                let pos = posData[d.stop_id];
                let y = lat2y(pos.lat);
                let x = lon2x(pos.lon);

                let msec = dayjs(`2022-01-01 ${d.date}`).valueOf()
                return { date: msec, x: x, y: y }
            })

            let start = data[0].date;
            let end = data[data.length - 1].date;


            const svg = d3.select("#d3-view")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

            // Map and projection
            const projection = d3.geoNaturalEarth1()
                .scale(20000)
                .translate([width / 2, height / 2])

            // Load external data and boot
            d3.json("../data/my/map.geojson").then(function (map) {



                new TrajsD3()
                    .fetch(data)
                    .weight(5)
                    .damping(0.98)
                    .thinning(0.99)
                    .color(3, 152, 252)
                    .roundCap(true)
                    .transition(svg, 100, 10000, start, end + 60 * 60 * 1000, true);
            })

        })
    });


}