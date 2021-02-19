
// **** Your JavaScript code goes here ****

d3.csv('baseball_hr_leaders_2017.csv').then(function(leaders) {
    var p = d3.select("#homerun-leaders").selectAll("p")
	.data(leaders)
	.enter()
	.append("p")
	.text(function(d, i) {
        return (d.rank + ". " + d.name + " with " + d.homeruns + " homeruns");
    })
	.style('font-weight', function(d) {
		return d.rank == '1' ? 'bold' : 'normal';
	});

	var tablerows = d3.select("tbody").selectAll("tr")
	.data(leaders)
	.enter()
	.append("tr");

	tablerows.append('td').html(function(d) {
		return d.rank;
	})

	tablerows.append('td').html(function(d) {
		return d.name;
	})

	tablerows.append('td').html(function(d) {
		return d.homeruns;
	})

})