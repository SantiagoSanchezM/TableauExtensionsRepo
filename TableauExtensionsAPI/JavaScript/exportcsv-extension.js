$(document).ready(function () {
    // Hook up an event handler for the load button click.
    // Wait to initialize until a button is clicked.
    $("#getFiltersButton").click(function () {
        tableau.extensions.initializeAsync().then(function () {

            // Initialization succeeded! Get the dashboard
            var dashboard = tableau.extensions.dashboardContent.dashboard;
            getFilters(dashboard);
                
        }, function (err) {
            // something went wrong in initialization
            $("#resultBox").html("Error while Initializing: " + err.toString());
        });
    });

    $("#exportCrosstabButton").click(function () {
        exportCrosstab("_customers");
    });
   
    $("#summaryDataButton").click(function () {
        tableau.extensions.initializeAsync().then(function () {

            // Initialization succeeded! Get the dashboard
            var dashboard = tableau.extensions.dashboardContent.dashboard;
            makeTable('summary', 'value', dashboard);
            
        }, function (err) {
            // something went wrong in initialization
            $("#resultBox").html("Error while Initializing: " + err.toString());
        });
    });

    $("#underlyingDataButton").click(function () {
        tableau.extensions.initializeAsync().then(function () {

            // Initialization succeeded! Get the dashboard
            var dashboard = tableau.extensions.dashboardContent.dashboard;
            makeTable('underlying', 'value', dashboard);

        }, function (err) {
            // something went wrong in initialization
            $("#resultBox").html("Error while Initializing: " + err.toString());
        });
    });

});

// METHOD 1: Generate a URL with a .csv extention and filters passed on the query string
// Based on David Spezia's code
function getFilters(dashboard) {
    current_sheet = $.grep(dashboard.worksheets, function (obj) { return obj.name == "_customers"; })[0];
    current_sheet.getFiltersAsync().then(
        function (result) {
            
            var customer = result[0]._appliedValues[0]._value;
            var state = result[1]._appliedValues[0]._value;

            console.log("SELECTED FILTERS: ", customer, ', ', state);
            createLink(state, customer);
        });
}

function createLink(state, customerSegment) {

    // Tableau Public requires an extra URL parameter to allow export to CSV, Tableau Server/Online doesn't
    var url = ((window.location != window.parent.location) ? document.referrer : document.location.href).split("?")[0];
    var urlParameter = url.indexOf("public.tableau.com") > 0 ? '.csv?:showVizHome=no&' : '.csv?';

    file = url + urlParameter + "State=" + state + '&' + "Customer Segment=" + customerSegment;
    console.log(file);

    var iframe = document.getElementById('invisible');
    iframe.src = file;
}

// METHOD 2: Use the Tableau Server Toolbar funtionality (Export Crosstab)
// Learn more about the Tableau JavaScript API here: http://onlinehelp.tableau.com/samples/en-us/js_api/tutorial.htm 
function exportCrosstab(worksheetName) {
    var viz = parent.parent.tableau.VizManager.getVizs()[0];
    viz.showExportCrossTabDialog(worksheetName);
}

// METHOD 3: Use getData() and work with the JSON object
// Based on Tableau and Behold article: https://tableauandbehold.com/2016/08/17/using-getdata-in-tableau-10-to-create-tables-from-any-viz/ 
function makeTable(summary_or_underlying, formatted_or_value, dashboard) {
    // get the table options
    get_data_options = {
        maxRows: 0, // Max rows to return. Use 0 to return all rows
        ignoreAliases: false,
        ignoreSelection: false,
        includeAllColumns: true
    };
    // set the current_sheet global variable based on the selected sheet name
    current_sheet = $.grep(dashboard.worksheets, function (obj) { return obj.name == "_customers"; })[0];

    // export either the summary or the underlying data 
    if (summary_or_underlying.toLowerCase() === 'summary') {
        current_sheet.getSummaryDataAsync(get_data_options).then(function (t) {
            exportCSVFile(t, formatted_or_value);
        });
    }
    else if (summary_or_underlying.toLowerCase() === 'underlying') {
        current_sheet.getUnderlyingDataAsync(get_data_options).then(function (t) {
            exportCSVFile(t, formatted_or_value);
        });
    }
}

// Returns a simple ordered array of the column/field names
function convertColumnsObjectToArrayOfNames(sheetDataObj) {
    col_obj = sheetDataObj.columns;
    col_array = new Array();
    for (var k = 0; k < col_obj.length; k++) {
        col_array[k] = col_obj[k].fieldName;
    }
    console.log(col_array);
    return col_array;
}

// Export using JavaScript
// WARNING!!: This is done on the client side so it could be really slow or crash when exporting a large table. If that's the need, consider doing this on the webapp server side.
// Based on the code from: https://medium.com/@danny.pule/export-json-to-csv-file-using-javascript-a0b7bc5b00d2
function exportCSVFile(sheetDataObj, formatted_or_value) {

    // Get the headers and rows for the table to be exported
    var column_header_array = convertColumnsObjectToArrayOfNames(sheetDataObj);
    var data = sheetDataObj.data;

    // Consolidate headers and rows into a single CSV string
    var csv = convertJsonToCSV(column_header_array, data, formatted_or_value);
    var exportedFilenmae = 'TableauExport.csv';

    // Generate the file with the CSV string and send to the browser
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, exportedFilenmae);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", exportedFilenmae);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

// This method iterates over a JSON object and related headers to create a comma separated value string 
// Optional: Modify this method to remove unwanted columns or change the order in which they are displayed
function convertJsonToCSV(column_header_array, objArray, formatted_or_value) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    var column_order = [1, 0, 2, 3, 4, 6, 5]; // Change the order of the columns here

    // If the number of columns specified for the order is larger than those available, use the default order
    if (column_order.length > column_header_array.length) {
        column_order = [];
        for (var i = 0; i < column_header_array.length; i++) {
            column_order.push(i);
        }
    }

    // Create one line for the headers
    for (var i = 0; i < column_order.length; i++) {
        if (str != '') str += ','
        str += column_header_array[column_order[i]];
    }
    str += '\r\n';

    // Create one line for every object (i.e. rows)
    for (var i = 0; i < array.length; i++) {
        var line = '';
        //for (var index in array[i]) {
        for (var j = 0; j < column_order.length; j++) {
            if (line != '') line += ','

            if (formatted_or_value.toLowerCase() === 'formatted') {
                line += '"' + array[i][column_order[j]].formattedValue + '"';
            }
            else if (formatted_or_value.toLowerCase() === 'value') {
                line += '"' + array[i][column_order[j]].value + '"';
            }
        }
        str += line + '\r\n';
    }

    return str;
}