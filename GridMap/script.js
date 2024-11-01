"use strict";

console.log("Hello Me");

let startCell = null;
let endCell = null;

// ******** CONTROLLER ********
document.addEventListener("DOMContentLoaded", start)

function start()
{
    document.getElementById("create-map").addEventListener("click", createMap)
}


// ******** VIEW ********

function createMap()
{

    let map = document.getElementById("map");
    map.innerHTML = "";
    let mapSizeWidth = 24;
    let mapSizeHeight = 24;
    for (let i = 0; i < mapSizeWidth; i++)
    {
        let col = document.createElement("div");
        col.classList.add("col");
        for (let j = 0; j < mapSizeHeight; j++)
        {
            let cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.col = i;
            cell.dataset.row = j;
            cell.addEventListener("mousedown", setStartCell);
            cell.addEventListener("mouseup", setEndCell);
            col.appendChild(cell);
        }
        map.appendChild(col)
    }
}

function setStartCell(event)
{
    startCell = event.target;
}

function setEndCell(event)
{
    endCell = event.target;
    if (startCell && endCell)
    {
        drawCircle();
    }
}

function drawCircle()
{

    // Getting the column and row of the start cell and of the end cell.
    const startCol = parseInt(startCell.dataset.col);
    const startRow = parseInt(startCell.dataset.row);
    const endCol = parseInt(endCell.dataset.col);
    const endRow = parseInt(endCell.dataset.row);

    // Test and confirm the cells coordinates.
    console.log("start position: " + startCol + ", " + startRow + ".");
    console.log("end position: " + endCol + ", " + endRow + ".");

    // Top left corner of the start cell the minus 1 is to align it on the screen
    const startX = startCol * 25 - 1;
    const startY = startRow * 25 - 1;

    // Bottom right corner of the end cell the minus 2 is to align it on the screen
    const endX = (endCol + 1) * 25 - 2;
    const endY = (endRow + 1) * 25 - 2;

    // The center of the circle
    const centerX = (startX + endX) / 2;
    const centerY = (startY + endY) / 2;

    // Getting the diameter and radius of the circle
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const diameter = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const radius = diameter / 2;

    // Creating the circle and adding the CSS styling
    const circle = document.createElement("div");
    circle.classList.add("circle");
    circle.style.width = `${diameter}px`;
    circle.style.height = `${diameter}px`;
    circle.style.left = `${centerX - radius}px`;
    circle.style.top = `${centerY - radius}px`;

    document.getElementById("map").appendChild(circle);

    checkClippedCells(centerX, centerY, radius)

    // Reset startCell and endCell
    startCell = null;
    endCell = null;
}

function checkClippedCells(centerX, centerY, radius) {
    const cells = document.querySelectorAll('.cell');
    console.log("In checkClippedCells")
    cells.forEach(cell => {
        const col = parseInt(cell.dataset.col);
        const row = parseInt(cell.dataset.row);
        const cellLeft = col * 25;
        const cellTop = row * 25;
        const cellRight = cellLeft + 25;
        const cellBottom = cellTop + 25;

        // Represent the cell as a polygon
        const cellPolygon = [
            { x: cellLeft, y: cellTop },
            { x: cellRight, y: cellTop },
            { x: cellRight, y: cellBottom },
            { x: cellLeft, y: cellBottom }
        ];

        // Approximate the circle as a polygon with many vertices
        const circlePolygon = approximateCircleAsPolygon(centerX, centerY, radius, 36); // 36 vertices

        // Clip the cell polygon with the circle polygon
        const clippedPolygon = greinerHormannClip(cellPolygon, circlePolygon);

        console.log(clippedPolygon + circlePolygon)

        // If the clipped polygon is not empty, the cell is clipped by the circle
        if (clippedPolygon.length > 0) {
            cell.classList.add("clipped-cell")
        } else {
            cell.classList.remove("clipped-cell")
        }

        console.log("end of checkClippedCells")
    });
}

function approximateCircleAsPolygon(centerX, centerY, radius, numVertices) {
    console.log("approximateCircleAsPolygon start")
    const vertices = [];
    for (let i = 0; i < numVertices; i++) {
        const angle = (2 * Math.PI * i) / numVertices;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        vertices.push({ x, y });
    }
    console.log(vertices)
    console.log("end of approximateCircleAsPolygon")
    return vertices;
}

function greinerHormannClip(subjectPolygon, clipPolygon) {
    console.log("start GreinerHormannClip")
    // Initialize lists
    let subjectList = createPolygonList(subjectPolygon);
    let clipList = createPolygonList(clipPolygon);

    // Find intersections and classify them
    findIntersections(subjectList, clipList);

    // Generate clipped polygons
    let resultPolygons = generateClippedPolygons(subjectList, clipList);
    console.log(resultPolygons)
    console.log("end of greinerHormannClip")

    return resultPolygons;
}

