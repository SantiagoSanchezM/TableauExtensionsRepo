# TableauExtensionsRepo
A project meant to be a collection of different Extensions for Tableau. Extensions have been built using the [Tableau Extensions API](https://tableau.github.io/extensions-api/#)

Each extension has its own folder within the "TableauExtensions" directory. All files associated with extension will be found there, including: TWB/TWBX, TREX, HTML, and JS.

# Installing the Extensions
Download Tableau Desktop/Server version 2018.2 or above. If you are new to Dashboard Extensions for Tableau, please read the [Get Started](https://tableau.github.io/extensions-api/docs/trex_getstarted.html) guide from Tableau's documentation, it'll save you time.

Host a new web application on your preferred web server, deploy the HTML and JavaScript files for the corresponding extension. I've been deploying on IIS but it should work with other web servers, all code is contained on HTML & JavaScript. All content must be served via HTTPS.

# Export CSV Extension
This extension features 3 methods you can use to export data from a Tableau Viz. For now it works only for a sheet called "_customers", you can use the TWBX file on the folder for testing.
 
Method 1: Add a ‘.csv’ to the URL of a viz in Tableau Server. This is a similar technique to the one used [here](http://www.vizwiz.com/2014/03/the-greatest-tableau-tip-ever-exporting.html), with the advantage of using JavaScript to add filters as [parameters in the URL](https://onlinehelp.tableau.com/current/pro/desktop/en-us/embed_structure.html), if needed. But if you add too many filters, you’ll run out of space in the URL…
 
Method 2: Use the JavaScript API to call ‘Download Data’ or ‘Download Crosstab’ from the Tableau Server toolbar. This users Tableau Server built-in functionality, which means you can’t change the order of the columns. By default, the button for this method is disabled on the HTML page as this would only work if the extension is deployed on the same server as Tableau Server (otherwise you hit a cross-domain security roadblock). A nice article that speaks more about this can be found [here](https://databoss.starschema.net/tableau-javascript-api-without-embedding/).
 
Method 3: Use getData() and could be as nice as written [here](https://databoss.starschema.net/getdata-tableau-10-javascript-api/). Or with less UI involved like in the html file attached where things happen behind the scenes in under 100 lines of code. There's plenty of spaces and commentary to help you read what’s going on. The comments include a WARNING! In case you are thinking about exporting a huge table using your browser. You can potentially change the order and visibility of the columns if you modify the convertJsonToCSV() method. 

# More Extensions?