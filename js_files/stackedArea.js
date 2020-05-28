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
    d3version5.csv("./data/stacked_movies.csv").then(function (text) {
        preprocessCountrySelection(text)
        stackedArea(text)

    });
    d3version5.csv("./data/stacked_movies_awards.csv").then(function (text) {
        stackedAreaAwards(text)
    })

});

function preprocessCountrySelection(data) {
    groupCountry = d3version5.group(data, d => d.country);
    var countries = Array.from(groupCountry.keys());
    countries = countries.sort()
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

// global variable
var byPercent = false;
var country = "";

function stackedAreabyCountry(country) {
    this.country = country
    d3version5.csv("./data/stacked_movies.csv").then(function (text) {

        //filter the country here
        if (this.country != "") {
            text = text.filter(d => d.country == this.country)
        }
        //clear svg
        d3version5.select("#stackedArea > *").remove()
        stackedArea(text)

    });
    d3version5.csv("./data/stacked_movies_awards.csv").then(function (text) {
        //filter the country here
        if (this.country != "") {
            text = text.filter(d => d.country == this.country)
        }
        //clear svg
        d3version5.select("#stackedAreaAwards > *").remove()
        stackedAreaAwards(text)
    });
}

function stackedArea(data) {
    // List of genre
    groupGenre = d3version5.group(data, d => d.genre);
    var keys = Array.from(groupGenre.keys()).sort();

    //Data by year then genre with values
    groupbyYearthenGenre = d3version5.rollup(data, v => v.length, d => d.year, d => d.genre);

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
    //stack the data
    if (byPercent) {
        var stackedData = d3version5.stack().keys(keys).offset(d3version5.stackOffsetExpand)(result);
    }
    else {
        var stackedData = d3version5.stack().keys(keys).offset(d3version5.stackOffsetDiverging)(result);
    }


    // set the dimensions and margins of the graph
    var margin = { top: 20, right: 90, bottom: 30, left: 55 },
        width = 500 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3version5.select("#stackedArea")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Add X axis
    var x = d3version5.scaleLinear()
        .domain(d3version5.extent(data, function (d) { return d.year; }))
        .range([0, width]);
    var xAxis = svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", 'axis')
        .call(d3version5.axisBottom(x).tickFormat(d3version5.format("d")));

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + 25)
        .style('fill', 'black')
        .style('font-size', '10px')
        .text("Time (year)");

    // Add Y axis + get the max value of the map
    var y = d3version5.scaleLinear()
        .domain([0, parseInt(d3version5.max(stackedData, d => d3version5.max(d, d => d[1])))]).nice()
        .range([height, 0]);
    var yAxis = svg.append("g")
        .attr("class", 'axis')
        .call(d3version5.axisLeft(y));
    svg.append("text")
        .attr("text-anchor", "start")
        .attr("x", 0)
        .attr("y", -10)
        .style('fill', 'black')
        .style('font-size', '10px')
        .text("Number of duo films-genre produced");

    // color palette
    var color = d3version5.scaleOrdinal()
        .domain(keys)
        .range(d3version5.schemePaired);


    //Highlit a group (reduce all opacity except of the group you want)
    var highlight = function (d) {
        d3version5.select("#stackedArea").selectAll(".myArea")
            .style("opacity", .1)
        d3version5.select("#stackedArea").select("." + d)
            .style("opacity", 1)
    }

    // And when it is not hovered anymore
    var noHighlight = function (d) {
        d3version5.select("#stackedArea").selectAll(".myArea").style("opacity", 1)
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
        .style("fill", 'black')
        .text(function (d) { return d })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .style("font-size", '10px')
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)


    var areaChart = svg.append('g')
        .attr("clip-path", "url(#clip)")


    // Show the areas
    var area = d3version5.area()
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

    var brush = d3version5.brushX()
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
        extent = d3version5.event.selection
        // If no selection, back to initial coordinate. Otherwise, update X axis domain
        if (!extent) {
            if (!idleTimeout) return idleTimeout = setTimeout(idled, 3000);
            x.domain(d3version5.extent(data, function (d) { return d.year; }))
        } else {
            x.domain([x.invert(extent[0]), x.invert(extent[1])])
            areaChart.select(".brush").call(brush.move, null)

        }

        // Update axis and area position
        xAxis.transition().duration(1000).call(d3version5.axisBottom(x).tickFormat(d3version5.format("d")))
        areaChart
            .selectAll("path")
            .transition().duration(1000)
            .attr("d", area)
    }

}

