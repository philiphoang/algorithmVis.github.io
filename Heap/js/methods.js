///<reference path="drawGraph.ts"/>
///<reference path="Controller.ts"/>
///<reference path="View.ts"/>
/**
 * Methods called from Viewer and Algorithms
 * @author Øyvind
 *
 */
//declare var javaBinder; // Used to communicate with java
var firstSelected = -1;
var locked = false;
var contentHidden = false;
// Displays new array
function displayArray(jsonString) {
    var $array = $.parseJSON(jsonString);
    createAndDrawNodes($array);
}
// Setup nodes and array elements to activate algorithm when clicked
function setOnClickListener() {
    $("#arrayUL li").each(function () {
        $(this).click(function () {
            if (locked) {
                return;
            }
            var id = $(this).attr("id");
            var idInt = "";
            for (var i = 0; i < id.length; i++)
                if (!isNaN(parseInt(id[i])))
                    idInt += id[i];
            if (isHighlighted(parseInt(idInt))) {
                deselectArrayElemSelections();
                deselectNodeSelections();
                return;
            }
            selectElement(parseInt(idInt));
        });
    });
}
function isHighlighted(id) {
    if ($("#arrayElem" + id).hasClass("selected"))
        return true;
    return false;
}
setOnClickListener();
function setKeyListener() {
    this.addEventListener("keyup", function (e) {
        if (locked) {
            return;
        }
        var key = e.which || e.keyCode;
        // Enter (reset algorithm)
        if (key == 13) {
            resetElementSelections();
            viewer.changeToCurrentAlgorithm();
        }
        else if (key == 72) {
            hideArrayValues();
        }
        else if (key == 37) {
            stepBack();
        }
        else if (key == 39) {
            viewer.stepForward(getGraphState(), getArrayState());
        }
    });
}
setKeyListener();
function hideArrayValues() {
    for (var i = 0; i < 10; i++) {
        $("#arrayContent" + i).css('color', contentHidden ? "#000000" : "#FFFFFF");
    }
    contentHidden = !contentHidden;
}
// Selects an element. If method==find call method, else wait for second element before union or connected
function selectElement(index) {
    // Set new class for selected index
    deselectNodeSelections();
    deselectArrayElemSelections();
    var $selected = $("#arrayElem" + index);
    if ($selected.hasClass("selected")) {
        $selected.removeClass("selected");
    }
    else {
        selectIndex(index, true);
        //Children to the highlighted node
        var highlightChildren = allNodes[index].children;
        console.log(highlightChildren);
        if (highlightChildren.length > 0) {
            for (var i = 0; i < highlightChildren.length; i++) {
                highlightNode(highlightChildren[i].id, "green");
            }
            selectIndex(index * 2 + 1, true);
            selectIndex(index * 2 + 2, true);
        }
    }
    var $method = $('input[name=method]:checked', '#method');
    if ($method.val() == 'Find') {
        $method.next().text(" find( " + index + " )");
        control.find(index);
        firstSelected = -1;
    }
    else if (firstSelected < 0) {
        var methodName = "union";
        if ($method.val() == 'Connected') {
            methodName = "connected";
        }
        $method.next().text(methodName + "( " + index + " , _ )");
        firstSelected = index;
    }
    else if ($method.val() == 'Union') {
        $method.next().text(" union( " + firstSelected + " , " + index + " )");
        control.union(firstSelected, index);
        firstSelected = -1;
    }
    else if ($method.val() == 'Connected') {
        $method.next().text(" connected( " + firstSelected + " , " + index + " )");
        control.connected(firstSelected, index);
        firstSelected = -1;
    }
}
// Reset selected values when new method is chosen
function setupRadio() {
    $('input[name=method]:radio', '#method').change(function () {
        resetElementSelections();
    });
}
setupRadio();
// Methods for positioning arrow
function setArrow(index) {
    console.log(index);
    var $arrow = $("#arrow");
    if (index == -1) {
        $arrow.addClass("hidden");
        $arrow.animate({ left: ($("#sortArrayElem0").position().left + 9) + "px" }, 0);
        return;
    }
    var left = $("#sortArrayElem" + index).position().left + 9;
    if ($arrow.hasClass("hidden")) {
        $arrow.removeClass("hidden");
    }
    else {
        $arrow.animate({ left: left + "px" }, 200);
    }
}
// New value in arrayElem
function setValueAtIndex(i, value) {
    var $elem = $("#arrayElem" + i).children(".content");
    $elem.empty();
    $elem.append("" + value);
}
// New value in arrayElem
function setValueAtSortIndex(i, value) {
    var $elem = $("#sortArrayElem" + i).children(".content");
    $elem.empty();
    $elem.append("" + value);
}
// Add a new element to the array
function insertNewElem(i, val) {
    console.log(allNodes);
    var arrayLength = control.getArrayClone().length;
    $("#rightBracket").css({
        "left": 683 + ((arrayLength - 10) * 70) + "px"
    });
    $("#arrayUL").append("<li id='arrayElem" + i + "'><div class='index'>" + i + "</div><div class='content' id='arrayContent" + i + "'>" + val + "</div></li>");
    var left = (i * 70) + "px";
    $("#arrayElem" + i).animate({ left: left }, 0);
    insertNewNode(i, val);
}
function insertNewElemConnect(child, parent) {
    if (allNodes[child] === undefined || allNodes[parent] === undefined)
        return;
    // If the two nodes are the same
    if (child == parent) {
        $("#graphUL li").each(function () {
            $(this).removeClass("selected");
        });
        return;
    }
    var parentNode = allNodes[parent];
    var childNode = allNodes[child];
    //To avoid removing and re-adding a child to its own parent
    if (childNode.parent == parentNode) {
        return;
    }
    parentNode.addChild(childNode);
    positioningNodes(500);
}
function removeElem(i, delArray) {
    if (allNodes[i] === undefined)
        return;
    // Set timeout to avoid deleting node before swapElement function has finished executing
    setTimeout(function () {
        var arrayLength = control.getArrayClone().length;
        $("#rightBracket").css({
            "left": 683 + ((arrayLength - 10) * 70) + "px"
        });
        if (delArray)
            $("#arrayElem" + i).remove();
        console.log(allNodes[i].parent);
        //allNodes[i].reset();
        $("#node" + i).fadeOut(2000, function () {
            $(this).remove();
        });
        allNodes[i].parent.removeChild(allNodes[i]);
        //allNodes[i].reset();
        allNodes.pop();
    }, 1000);
}
// Swap position of two graphNodes
function swapNodes(child, parent) {
    if (allNodes[parent] === undefined)
        return;
    // Get coordinates
    var tmp = allNodes[parent].value;
    var pTop = allNodes[parent].top;
    var pLeft = allNodes[parent].left;
    var cTop = allNodes[child].top;
    var cLeft = allNodes[child].left;
    // Animate swap => when done change value and reset position
    $("#node" + parent).animate({
        left: allNodes[child].left + 'px',
        top: allNodes[child].top + 'px'
    }, 1000, function () {
        allNodes[parent].changeValue(allNodes[child].value);
        // Reset node position
        $("#node" + parent).css({ 'left': pLeft + 'px', 'top': pTop + 'px' });
    });
    $("#node" + child).animate({
        left: allNodes[parent].left + 'px',
        top: allNodes[parent].top + 'px'
    }, 1000, function () {
        if (allNodes[child] == undefined)
            return;
        allNodes[child].changeValue(tmp);
        // Reset node position
        $("#node" + child).css({ 'left': cLeft + 'px', 'top': cTop + 'px' });
    });
}
// Connecting two nodes
function connectNodes(child, parent) {
    if (allNodes[child] === undefined)
        return;
    // If the two nodes are the same
    if (child == parent) {
        $("#graphUL li").each(function () {
            $(this).removeClass("selected");
        });
        return;
    }
    var parentNode = allNodes[parent];
    var childNode = allNodes[child];
    //To avoid removing and re-adding a child to its own parent
    if (childNode.parent == parentNode) {
        return;
    }
    parentNode.addChild(childNode);
    positioningNodes(animationTime);
}
function selectIndex(index, select) {
    $("#arrayElem" + index + ", #node" + index).each(function () {
        if (select) {
            $(this).addClass("selected");
        }
        else {
            $(this).removeClass("selected");
        }
    });
}
function deselectNodeIndex(index) {
    $("#node" + index).each(function () {
        $(this).removeClass("selected");
        $(this).removeClass("green");
    });
}
function deselectArrayElement(index) {
    $("#arrayElem" + index).removeClass("selected");
}
function highlightNode(index, color) {
    if (color.toLowerCase() == "green" || color.toLowerCase() == "orange") {
        $("#arrayElem" + index + ", #node" + index).each(function () {
            removeHighlight(index);
            $(this).addClass(color);
        });
    }
    else {
        console.log("*** WARNING: Unknown color, " + color + " *** ");
    }
}
function sortHighlightElem(index, color) {
    if (color.toLowerCase() == "green" || color.toLowerCase() == "orange") {
        removeSortHighlight(index);
        $("#sortArrayContent" + index).addClass("highlight" + color);
    }
    else {
        console.log("*** WARNING: Unknown color, " + color + " *** ");
    }
}
function removeSortHighlight(index) {
    $("#sortArrayContent" + index).removeClass("highlightgreen highlightorange");
}
function removeHighlight(index) {
    $("#arrayElem" + index + ", #node" + index).each(function () {
        $(this).removeClass("green");
        $(this).removeClass("orange");
    });
}
function resetElementSelections() {
    firstSelected = -1;
    for (var i = 0; i < 10; i++) {
        selectIndex(i, false);
    }
}
function deselectNodeSelections() {
    for (var i = 0; i < 10; i++) {
        deselectNodeIndex(i);
    }
}
function deselectArrayElemSelections() {
    for (var i = 0; i < 10; i++) {
        deselectArrayElement(i);
    }
}
function saveState(backendArray) {
    viewer.saveState(getGraphState(), backendArray);
}
function setState(backendArrayJSON, twoDimRelationshipArrayJSON) {
    var twoDimRelationshipArray = JSON.parse(twoDimRelationshipArrayJSON);
    var backendArray = JSON.parse(backendArrayJSON);
    superNode.children = new Array;
    $("#graphUL svg#lines line").each(function () {
        $(this).remove();
    });
    idCounter = 0;
    // Reset all nodes and remove all lines
    for (var _i = 0, allNodes_1 = allNodes; _i < allNodes_1.length; _i++) {
        var node = allNodes_1[_i];
        node.reset();
        node.parent = superNode;
        superNode.children.push(node);
    }
    // Connect nodes
    for (var j = 0; j < twoDimRelationshipArray.length; j++) {
        for (var i = 0; i < twoDimRelationshipArray[j].length; i++) {
            allNodes[j].addChild(allNodes[twoDimRelationshipArray[j][i]]);
        }
    }
    // Set the frontend array based on the given param (using setValueAtIndex())
    for (var i = 0; i < backendArray.length; i++) {
        setValueAtIndex(i, backendArray[i]);
    }
    for (var _a = 0, allNodes_2 = allNodes; _a < allNodes_2.length; _a++) {
        var node = allNodes_2[_a];
        $("#node" + node.id).finish();
    }
    //Animation time = 0
    positioningNodes(0);
}
function setCheckMark(check, indexA, indexB) {
    if (check) {
        var $A = allNodes[indexA];
        var $B = allNodes[indexB];
        $("#correctImgA").css({ left: $A.left, top: $A.top }).removeClass("hidden");
        $("#correctImgB").css({ left: $B.left, top: $B.top }).removeClass("hidden");
    }
    else {
        $("#correctImgA").addClass("hidden");
        $("#correctImgB").addClass("hidden");
    }
}
function setWrongMark(check, indexA, indexB) {
    if (check) {
        var $A = allNodes[indexA];
        var $B = allNodes[indexB];
        $("#wrongImgA").css({ left: $A.left, top: $A.top }).removeClass("hidden");
        $("#wrongImgB").css({ left: $B.left, top: $B.top }).removeClass("hidden");
    }
    else {
        $("#wrongImgA").addClass("hidden");
        $("#wrongImgB").addClass("hidden");
    }
}
function screenLock(lock) {
    locked = lock;
    if (lock) {
        $("#addElem").attr({ "disabled": "true" });
        $("#removeElem").attr({ "disabled": "true" });
    }
    else {
        $("#addElem").removeAttr("disabled");
        $("#removeElem").removeAttr("disabled");
    }
}
function stepBack() {
    if (firstSelected != -1) {
        selectIndex(firstSelected, false);
        firstSelected = -1;
    }
    else {
        viewer.stepBack(getGraphState(), getArrayState());
    }
}
function setHeaderText(text) {
    $("#headerText").html(text);
}
function setSlow() {
    animationTime = 6000;
    viewer.setSlow();
}
function setMedium() {
    animationTime = 2500;
    viewer.setMedium();
}
function setFast() {
    animationTime = 1000;
    viewer.setFast();
}
function setupSpeedButtons() {
    // Default is medium
    setMedium();
    $("#medium").addClass("active");
    // Set onClickListener
    $("#slow , #medium , #fast").each(function () {
        $(this).click(function () {
            $("#slow , #medium , #fast").each(function () {
                $(this).removeClass('active');
            });
            $(this).addClass('active');
        });
    });
}
setupSpeedButtons();
function setUpAddButton() {
    $("#addElem").click(function () {
        var val = prompt("Which value do you want to add? Integer >= 0");
        while (isNaN(parseInt(val))) {
            //val = prompt("Which value do you want to add? Integer >= 0");
            return;
        }
        viewer.addNode(parseInt(val));
    });
}
setUpAddButton();
function setUpRemoveButton() {
    $("#removeElem").click(function () {
        viewer.removeNode();
    });
}
setUpRemoveButton();