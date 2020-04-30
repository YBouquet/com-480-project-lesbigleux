function whenDocumentLoaded(action) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", action);
    } else {
        action
    }
}


whenDocumentLoaded(() => {

    createTreeMap("#countries_cat_viz", "./famous10_countries_genre.csv")

});


function createTreeMap(svg_name, csv_filename) {
    // set the dimensions and margins of the graph
    var margin = { top: 20, right: 10, bottom: 10, left: 10 },
        width = 1000 - margin.left - margin.right,
        height = 1000 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select(svg_name)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


    // read csv data
    d3.csv(csv_filename, function (data) {

        console.log(data)

        var root = d3.stratify()
            .id(function (d) { return d.name; })   // Name of the entity (column name is name in csv)
            .parentId(function (d) { return d.parent; })   // Name of the parent (column name is parent in csv)
            (data);

        root.sum(function (d) { return +d.value })   // Compute the numeric value for each entity

        // prepare a color scale
        var color = d3.scaleOrdinal()
            .domain(['Biography', 'Crime', 'Drama', 'History', 'Adventure', 'Fantasy',
                'Romance', 'War', 'Mystery', 'Horror', 'Western', 'Comedy',
                'Family', 'Action', 'Sci-Fi', 'Thriller', 'Sport', 'Animation',
                'Musical', 'Music', 'Film-Noir', 'Adult', 'Documentary',
                'Reality-TV', 'Game-Show', 'News'])
            .range(d3.schemeSet2)

        // And a opacity scale
        var opacity = d3.scaleLinear()
            .domain([30, 1000])
            .range([.5, 1])

        // Then d3.treemap computes the position of each element of the hierarchy
        d3.treemap()
            .size([width, height])
            .paddingTop(24)
            .paddingRight(4)
            .paddingInner(2)      // Padding between each rectangle
            .paddingOuter(10)
            .padding(10)
            (root)

        console.log(root)

        // use this information to add rectangles:
        svg
            .selectAll("rect")
            .data(root.leaves())
            .enter()
            .append("rect")
            .attr('x', function (d) { return d.x0; })
            .attr('y', function (d) { return d.y0; })
            .attr('width', function (d) { return d.x1 - d.x0; })
            .attr('height', function (d) { return d.y1 - d.y0; })
            //.style("stroke", "gray")
            .style("fill", function (d) { return color(d.parent.data.name) })
            .style("opacity", function (d) { return opacity(d.data.value) })

        // and to add the text labels/genre
        svg
            .selectAll("text")
            .data(root.leaves())
            .enter()
            .append("text")
            .attr("x", function (d) { return d.x0 + 5 })    // +10 to adjust position (more right)
            .attr("y", function (d) { return d.y0 + 20 })    // +20 to adjust position (lower)
            .text(function (d) { return d.data.name })
            .attr("font-size", "19px")
            .attr("fill", "white")

        // and to add the text labels/values
        svg
            .selectAll("vals")
            .data(root.leaves())
            .enter()
            .append("text")
            .attr("x", function (d) { return d.x0 + 5 })    // +10 to adjust position (more right)
            .attr("y", function (d) { return d.y0 + 35 })    // +20 to adjust position (lower)
            .text(function (d) { return d.data.value })
            .attr("font-size", "11px")
            .attr("fill", "white")

        // Add title of each group/countries
        svg
            .selectAll("titles")
            .data(root.descendants().filter(function (d) { return d.depth == 1 }))
            .enter()
            .append("text")
            .attr("x", function (d) { return d.x0 })
            .attr("y", function (d) { return d.y0 }) // +21 pour l'avoir ds le rect
            .text(function (d) { return d.data.name })
            .attr("font-size", "19px")
            .attr("font-weight", "600")
            .attr("fill", function (d) { return color(d.data.name) })

        // Add title 
        svg
            .append("text")
            .attr("x", 0)
            .attr("y", 0)    // +20 to adjust position (lower)
            .text("Countries by genre")
            .attr("font-size", "19px")
            .attr("font-weight", "600")
            .attr("fill", "grey")
    });
}
