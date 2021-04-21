function dataPreprocessor(row) {
    return {
        'Name': row['Name'],
        'Control': row['Control'],
        'Region': row['Region'],
        'Locale': row['Locale'],
        'Admission Rate': +row['Admission Rate'],
        'SAT Average': +row['SAT Average'],
        'Undergrad Population': +row['Undergrad Population'],
        '% White': +row['% White'],
        '% Black': +row['% Black'],
        '% Hispanic': +row['% Hispanic'],
        '% Asian': +row['% Asian'],
        '% American Indian': +row['% American Indian'],
        '% Pacific Islander': +row['% Pacific Islander'],
        '% Biracial': +row['% Biracial'],
        '% Nonresident Aliens': +row['% Nonresident Aliens'],
        'Average Age of Entry': +row['Average Age of Entry'],
        'Poverty Rate': +row['Poverty Rate'],
        'Average Family Income': +row['Average Family Income'],
        'Completion Rate': +row['Completion Rate'],
        'Retention Rate': +row['Retention Rate'],
        'Average Cost': +row['Average Cost']
    };
}

const color = d3.scaleOrdinal(["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928"]);

var data;
var donutchange = false;
var scatterchange = false;
var parallelchange = false;
var all;

var allselected = true;
var regionaldata;

var xax = "SAT Average";
var yax = "Admission Rate";

var click = false;


d3.csv('colleges.csv', dataPreprocessor).then(function(dataset) {

    data = dataset;

    barChart();
    all = {key: "ALL", values: data};
    donutChart(all);
    scatterPlot(all, xax, yax);
    parallelPlot(all.values) 
})

function xAxisChanged() {
    brushended();
    click = false;
    d3.selectAll("#slice").style("stroke", "none");
    var select = d3.select('#xAxisSelector').node();
    xax = select.options[select.selectedIndex].value;
    scatterchange = true;
    if (allselected) {
        scatterPlot(all, xax, yax);
    } else {
        scatterPlot(regionaldata, xax, yax);
    }
}

function yAxisChanged() {
    brushended();
    click = false;
    d3.selectAll("#slice").style("stroke", "none");
    var select = d3.select('#yAxisSelector').node();
    yax = select.options[select.selectedIndex].value;
    scatterchange = true;
    if (allselected) {
        scatterPlot(all, xax, yax);
    } else {
        scatterPlot(regionaldata, xax, yax);
    }
}

function barChart() {

    var margin = {top: 10, right: 10, bottom: 65, left: 30},
        width = 1230 - margin.left - margin.right,
        height = 220 - margin.top - margin.bottom;

    var nested = d3.nest()
        .key(function(data) {
            return data['Region'];
        })
        .entries(data);

    var container = d3.select('#bar')
        .append("svg")
        .attr("class", "container")
        .attr("width", width+margin.left+margin.right)
        .attr("height", 180);

    var barchart = container
        .append("g")
        .attr("class", "chart")
        .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")");
    
    var xbar = d3.scaleBand()
        .range([0, width])
        .domain(nested.map(function(d) {
            return d.key;
        }))
        .padding(0.2);
    barchart.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xbar).tickSize(0))
        .selectAll("text")
        .attr("class", "xaxis")
        .attr("transform", "translate(0, 5)")
        .style("font-size", 10)
        .style("text-anchor", "middle");

    var ybar = d3.scaleLinear()
        .domain([0, 300])
        .range([height, 0]);
    barchart.append("g")
        .call(d3.axisLeft(ybar).ticks(8).tickSize(0))
        .selectAll("text")
        .style("font-size", 8)
    
    barchart.selectAll("rect")
        .data(nested)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return xbar(d.key); })
        .attr("y", function(d) { return ybar(d.values.length); })
        .attr("width", xbar.bandwidth())
        .attr("height", function(d) { return height - ybar(d.values.length); })
        .attr("fill", "cadetblue")
        .style("opacity", 0.15);
    
    barchart.selectAll("rect")
        .each(function(d,i) {
            d3.select(this)
            .on('mousemove', function(d) { 
                d3.select(this).style("opacity", 0.3);
            })
            .on('mouseleave', function() {
                    d3.selectAll('.bar').style("opacity", 0.15);
            })
            .on('click', function() {
                click = false;
                barchart.selectAll("rect").attr("stroke", "none");
                d3.select(this).attr("stroke", "black")
                               .attr("stroke-alignment", "inner")
                               .attr("stroke-opacity", 1)
                               .attr("stroke-width", 1);
                allselected = false;
                regionaldata = this.__data__;
                donutchange = true;
                scatterchange = true;
                parallelchange = true;
                createLegend(regionaldata);
                donutChart(this.__data__);
                brushended();
                scatterPlot(this.__data__, xax, yax);
                parallelPlot(this.__data__.values);
            })
            .on('mouseup', function() {
                d3.select(this).style("opacity", 0.3);
            });
        })
}

