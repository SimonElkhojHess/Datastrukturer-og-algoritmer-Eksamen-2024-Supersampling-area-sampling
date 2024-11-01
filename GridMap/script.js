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

    const cellSize = 25;

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


    // Reset startCell and endCell
    startCell = null;
    endCell = null;

    highlightCells(centerX, centerY, radius, cellSize);
}

function highlightCells(centerX, centerY, radius, cellSize) {
    const map = document.getElementById("map");
    const cells = map.getElementsByClassName("cell");
    const samplesPerSide = 5;

    // Loop through each cell
    for (let cell of cells) {
        const col = parseInt(cell.dataset.col);
        const row = parseInt(cell.dataset.row);

        // calculate cell's top-left coordinates
        const cellX = col * cellSize;
        const cellY = row * cellSize;

        let insideCount = 0;
        const totalSamples = samplesPerSide * samplesPerSide;

        const sampleSpacing = cellSize / samplesPerSide;

        // Supersampling
        for ( let i = 0; i < samplesPerSide; i++) {
            for (let j = 0; j < samplesPerSide; j++) {
                // Subcell center coordinates
                const sampleX = cellX + (i + 0.5) * sampleSpacing;
                const sampleY = cellY + (j + 0.5) * sampleSpacing;

                // Distance from circle center
                const dx = sampleX - centerX;
                const dy = sampleY - centerY;
                const distanceSquared = dx * dx + dy* dy;

                if (distanceSquared <= radius * radius) {
                    insideCount++;
                }
            }
        }
        const coverageRatio = insideCount / totalSamples;

        // Highlight if coverage > 50%
        if (coverageRatio >= 0.49) {
            cell.classList.add("highlight");
        }
    }




}