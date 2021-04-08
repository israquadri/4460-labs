// **** Your JavaScript code goes here ****

d3.csv('baseball_hr_leaders.csv').then(function(leaders) {
    var p = d3.select("svg").selectAll("circle")
    .data(leaders)
    .enter()
    .append("circle")
    .attr("r", 2)
    .attr("cx", function(d, i) {
        return scaleYear(d.year);
    })
    .attr("cy", function(d, i) {
        return scaleHomeruns(d.homeruns);
    });

    var labels = d3.select("svg").selectAll("g.group")
    .data(leaders)
    .enter()
    .append("g")
    .attr("transform", function(d, i) {
        return "translate(" + scaleYear(d.year) + ", " + scaleHomeruns(d.homeruns) + ")";
    })

    var i = labels.append("text")
    .attr('class', 'hoverlabel')
    .text(function(d) { return d.name })
    .attr('dy', -5)
    .attr('dx', -25);

    var h = labels.append("circle")
    .attr('class', 'hovercircle')
    .attr("r", 2);

});


// **** Functions to call for scaled values ****

function scaleYear(year) {
    return yearScale(year);
}

function scaleHomeruns(homeruns) {
    return hrScale(homeruns);
}

// **** Code for creating scales, axes and labels ****

var yearScale = d3.scaleLinear()
    .domain([1870,2017]).range([60,700]);

var hrScale = d3.scaleLinear()
    .domain([0,75]).range([340,20]);

var svg = d3.select('svg');

svg.append('g').attr('class', 'x axis')
    .attr('transform', 'translate(0,345)')
    .call(d3.axisBottom(yearScale).tickFormat(function(d){return d;}));

svg.append('text')
    .attr('class', 'label')
    .attr('transform','translate(360,390)')
    .text('MLB Season');

svg.append('g').attr('class', 'y axis')
    .attr('transform', 'translate(55,0)')
    .call(d3.axisLeft(hrScale));

svg.append('text')
    .attr('class', 'label')
    .attr('transform','translate(15,200) rotate(90)')
    .text('Home Runs (HR)');

svg.append('text')
    .attr('class', 'title')
    .attr('transform','translate(360,30)')
    .text('Top 10 HR Leaders per MLB Season');