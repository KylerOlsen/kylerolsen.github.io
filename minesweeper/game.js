var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext("2d");
ctx.font = "10px Arial";
//ctx.textAlign = "center";
var grid = {
    xOff: 0,
    yOff: 0,
    zoom: 0.07,
    draw: function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var sqr;
        //console.log(squares);

        for (var x = Math.floor(this.xOff * this.zoom); x < Math.floor((this.xOff + canvas.width) * this.zoom) + 1; x++) {
            for (var y = Math.floor(this.yOff * this.zoom); y < Math.floor((this.yOff + canvas.height) * this.zoom) + 1; y++) {
                if (gameover && mines.get(x, y)) {
                    ctx.fillStyle = "#000000";
                    ctx.fillRect((x / this.zoom) - this.xOff, (y / this.zoom) - this.yOff, (((x + 1) / this.zoom) - this.xOff) - ((x / this.zoom) - this.xOff), (((y + 1) / this.zoom) - this.yOff) - ((y / this.zoom) - this.yOff));
                }
                //if (x % 5 == 0 && y % 5 == 0)
                sqr = squares.get("x" + x.toString() + "y" + y.toString())
                if (sqr >= 0) {
                    ctx.fillStyle = "#888888";
                    ctx.fillRect((x / this.zoom) - this.xOff, (y / this.zoom) - this.yOff, (((x + 1) / this.zoom) - this.xOff) - ((x / this.zoom) - this.xOff), (((y + 1) / this.zoom) - this.yOff) - ((y / this.zoom) - this.yOff));
                    if (sqr == 0) ctx.fillStyle = "#888888";
                    else if (sqr == 1) ctx.fillStyle = "#0000FF";
                    else if (sqr == 2) ctx.fillStyle = "#00FF00";
                    else if (sqr == 3) ctx.fillStyle = "#FF0000";
                    else if (sqr == 4) ctx.fillStyle = "#000088";
                    else if (sqr == 5) ctx.fillStyle = "#880000";
                    else if (sqr == 6) ctx.fillStyle = "#00FFFF";
                    else if (sqr == 7) ctx.fillStyle = "#CC00CC";
                    else if (sqr == 8) ctx.fillStyle = "#444444";
                    ctx.fillText(sqr, (((((x + 1) / this.zoom) - this.xOff) + ((x / this.zoom) - this.xOff)) / 2) - 3, (((((y + 1) / this.zoom) - this.yOff) + ((y / this.zoom) - this.yOff)) / 2) + 3);
                } else if (sqr == -1) {
                    if (!gameover) {
                        ctx.fillStyle = "#FF0000";
                        ctx.fillRect((x / this.zoom) - this.xOff, (y / this.zoom) - this.yOff, (((x + 1) / this.zoom) - this.xOff) - ((x / this.zoom) - this.xOff), (((y + 1) / this.zoom) - this.yOff) - ((y / this.zoom) - this.yOff));
                    } else if (gameover && mines.get(x, y)) {
                        ctx.fillStyle = "#FF0000";
                        ctx.fillRect((x / this.zoom) - this.xOff, (y / this.zoom) - this.yOff, (((x + 1) / this.zoom) - this.xOff) - ((x / this.zoom) - this.xOff), (((y + 1) / this.zoom) - this.yOff) - ((y / this.zoom) - this.yOff));
                    } else {
                        ctx.fillStyle = "#880000";
                        ctx.fillRect((x / this.zoom) - this.xOff, (y / this.zoom) - this.yOff, (((x + 1) / this.zoom) - this.xOff) - ((x / this.zoom) - this.xOff), (((y + 1) / this.zoom) - this.yOff) - ((y / this.zoom) - this.yOff));
                    }
                }
            }
        }


        ctx.fillStyle = "#000000";
        ctx.beginPath();
        for (var x = Math.floor(this.xOff * this.zoom); x < Math.floor((this.xOff + canvas.width) * this.zoom) + 1; x++) {
            ctx.moveTo((x / this.zoom) - this.xOff, 0);
            ctx.lineTo((x / this.zoom) - this.xOff, canvas.height);
        }
        for (var y = Math.floor(this.yOff * this.zoom); y < Math.floor((this.yOff + canvas.height) * this.zoom) + 1; y++) {
            ctx.moveTo(0, (y / this.zoom) - this.yOff);
            ctx.lineTo(canvas.width, (y / this.zoom) - this.yOff);
        }
        ctx.stroke();

    }
};
var mines = {
    seeds: [Math.random() / 1,
            Math.random() / 1,
            Math.random() / 1,
            Math.random() / 1,
            Math.random() / 1,
            Math.random() / 1,
            Math.random() / 1,
            Math.random() / 1,
            Math.random() / 1,
            Math.random() / 1,
            Math.random() / 1,
            Math.random() / 1],
    rarity: 0.2,
    get: function (x, y) {
        x = x + 837888;
        x = x * 526539824851;
        x = x % 5476;
        x = x + 938431;
        x = x * 434783784310;
        x = x % 1634;
        
        y = y + 338735;
        y = y * 973245685325;
        y = y % 3677;
        y = y + 584694;
        y = y * 543664398948;
        y = y % 6986;
        return (Math.sin(x * this.seeds[0] + y * this.seeds[1] + this.seeds[2]) *
            Math.cos(x * this.seeds[3] * y * this.seeds[4] + this.seeds[5]) *
            Math.sin(x * this.seeds[6] + y * this.seeds[7] + this.seeds[8]) *
            Math.cos(x * this.seeds[9] * y * this.seeds[10] + this.seeds[11])) > this.rarity;
    }
};
var squares = new Map();

