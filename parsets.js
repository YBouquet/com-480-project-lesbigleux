function whenDocumentLoaded(action) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", action);
  } else {
    // `DOMContentLoaded` already fired
    action();
  }
}

whenDocumentLoaded(() => {
  generate_parallel_sets("all_parallel_sets.csv");
});

function generate_parallel_sets(data) {
  // Add active class to the current button (highlight it)
  var header = document.getElementById("tab");
  var btns = header.getElementsByClassName("rangeSets");
  for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", function () {
      var current = document.getElementsByClassName("active");
      current[0].className = current[0].className.replace(" active", "");
      this.className += " active";
    });
  }

  //Change range time by clicking on range
  var range_val = 1970;
  function change_range(val) {
    range_val = val;
    call_data(range_val);
  }
  var chart = d3.parsets()
    .dimensions(["Country", "Genre", "Winner or Nominee"])
    .tension(0.5)
    .width(1000);

  var vis = d3.select("#vis").append("svg")
    .attr("width", chart.width())
    .attr("height", chart.height());

  var partition = d3.layout.partition()
    .sort(null)
    .size([chart.width(), chart.height() * 5 / 4])
    .children(function (d) { return d.children ? d3.values(d.children) : null; })
    .value(function (d) { return d.numMovies; });

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

    return d3.csv(data).then(function (csv) {
      //filter the country here
      csv = csv.filter(d => d.range == range_val)
      console.log(csv)
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

  call_data(range_val);

  d3.select("#file").then(function () {
    var file = this.files[0],
      reader = new FileReader;
    reader.onloadend = function () {
      var csv = d3.csv.parse(reader.result);
      vis.datum(csv).call(chart
        .dimensions(function (d) { return d3.keys(d[0]).sort(); }));
    };
    reader.readAsText(file);
  });
}