function stackedAreaAwards(data) {

    // List of award (Winner is either Primary or Secondary)
    var keys = ['Primary', 'Secondary', 'No_award'];

    //Data by year then genre with values
    groupbyYear = d3version5.group(data, d => d.year);

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
                if (s.isSecondary == "TRUE") {
                    o['Secondary'] += 1
                }
                else if (s.isPrimary == "TRUE") {
                    o['Primary'] += 1
                }
                else {
                    o['No_award'] += 1
                }
            })
            result.push(o)
        });
        return result.sort((a, b) => a.year - b.year)
    }
    //stack the data
    if (byPercent) {
        var stackedData = d3version5.stack().keys(keys).offset(d3version5.stackOffsetExpand)(result);
    }
    else {
        var stackedData = d3version5.stack().keys(keys).offset(d3version5.stackOffsetDiverging)(result);
    }

    // set the dimensions and margins of the graph
    var margin = { top: 20, right: 90, bottom: 30, left: 55 },
        width = 500 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3version5.select("#stackedAreaAwards")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


    // Add X axis
    var x = d3version5.scaleLinear()
        .domain(d3version5.extent(data, function (d) { return d.year; }))
        .range([0, width]);
    var xAxis = svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", 'axis')
        .call(d3version5.axisBottom(x).tickFormat(d3version5.format("d")));

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + 25)
        .style('fill', 'black')
        .style('font-size', '10px')
        .text("Time (year)");


    // Add Y axis + get the max value of the map
    var y = d3version5.scaleLinear()
        .domain([0, d3version5.max(stackedData, d => d3version5.max(d, d => d[1]))]).nice()
        .range([height, 0]);
    var yAxis = svg.append("g")
        .attr("class", 'axis')
        .call(d3version5.axisLeft(y));
    svg.append("text")
        .attr("text-anchor", "start")
        .attr("x", 0)
        .attr("y", -10)
        .style('fill', 'black')
        .style('font-size', '10px')
        .text("Number of awards received by film produced");

    // color palette
    var color = d3version5.scaleOrdinal()
        .domain(keys)
        .range(d3version5.schemePaired);


    //Highlit a group (reduce all opacity except of the group you want)
    var highlight = function (d) {
        d3version5.select("#stackedAreaAwards").selectAll(".myArea")
            .style("opacity", .1)
        d3version5.select("#stackedAreaAwards").select("." + d)
            .style("opacity", 1)
    }

    // And when it is not hovered anymore
    var noHighlight = function (d) {
        d3version5.select("#stackedAreaAwards").selectAll(".myArea").style("opacity", 1)
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
        .style("fill", 'black')
        .text(function (d) { return d })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .style("font-size", '10px')
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)


    var areaChart = svg.append('g')
        .attr("clip-path", "url(#clip)")


    // Show the areas

    var area = d3version5.area()
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

    var brush = d3version5.brushX()
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
        extent = d3version5.event.selection
        // If no selection, back to initial coordinate. Otherwise, update X axis domain
        if (!extent) {
            if (!idleTimeout) return idleTimeout = setTimeout(idled, 3000);
            x.domain(d3version5.extent(data, function (d) { return d.year; }))
        } else {
            x.domain([x.invert(extent[0]), x.invert(extent[1])])
            areaChart.select(".brush").call(brush.move, null)

        }

        // Update axis and area position
        xAxis.transition().duration(1000).call(d3version5.axisBottom(x).ticks(5))
        areaChart
            .selectAll("path")
            .transition().duration(1000)
            .attr("d", area)
    }

    //Transition and choice Bypercent / Bycount
    d3version5.select(".need-validation").selectAll("input").on("change", handleFormClick);
    function handleFormClick() {
        byPercent = (this.value === "bypercent")
        stackedAreabyCountry(country);
    }




}
