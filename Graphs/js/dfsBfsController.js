///<reference path="adjacencyList.ts"/>
///<reference path="graphUI.ts"/>
///<reference path="graphStructureController.ts"/>
///<reference path="eventManager.ts"/>
///<reference path="visitedArray.ts"/>
var visited;
var bfsQueue;
var currentNode;
var highlightEventDuration = 0;
var visitEventDuration = 2000;
var paused = true;
var algoRunning = "";
var color = [];
var colorEdge = [];
var firstNode;
var BFSfirst;
function helpStartBfs() {
    if (algoRunning != "BFS") {
        resetForNewAlgo();
        algoRunning = "BFS";
        startBfs(0);
        $("#dfs").html("DFS");
        paused = true;
    }
    togglePauseBfs();
}
function togglePauseBfs() {
    if (paused) {
        manager.start();
        $('#backward').attr('disabled', 'disabled');
        $('#forward').attr('disabled', 'disabled');
        $("#bfs").html("Pause");
        paused = false;
    }
    else {
        $('#backward').removeAttr('disabled');
        $('#forward').removeAttr('disabled');
        $("#bfs").html("Resume");
        manager.pause();
        paused = true;
    }
}
function startBfs(startIndex) {
    resetVisited(nodes);
    bfsQueue = [];
    currentNode = startIndex;
    var lastElemtent = 0;
    bfsQueue.push(startIndex);
    while (bfsQueue.length != 0) {
        var v = bfsQueue.shift();
        popFromBfsQueue(v);
        visit(v);
        lastElemtent = v;
        var adjacent = adjacencyList[v];
        for (var i = 0; i < adjacent.length; i++) {
            var w = adjacent[i];
            if (!visited[w] && $.inArray(w, bfsQueue)) {
                addToBfsQueue(w);
                bfsQueue.push(w);
            }
        }
    }
    removeHighlighting(lastElemtent);
}
function addToBfsQueue(v) {
    var forward = function (id) {
        return function () {
            addQueueElement(id);
        };
    }(v);
    var backwards = function (id) {
        return function () {
            popQueueElement(id);
        };
    }(v);
    manager.addEvent(new FrontendEvent(forward, backwards, visitEventDuration));
}
function popFromBfsQueue(v) {
    var forward = function (id) {
        return function () {
            popQueueElement(id);
        };
    }(v);
    var backwards = function (id, BFSfirst) {
        return function () {
            if (!BFSfirst)
                addQueueElement(id);
        };
    }(v, BFSfirst);
    BFSfirst = false;
    manager.addEvent(new FrontendEvent(forward, backwards, visitEventDuration));
}
function helpStartDfs() {
    if (algoRunning != "DFS") {
        resetForNewAlgo();
        algoRunning = "DFS";
        startDfs(0);
        $("#bfs").html("BFS");
        paused = true;
    }
    togglePauseDfs();
}
function togglePauseDfs() {
    if (paused) {
        paused = false;
        manager.start();
        $('#backward').attr('disabled', 'disabled');
        $('#forward').attr('disabled', 'disabled');
        $("#dfs").html("Pause");
    }
    else {
        paused = true;
        manager.pause();
        $('#backward').removeAttr('disabled');
        $('#forward').removeAttr('disabled');
        $("#dfs").html("Resume");
    }
}
function startDfs(startIndex) {
    resetVisited(nodes);
    currentNode = startIndex;
    dfs(startIndex);
    removeHighlighting(startIndex);
}
function dfs(v) {
    visit(v);
    var adjacent = adjacencyList[v];
    for (var i = 0; i < adjacent.length; i++) {
        if (visited[adjacent[i]])
            continue;
        setHighlightEdge(getEdgeId(v, adjacent[i]), true);
        dfs(adjacent[i]);
        setHighlightEdge(getEdgeId(v, adjacent[i]), false);
        visit(v);
    }
}
function setHighlightEdge(edgeId, highlight) {
    var forward = function (id, h) {
        return function () {
            if (h) {
                $("#edge" + id).css({ "stroke": "rgb(16, 130, 219)", "stroke-width": "6" });
            } //add highlight
            else {
                $("#edge" + id).css({ "stroke": "rgb(0, 0, 0)", "stroke-width": "4" });
            } //remove highlight
        };
    }(edgeId, highlight);
    var backwards = function (id, bool) {
        return function () {
            if (bool === false) {
                $("#edge" + id).css({ "stroke": "rgb(0, 0, 0)", "stroke-width": "4" });
            }
            else {
                $("#edge" + id).css({ "stroke": "rgb(16, 130, 219)", "stroke-width": "6" });
            }
        };
    }(edgeId, colorEdge[edgeId]);
    colorEdge[edgeId] = highlight;
    manager.addEvent(new FrontendEvent(forward, backwards, highlightEventDuration));
}
function visit(id) {
    visited[id] = true;
    var forward = function (v, curr) {
        return function () {
            $("#node" + curr).css("border", "6px solid black");
            $("#node" + v).css("background-color", "rgb(80, 250, 80)");
            $("#node" + v).css("border", "6px solid rgb(16, 130, 219)");
            $("#insElemNr" + v).html("<p>" + v + "</p><div> T </div>");
            $("#insElemNr" + v).addClass("marked");
        };
    }(id, currentNode);
    var backwards = function (v, curr, bool, firstNode) {
        return function () {
            if (firstNode) {
                $("#node" + v).css("background-color", "white");
                $("#node" + v).css("border", "6px solid black");
                $("#node" + curr).css("border", "6px solid rgb(0, 0, 0)");
                $("#insElemNr" + v).html("<p>" + v + "</p><div> F </div>");
                $("#insElemNr" + v).removeClass("marked");
            }
            else {
                if (!bool) {
                    $("#node" + v).css("background-color", "white");
                    $("#node" + v).css("border", "6px solid black");
                    $("#node" + curr).css("border", "6px solid rgb(16, 130, 219)");
                    $("#insElemNr" + v).html("<p>" + v + "</p><div> F </div>");
                    $("#insElemNr" + v).removeClass("marked");
                }
                else {
                    $("#node" + curr).css("border", "6px solid black");
                    $("#node" + v).css("background-color", "rgb(80, 250, 80)");
                    $("#node" + v).css("border", "6px solid rgb(16, 130, 219)");
                    $("#insElemNr" + v).html("<p>" + v + "</p><div> T </div>");
                    $("#insElemNr" + v).addClass("marked");
                }
            }
        };
    }(id, currentNode, color[id], firstNode);
    color[id] = true;
    firstNode = false;
    manager.addEvent(new FrontendEvent(forward, backwards, visitEventDuration));
    currentNode = id;
}
function removeHighlighting(v) {
    var forward = function (v) {
        return function () {
            $("#node" + v).css({ "border-color": "black" });
        };
    }(v);
    var backwards = function (v) {
        return function () {
            $("#node" + v).css("border", "6px solid rgb(16, 130, 219)");
        };
    }(v);
    manager.addEvent(new FrontendEvent(forward, backwards, visitEventDuration));
}
function resetVisited(numNodes) {
    visited = [];
    for (var i = 0; i < numNodes; i++)
        visited.push(false);
    setInitialArray();
}
function instantCollapseAll() {
    for (var i = 0; i < nodes; i++) {
        var width = $("#adjList" + i).width();
        $("#adjList" + i).css({ left: -width });
    }
}
function collapseAdjacencyList(index) {
    for (var i = 0; i < nodes; i++) {
        $("#adjList" + i).finish();
    }
    var width = $("#adjList" + index).width();
    $("#adjList" + index).animate({ left: -width });
}
function expandAdjacencyList(index) {
    for (var i = 0; i < nodes; i++) {
        $("#adjList" + i).finish();
        collapseAdjacencyList(i);
    }
    $("#adjList" + index).animate({ left: 65 }, 350);
}
function stepForward() {
    $('#forward').attr('disabled', 'disabled');
    manager.next();
    setTimeout(function () {
        $('#forward').removeAttr('disabled');
    }, 350);
}
function stepBackwards() {
    $('#backward').attr('disabled', 'disabled');
    manager.previous();
    setTimeout(function () {
        $('#backward').removeAttr('disabled');
    }, 350);
}
