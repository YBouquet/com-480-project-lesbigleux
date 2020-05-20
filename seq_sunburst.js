
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
  d3version5.text("test.csv").then(function (text) {
    generate_sunburst(buildHierarchy((d3version5.csvParseRows(text))));
  });
});

const width = 750;
const height = 600;
const radius = Math.min(width, height) / 2;

const b = {
  w: 75, h: 30, s: 3, t: 10
};

const root_domain = ["Oscar", "Nominees", "Winners", "Films", "People"];

const color = d3version5
  .scaleOrdinal()
  .domain(["Oscar", "Nominees", "Winners", "Films", "People", "Price"])
  .range(["#5d85cf", "#7c6561", "#da7847", "#6fb971", "#9e70cf", "#bfad2c"])

function generate_sunburst(data) {

  initializeBreadcrumbTrail();
  drawLegend();
  d3version5.select("#togglelegend").on("click", toggleLegend);

  const root = d3version5.partition().size([2 * Math.PI, radius * radius])(
    d3version5
      .hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value)
  );


  const viz = d3version5.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("id", "container")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  //const svg = d3version5.select("#sunburst");

  var element = viz.node();
  element.value = { sequence: [], percentage: 0.0 };


  const label = viz
    .append("text")
    .attr("text-anchor", "middle")
    .attr("fill", "#888")
    .style("visibility", "hidden");

  label
    .append("tspan")
    .attr("class", "percentage")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dy", "-0.1em")
    .attr("font-size", "3em")
    .text("");

  label
    .append("tspan")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dy", "1.5em")
    .text("of visits begin with this sequence");

  viz
    .attr("viewBox", `${-radius} ${-radius} ${width} ${width}`)
    .style("max-width", `${width}px`)
    .style("font", "12px sans-serif");

  let arc = d3version5
    .arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(1 / radius)
    .padRadius(radius)
    .innerRadius(d => Math.sqrt(d.y0))
    .outerRadius(d => Math.sqrt(d.y1) - 1)

  const path = viz
    .append("g")
    .selectAll("path")
    .data(
      root.descendants().filter(d => {
        // Don't draw the root node, and for efficiency, filter out nodes that would be too small to see
        return d.depth && d.x1 - d.x0 > 0.001;
      })
    )
    .enter()
    .append("path")
    .attr("fill", d => color(root_domain.includes(d.data.name) ? d.data.name : "Price"))
    .attr("d", arc);


  const mousearc = d3version5
    .arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .innerRadius(d => Math.sqrt(d.y0))
    .outerRadius(radius);

  viz
    .append("g")
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("mouseleave", () => {
      d3version5.select("#trail")
        .style("visibility", "hidden");

      path.attr("fill-opacity", 1);
      label.style("visibility", "hidden");
      // Update the value of this view
      element.value = { sequence: [], percentage: 0.0 };
      updateBreadcrumbs(element.value);

      // Update the value of this view
      /*
        element.value = { sequence: [], percentage: 0.0 };
        element.dispatchEvent(new CustomEvent("input"));
      */
    })
    .selectAll("path")
    .data(
      root.descendants().filter(d => {
        // Don't draw the root node, and for efficiency, filter out nodes that would be too small to see
        return d.depth && d.x1 - d.x0 > 0.001;
      })
    )
    .enter()
    .append("path")
    .attr("d", mousearc)
    .on("mouseenter", d => {
      // Get the ancestors of the current segment, minus the root
      const sequence = d
        .ancestors()
        .reverse()
        .slice(1);
      // Highlight the ancestors
      path
        .attr("fill-opacity", node =>
          sequence.indexOf(node) >= 0 ? 1.0 : 0.3
        );
      const percentage = ((100 * d.value) / root.value).toPrecision(3);
      label
        .style("visibility", null)
        .select(".percentage")
        .text(percentage + "%");
      // Update the value of this view with the currently hovered sequence and percentage
      element.value = { sequence, percentage };
      // Update the value of this view with the currently hovered sequence and percentage
      updateBreadcrumbs(element.value);
    });


}