var dx = 0,
    dy = 0,
    vx = 0,
    vy = 0,
    drag = false,
    delayedDrag = false,
    moved = false,
    gameover = false,
    t = 0,
    d = new Date();

onResize();
document.getElementById("gameCanvas").addEventListener("wheel", function (event) {
    //return;

    var x = Math.floor((grid.xOff + dx) * grid.zoom);
    var y = Math.floor((grid.yOff + dy) * grid.zoom);

    grid.zoom += (event.deltaY / 100000);
    
    if (grid.zoom > 1) grid.zoom = 1;
    if (grid.zoom < 0.001) grid.zoom = 0.001;

    grid.xOff = Math.floor(x/grid.zoom)-Math.floor(dx*0.99);
    grid.yOff = Math.floor(y/grid.zoom)-Math.floor(dy*0.99);

    grid.draw();
    save();
});
document.getElementById("gameCanvas").addEventListener('contextmenu', function (event) {
    event.preventDefault();
});
document.getElementById("gameCanvas").addEventListener('touchstart', function (event) {
    d = new Date();
    dx = event.pageX;
    dy = event.pageY;
    t = d.getTime();
    //location.reload();
});
document.getElementById("gameCanvas").addEventListener('touchmove', function (event) {

    if (Math.abs(grid.xOff + (dx - event.pageX)) > 1 && Math.abs(grid.yOff + (dy - event.pageY)) > 1) moved = true;
    //grid.xOff = Math.floor(grid.xOff + (dx - event.pageX));
    //grid.yOff = Math.floor(grid.yOff + (dy - event.pageY));
    vx = dx - event.pageX;
    vy = dy - event.pageY;

    dx = event.pageX;
    dy = event.pageY;
    grid.draw();
    //}
});
document.getElementById("gameCanvas").addEventListener('touchend', function (event) {
    d = new Date();
    //return;
    var x = Math.floor((event.pageX + grid.xOff) * grid.zoom);
    var y = Math.floor((event.pageY + grid.yOff) * grid.zoom);
    var nm = "x" + x.toString() + "y" + y.toString();
    if (!moved && t != 0) {
        //location.reload();

        //ctx.fillText((d.getTime() - t).toString(), 100, 100);
        //ctx.fillText((t).toString(), 100, 120);
        //ctx.fillText((d.getTime()).toString(), 100, 140);
        if (!gameover && (d.getTime() - t) <= 300) {
            //location.reload();
            if (mines.get(x, y) && (!squares.has(nm))) gameover = true;
            else search(x, y);
            grid.draw();
        } else if (!gameover) {
            if (!squares.has(nm))
                squares.set(nm, -1);
            else if (squares.get(nm) == -1)
                squares.delete(nm);
            grid.draw();
        }
    }
    t = 0;
    moved = false;
    save();
});

