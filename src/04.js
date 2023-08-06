fetch("./res/jpn.topojson")
    .then(response => response.text())
    .then(topojson => {
        const transformParam = {
            center: { lon: 137.7, lat: 37.5 },
            scale: 500 * devicePixelRatio,
            projection: 'mercator'
        };
        const cvs4 = document.querySelector('#cvs4');
        w = cvs4.width * devicePixelRatio;
        h = cvs4.height * devicePixelRatio;
        cvs4.width = w;
        cvs4.height = h;
        cvs4.style.width = String(w / devicePixelRatio) + 'px';
        cvs4.style.height = String(h / devicePixelRatio) + 'px';
        Trajs()
            .canvas(cvs4)
            .transform(transformParam)
            .map(topojson)
            .mapStyle({
                color: "#fff",
                fill: false,
                stroke: true
            })
            .draw();
    })