function donutChart(d) {


    if (donutchange == true) {
        document.getElementById("donut").innerHTML = "";
        document.getElementById("legend").innerHTML = "";
    }

    var region = d.key;
    var colleges = d.values;

    var nestedByLocale = d3.nest()
        .key(function(colleges) {
            return colleges['Locale'];
        })
        .entries(colleges);

    var regions = nestedByLocale.map(function(d) {
        return d.key;
    })

    //console.log(nestedByLocale);
    //console.log(regions);
    createLegend(regions);

    var total = 0;

    nestedByLocale.forEach(function(e) {
        //console.log(e.key);
        total += e.values.length;
        //console.log(e.values.length);
    })

    //console.log(total);
    var percentages = [];

    nestedByLocale.forEach(function(e) {
        var obj = {}
        var p = (e.values.length/total)*100;
        obj[e.key] = p.toFixed(1);
        percentages.push(obj);
    })

    //console.log(percentages[0].value);


    var width = 300,
        height = 300,
        radius = 120
        innerradius = 75;

    const pietooltip = d3.select("#donut")
        .append("div")
        .attr("class", "pietooltip")
        .style("opacity", 0);

    var svg = d3.select("#donut")
        .append("svg")
        .attr("width", width-20)
        .attr("height", height-20)
        .append("g")
        .attr("transform", "translate(150," + height/2 + ")");

   svg.append("text")
        .attr("text-anchor", "middle")
        .text(function() {
            if (region != "ALL")
                return region;
        })

    var pie = d3.pie()
        .value(function(d, i) {
            return d.values.length;
        });
    var data_ready = pie(nestedByLocale);
    //console.log(data_ready)


    var slice = svg.selectAll('path')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', d3.arc()
            .innerRadius(innerradius)
            .outerRadius(radius)
        )
        .attr("id", "slice")
        .attr('fill', function(d) {
            return color(d.data.key);
        })
        .style("opacity", 0.8)
        .on("mousemove", function(d) {
            if (!click) {
                d3.select(this).style("opacity", 1.0);
                pietooltip.style('opacity', 0.9);
                pietooltip.html("" + d.data.key)
                    .style('left', d3.event.pageX + 'px')
                    .style('top', d3.event.pageY - 28 + 'px');
                if (brush) {
                    HighLightBrushedCircles(d.data.key);
                } else {
                    HighlightCircle(d.data.key);
                }
            }
        })
        .on("mouseleave", function() {
            if (!click) {
                d3.select(this).style("opacity", 0.8);
                pietooltip.style('opacity', 0);
                if (!click) {
                    if (brush) {
                        unHighlightBrushedCircles();
                    } else {
                    unHighlightCircle();
                    }
                }
            }
        })
        .on("click", function(d) {
            if (!brush) {
                pietooltip.style('opacity', 0);
                if (click) {
                    d3.selectAll("#slice").style("stroke", "none");
                    d3.select(this).style("opacity", 0.8);
                    click = false;
                    unHighlightCircle();
                } else {
                    d3.select(this).style("opacity", 1)
                                .style("stroke", "black")
                                .style("stroke-width", 0.5);
                    click = true;
                    HighLightBrushedCircles(d.data.key);
                }
            }

        })
        
    var arcGenerator = d3.arc()
        .innerRadius(innerradius)
        .outerRadius(radius);

    svg.selectAll('blah')
        .data(data_ready)
        .enter()
        .append('text')
        .text(function(d, i){
            if (percentages[i][d.data.key] > 5) { 
                return percentages[i][d.data.key] + "%"
            }
        })
        .attr("transform", function(d) { return "translate(" + arcGenerator.centroid(d) + ")";  })
        .style("text-anchor", "middle")
        .style("font-size", 9)
        .style("fill", "white")
}

function HighlightCircle(locale){
    d3.selectAll("circle").attr("visibility", function(d) {
        if (d['Locale'] == locale) {
            return "visible";
        } else {
            return "hidden";
        }
    })
}

function unHighlightCircle() {
    //d3.selectAll("circle").style("opacity", 1)
    d3.selectAll("circle").attr("visibility", "visible")
}

function HighLightBrushedCircles(locale) {
    d3.selectAll("circle.brushed").style("opacity", function(d) {
        if (d['Locale'] == locale) {
            return 1;
        } else {
            return 0.05;
        }
    }) 
}

