function whenDocumentLoaded(action) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", action);
  } else {
    // `DOMContentLoaded` already fired
    action();
  }
}

var range_val = 1970;

// Given a text function and width function, truncates the text if necessary to
// fit within the given width.
function truncateText(text, width) {
  return function (d, i) {
    var t = this.textContent = text(d, i),
      w = width(d, i);
    if (this.getComputedTextLength() < w) return t;
    this.textContent = "…" + t;
    var lo = 0,
      hi = t.length + 1,
      x;
    while (lo < hi) {
      var mid = lo + hi >> 1;
      if ((x = this.getSubStringLength(0, mid)) < w) lo = mid + 1;
      else hi = mid;
    }
    return lo > 1 ? t.substr(0, lo - 2) + "…" : "";
  };
}

function call_data(range_val) {
  var chart = d3.parsets()
    .dimensions(["Country", "Genre", "Winner or Nominee"])
    .tension(0.5)
    .width(1000);

  d3.select("#vis > *").remove()
  var vis = d3.select("#vis").append("svg")
    .attr("width", chart.width())
    .attr("height", chart.height());

  var partition = d3.layout.partition()
    .sort(null)
    .size([chart.width(), chart.height() * 5 / 4])
    .children(function (d) { return d.children ? d3.values(d.children) : null; })
    .value(function (d) { return d.numMovies; });

  return d3.csv("./data/all_parallel_sets.csv", function (csv) {
    csv = csv.filter(function (row) {
      return row['range'] == range_val;
    })
    vis.datum(csv).call(chart);
    var tension = chart.tension();
    var dimensions = [];
    vis.selectAll("g.dimension")
      .each(function (d) { dimensions.push(d); });
    dimensions.sort(function (a, b) { return a.y - b.y; });
    var root = d3.parsets.tree({ children: {} }, csv, dimensions.map(function (d) { return d.name; }), function () { return 1; }),
      nodes = partition(root),
      nodesByPath = {};
    var data = [];
  });
}

//Change range time by clicking on range
function change_range(val) {
  range_val = val;
  // Add active class to the current button (highlight it)
  call_data(range_val);
}

whenDocumentLoaded(() => {
  console.log('Parallel Sets loaded');
  change_range(range_val);
});
