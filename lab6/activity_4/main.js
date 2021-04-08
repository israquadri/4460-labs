var margin = {top: 10, right: 10, bottom: 40, left: 40},
    width = 500 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var scatterplot = d3.select('#scatterplot')
    .append("svg")
        .attr("class", "container")
        .attr("width", width+margin.left+margin.right)
        .attr("height", height+margin.top+margin.bottom)
    .append("g")
    .attr('class', 'plot')
    .attr("transform", 
          'translate(' + margin.left + ',' + margin.top + ')');

var cValue = function(d) { 
    return d["cylinders"];
}
const color = d3.scaleOrdinal(["#9467BD", "#4CA12D", "#D73E2A", "#F17D30", "#2477B4"]);

var xaxis = "cylinders";
var yaxis = "power (hp)"

function xAxisChanged() {
    var select = d3.select('#xAxisSelector').node();
    xaxis = select.options[select.selectedIndex].value;
    defaultBar(cars);
    updateScatterplot(xaxis, yaxis);
}

function yAxisChanged() {
    var select = d3.select('#yAxisSelector').node();
    yaxis = select.options[select.selectedIndex].value;
    defaultBar(cars);
    updateScatterplot(xaxis, yaxis);
}

var cars;
var container

d3.csv('cars.csv', dataPreprocessor).then(function(dataset) {

    container = d3.select('#barchart')
        .append("svg")
        .attr("class", "container")
        .attr("width", width+margin.left+margin.right)
        .attr("height", height+margin.top+margin.bottom)
    
    var barchart = container
        .append("g")
        .attr('class', 'chart')
        .attr("transform", 
            'translate(' + margin.left + ',' + margin.top + ')');

    var nested = d3.nest()
        .key(function(dataset) {
            return dataset["cylinders"];
        })
        .sortKeys(d3.ascending)
        .entries(dataset)

    var bardata = [
        {cylinders: parseInt(nested[0].key), count: nested[0].values.length},
        {cylinders: parseInt(nested[1].key), count: nested[1].values.length},
        {cylinders: parseInt(nested[2].key), count: nested[2].values.length},
        {cylinders: parseInt(nested[3].key), count: nested[3].values.length},
        {cylinders: parseInt(nested[4].key), count: nested[4].values.length},  
    ];

    //console.log(bardata);

    var xbar = d3.scaleBand()
        .range([0, width])
        .domain(bardata.map(function(d) {
            return d.cylinders;
        }))
        .padding(0.2);
    barchart.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xbar));
    barchart.append("text")  
        .attr('class', 'xlabel')           
        .attr("transform",
                "translate(" + (width/2) + " ," + 
                                (height + margin.top + 25) + ")")
        .style("text-anchor", "middle")
        .text("cylinders");

    var ybar = d3.scaleLinear()
        .domain([0, 220])
        .range([height, 0]);
    barchart.append("g")
        .call(d3.axisLeft(ybar));
    barchart.append("text")
        .attr('class', 'ylabel')
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left - 6)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("count");  

    barchart.selectAll("rect")
        .data(bardata)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return xbar(d.cylinders); })
        .attr("y", function(d) { return ybar(d.count); })
        .attr("width", xbar.bandwidth())
        .attr("height", function(d) { return height - ybar(d.count); })
        .attr("fill", function(d) {
            return color(cValue(d));
        })
        .style("opacity", 0.7);
    
    barchart.selectAll("rect")
        .each(function(d,i) {
            d3.select(this).on('mousemove', function(d) { 
                HighlightCircle(d.cylinders)
                d3.select(this).style("opacity", 1.0);
            })
            .on('mouseleave', function() {
                    d3.selectAll('.bar').style("opacity", 0.7);
                                    
                    d3.selectAll('circle')
                        .attr('fill', function(d) {
                            return color(cValue(d));
                        })
                    });
      })

    cars = dataset;
    updateScatterplot(xaxis, yaxis);

})

function HighlightCircle(name){
    //console.log(name)
    //console.log(cyl)
    d3.selectAll("circle").attr("fill", function(d) {
        if (d.cylinders == name) {
                return color(cValue(d));
        } else {
            return "lightgray";
        }
    })
    
}

function extrema(axis) {
    if (axis == "cylinders") {
        return [2, 9];
    } else if (axis == "power (hp)") {
        return [-5, 240];
    } else if (axis == "0-60 mph (s)") {
        return [8, 26];
    } else if (axis == "economy (mpg)") {
        return [-5, 50];
    } else if (axis == "displacement (cc)") {
        return [50, 460];
    } else if (axis == "year") {
        return [65, 85];
    } else if (axis == "weight (lb)") {
        return [1500, 5200];
    }
}


