function whenDocumentLoaded(action) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", action);
    } else {
        // `DOMContentLoaded` already fired
        action();
    }
}
whenDocumentLoaded(() => {
    console.log('DOM loaded');
    d3.csv("./data/stacked_movies_awards.csv").then(function (text) {
        preprocessCountrySelection(text)
        stackedArea(text)
        stackedAreaAwards(text)
    });

});

function preprocessCountrySelection(data) {
    groupCountry = d3.group(data, d => d.country);
    var countries = Array.from(groupCountry.keys());
    countries = countries.sort()
    console.log(countries)
    selector = document.getElementById('country_selection')
    countries.forEach(c => {
        newOption = document.createElement('option');
        newOption.setAttribute('value', c)
        newOption.innerHTML = c
        selector.appendChild(newOption)
    });
}


/*
* Map of form (Genre -> (Year -> value))
*/
function getMaxValue(data) {
    max = 0;
    data.forEach(g => {
        g.forEach(v => {
            maxY = Math.max(v)
            if (maxY > max) {
                max = maxY
            }
        })
    });
    return max;
}

function stackedAreabyCountry(country) {
    console.log("called with:")
    console.log(country)
    d3.csv("./data/stacked_movies_awards.csv").then(function (text) {

        //filter the country here
        if (country != "") {
            text = text.filter(d => d.country == country)
        }
        //clear svg
        d3.select("#stackedArea > *").remove()
        d3.select("#stackedAreaAwards > *").remove()
        stackedArea(text)
        stackedAreaAwards(text)
    });
}

function stackedArea(data) {
    console.log(data)
    // List of genre
    groupGenre = d3.group(data, d => d.genre);
    var keys = Array.from(groupGenre.keys());

    //Data by year then genre with values
    groupbyYearthenGenre = d3.rollup(data, v => v.length, d => d.year, d => d.genre);
    console.log(groupbyYearthenGenre)

    result = mapToArray(groupbyYearthenGenre);
    function mapToArray(map) {
        result = []
        map.forEach((v, i, a) => {
            o = {}
            o["year"] = i
            keys.forEach(genre => {
                if (v.has(genre)) {
                    o[genre] = v.get(genre)
                }
                else {
                    o[genre] = 0
                }
            })
            result.push(o)
        });
        return result.sort((a, b) => a.year - b.year)
    }
    console.log(result)
    //stack the data
    var stackedData = d3.stack().keys(keys)(result);


    // set the dimensions and margins of the graph
    var margin = { top: 20, right: 90, bottom: 30, left: 55 },
        width = 500 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#stackedArea")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


    // Add X axis
    var x = d3.scaleLinear()
        .domain(d3.extent(data, function (d) { return d.year; }))
        .range([0, width]);
    var xAxis = svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(5));

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + 25)
        .style('fill', 'white')
        .style('font-size', '10px')
        .text("Time (year)");

    // Add Y axis + get the max value of the map
    var y = d3.scaleLinear()
        .domain([0, d3.max(stackedData, d => d3.max(d, d => d[1]))]).nice()
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));
    svg.append("text")
        .attr("text-anchor", "start")
        .attr("x", 0)
        .attr("y", -10)
        .style('fill', 'white')
        .style('font-size', '10px')
        .text("Number of films produced");

    // color palette
    var color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemePaired);


    //Highlit a group (reduce all opacity except of the group you want)
    var highlight = function (d) {
        console.log(d)
        d3.select("#stackedArea").selectAll(".myArea")
            .style("opacity", .1)
        d3.select("#stackedArea").select("." + d)
            .style("opacity", 1)
    }

    // And when it is not hovered anymore
    var noHighlight = function (d) {
        d3.select("#stackedArea").selectAll(".myArea").style("opacity", 1)
    }

    //Add a legend + color plot associated
    var size = 10
    svg.selectAll("myrect")
        .data(keys)
        .enter()
        .append("rect")
        .attr("x", width + 15)
        .attr("y", function (d, i) { return 10 + i * (size + 5) })
        .attr("width", size)
        .attr("height", size)
        .style("fill", function (d) { return color(d) })
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)

    svg.selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
        .attr("x", width + 15 + size * 1.3)
        .attr("y", function (d, i) { return 10 + i * (size + 5) + (size / 2) }) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function (d) { return color(d) })
        .text(function (d) { return d })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .style("font-size", '10px')
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)


    var areaChart = svg.append('g')
        .attr("clip-path", "url(#clip)")


    // Show the areas

    var area = d3.area()
        .x(function (d, i) { return x(d.data.year); })
        .y0(function (d) { return y(d[0]) })
        .y1(function (d) { return y(d[1]) })

    areaChart
        .selectAll("mylayers")
        .data(stackedData)
        .enter()
        .append("path")
        .attr("class", function (d) { return "myArea " + d.key })
        .style("fill", function (d) { return color(d.key); })
        .attr("d", area
        )
        .append("title")
        .text(({ key }) => key)


    //Brush

    //everything around is not drawn
    svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", 0)
        .attr("y", 0)

    var brush = d3.brushX()
        .extent([[0, 0], [width, height]])
        .on("end", updateChart)

    areaChart.append("g")
        .attr("class", "brush")
        .call(brush);

    var idleTimeout
    function idled() {
        idleTimeout = false;
    }

    function updateChart() {
        extent = d3.event.selection
        // If no selection, back to initial coordinate. Otherwise, update X axis domain
        if (!extent) {
            if (!idleTimeout) return idleTimeout = setTimeout(idled, 3000);
            console.log('no extend')
            x.domain(d3.extent(data, function (d) { return d.year; }))
        } else {
            console.log('extend')
            x.domain([x.invert(extent[0]), x.invert(extent[1])])
            areaChart.select(".brush").call(brush.move, null)

        }

        // Update axis and area position
        xAxis.transition().duration(1000).call(d3.axisBottom(x).ticks(5))
        areaChart
            .selectAll("path")
            .transition().duration(1000)
            .attr("d", area)
    }

}

