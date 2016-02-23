//////// OPTIONS ////////
// Set the path to the CSV data file name here:
var csvFileName = 'data/data.csv';
/////////////////////////


/**********************************/

var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() { if (xhr.readyState == 4 && xhr.status == 200) processCSVData(xhr.responseText); }
xhr.open("GET", csvFileName, true);
xhr.send();

// Process the CSV data.
function processCSVData(data) {

    // Split the file into rows.
    data = data.split('\n');

    // Populate rows.
    var rows = [];
    data.forEach(function generateClusterableRow(line) {
        var splitLine = line.replace(/,$/, '').split(',');
        var columns = [];

        // Generate columns, taking into account quoted strings.
        var combinedColumn = "";
        splitLine.forEach(function(column) {
            var quoteStart = column.match(/^"/);
            var quoteEnd = column.match(/"$/);
            var noQuote = !(quoteStart || quoteEnd);
            if (quoteStart) {
                combinedColumn += column;
            } else if (quoteEnd) {
                combinedColumn += column;
                columns.push(combinedColumn.replace(/"/g, ""));
                combinedColumn = "";
            } else if (noQuote) {
                if (!combinedColumn) {
                    columns.push(column);
                }
            }
        });

        // Generate the row.
        var row = {
            values: columns,
            markup: '<tr>' + columns.map(function(td){ return '<td>' + td + '</td>'}).join('') + '</tr>',
            visible: true
        };

        // Append the row.
        rows.push(row);
    });

    // Setup search event handler.
    function onSearch() {
        this.value = this.value.toLowerCase();
        var searchValue = this.value;
        for(var i = 0, ii = rows.length; i < ii; i++) {
            var rowMatches = false;
            for(var j = 0, jj = rows[i].values.length; j < jj; j++) {
                var value = rows[i].values[j].toLowerCase();
                if (!rowMatches) {
                    // Define your column search rules here, based on column index:
                    switch (j) {
                        case 3: case 4: case 7:
                            rowMatches = value.startsWith(searchValue) || value.endsWith(searchValue);
                            break;
                        case 5:
                            rowMatches = value.indexOf(searchValue) + 1;
                            break;
                    }
                }
            }
            rows[i].visible = rowMatches;
        }
        clusterize.update(rows.filterByVisibility());
    }

    // Initialize clusterer.
    var clusterize = new Clusterize({
        rows: rows.filterByVisibility(),
        scrollId: 'scrollArea',
        contentId: 'contentArea'
    });

    // DOM events.
    document.getElementById('search').oninput = debounce(onSearch, 300);
    document.getElementById('scrollArea').style.maxHeight = window.innerHeight - 75 + 'px';
}

// Helper functions.
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

String.prototype.startsWith = function(test) {
    return this.indexOf(test) === 0;
}

String.prototype.endsWith = function(test) {
    var io = this.lastIndexOf(test);
    return this.length === (io == -1 ? -1 : io + test.length);
}

Array.prototype.filterByVisibility = function() {
    var results = [];
    for (var i = 0, ii = this.length; i < ii; i++) {
        if (this[i].visible) results.push(this[i].markup)
    }
    return results;
}