function updateScatterplot(xaxis, yaxis) {

    d3.select(".plot").remove();

    var scatterplot = d3.select('.container')
        .append("g")
        .attr('class', 'plot')
        .attr("transform", 
            'translate(' + margin.left + ',' + margin.top + ')');

    var x = d3.scaleLinear()
        .domain(extrema(xaxis))
        .range([0, width]);
    scatterplot.append("g")
        .attr('class', 'xaxis')
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(6).tickSize(-height));
    scatterplot.append("text") 
        .attr('class', 'xlabel')            
        .attr("transform",
                "translate(" + (width/2) + " ," + 
                                (height + margin.top + 25) + ")")
        .style("text-anchor", "middle")
        .text(xaxis);

    var y = d3.scaleLinear()
        .domain(extrema(yaxis))
        .range([height, 0]);
    scatterplot.append("g")
        .attr('class', 'yaxis')
        .call(d3.axisLeft(y).ticks(10).tickSize(-width));
    scatterplot.append("text")
        .attr('class', 'ylabel')
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(yaxis);  

   scatterplot.append('g').selectAll("circle")
        .data(cars)
        .enter()
        .append("circle")
        .attr("r", 3)
        .attr("cx", function(d) {
            return x(d[xaxis]);
        })
        .attr("cy", function(d) {
            return y(d[yaxis]);
        })
        .attr("fill", function(d) { return color(cValue(d));});
    
    scatterplot.append("g")
        .call(d3.brush()
        .extent([[0, 0], [width, height]])
        .on("brush", brushed)
        .on("end", brushended));


    function brushed() {
        var s = d3.event.selection,
            x0 = s[0][0],
            y0 = s[0][1],
            dx = s[1][0] - x0,
            dy = s[1][1] - y0;

        scatterplot.selectAll('circle')
            .style("fill", function (d) {
                if (x(d[xaxis]) >= x0 && x(d[xaxis]) <= x0 + dx && y(d[yaxis]) >= y0 && y(d[yaxis]) <= y0 + dy) { 
                    return color(cValue(d)); 
                }
                else { 
                    return "lightgray"; 
                }
            })
            .attr("class", function (d) {
                if (x(d[xaxis]) >= x0 && x(d[xaxis]) <= x0 + dx && y(d[yaxis]) >= y0 && y(d[yaxis]) <= y0 + dy) { 
                    return 'brushed'; 
                } else {
                    return 'notbrushed'
                }
            });

        var d_brushed = scatterplot.selectAll(".brushed");

        var selectedList = d_brushed['_groups'][0];
        var brushedData = [];

        selectedList.forEach(function (node) {
            brushedData.push(node.__data__);
        });

        // console.log(brushedData);
        // console.log(brushedData.length);

        if (brushedData.length > 0) {
            updateBarChart(brushedData);
        }

        function updateBarChart(newdata) {

            d3.select(".chart").remove();

            var barchart = container
                .append("g")
                .attr('class', 'chart')
                .attr("transform", 
                    'translate(' + margin.left + ',' + margin.top + ')');

            var nested = d3.nest()
                .key(function(newdata) {
                    return newdata["cylinders"];
                })
                .sortKeys(d3.ascending)
                .entries(newdata)
            
            //console.log(nested);
            
            var bardata = [];

            nested.forEach(function (n) {
                var obj = {cylinders: parseInt(n.key), count: n.values.length};
                bardata.push(obj);
            });

            var keys = [];

            bardata.forEach(function (n) {
                keys.push(n.cylinders);
            })
            
            if (!(keys.includes("3"))) { 
                var obj = {cylinders: 3, count: 0};
                bardata.push(obj);
            }
            if (!(keys.includes("4"))) { 
                var obj = {cylinders: 4, count: 0};
                bardata.push(obj);
            }
            if (!(keys.includes("5"))) { 
                var obj = {cylinders: 5, count: 0};
                bardata.push(obj);
            }
            if (!(keys.includes("6"))) { 
                var obj = {cylinders: 6, count: 0};
                bardata.push(obj);
            }
            if (!(keys.includes("8"))) {  
                var obj = {cylinders: 8, count: 0};
                bardata.push(obj);
            }

            bardata.sort((a, b) => (a.cylinders > b.cylinders) ? 1 : -1)
            //console.log(bardata);

            var xbar = d3.scaleBand()
                .range([0, width])
                .domain(bardata.map(function(d) {
                    return d.cylinders;
                }))
                .padding(0.2);
            barchart.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(xbar));
            barchart.append("text")  
                .attr('class', 'xlabel')           
                .attr("transform",
                        "translate(" + (width/2) + " ," + 
                                        (height + margin.top + 25) + ")")
                .style("text-anchor", "middle")
                .text("cylinders");

            var ybar = d3.scaleLinear()
                .domain([0, 220])
                .range([height, 0]);
            barchart.append("g")
                .call(d3.axisLeft(ybar));
            barchart.append("text")
                .attr('class', 'ylabel')
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left - 6)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("count");  

            barchart.selectAll("rect")
                .data(bardata)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", function(d) { return xbar(d.cylinders); })
                .attr("y", function(d) { return ybar(d.count); })
                .attr("width", xbar.bandwidth())
                .attr("height", function(d) { return height - ybar(d.count); })
                .attr("fill", function(d) {
                    return color(cValue(d));
                })
                .style("opacity", 0.7);

            barchart.selectAll("rect")
                .each(function() {
                    d3.select(this).on('mousemove', function(d) { 
                        HighlightCircle(d["cylinders"])
                        d3.select(this).style("opacity", 1.0);
                    })
                    .on('mouseleave', function() {
                            d3.selectAll('.bar').style("opacity", 0.7);
                                            
                            d3.selectAll('circle')
                                .attr('fill', function(d) {
                                    return color(cValue(d));
                                })
                    });
                })

        }

    }

    function brushended() {
        if (!d3.event.selection) {
            scatterplot.selectAll('circle')
            .transition()
            .duration(150)
            .ease(d3.easeLinear)
            .style("fill", function(d) {
                return color(cValue(d));
            });

            updateScatterplot(xaxis, yaxis);
            defaultBar(cars);

        }
    }
}

