"use strict";

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
    const startCol = parseInt(startCell.dataset.col);
    const startRow = parseInt(startCell.dataset.row);
    const endCol = parseInt(endCell.dataset.col);
    const endRow = parseInt(endCell.dataset.row);

    const cellSize = 25;

    const startX = startCol * 25;
    const startY = startRow * 25;

    const endX = (endCol + 1) * 25;
    const endY = (endRow + 1) * 25;

    const centerX = (startX + endX) / 2;
    const centerY = (startY + endY) / 2;

    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const targetDiameter = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const targetRadius = targetDiameter / 2;

    startCell = null;
    endCell = null;

    animateCircleExpansion(centerX, centerY, targetRadius, cellSize);
}

function animateCircleExpansion(centerX, centerY, targetRadius, cellSize)
{
    let currentRadius = 0;

    clearHighlightedCellsAndCircle();

    const circle = document.createElement("div");
    circle.classList.add("circle");
    document.getElementById("map").appendChild(circle);




    function animate()
    {
        currentRadius += targetRadius / 60;

        if (currentRadius > targetRadius)
        {
            currentRadius = targetRadius;
        }

        circle.style.width = `${currentRadius * 2}px`;
        circle.style.height = `${currentRadius * 2}px`;
        circle.style.left = `${centerX}px`;
        circle.style.top = `${centerY}px`;

        highlightCells(centerX, centerY, currentRadius, cellSize);

        if (currentRadius < targetRadius)
        {
            requestAnimationFrame(animate);
        }
    }

    animate();
}

function clearHighlightedCellsAndCircle()
{
    const highlightedCells = document.querySelectorAll(".cell.highlight");
    const circle = document.querySelector(".circle");

    if (circle)
    {
        circle.parentElement.removeChild(circle);
    }
    highlightedCells.forEach(cell => cell.classList.remove("highlight"));
}



function highlightCells(centerX, centerY, radius, cellSize)
{
    const map = document.getElementById("map");
    const samplesPerSide = 5;

    const minCol = Math.floor((centerX - radius) / cellSize);
    const maxCol = Math.ceil((centerX + radius) / cellSize);
    const minRow = Math.floor((centerY - radius) / cellSize);
    const maxRow = Math.ceil((centerY + radius) / cellSize);

    for (let col = minCol; col <= maxCol; col++)
    {
        for (let row = minRow; row <= maxRow; row++)
        {
            if (col < 0 || row < 0) continue;

            const cell = document.querySelector(`.cell[data-col='${col}'][data-row='${row}']`);
            if (!cell) continue;

            const cellX = col * cellSize;
            const cellY = row * cellSize;

            let insideCount = 0;
            const totalSamples = samplesPerSide * samplesPerSide;

            const sampleSpacing = cellSize / samplesPerSide;

            for ( let i = 0; i < samplesPerSide; i++)
            {
                for (let j = 0; j < samplesPerSide; j++)
                {
                    const sampleX = cellX + (i + 0.5) * sampleSpacing;
                    const sampleY = cellY + (j + 0.5) * sampleSpacing;

                    const dx = sampleX - centerX;
                    const dy = sampleY - centerY;
                    const distanceSquared = dx * dx + dy* dy;

                    if (distanceSquared <= radius * radius)
                    {
                        insideCount++;
                    }
                }
            }
            const coverageRatio = insideCount / totalSamples;

            if (coverageRatio >= 0.5)
            {
                cell.classList.add("highlight");
            }
        }
    }
}