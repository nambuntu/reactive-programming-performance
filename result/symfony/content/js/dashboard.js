/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "^(HP)(-success|-failure)?$";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 6;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 6.753645433614735, "KoPercent": 93.24635456638526};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.0, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "HP"], "isController": false}, {"data": [0.0, 500, 1500, "Transaction Controller"], "isController": true}, {"data": [0.0, 500, 1500, "POST - book"], "isController": false}, {"data": [0.0, 500, 1500, "POST - cleanup"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 59938, 55890, 93.24635456638526, 4222.964696853412, 77, 121946, 21641.0, 24062.700000000004, 85012.98000000001, 137.35024794448978, 352.00775895318503, 1.7029668480228606], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["HP", 59936, 55889, 93.24779765082755, 4222.324913240759, 77, 121946, 21641.0, 24062.700000000004, 85012.98000000001, 137.34566486704492, 352.0006381756316, 1.702568514143377], "isController": false}, {"data": ["Transaction Controller", 59936, 55889, 93.24779765082755, 4222.325046716504, 77, 121946, 21641.0, 24062.700000000004, 85012.98000000001, 137.2060654897077, 351.6428615398769, 1.7008380080900667], "isController": true}, {"data": ["POST - book", 1, 1, 100.0, 2314.0, 2314, 2314, 2314.0, 2314.0, 2314.0, 0.43215211754537597, 1.181243922860847, 0.0], "isController": false}, {"data": ["POST - cleanup", 1, 0, 0.0, 44478.0, 44478, 44478, 44478.0, 44478.0, 44478.0, 0.022483025315886505, 0.008409178414047393, 0.003908182134988084], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Percentile 1
            case 8:
            // Percentile 2
            case 9:
            // Percentile 3
            case 10:
            // Throughput
            case 11:
            // Kbytes/s
            case 12:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException\/Non HTTP response message: Connection reset", 62, 0.11093218822687421, 0.10344022156228103], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException\/Non HTTP response message: Unrecognized Windows Sockets error: 0: recv failed", 20, 0.03578457684737878, 0.033367813407187426], "isController": false}, {"data": ["500\/Internal Server Error", 830, 1.4850599391662194, 1.3847642563982783], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException\/Non HTTP response message: Connect to 127.0.0.1:8080 [\\\/127.0.0.1] failed: Connection refused: connect", 54941, 98.30202182859188, 91.66305182021422], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException\/Non HTTP response message: Socket operation on nonsocket: connect", 37, 0.06620146716765074, 0.06173045480329674], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 59938, 55890, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException\/Non HTTP response message: Connect to 127.0.0.1:8080 [\\\/127.0.0.1] failed: Connection refused: connect", 54941, "500\/Internal Server Error", 830, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Connection reset", 62, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Socket operation on nonsocket: connect", 37, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Unrecognized Windows Sockets error: 0: recv failed", 20], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["HP", 59936, 55889, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException\/Non HTTP response message: Connect to 127.0.0.1:8080 [\\\/127.0.0.1] failed: Connection refused: connect", 54940, "500\/Internal Server Error", 830, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Connection reset", 62, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Socket operation on nonsocket: connect", 37, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Unrecognized Windows Sockets error: 0: recv failed", 20], "isController": false}, {"data": [], "isController": false}, {"data": ["POST - book", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException\/Non HTTP response message: Connect to 127.0.0.1:8080 [\\\/127.0.0.1] failed: Connection refused: connect", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
