function whenDocumentLoaded(action) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", action);
    } else {
        action
    }
}



whenDocumentLoaded(() => {
    console.log("fire")
    // The svg
    var svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    // Map and projection
    var projection = d3.geoNaturalEarth()
        .scale(width / 1.3 / Math.PI)
        .translate([width / 2, height / 2])

    // Load external data and boot
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson", function (data) {

        // Draw the map
        svg.append("g")
            .selectAll("path")
            .data(data.features)
            .enter().append("path")
            .attr("fill", "#A9A9A9")
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            .style("stroke", "#fff")


    })
});