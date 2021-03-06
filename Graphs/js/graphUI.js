///<reference path="graphStructureController.ts"/>
var edgeIdList = [[]];
/***************************************************************** */
/*********************** Click Handler *****************************/
/***************************************************************** */
var clickedId = -1; // If -1, no element has been clicked yet
$("#graphUI").click(function (e) {
    /** If <node> was clicked */
    if (e.target.className == "nodeUI") {
        nodeClicked(getIdFromDomId(e.target.id));
    }
    else if (e.target.parentNode.className == "nodeUI") {
        nodeClicked(getIdFromDomId(e.target.parentNode.id));
    }
    else {
        clickedId = -1;
        deselectAllNodes();
        var parent_1 = $(this).offset();
        var x = Math.round(e.pageX - parent_1.left);
        var y = Math.round(e.pageY - parent_1.top);
        graphUIClicked(x, y);
    }
    function nodeClicked(id) {
        if (clickedId == -1) {
            $("#node" + id).addClass("selected");
            clickedId = id;
        }
        else {
            twoNodesClicked(clickedId, id);
            $("#node" + id).addClass("selected");
            var n1_1 = clickedId, n2_1 = id;
            setTimeout(function () {
                deselectTwoNodes(n1_1, n2_1);
            }, 800);
            clickedId = -1;
        }
    }
});
/***************************************************************** */
/*********************** Graph UI Functions ************************/
/***************************************************************** */
function addNode(id, x, y) {
    edgeIdList.push([]);
    $("#graphUI").append("<div id='node" + id + "' class='nodeUI' style='left:" + (x - 40) + "px; top:" + (y - 40) + "px;'><p>" + id + "</p></div>");
}
function addEdge(id, n1, n2) {
    edgeIdList[n1][n2] = id;
    edgeIdList[n2][n1] = id;
    var r = getNodeWidth(n1) / 2;
    var p1 = getNodePosition(n1), p2 = getNodePosition(n2);
    var line = parseLine(id, p1.left + r, p1.top + r, p2.left + r, p2.top + r);
    document.getElementById('edgeSvg').appendChild(line);
}
function getEdgeId(v, w) {
    return edgeIdList[v][w];
}
function addWeightedEdge(id, n1, n2, weight) {
    addEdge(id, n1, n2);
    var edge = $("#edge" + id);
    var x1 = parseInt(edge.attr("x1")), y1 = parseInt(edge.attr("y1"));
    var x2 = parseInt(edge.attr("x2")), y2 = parseInt(edge.attr("y2"));
    var x = x1 + (x2 - x1) / 2, y = y1 + (y2 - y1) / 2;
    var normal = getNormal(x1, y1, x2, y2);
    var unit = getUnit(normal.x, normal.y);
    var unitScale = 25;
    $("#graphUI").append("<p id='edgeWeight" + id + "' " +
        "class='edgeWeight' " +
        "style='top: " + (y + unitScale * unit.y) + "px; left: " + (x + unitScale * unit.x) + "px'>" +
        weight + "</p>");
}
function addQueueElement(id) {
    var queueSize = $("#queueUI").find("div").length;
    var top = queueSize * 90 + 5;
    $("#queueUI").append("<div id='queueNode" + id + "' style='left:200px; top:" + top + "px;' class='nodeUI'><p>" + id + "</p></div>");
    $("#queueNode" + id).animate({ left: '15px' }, 700);
}
function popQueueElement(id) {
    $("#queueNode" + id).animate({ left: "200px" }, 700, function () {
        $(this).remove();
    });
    $("#queueUI").find("div").each(function () {
        var top = $(this).position().top - 90;
        $(this).animate({ top: top + "px" }, 700);
    });
}
function resetGraphUI() {
    $("#graphUI").find("div.nodeUI").each(function () {
        $(this).remove();
    });
    $("#graphUI").find("p.edgeWeight").each(function () {
        $(this).remove();
    });
    $("#edgeSvg").find("line").each(function () {
        $(this).remove();
    });
    $("#queueUI").find("div").each(function () {
        $(this).remove();
    });
    edgeIdList = [[]];
}
/***************************************************************** */
/********************* HELPER FUNCTIONS ****************************/
/***************************************************************** */
function getNormal(x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1;
    return { x: -dy, y: dx };
}
function getUnit(x, y) {
    var length = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    return { x: x / length, y: y / length };
}
function getIdFromDomId(domId) {
    return parseInt(domId.replace("node", ""));
}
function getNodeWidth(id) {
    return $("#node" + id).outerWidth();
}
function getNodePosition(id) {
    return $("#node" + id).position();
}
function parseLine(id, x1, y1, x2, y2) {
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute("id", "edge" + id);
    line.setAttribute("x1", x1 + "");
    line.setAttribute("y1", y1 + "");
    line.setAttribute("x2", x2 + "");
    line.setAttribute("y2", y2 + "");
    return line;
}
function deselectAllNodes() {
    $("#graphUI").children().each(function () {
        $(this).removeClass("selected");
    });
}
function deselectTwoNodes(n1, n2) {
    $("#node" + n1).removeClass("selected");
    $("#node" + n2).removeClass("selected");
}
