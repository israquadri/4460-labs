// **** Example of how to create padding and spacing for trellis plot****
var svg = d3.select('svg');

// Hand code the svg dimensions, you can also use +svg.attr('width') or +svg.attr('height')
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

// Define a padding object
// This will space out the trellis subplots
var padding = {t: 20, r: 20, b: 60, l: 60};

// Compute the dimensions of the trellis plots, assuming a 2x2 layout matrix.
trellisWidth = svgWidth / 2 - padding.l - padding.r;
trellisHeight = svgHeight / 2 - padding.t - padding.b;

// As an example for how to layout elements with our variables
// Lets create .background rects for the trellis plots
svg.selectAll('.background')
    .data(['A', 'B', 'C', 'C']) // dummy data
    .enter()
    .append('rect') // Append 4 rectangles
    .attr('class', 'background')
    .attr('width', trellisWidth) // Use our trellis dimensions
    .attr('height', trellisHeight)
    .attr('transform', function(d, i) {
        // Position based on the matrix array indices.
        // i = 1 for column 1, row 0)
        var tx = (i % 2) * (trellisWidth + padding.l + padding.r) + padding.l;
        var ty = Math.floor(i / 2) * (trellisHeight + padding.t + padding.b) + padding.t;
        return 'translate('+[tx, ty]+')';
    });

var parseDate = d3.timeParse('%b %Y');
// To speed things up, we have already computed the domains for your scales
var dateDomain = [new Date(2000, 0), new Date(2010, 2)];
var priceDomain = [0, 223.02];

// **** How to properly load data ****

d3.csv('stock_prices.csv').then(function(dataset) {

    for (var i = 0; i < dataset.length; i++) {
        dataset[i].date = parseDate(dataset[i].date);
        //console.log(dataset[i].date);
    }

    var nested = d3.nest()
        .key(function(dataset) {
            return dataset.company;
        })
        .entries(dataset);

    //console.log(nested);

    var trellises = svg.selectAll('g')
        .data(nested)
        .enter()
        .append('g')
        .attr('class', 'trellis')
        .attr('transform', function(d, i) {
            var tx = (i % 2) * (trellisWidth + padding.l + padding.r) + padding.l;
            var ty = Math.floor(i / 2) * (trellisHeight + padding.t + padding.b) + padding.t;
            return 'translate('+[tx, ty]+')';
        })

    var xScale = d3.scaleTime()
        .domain(dateDomain)
        .range([0, trellisWidth]);

    var yScale = d3.scaleLinear()
        .domain(priceDomain)
        .range([trellisHeight, 0]);

    var xGrid = d3.axisTop(xScale)
        .tickSize(-trellisHeight, 0, 0)
        .tickFormat('');

    var yGrid = d3.axisLeft(yScale)
        .tickSize(-trellisWidth, 0, 0)
        .tickFormat('');

    trellises.append('g')
        .call(xGrid)
        .attr('class', 'x grid');

    trellises.append('g')
        .call(yGrid)
        .attr('class', 'y grid');

    const lineInterpolate = d3.line()
        .x(function(d) {
            return xScale(d.date);
        })
        .y(function(d) {
            return yScale(d.price);
        });

    var companies = nested.map(function(d) {
        return d.key;
    });

    var colorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(companies);

    trellises.append('path')
        .attr('class', 'line-plot')
        .attr('d', function(d) {
            return lineInterpolate(d.values);
        })
        .attr('stroke', function(d) {
            return colorScale(d.key);
        });

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    trellises.append('g')
        .call(xAxis)
        .attr('class', 'x axis')
        .attr('transform', function() {
            return 'translate('+0+', '+trellisHeight+')';
        });

    trellises.append('g')
        .call(yAxis)
        .attr('class', 'y axis');

    trellises.append('text')
        .attr('class', 'company-label')
        .style('fill', function(d) {
            return colorScale(d.key);
        })
        .text(function(d) {
            return d.key;
        })
        .attr('transform', function() {
            var tx = trellisWidth/2;
            var ty = trellisHeight/2;
            return 'translate('+[tx, ty]+')';
        });

    trellises.append('text')
        .attr('class', 'x axis-label')
        .text('Date (by Month)')
        .attr('transform', function() {
            var tx = trellisWidth/2;
            var ty = trellisHeight + 34;
            return 'translate('+[tx, ty]+')';
        });

    trellises.append('text')
        .attr('class', 'y axis-label')
        .text('Stock Price (USD)')
        .attr('transform', function() {
            var tx = -35;
            var ty = trellisHeight/2;
            return 'translate('+[tx, ty]+') rotate(-90)';
        });

});

// Remember code outside of the data callback function will run before the data loads