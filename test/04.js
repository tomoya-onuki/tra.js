fetch("../data/my/jpn.topojson")
    .then(response => response.text())
    .then(topojson => {
        const transformParam = {
            center: { lon: 137.7, lat: 37.5 },
            scale: 500,
            projection: 'mercator'
        };
        const cvs4 = document.querySelector('#cvs4');
        Trajs()
            .canvas(cvs4)
            .transform(transformParam)
            .map(topojson, "#fff", true, true)
            .draw(0);
    })