function stackedAreaAwards(data) {
    console.log(data)
    // List of genre

    var keys = ['Primary', 'Secondary', 'No_award'];

    //Data by year then genre with values
    groupbyYear = d3.group(data, d => d.year);

    result = mapToArray(groupbyYear);
    function mapToArray(map) {
        result = []
        map.forEach((v, i, a) => {
            o = {}
            //initialize
            o["year"] = i
            keys.forEach(price => {
                o[price] = 0;
            })
            v.forEach(s => {
                if (s.isSecondary == "True") {
                    o['Secondary'] += 1
                }
                else if (s.isPrimary == "True") {
                    o['Primary'] += 1
                }
                else {
                    o['No_award'] += 1
                }
            })
            result.push(o)
        });
        console.log(result)
        return result.sort((a, b) => a.year - b.year)
    }
    console.log(result)
    //stack the data
    var stackedData = d3.stack().keys(keys)(result);


    // set the dimensions and margins of the graph
    var margin = { top: 20, right: 90, bottom: 30, left: 55 },
        width = 500 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#stackedAreaAwards")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


    // Add X axis
    var x = d3.scaleLinear()
        .domain(d3.extent(data, function (d) { return d.year; }))
        .range([0, width]);
    var xAxis = svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(5));

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + 25)
        .style('fill', 'white')
        .style('font-size', '10px')
        .text("Time (year)");

    // Add Y axis + get the max value of the map
    var y = d3.scaleLinear()
        .domain([0, d3.max(stackedData, d => d3.max(d, d => d[1]))]).nice()
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));
    svg.append("text")
        .attr("text-anchor", "start")
        .attr("x", 0)
        .attr("y", -10)
        .style('fill', 'white')
        .style('font-size', '10px')
        .text("Number of awards received by film produced");

    // color palette
    var color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemePaired);


    //Highlit a group (reduce all opacity except of the group you want)
    var highlight = function (d) {
        console.log(d)
        d3.select("#stackedAreaAwards").selectAll(".myArea")
            .style("opacity", .1)
        d3.select("#stackedAreaAwards").select("." + d)
            .style("opacity", 1)
    }

    // And when it is not hovered anymore
    var noHighlight = function (d) {
        d3.select("#stackedAreaAwards").selectAll(".myArea").style("opacity", 1)
    }

    //Add a legend + color plot associated
    var size = 10
    svg.selectAll("myrect")
        .data(keys)
        .enter()
        .append("rect")
        .attr("x", width + 15)
        .attr("y", function (d, i) { return 10 + i * (size + 5) })
        .attr("width", size)
        .attr("height", size)
        .style("fill", function (d) { return color(d) })
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)

    svg.selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
        .attr("x", width + 15 + size * 1.3)
        .attr("y", function (d, i) { return 10 + i * (size + 5) + (size / 2) }) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function (d) { return color(d) })
        .text(function (d) { return d })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .style("font-size", '10px')
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)


    var areaChart = svg.append('g')
        .attr("clip-path", "url(#clip)")


    // Show the areas

    var area = d3.area()
        .x(function (d, i) { return x(d.data.year); })
        .y0(function (d) { return y(d[0]) })
        .y1(function (d) { return y(d[1]) })

    areaChart
        .selectAll("mylayers")
        .data(stackedData)
        .enter()
        .append("path")
        .attr("class", function (d) { return "myArea " + d.key })
        .style("fill", function (d) { return color(d.key); })
        .attr("d", area)
        .append("title")
        .text(({ key }) => key)


    //Brush

    //everything around is not drawn
    svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", 0)
        .attr("y", 0)

    var brush = d3.brushX()
        .extent([[0, 0], [width, height]])
        .on("end", updateChart)

    areaChart.append("g")
        .attr("class", "brush")
        .call(brush);

    var idleTimeout
    function idled() {
        idleTimeout = false;
    }

    function updateChart() {
        extent = d3.event.selection
        // If no selection, back to initial coordinate. Otherwise, update X axis domain
        if (!extent) {
            if (!idleTimeout) return idleTimeout = setTimeout(idled, 3000);
            console.log('no extend')
            x.domain(d3.extent(data, function (d) { return d.year; }))
        } else {
            console.log('extend')
            x.domain([x.invert(extent[0]), x.invert(extent[1])])
            areaChart.select(".brush").call(brush.move, null)

        }

        // Update axis and area position
        xAxis.transition().duration(1000).call(d3.axisBottom(x).ticks(5))
        areaChart
            .selectAll("path")
            .transition().duration(1000)
            .attr("d", area)
    }



}

