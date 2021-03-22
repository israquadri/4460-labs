// Global function called when select element is changed
function onCategoryChanged() {
    var select = d3.select('#categorySelect').node();
    // Get current value of select element
    var category = select.options[select.selectedIndex].value;
    // Update chart with the selected category of letters
    updateChart(category);
}

// recall that when data is loaded into memory, numbers are loaded as strings
// this function helps convert numbers into string during data preprocessing
function dataPreprocessor(row) {
    return {
        letter: row.letter,
        frequency: +row.frequency
    };
}

var svg = d3.select('svg');

// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 60, r: 40, b: 30, l: 40};

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

// Compute the spacing for bar bands based on all 26 letters
var barBand = chartHeight / 26;
var barHeight = barBand * 0.7;

// Create a group element for appending chart elements
var chartG = svg.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');

// A map with arrays for each category of letter sets
var lettersMap = {
    'all-letters': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    'only-consonants': 'BCDFGHJKLMNPQRSTVWXZ'.split(''),
    'only-vowels': 'AEIOUY'.split('')
};

var letters;

d3.csv('letter_freq.csv', dataPreprocessor).then(function(dataset) {
    // Create global variables here and intialize the chart
    
    letters = dataset;

    // Update the chart for all letters to initialize
    updateChart('all-letters');
});

function updateChart(filterKey) {
    // Create a filtered array of letters based on the filterKey
    var filteredLetters = letters.filter(function(d){
        return lettersMap[filterKey].indexOf(d.letter) >= 0;
    });

    //console.log(filteredLetters);
    //console.log(letters);

    // **** Draw and Update your chart here ****

    var widthScale = d3.scaleLinear()
        .domain([0, 0.13])
        .range([0, chartWidth]);

    var bandScale = d3.scaleBand()
        .domain(lettersMap["all-letters"])
        .range([0, chartHeight]);

    chartG.selectAll('.bar')
        .data(filteredLetters)
        .enter()
        .append('rect')
        .attr("class", "bar")
        .attr("height", barHeight)
        .attr("width", function(d) {
            return widthScale(d.frequency);
        })
        .attr("y", function(d) {
            return bandScale(d.letter);
        })
        .attr("fill", "black");

    var y = d3.scaleBand()
        .range([0, chartHeight])
        .domain(filteredLetters.map(function(d) {
            return d.letter;
        }));
    
    var yAxisGenerator = 
        d3.axisLeft(y)
        .tickSize(0)
        .tickPadding(9);

    chartG.append("g")
        .call(yAxisGenerator)
        .select('.domain').remove();

    var x = d3.scaleLinear()
        .domain([0, 12])
        .range([0, chartWidth]);

    chartG.append("g")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(d3.axisBottom(x).ticks(6).tickFormat(function(d) {
            return d + "%";
        }))
        .attr('class', 'xaxis');

    chartG.append("g")
        .attr("transform", "translate(0, -4)")
        .call(d3.axisTop(x).ticks(6).tickFormat(function(d) {
            return d + "%";
         }))
        .attr('class', 'xaxis');

    chartG.append('text')
         .attr("transform", "translate(60, -35)")
         .attr("class", "title")
         .text('Letter Frequency (%)');
}

// Remember code outside of the data callback function will run before the data loads