function mouseDown(event) {
    if (event.button == 0) {
        delayedDrag = true;
        moved = false;
        dx = event.pageX;
        dy = event.pageY;
    }
    if (event.button == 1) {
        drag = true;
        moved = false;
        dx = event.pageX;
        dy = event.pageY;
    }
}

function mouseMove(event) {
    if (delayedDrag && (Math.abs((dx - event.pageX)) > 30 || Math.abs((dy - event.pageY)) > 30)) {
        drag = true;
        delayedDrag = false;
    } else if (!delayedDrag && !drag) {
        dx = event.pageX;
        dy = event.pageY;
    }
    if (drag) {
        //if (true) {
        grid.xOff = Math.floor(grid.xOff + (dx - event.pageX));
        grid.yOff = Math.floor(grid.yOff + (dy - event.pageY));
        //vx = dx - event.pageX;
        //vy = dy - event.pageY;
        dx = event.pageX;
        dy = event.pageY;
        grid.draw();
        moved = true;
    }
}

function mouseUp(event) {
    var x = Math.floor((event.pageX + grid.xOff) * grid.zoom);
    var y = Math.floor((event.pageY + grid.yOff) * grid.zoom);
    var nm = "x" + x.toString() + "y" + y.toString();
    delayedDrag = false;
    drag = false;
    if (!moved && t == 0) {
        moved = false;

        var tests = 0;
        // If the first move is a mine, regenerate the seeds until the first move is safe
        //console.log(squares.size);
        //while (squares.size <= 0 && mines.get(x, y)) {
        while (squares.size <= 0 &&
            (mines.get(x-1, y-1) ||
            mines.get(x, y-1) ||
            mines.get(x+1, y-1) ||
            mines.get(x-1, y) ||
            mines.get(x, y) ||
            mines.get(x+1, y) ||
            mines.get(x-1, y+1) ||
            mines.get(x, y+1) ||
            mines.get(x+1, y+1))
            ) {//*/
        /*while (squares.size <= 0 &&
            (mines.get(x-2, y-2) ||
            mines.get(x-1, y-2) ||
            mines.get(x, y-2) ||
            mines.get(x+1, y-2) ||
            mines.get(x+2, y-2) ||
            mines.get(x-2, y-1) ||
            mines.get(x-1, y-1) ||
            mines.get(x, y-1) ||
            mines.get(x+1, y-1) ||
            mines.get(x+2, y-1) ||
            mines.get(x-2, y) ||
            mines.get(x-1, y) ||
            mines.get(x, y) ||
            mines.get(x+1, y) ||
            mines.get(x+2, y) ||
            mines.get(x-2, y+1) ||
            mines.get(x-1, y+1) ||
            mines.get(x, y+1) ||
            mines.get(x+1, y+1) ||
            mines.get(x+2, y+1) ||
            mines.get(x-2, y+2) ||
            mines.get(x-1, y+2) ||
            mines.get(x, y+2) ||
            mines.get(x+1, y+2) ||
            mines.get(x+2, y+2))
            ) {//*/
            mines.seeds = [Math.random() / 1,
                           Math.random() / 1,
                           Math.random() / 1,
                           Math.random() / 1,
                           Math.random() / 1,
                           Math.random() / 1,
                           Math.random() / 1,
                           Math.random() / 1,
                           Math.random() / 1,
                           Math.random() / 1,
                           Math.random() / 1,
                           Math.random() / 1];
            tests++;
            if (tests >= 1000000) {
                alert("ERROR! - Can not find a safe start!")
                break;
            }
        }

        // Test if flagging or clicking
        if (event.button == 0 && !gameover) { // && ((d.getTime() - t) <= 1 || t == 0)) {
            if (mines.get(x, y) && (!squares.has(nm))) gameover = true;
            else search(x, y);
            grid.draw();
        }
        if (event.button == 2 && !gameover) { // && ((d.getTime() - t) > 1 || t == 0)) {
            if (!squares.has(nm))
                squares.set(nm, -1);
            else if (squares.get(nm) == -1)
                squares.delete(nm);
            grid.draw();
        }
        /*
        if (squares.get("x" + Math.floor((event.pageX + grid.xOff) * grid.zoom).toString() + "y" + Math.floor((event.pageY + grid.yOff) * grid.zoom).toString()) == undefined)
            squares.set("x" + Math.floor((event.pageX + grid.xOff) * grid.zoom).toString() + "y" + Math.floor((event.pageY + grid.yOff) * grid.zoom).toString(), 0);
        else if (squares.get("x" + Math.floor((event.pageX + grid.xOff) * grid.zoom).toString() + "y" + Math.floor((event.pageY + grid.yOff) * grid.zoom).toString()) == 8)
            squares.delete("x" + Math.floor((event.pageX + grid.xOff) * grid.zoom).toString() + "y" + Math.floor((event.pageY + grid.yOff) * grid.zoom).toString());
        else
            squares.set("x" + Math.floor((event.pageX + grid.xOff) * grid.zoom).toString() + "y" + Math.floor((event.pageY + grid.yOff) * grid.zoom).toString(), 1 + squares.get("x" + Math.floor((event.pageX + grid.xOff) * grid.zoom).toString() + "y" + Math.floor((event.pageY + grid.yOff) * grid.zoom).toString()));
        grid.draw();*/
    }
    save();
}