function createPolygonList(polygon) {
    console.log("start createPolygonList")
    let nodeList = [];
    for (let i = 0; i < polygon.length; i++) {
        nodeList.push({
            x: polygon[i].x,
            y: polygon[i].y,
            next: null,
            prev: null,
            intersect: false,
            entry: null,
            alpha: null,
            neighbor: null
        });
    }
    for (let i = 0; i < nodeList.length; i++) {
        nodeList[i].next = nodeList[(i + 1) % nodeList.length];
        nodeList[i].prev = nodeList[(i - 1 + nodeList.length) % nodeList.length];
    }
    console.log(nodeList)
    console.log("end of createPolygonList")
    return nodeList;
}

function findIntersections(subjectList, clipList) {
    console.log("start findIntersections")
    for (let sNode of subjectList) {
        for (let cNode of clipList) {
            let intersection = findIntersection(sNode, sNode.next, cNode, cNode.next);
            if (intersection) {
                let sIntersectionNode = {
                    x: intersection.x,
                    y: intersection.y,
                    next: null,
                    prev: null,
                    intersect: true,
                    entry: null,
                    alpha: intersection.alpha1,
                    neighbor: null
                };
                let cIntersectionNode = {
                    x: intersection.x,
                    y: intersection.y,
                    next: null,
                    prev: null,
                    intersect: true,
                    entry: null,
                    alpha: intersection.alpha2,
                    neighbor: null
                };
                sIntersectionNode.neighbor = cIntersectionNode;
                cIntersectionNode.neighbor = sIntersectionNode;

                insertNode(sNode, sIntersectionNode);
                insertNode(cNode, cIntersectionNode);
            }
        }
    }
    console.log("end of findIntersections")
}

function findIntersection(s1, s2, c1, c2) {
    console.log("Start findIntersection");
    console.log(`s1: (${s1.x}, ${s1.y}), s2: (${s2.x}, ${s2.y}), c1: (${c1.x}, ${c1.y}), c2: (${c2.x}, ${c2.y})`);

    let a1 = s2.y - s1.y;
    let b1 = s1.x - s2.x;
    let c1_ = a1 * s1.x + b1 * s1.y;

    let a2 = c2.y - c1.y;
    let b2 = c1.x - c2.x;
    let c2_ = a2 * c1.x + b2 * c1.y;

    let det = a1 * b2 - a2 * b1;
    if (Math.abs(det) < 1e-10) {
        console.log("Lines are parallel");
        return null; // Lines are parallel
    }

    let x = (b2 * c1_ - b1 * c2_) / det;
    let y = (a1 * c2_ - a2 * c1_) / det;

    console.log(`Intersection point: (${x}, ${y})`);

    let alpha1, alpha2;

    if (Math.abs(s2.x - s1.x) > Math.abs(s2.y - s1.y)) {
        alpha1 = (x - s1.x) / (s2.x - s1.x);
    } else {
        alpha1 = (y - s1.y) / (s2.y - s1.y);
    }

    if (Math.abs(c2.x - c1.x) > Math.abs(c2.y - c1.y)) {
        alpha2 = (x - c1.x) / (c2.x - c1.x);
    } else {
        alpha2 = (y - c1.y) / (c2.y - c1.y);
    }

    console.log(`Alpha values: alpha1 = ${alpha1}, alpha2 = ${alpha2}`);

    if (alpha1 >= 0 && alpha1 <= 1 && alpha2 >= 0 && alpha2 <= 1) {
        console.log("Intersection within segment bounds");
        return { x, y, alpha1, alpha2 };
    }

    console.log("Intersection outside segment bounds");
    return null;
}

function insertNode(existingNode, newNode) {
    console.log("stat of insertNode")
    newNode.next = existingNode.next;
    newNode.prev = existingNode;
    existingNode.next.prev = newNode;
    existingNode.next = newNode;
}

function generateClippedPolygons(subjectList, clipList) {
    console.log("generateClippedPolygons start")

    let resultPolygons = [];

    let startNode = subjectList.find(node => node.intersect && node.entry === null);
    while (startNode) {
        let clippedPolygon = [];
        let currentNode = startNode;

        do {
            clippedPolygon.push({ x: currentNode.x, y: currentNode.y });
            currentNode.intersect = false;
            if (currentNode.entry) {
                currentNode = currentNode.neighbor;
                while (!currentNode.intersect) {
                    clippedPolygon.push({ x: currentNode.x, y: currentNode.y });
                    currentNode = currentNode.next;
                }
            } else {
                currentNode = currentNode.next;
                while (!currentNode.intersect) {
                    clippedPolygon.push({ x: currentNode.x, y: currentNode.y });
                    currentNode = currentNode.next;
                }
                currentNode = currentNode.neighbor;
            }
        } while (currentNode !== startNode);

        resultPolygons.push(clippedPolygon);
        startNode = subjectList.find(node => node.intersect && node.entry === null);
    }

    console.log(resultPolygons)
    console.log("end of generateClippedPolygons")
    return resultPolygons;
}