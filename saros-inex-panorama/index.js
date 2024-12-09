const canvas = document.getElementById('grid');
const ctx = canvas.getContext("2d");
const img = document.getElementById('img');
const info = document.getElementById('info');
const info_date = document.getElementById('info-date');
const info_type = document.getElementById('info-type');
const info_saros = document.getElementById('info-saros');
const info_inex = document.getElementById('info-inex');

var offsetX = 0;
var offsetY = 0;
var scale = 1;
var data;
const cellSize = 20;

function getColor(x, y) {
    var r = 255;
    var g = 255;
    var b = 255;
    if (data != undefined) {
        eclipse = data.eclipses[`${x},${y}`];
        if (eclipse != undefined) {
            if (eclipse.type == 'T') {
                r = 0;
                g = 255;
                b = 255;
            } else if (eclipse.type == 'A') {
                r = 255;
                g = 0;
                b = 0;
            } else if (eclipse.type == 'H') {
                r = 255;
                g = 255;
                b = 0;
            } else if (eclipse.type == 'P') {
                r = 0;
                g = 255;
                b = 0;
            } else {
                return null;
            }
        } else {
            return null;
        }
    } else {
        return null;
    }
    return `rgb(${r}, ${g}, ${b})`;
}

function getEclipse(x, y) {
    if (data != undefined) {
        eclipse = data.eclipses[`${x},${y}`];
        if (eclipse != undefined) {
            return eclipse;
        }
    }
    return null;
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaledCellSize = cellSize * scale;
    const cols = Math.ceil(canvas.width / scaledCellSize) + 2;
    const rows = Math.ceil(canvas.height / scaledCellSize) + 2;

    const startX = Math.floor(-offsetX / scaledCellSize) - 1;
    const startY = Math.floor(-offsetY / scaledCellSize) - 1;

    const sub = (scale > 1 ? 2 : (scale > 0.35 ? 1 : 0));

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = startX + col;
            const y = startY + row;

            let color = getColor(x, y);
            if (color) {
                ctx.fillStyle = color;
                ctx.fillRect(
                    x * scaledCellSize + offsetX,
                    y * scaledCellSize + offsetY,
                    scaledCellSize - sub,
                    scaledCellSize - sub
                );
            }
        }
    }
}

function onResize() {
    canvas.setAttribute("height", window.innerHeight);
    canvas.setAttribute("width", window.innerWidth);
    drawGrid();
}

var isDragging = false;
var dragStartX, dragStartY;
canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
});

canvas.addEventListener("mousemove", (e) => {
    if (isDragging) {
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        dragStartX = e.clientX;
        dragStartY = e.clientY;

        offsetX += dx;
        offsetY += dy;

        drawGrid();
    } else {
        const worldX = (e.offsetX - offsetX) / scale;
        const worldY = (e.offsetY - offsetY) / scale;

        const hoveredCellX = Math.floor(worldX / cellSize);
        const hoveredCellY = Math.floor(worldY / cellSize);

        // console.log(`Hovered Cell: (${hoveredCellX}, ${hoveredCellY})`);

        const eclipse = getEclipse(hoveredCellX, hoveredCellY);
        if (eclipse) {
            img.hidden = false;
            img.src = eclipse.img;

            info.hidden = false;
            info_date.innerText = `${eclipse.year}-${eclipse.month}-${eclipse.day}`;
            if (eclipse.type == 'H') info_type.innerText = "Hybrid";
            else if (eclipse.type == 'T') info_type.innerText = "Total";
            else if (eclipse.type == 'A') info_type.innerText = "Annular";
            else if (eclipse.type == 'P') info_type.innerText = "Partial";
            else info_type.innerText = "ERROR";
            info_saros.innerText = eclipse.saros;
            info_inex.innerText = eclipse.inex;
        } else {
            img.hidden = true;
            info.hidden = true;
        }

        if (scale > 0.35) {
            drawGrid();

            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            ctx.strokeRect(
                hoveredCellX * cellSize * scale + offsetX,
                hoveredCellY * cellSize * scale + offsetY,
                cellSize * scale,
                cellSize * scale
            );
        }
    }
});

canvas.addEventListener("mouseup", () => {
    isDragging = false;
});

canvas.addEventListener("mouseout", () => {
    isDragging = false;
});

canvas.addEventListener("wheel", (e) => {
    const zoomIntensity = 0.1;
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    const zoom = e.deltaY > 0 ? 1 / (1 + zoomIntensity) : 1 + zoomIntensity;

    const worldX = (mouseX - offsetX) / scale;
    const worldY = (mouseY - offsetY) / scale;

    scale *= zoom;

    scale = Math.max(0.1, scale);

    offsetX = mouseX - worldX * scale;
    offsetY = mouseY - worldY * scale;

    drawGrid();
});

function main() {
    img.hidden = true;
    info.hidden = true;

    img.onerror = function () {
        this.src = './no_eclipse_image.gif';
    };

    fetch('./eclipses.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(api_data => {
            data = api_data;
            onResize();
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
    onResize();
}

main();