function onResize() {
    canvas.setAttribute("height", window.innerHeight);// * 0.99);
    canvas.setAttribute("width", window.innerWidth);// * 0.99);
    grid.draw();
}

function onScreen(x, y) {
    return Math.floor(grid.xOff * grid.zoom) <= x && x <= Math.floor((grid.xOff + canvas.width) * grid.zoom) + 1 && Math.floor(grid.yOff * grid.zoom) <= y && y <= Math.floor((grid.yOff + canvas.height) * grid.zoom) + 1;
}

function search(x, y) { //, rec = 27) {
    //console.log("Searching", x, y);
    if (!onScreen(x, y)) return;
    //if (rec <= 0) return;
    var cm = 0;
    var ix, iy;
    for (ix = x - 1; ix < x + 2; ix++)
        for (iy = y - 1; iy < y + 2; iy++)
            if (mines.get(ix, iy)) cm++;

    for (ix = x - 1; ix < x + 2; ix++)
        for (iy = y - 1; iy < y + 2; iy++) {
            var nm = "x" + ix.toString() + "y" + iy.toString();
            if ((!mines.get(ix, iy)) && (!squares.has(nm))) {
                var m = 0;
                for (var rx = ix - 1; rx < ix + 2; rx++)
                    for (var ry = iy - 1; ry < iy + 2; ry++)
                        if (ix == rx && iy == ry);
                        else if (mines.get(rx, ry)) m++;
                if (ix == x && iy == y) squares.set(nm, m);
                else if (m == 0 && cm == 0) search(ix, iy); //, rec - 1);
                else if (cm == 0) squares.set(nm, m);
            }
        }
}

function isMobile() {
    const toMatch = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i
    ];

    return toMatch.some((toMatchItem) => {
        return navigator.userAgent.match(toMatchItem);
    });
}

if (isMobile()) {
    ctx.font = "20px Arial";
    grid.zoom = 0.03;
    grid.draw();
}

