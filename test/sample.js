window.onload = () => {

    const width = 400;
    const height = 400;
    // const transform = Trajs().transform
    //     .center(139.63, 35.60)
    //     .scale(200000)
    //     .mercator();

    // console.log(transform.x(139.63), transform.y(35.60))
    // console.log(Trajs().map.transform(transform).get(139.63, 35.60))

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
                let x = pos.lon;
                let y = pos.lat;
                // let x = transform.x(pos.lon)
                // let y = transform.y(pos.lat)

                let msec = dayjs(`2022-01-01 ${d.date}`).valueOf()
                return { date: msec, lon: x, lat: y }
            })

            let start = data[0].date;
            let end = data[data.length - 1].date;

            const transformParam = {
                center : {lon : 139.63, lat : 35.60},
                scale : 100000,
                projection : 'mercator'
            };

            const svg = d3.select("#d3-view")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

            Trajs()
                .fetch(data)
                .weight(3)
                .damping(0.95)
                .thinning(0.99)
                .color(3, 152, 252)
                .transform(transformParam)
                .svg(svg)
                .animation(100, 10000, start, end + 60 * 60 * 1000, true);


            const cvs = document.querySelector('canvas');
            cvs.width = width;
            cvs.height = height;
            Trajs()
                .fetch(data)
                .weight(3)
                .damping(0.95)
                .thinning(0.99)
                .color(3, 152, 252)
                .transform(transformParam)
                .canvas(cvs)
                .animation(100, 10000, start, end + 60 * 60 * 1000, true);
        })
    });


}