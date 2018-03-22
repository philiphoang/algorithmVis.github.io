/**
 * File created by Philip Hoang 12.02.18
 * File designed and written by Kenneth Apeland
 */
///<reference path="EventManager.ts"/>
///<reference path="View.ts"/>
///<reference path="InitArray.ts"/>
var n = 10;
var sortArray = [];
var copyArray = [];
var running = true;
function checkIfAlreadyRunning() {
    manager.clear();
    viewer.setPause();
}
function startMergeSort() {
    checkIfAlreadyRunning();
    copyArray = returnArray();
    mergesort(copyArray);
}
function mergesort(array) {
    if (array.length < 2) {
        //denne er ekkel
        viewer.deselectPivotElement(array[0]);
        return array;
    }
    else {
        var mid = void 0;
        var left = void 0;
        var right = void 0;
        mid = Math.floor(array.length * 0.5);
        left = array.slice(0, mid);
        right = array.slice(mid);
        //denne og er ekkel
        viewer.setPivotElement(right[0]);
        viewer.setColorInArrayElements(left, 1, true);
        viewer.setColorInArrayElements(right, 2, true);
        viewer.lowerElements(left);
        viewer.lowerElements(right);
        viewer.setColorInArrayElements(left, 1, false);
        viewer.setColorInArrayElements(right, 2, false);
        //Split until there is only 1 element left
        return merge(mergesort(left), mergesort(right));
    }
}
function merge(left, right) {
    var result = [];
    var testing = copyArray.slice(0);
    var tempLeftIndex = 0;
    var tempRightIndex = 0;
    var counter = copyArray.indexOf(left[0]);
    while (tempLeftIndex < left.length && tempRightIndex < right.length) {
        //Compare the elements from each array
        viewer.setColorInArrayElement(left[tempLeftIndex], 0, true);
        viewer.setColorInArrayElement(right[tempRightIndex], 0, true);
        if (left[tempLeftIndex] < right[tempRightIndex]) {
            viewer.setColorInArrayElement(left[tempLeftIndex], 3, true);
            viewer.moveElementToPlace(left[tempLeftIndex], counter, copyArray.indexOf(left[tempLeftIndex]));
            result.push(left[tempLeftIndex]);
            testing[counter] = left[tempLeftIndex];
            counter++;
            tempLeftIndex++;
        }
        else {
            viewer.setColorInArrayElement(right[tempRightIndex], 3, true);
            viewer.moveElementToPlace(right[tempRightIndex], counter, copyArray.indexOf(right[tempRightIndex]));
            result.push(right[tempRightIndex]);
            testing[counter] = right[tempRightIndex];
            counter++;
            tempRightIndex++;
        }
    }
    if (right.slice(tempRightIndex).length > 0) {
        var moreRight = right.slice(tempRightIndex);
        viewer.setColorInArrayElements(moreRight, 3, true);
        for (var i = 0; i < moreRight.length; i++) {
            viewer.moveElementToPlace(moreRight[i], counter, copyArray.indexOf(moreRight[i]));
            testing[counter] = moreRight[i];
            counter++;
        }
    }
    if (left.slice(tempLeftIndex).length > 0) {
        var moreLeft = left.slice(tempLeftIndex);
        viewer.setColorInArrayElements(moreLeft, 3, true);
        for (var i = 0; i < moreLeft.length; i++) {
            viewer.moveElementToPlace(moreLeft[i], counter, copyArray.indexOf(moreLeft[i]));
            testing[counter] = moreLeft[i];
            counter++;
        }
    }
    viewer.setColorInArrayElements(testing, 3, false);
    copyArray = testing.slice(0);
    return result.concat(left.slice(tempLeftIndex)).concat(right.slice(tempRightIndex));
}
function setRandomMyArray() {
    for (var i = 0; i < n; i++) {
        sortArray[i] = randomInt(0, 99);
    }
    return sortArray;
}
function setSortedArray() {
    var arr = setRandomMyArray();
    return arr.sort(function (n1, n2) { return n1 - n2; });
}
function setInvSortedArray() {
    return setSortedArray().reverse();
}
function isSorted(arr) {
    return arr.forEach(function (n1, n2) { return n1 <= n2; });
}
function setAlmostSortedArray() {
    var arr = setSortedArray();
    for (var i = 1; i < arr.length - 1; i++) {
        if (Math.random() < 0.70) {
            if (Math.random() < 0.5) {
                var temp = arr[i];
                arr[i] = arr[i + 1];
                arr[i + 1] = temp;
            }
            else {
                var temp = arr[i];
                arr[i] = arr[i - 1];
                arr[i - 1] = temp;
            }
        }
    }
    //If sorted array, try again.
    if (isSorted(arr)) {
        return setAlmostSortedArray();
    }
    return arr;
}
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}