function buildHierarchy(csv) {
  // Helper function that transforms the given CSV into a hierarchical format.
  const root = { name: "root", children: [] };
  for (let i = 0; i < csv.length; i++) {
    const sequence = csv[i][0];
    const size = +csv[i][1];
    if (isNaN(size)) {
      // e.g. if this is a header row
      continue;
    }
    const parts = sequence.split("-");
    let currentNode = root;
    for (let j = 0; j < parts.length; j++) {
      const children = currentNode["children"];
      const nodeName = parts[j];
      let childNode = null;
      if (j + 1 < parts.length) {
        // Not yet at the end of the sequence; move down the tree.
        let foundChild = false;
        for (let k = 0; k < children.length; k++) {
          if (children[k]["name"] == nodeName) {
            childNode = children[k];
            foundChild = true;
            break;
          }
        }
        // If we don't already have a child node for this branch, create it.
        if (!foundChild) {
          childNode = { name: nodeName, children: [] };
          children.push(childNode);
        }
        currentNode = childNode;
      } else {
        // Reached the end of the sequence; create a leaf node.
        childNode = { name: nodeName, value: size };
        children.push(childNode);
      }
    }
  }
  return root;
}

breadcrumbWidth = 75
breadcrumbHeight = 30
string_threshold = 15

function breadcrumbPoints(d, i) {
  const tipWidth = 10;
  const points = [];
  const final_width = d.data.name.length > string_threshold ? breadcrumbWidth * 5 : breadcrumbWidth;
  points.push("0,0");
  points.push(`${final_width},0`);
  points.push(`${final_width + tipWidth},${breadcrumbHeight / 2}`);
  points.push(`${final_width},${breadcrumbHeight}`);
  points.push(`0,${breadcrumbHeight}`);
  if (i > 0) {
    // Leftmost breadcrumb; don't include 6th vertex.
    points.push(`${tipWidth},${breadcrumbHeight / 2}`);
  }

  return points.join(" ");
}


function initializeBreadcrumbTrail() {
  // Add the svg area.
  var trail = d3version5.select("#sequence").append("svg")
    .attr("width", width)
    .attr("height", 50)
    .attr("id", "trail");
  // Add the label at the end, for the percentage.
}



function updateBreadcrumbs(sunburst) {
  // Data join; key function combines name and depth (= position in sequence).
  d3version5.select('#trail').selectAll('*').remove();

  const svg = d3version5.select('#trail')
    .append("svg")
    .attr("viewBox", `0 0 ${breadcrumbWidth * 10} ${breadcrumbHeight}`)
    .style("font", "12px sans-serif")
    .style("margin", "5px");

  const g = svg
    .selectAll("g")
    .data(sunburst.sequence)
    .enter()
    .append("g")
    .attr("transform", (d, i) => `translate(${i * breadcrumbWidth}, 0)`);


  g.append("polygon")
    .attr("points", breadcrumbPoints)
    .attr("fill", d => color(root_domain.includes(d.data.name) ? d.data.name : "Price"))
    .attr("stroke", "white");

  g.append("text")
    .attr("x", (d, i) => (breadcrumbWidth * (d.data.name.length > string_threshold ? 5 : 1) + 10) / 2)
    .attr("y", 15)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .text(d => d.data.name)


  svg
    .append("text")
    .text(sunburst.percentage > 0 ? sunburst.percentage + "%" : "")
    .attr("x", () => {
      var multiplier = 0
      sunburst.sequence.forEach(d => {
        multiplier = multiplier + (d.data.name.length > string_threshold ? 5 : 1)
      })
      return (multiplier + 0.5) * breadcrumbWidth;
    })
    .attr("y", breadcrumbHeight / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .style('fill', '#fff');


  // Make the breadcrumb trail visible, if it's hidden.
  d3version5.select("#trail")
    .style("visibility", "");
}

function drawLegend() {

  // Dimensions of legend item: width, height, spacing, radius of rounded rect.
  var li = {
    w: 80, h: 30, s: 3, r: 3
  };

  var legend = d3version5.select("#legend").append("svg")
    .attr("width", li.w)
    .attr("height", d3version5.keys(color.domain()).length * (li.h + li.s));

  var g = legend.selectAll("g")
    .data(color.domain().map((d, i) => { return { 'domain': d, 'range': color.range()[i] } }))
    .enter().append("g")
    .attr("transform", function (d, i) {
      return "translate(0," + i * (li.h + li.s) + ")";
    });

  g.append("rect")
    .attr("rx", li.r)
    .attr("ry", li.r)
    .attr("width", li.w)
    .attr("height", li.h)
    .style("fill", function (d) { return d.range; });

  g.append("svg:text")
    .attr("x", li.w / 2)
    .attr("y", li.h / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .text(function (d) { return d.domain; });
}

function toggleLegend() {
  var legend = d3version5.select("#legend");
  if (legend.style("visibility") == "hidden") {
    legend.style("visibility", "");
  } else {
    legend.style("visibility", "hidden");
  }
}
