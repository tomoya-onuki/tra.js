(c) 2022 Tomoya Onuki.  

# Tra.js
Tra.js is a library for visualizing the trajectory of time-series location data in a web browser. Dynamic changes can be visualized using transition. Currently supports visualization using the Canvas element and D3.js.

Tra.jsは時系列位置データをwebブラウザ上で可視化するためのライブラリです。動的な移動の様子を軌跡で表現します。現在はCanvas要素とD3.jsを用いた可視化をサポートしています。

## Reference (English)
https://tomoya-onuki.github.io/tra.js/

## Data
I use processed bus location data obtained from GTFS-JP([https://www.gtfs.jp/](https://www.gtfs.jp/)).

GTFS-JP([https://www.gtfs.jp/](https://www.gtfs.jp/))より得たバスの運行データを加工したものを利用しています。


## Quick Start
### Canvas
```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="../tra.min.js"></script>
    <title>Tra.js - canvas demo</title>
</head>

<body>
    <canvas width="200" height="200"></canvas>

    <script>
        let data = []
        for (let t = 0, msec = 1000; t < Math.PI / 2 * 3; t += Math.PI / 120, msec += 10) {
            data.push({
                date: msec,
                x: Math.cos(t) * 90 + 100,
                y: Math.sin(t) * 90 + 100
            })
        }

        const cvs = document.querySelector('canvas');
        new Trajs()
            .trajectory(data)
            .weight(5)
            .thinning(0.99)
            .length(1000)
            .damping(0.95)
            .color(3, 152, 252)
            .ticks(100)
            .label('canvas')
            .labelStyle({
                font: 'Arial', size: 10, color: '#000', offset: 5
            })
            .animation(cvs, 2, 1000, 4000, true);
    </script>
</body>

</html>
```

### D3.js
```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://d3js.org/d3.v6.js"></script>
    <script src="../tra.min.js"></script>
    <title>Tra.js - d3 demo</title>
</head>

<body>
    <div id="d3-view"></div>

    <script>
        let data = []
        for (let t = 0, msec = 1000; t < Math.PI / 2 * 3; t += Math.PI / 120, msec += 10) {
            data.push({
                date: msec,
                x: Math.cos(t) * 90 + 100,
                y: Math.sin(t) * 90 + 100
            })
        }
        const svg = d3.select("#d3-view")
            .append("svg")
            .attr("width", 200)
            .attr("height", 200);

        new TrajsD3()
            .trajectory(data)
            .weight(5)
            .thinning(0.99)
            .length(1000)
            .damping(0.95)
            .color(3, 152, 252)
            .ticks(100)
            .label('D3.js')
            .labelStyle({
                font: 'Arial', size: 10, color: '#000', offset: 5
            })
            .roundCap(true)
            .animation(svg, 2, 1000, 4000, true);
    </script>
</body>

</html>
```
