window.onload = () => {


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

                let msec = dayjs(`2022-01-01 ${d.date}`).valueOf()
                return { date: msec, lon: x, lat: y }
            })

            fetch("../data/my/map.topojson")
                .then(response => response.text())
                .then(topojson => {
                    let start = data[0].date;
                    let end = data[data.length - 1].date;

                    const transformParam = {
                        center: { lon: 139.7, lat: 35.67 },
                        scale: 300000,
                        projection: 'mercator'
                    };
                    const cvs = document.querySelector('#cvs');
                    Trajs()
                        .fetch(data)
                        .weight(3)
                        .damping(0.95)
                        .thinning(0.99)
                        .color(3, 152, 252)
                        .canvas(cvs)
                        .transform(transformParam)
                        .map(topojson, "#fff", false, true)
                        .animation(100, 10000, start, end + 60 * 60 * 1000, true);
                })
        })
    });


}