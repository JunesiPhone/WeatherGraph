/*jslint
  node: true,
  sloppy: true,
  browser: true
*/

/*global
  d3,
  showLows,
  IS2W,
  translate,
  current
*/

'use strict';
var graphMaker = {
    storage: {
        forecastInfo: null,
        condition: null,
        icon: null,
        dataArray: [],
        data2Array: [],
        highArray: [],
        lowArray: [],
        iconArray: [],
        daysArray: []
    },
    clearGraph: function () {
        document.getElementById('graph').innerHTML = '';
        document.getElementById('graph2').innerHTML = '';
        document.getElementById('dots').innerHTML = '';
        document.getElementById('days').innerHTML = '';
    },
    emptyArrays: function () {
        graphMaker.storage.dataArray = [];
        graphMaker.storage.data2Array = [];
        graphMaker.storage.highArray = [];
        graphMaker.storage.lowArray = [];
        graphMaker.storage.iconArray = [];
        graphMaker.storage.daysArray = [];
    },
    createDots: function (x, y, low) {
        var dot = document.createElement('div');
        dot.style.left = x - 4 + 'px';
        dot.style.top = y - 4 + 'px';
        if (low) {
            dot.className = 'dotlow';
        } else {
            dot.className = 'dot';
        }
        document.getElementById('dots').appendChild(dot);
    },
    createDays: function (x, y, count, low) {
        var day = document.createElement('div'),
            temp = document.createElement('div'),
            img = document.createElement('img');
        day.style.left = x - 15 + 'px';
        day.style.top = y - 10 + 'px';

        temp.style.left = x - 13 + 'px';
        if (low) {
            temp.style.top = (y + 40) + 'px';
        } else {
            temp.style.top = (y + 5) + 'px';
        }
        temp.className = 'temps';
        if (low) {
            temp.innerHTML = graphMaker.storage.lowArray[count - 5] + '&deg;';
        } else {
            temp.innerHTML = graphMaker.storage.highArray[count] + '&deg;';
        }


        img.style.left = x - 15 + 'px';
        img.style.top = y - 40 + 'px';
        img.className = 'img';
        img.src = 'src/images/icons/weather/' + graphMaker.storage.iconArray[count] + '.png';

        day.innerHTML = graphMaker.storage.daysArray[count];
        day.className = 'day';
        if (!low) {
            document.getElementById('days').appendChild(img);
            document.getElementById('days').appendChild(day);
        }
        document.getElementById('days').appendChild(temp);

    },
    loadGraph: function () {
        this.clearGraph();
        var dotArrayX = [],
            dotArrayY = [],
            w = 320,
            h = 100,

            data = graphMaker.storage.dataArray,
            data2 = graphMaker.storage.data2Array,
            x = d3.scale.linear().domain([0, data.length]).range([0, w]),
            y = d3.scale.linear().domain([0, 10]).range([h, 0]),
            line = d3.svg.line().x(function (d, i) {
                dotArrayX.push(x(i));
                return x(i);
            }).y(function (d) {
                dotArrayY.push(y(d));
                return y(d);
            }),
            graph = d3.select("#graph").append("svg:svg").attr("width", 270).attr("height", h + 100).append("svg:g"),
            graph2 = d3.select("#graph2").append("svg:svg").attr("width", 270).attr("height", h + 100).append("svg:g"),
            i;

        graph.append("svg:path").attr("d", line(data));

        if (showLows) {
            graph2.append("svg:path").attr("d", line(data2));
        }

        for (i = 0; i < dotArrayX.length; i += 1) {
            if (i >= data.length) {
                graphMaker.createDots(dotArrayX[i], dotArrayY[i], true);
                graphMaker.createDays(dotArrayX[i], dotArrayY[i], i, true);
            } else {
                graphMaker.createDots(dotArrayX[i], dotArrayY[i], false);
                graphMaker.createDays(dotArrayX[i], dotArrayY[i], i, false);
            }
        }
        this.emptyArrays();
    },
    createArrays: function () {
        var icon,
            i,
            forecast = JSON.parse(IS2W('dayForecastsForCurrentLocationJSON')),
            currentCondition = IS2W('currentCondition');

        for (i = 1; i < 6; i += 1) {
            graphMaker.storage.dataArray.push(forecast[i].high / 10);
            graphMaker.storage.data2Array.push(forecast[i].low / 10);
            graphMaker.storage.highArray.push(forecast[i].high);
            graphMaker.storage.lowArray.push(forecast[i].low);
            graphMaker.storage.daysArray.push(translate[current].sday[forecast[i].dayOfWeek - 1]);
            icon = (forecast[i].condition === 3200) ? currentCondition : forecast[i].condition;
            graphMaker.storage.iconArray.push(icon);
        }
        graphMaker.loadGraph();
        setTimeout(graphMaker.createArrays, 604000);
    }
};
setTimeout(graphMaker.createArrays, 0);

/* implementation heavily inspired by http://bl.ocks.org/1166403 */