setInterval(function mainLoop() {
    if (Math.abs(vx) > 1 || Math.abs(vx) > 1) {
        grid.xOff = Math.floor(grid.xOff + vx);
        grid.yOff = Math.floor(grid.yOff + vy);
        grid.draw();
        vx /= 1.1;
        vy /= 1.1;
    }
    if (!moved && t != 0) {
        d = new Date();
        var x = Math.floor((dx + grid.xOff) * grid.zoom);
        var y = Math.floor((dy + grid.yOff) * grid.zoom);
        if ((d.getTime() - t) > 300) {
            //location.reload();
            ctx.fillStyle = "#0088FF";
            ctx.fillRect((x / grid.zoom) - grid.xOff, (y / grid.zoom) - grid.yOff, (((x + 1) / grid.zoom) - grid.xOff) - ((x / grid.zoom) - grid.xOff), (((y + 1) / grid.zoom) - grid.yOff) - ((y / grid.zoom) - grid.yOff));
        }
    }
}, 33);

function save() {
    console.log("Saving")
    localStorage.setItem('grid.xOff', grid.xOff);
    localStorage.setItem('grid.yOff', grid.yOff);
    localStorage.setItem('grid.zoom', grid.zoom);
    localStorage.setItem('mines.seeds', mines.seeds);
    localStorage.setItem('mines.rarity', mines.rarity);
    localStorage.setItem('squares', JSON.stringify(Object.fromEntries(squares)));
    /*localStorage.setItem('dx', dx);
    localStorage.setItem('dy', dy);
    localStorage.setItem('vx', vx);
    localStorage.setItem('vy', vy);
    localStorage.setItem('drag', drag);
    localStorage.setItem('delayedDrag', delayedDrag);
    localStorage.setItem('moved', moved);*/
    localStorage.setItem('gameover', gameover);
}

function load() {
    //console.log(localStorage.getItem('gameover'));
    //console.log(localStorage.getItem('gameover') != null);
    //console.log(localStorage.getItem('gameover') == 'false');
    //console.log(localStorage.getItem('gameover') == 'false' && localStorage.getItem('gameover') != null);
    if (localStorage.getItem('gameover') == 'false' && localStorage.getItem('gameover') != null) {
        console.log("Loading cached game");
        //console.log(grid.xOff, grid.yOff, grid.zoom);
        //console.log(mines.seeds, mines.rarity, gameover);
        
        //*
        grid.xOff = parseFloat(localStorage.getItem('grid.xOff'));
        grid.yOff = parseFloat(localStorage.getItem('grid.yOff'));
        grid.zoom = parseFloat(localStorage.getItem('grid.zoom'));//*/
        mines.seeds = localStorage.getItem('mines.seeds').split(',');
        for (var i = 0; i < mines.seeds.length; i++) mines.seeds[i] = parseFloat(mines.seeds[i]);
        mines.rarity = parseFloat(localStorage.getItem('mines.rarity'));
        squares = new Map(Object.entries(JSON.parse(localStorage.getItem('squares'))));
        /*dx = localStorage.getItem('dx');
        dy = localStorage.getItem('dy');
        vx = localStorage.getItem('vx');
        vy = localStorage.getItem('vy');
        drag = localStorage.getItem('drag');
        delayedDrag = localStorage.getItem('delayedDrag');
        moved = localStorage.getItem('moved');*/
        gameover = !(localStorage.getItem('gameover') == 'false');

        //console.log(grid.xOff, grid.yOff, grid.zoom);
        //console.log(mines.seeds, mines.rarity, gameover);

        grid.draw();
    } else console.log("Not loading cached game")
}

function main() {
    var urlParams = new URLSearchParams(window.location.search);
    var rarity = urlParams.get('rarity');
    //console.log(rarity);
    //console.log(parseFloat(rarity));
    if (rarity != null && parseFloat(rarity) > 0) {
        //console.log("Setting");
        mines.rarity = parseFloat(rarity);
    }
    //console.log(mines.rarity);
    load();
}

main();