function unHighlightBrushedCircles() {
    d3.selectAll("circle.brushed").style("opacity", 1);
}

var brush = false;

function scatterPlot(colleges, xaxis, yaxis) {

    var margin = {top: 10, right: 10, bottom: 40, left: 30},
        width = 700 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;


    if (scatterchange == true) {
        document.getElementById("scatter").innerHTML = "";
    }

    var list = colleges.values;
    var filtered = list.filter(function(d) {
        return (d[xaxis] != 0) && (d[yaxis] != 0);
    })

    var scatterplot = d3.select("#scatter")
        .append("svg")
        .attr("width", width+90)
        .attr("height", height+margin.top+margin.bottom)
        .append("g")
        .attr("transform", "translate(40, 10)")

    
    var x = d3.scaleLinear()
        .domain(d3.extent(filtered, function(d) {
            return +d[xaxis];
        }))
        .range([0, width]);
    scatterplot.append("g")
        .attr("transform", "translate(0," + (height+10) + ")")
        .call(d3.axisBottom(x).tickSize(0).ticks(10))
        .append("text")
        .attr("transform", "translate(" + width + ", -2)")
        .style("fill", "black")
        .style("text-anchor", "end")
        .text(xax);
    
    var y = d3.scaleLinear()
        .domain(d3.extent(filtered, function(d) {
            return +d[yaxis];
        }))
        .range([height, 0]);  
    scatterplot.append("g")
        .call(d3.axisLeft(y).tickSize(0).ticks(10))
        .attr("transform", "translate(-20, 0)")
        .append("text")
        .attr("transform", "translate(10, 0) rotate(-90)")
        .style("fill", "black")
        .style("text-anchor", "end")
        .text(yax);
    
    scatterplot.append("g")
        .selectAll("dot")
        .data(filtered)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            return x(d[xaxis]);
        })
        .attr("cy", function(d) {
            return y(d[yaxis]);
        })
        .attr("r", 4)
        .attr('fill', function(d) {
            return color(d['Locale']);
        })

    scatterplot.append("g")
        .call(d3.brush()
        .extent([[-15, -15], [width+25, height+25]])
        .on("brush", brushed)
        .on("end", brushended));

    function brushed() {

        brush = true;
        //console.log(brush);

        var s = d3.event.selection,
            x0 = s[0][0],
            y0 = s[0][1],
            dx = s[1][0] - x0,
            dy = s[1][1] - y0;

        if (!click) {
            scatterplot.selectAll('circle')
                    .style("opacity", function (d) {
                        if (x(d[xaxis]) >= x0 && x(d[xaxis]) <= x0 + dx && y(d[yaxis]) >= y0 && y(d[yaxis]) <= y0 + dy) { 
                            return 1; 
                        }
                        else { 
                            return 0.1; 
                        }
                    })
                    .attr("class", function (d) {
                        if (x(d[xaxis]) >= x0 && x(d[xaxis]) <= x0 + dx && y(d[yaxis]) >= y0 && y(d[yaxis]) <= y0 + dy) { 
                            return 'brushed'; 
                        } else {
                            return 'notbrushed'
                        }
                    });

            highlightLines();
        } else {
            scatterplot.selectAll('circle')
                .style("opacity", function (d) {
                    if (d3.select(this).attr("visibility") == "visible") {
                        if (x(d[xaxis]) >= x0 && x(d[xaxis]) <= x0 + dx && y(d[yaxis]) >= y0 && y(d[yaxis]) <= y0 + dy) { 
                            return 1; 
                        }
                        else { 
                            return 0.1; 
                        }
                    }
                })
                .attr("class", function (d) {
                    if (d3.select(this).attr("visibility") == "visible") {
                        if (x(d[xaxis]) >= x0 && x(d[xaxis]) <= x0 + dx && y(d[yaxis]) >= y0 && y(d[yaxis]) <= y0 + dy) { 
                            return 'brushed'; 
                        } else {
                            return 'notbrushed'
                        }
                    }
                });
            
            highlightLines();
        }
    }


    function brushended() {
        if (!d3.event.selection) {
            brush = false;
            resetLines();
            scatterplot.selectAll('circle')
                .style("opacity", 1)
                .attr("class", 'notbrushed');

        }
    }

}

function brushended() {
        brush = false;
        resetLines();
        d3.selectAll('circle')
            .style("opacity", 1)
            .attr("class", 'notbrushed');

    }

