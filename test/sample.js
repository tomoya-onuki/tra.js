window.onload = () => {


    d3.csv("../data/my/stops.csv", function (data) {
        return data;
    }).then(function (data) {
        let posData = {}
        data.forEach(d => {
            posData[d.stop_id] = { lat: Number(d.lat), lon: Number(d.lon) }
        })

        d3.csv("../data/my/stop_times2.csv", function (data) {
            return data;

        }).then(function (timeData) {

            let data = {};
            timeData.forEach(d => {
                let msec = dayjs(`2022-01-01 ${d.arrival_time}`).valueOf();
                let pos = posData[d.stop_id];

                if (!Object.keys(data).includes(d.trip_id)) {
                    // console.log(d.trip_id)
                    data[d.trip_id] = [];
                }

                data[d.trip_id].push({
                    date: msec,
                    lon: pos.lon,
                    lat: pos.lat
                });
            })

            console.log(data)

            // let data = timeData.map(d => {
            //     let pos = posData[d.stop_id];
            //     let x = pos.lon;
            //     let y = pos.lat;

            //     let msec = dayjs(`2022-01-01 ${d.date}`).valueOf()
            //     return { date: msec, lon: x, lat: y }
            // })

            fetch("../data/my/map.topojson")
                .then(response => response.text())
                .then(topojson => {
                    // let start = dayjs('2022-01-01 07:50:00').valueOf();
                    // let end = dayjs('2022-01-01 20:21:00').valueOf();
                    // let start = data[0].date;
                    // let end = data[data.length - 1].date;

                    const transformParam = {
                        center: { lon: 139.7, lat: 35.67 },
                        scale: 300000 * devicePixelRatio,
                        projection: 'mercator'
                    };
                    const cvs = document.querySelector('#cvs');
                    const w = cvs.width * devicePixelRatio;
                    const h = cvs.height * devicePixelRatio;
                    cvs.width = w;
                    cvs.height = h;
                    cvs.style.width = String(w / devicePixelRatio) + 'px';
                    cvs.style.height = String(h / devicePixelRatio) + 'px';

                    var map = Trajs()
                        .canvas(cvs)
                        .transform(transformParam)
                        .map(topojson, "#fff", false, true);

                    let keyList = Object.keys(data);
                    let colorList = {};
                    let tmp = Array.from(new Set(keyList.map(key => key.split('_')[2])));
                    tmp.forEach((key, i) => {
                        let h = i / tmp.length * 360;
                        colorList[key] = chroma.hsv(h, 0.5, 1.0).rgb();
                    })
                    let trajsList = [];
                    keyList.forEach(key => {
                        let label = key.split('_')[2]; 
                        let rgb = colorList[label];
                        let trajs = Trajs()
                            .fetch(data[key])
                            .weight(6)
                            .damping(0.8)
                            .thinning(0.8)
                            .color(rgb[0], rgb[1], rgb[2])
                            .label(label)
                            .labelStyle({
                                font: 'Arial',
                                size: 10,
                                color: '#FFF',
                                offset: 5
                            })
                            .canvas(cvs)
                            .transform(transformParam);
                        trajsList.push(trajs)
                    })

                    let startData = data[keyList[0]]
                    let start = startData[0].date
                    let endData = data[keyList[keyList.length - 1]]
                    let end = endData[endData.length - 1].date

                    let crnt = start;
                    const ctx = cvs.getContext('2d');
                    setInterval(() => {
                        ctx.clearRect(0, 0, w, h);
                        map.drawMap();

                        ctx.font = '24px Arial'
                        ctx.fillStyle = '#FFF'
                        ctx.fillText(dayjs(crnt).format('HH:mm:ss'), 100, 100);

                        if (start <= crnt && crnt <= end) {
                            trajsList.forEach(t => t.draw(crnt));
                        } else if (crnt > end) {
                            crnt = start;
                        }
                        crnt += 60 * 1000 / 10;
                    }, 10);
                })
        })
    });


}