function defaultBar(dataset) {
 
    d3.select(".chart").remove();

    var barchart = container
        .append("g")
        .attr('class', 'chart')
        .attr("transform", 
            'translate(' + margin.left + ',' + margin.top + ')');

    var nested = d3.nest()
        .key(function(dataset) {
            return dataset["cylinders"];
        })
        .sortKeys(d3.ascending)
        .entries(dataset)

    var bardata = [
        {cylinders: parseInt(nested[0].key), count: nested[0].values.length},
        {cylinders: parseInt(nested[1].key), count: nested[1].values.length},
        {cylinders: parseInt(nested[2].key), count: nested[2].values.length},
        {cylinders: parseInt(nested[3].key), count: nested[3].values.length},
        {cylinders: parseInt(nested[4].key), count: nested[4].values.length},  
    ];

    console.log(bardata);

    var xbar = d3.scaleBand()
        .range([0, width])
        .domain(bardata.map(function(d) {
            return d.cylinders;
        }))
        .padding(0.2);
    barchart.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xbar));
    barchart.append("text")  
        .attr('class', 'xlabel')           
        .attr("transform",
                "translate(" + (width/2) + " ," + 
                                (height + margin.top + 25) + ")")
        .style("text-anchor", "middle")
        .text("cylinders");

    var ybar = d3.scaleLinear()
        .domain([0, 220])
        .range([height, 0]);
    barchart.append("g")
        .call(d3.axisLeft(ybar));
    barchart.append("text")
        .attr('class', 'ylabel')
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left - 6)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("count");  

    barchart.selectAll("rect")
        .data(bardata)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return xbar(d.cylinders); })
        .attr("y", function(d) { return ybar(d.count); })
        .attr("width", xbar.bandwidth())
        .attr("height", function(d) { return height - ybar(d.count); })
        .attr("fill", function(d) {
            return color(cValue(d));
        })
        .style("opacity", 0.7);
    
    barchart.selectAll("rect")
        .each(function(d,i) {
            d3.select(this).on('mousemove', function(d) { 
                HighlightCircle(d.cylinders)
                d3.select(this).style("opacity", 1.0);
            })
            .on('mouseleave', function() {
                    d3.selectAll('.bar').style("opacity", 0.7);
                                    
                    d3.selectAll('circle')
                        .attr('fill', function(d) {
                            return color(cValue(d));
                        })
                    });
      })
}

function dataPreprocessor(row) {
    return {
        'name': row['name'],
        'economy (mpg)': +row['economy (mpg)'],
        'cylinders': +row['cylinders'],
        'displacement (cc)': +row['displacement (cc)'],
        'power (hp)': +row['power (hp)'],
        'weight (lb)': +row['weight (lb)'],
        '0-60 mph (s)': +row['0-60 mph (s)'],
        'year': +row['year']
    };
}