function highlightLines() {

    var colleges =  d3.selectAll(".brushed").data();

    var nestedNames = d3.nest()
            .key(function(colleges) {
                return colleges['Name'];
            })
            .entries(colleges);
    var e = nestedNames.map(function(i) {
        return i.key;
    })

    d3.selectAll(".paraline")
      .style("opacity", function(d) {
          if (e.includes(d['Name'])) {
              return 1;
          } else {
              return 0.005;
          }
      })
      .attr("visibility", function(d) {
        if (e.includes(d['Name'])) {
            return "visible";
        } else {
            return "hidden";
        }
      })
      .attr("stroke-width", 3)
      .attr("class", function(d) {
        if (e.includes(d['Name'])) {
            return "paraline highlighted";
        } else {
            return "paraline normal";
        }
      })

    const tooltip = d3.select("#parallel")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);


    d3.selectAll(".paraline").filter(".highlighted")
        .on("mouseover", function(d) {

            d3.select(this).style("opacity", "0.3");
            tooltip.transition()
                .duration(200)
                .style('opacity', 0.9);
            tooltip.html(d['Name'] + 
                        '<br>' + 'Admission Rate: ' + d['Admission Rate'] +
                        '<br>' + 'Average Cost: ' + d['Average Cost'])
                .style('left', d3.event.pageX + 'px')
                .style('top', d3.event.pageY - 28 + 'px');
                })
        .on("mouseleave", function(d) {
            d3.select(this).style("opacity", "1");
            tooltip.transition()
                .duration(200)
                .style('opacity', 0);
        });

}

function resetLines() {
    d3.selectAll(".paraline")
      .style("opacity", 0.4)
      .attr("stroke-width", 1)
      .attr("visibility", "visible")
      .attr("class", "paraline normal");
}

function parallelPlot(coll) {

    var colleges = coll.filter(function(d) {
        return (d[xax] != 0) && (d[yax] != 0);
    })

    var margin = {top: 10, right: 10, bottom: 0, left: 50},
        width = 1200,
        height = 250;


    if (parallelchange == true) {
        document.getElementById("parallel").innerHTML = "";
    }

    var parallel = d3.select("#parallel")
        .append("svg")
        .attr("width", width+40)
        .attr("height", height+30)
        .attr("id", "parallelcontainer")
        .append("g")
        .attr("width", width)
        .attr("height", height-100)
        .attr("transform", "translate(" + margin.left + ", 20)");
    
    var dimensions = ["% White", "% Asian", "% Black", "% American Indian", "% Hispanic", "% Pacific Islander", "% Biracial"];

    var y = {}
    for (i in dimensions) {
        var name = dimensions[i];
        y[name] = d3.scaleLinear()
            .domain([0, 1])
            .range([height, 0]);
    }

    var x = d3.scalePoint()
        .range([0, width-60])
        .domain(dimensions);

    function path(d) {
        return d3.line()(dimensions.map(function(p) {
            return [x(p), y[p](d[p])];
        }))
    }

    parallel.selectAll("myAxis")
        .data(dimensions)
        .enter()
        .append("g")
        .attr("transform", function(d) { 
            return "translate(" + x(d) + ")"; 
        })
        .each(function(d) { 
            if (d == "% White") {
                d3.select(this).call(d3.axisLeft()
                                    .ticks(8)
                                    .tickSize(15)
                                    .scale(y[d])); 
            } else {
                d3.select(this).call(d3.axisLeft()
                                    .ticks(0)
                                    .tickSize(0)
                                    .scale(y[d])); 
            }
        })
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function(d) { return d; })
        .style("fill", "black");

    parallel.selectAll("myPath")
        .data(colleges)
        .enter()
        .append("path")
        .attr("d",  path)
        .attr("class", "paraline")
        .style("fill", "none")
        .style("stroke", function(d) {
            return color(d['Locale']);
        })
        .style("opacity", 0.4)

}

function createLegend(names) {

    //console.log(names);

    var container = d3.select("#legend").append("svg")
        .attr("width", 150)
        .attr("height", 250);

    //var svg = container.append("svg");


    var size = 13;
    var each = container.selectAll("squares")
        .data(names)
        .enter()
        .append("g")
        .attr("y", function(d,i) { 
            return i*(size)
        })

    each.append("rect")
        .attr("x", 15)
        .attr("y", function(d,i) { 
            return i*(size+5)
        })
        .style("fill",function(d) {
            return color(d);
        })
        .attr("width", size)
        .attr("height", size)
        .attr("class", "legendsquare")

    each.append("text")
        .attr("x", 40)
        .attr("y", function(d,i) { 
            return i*(size+5)+(size/2)+2;
        })
        .style("font-size", 11)
        .text(function(d) {
            return d;
        })
        .attr("text-anchor", "left")
        .attr("class", "legendtext")
        .style("alignment-baseline", "middle")

}
