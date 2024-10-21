/*
    Kyler Olsen
    Sept 2022
    PHYS 1060 - Voyager Mission
*/

const INFO_CARDS = [
    {'start': -9999, 'end': -8195, 'name': '#intro'},
    {'start': -8185, 'end': -8105, 'name': '#grand_tour'},
    {'start': -8095, 'end': -8015, 'name': '#launch'},
    {'start': -8005, 'end': -7925, 'name': '#earth_and_moon'},
    {'start': -7915, 'end': -7835, 'name': '#spacecraft'},
    {'start': -7825, 'end': -7745, 'name': '#coms_and_control'},
    {'start': -7735, 'end': -7655, 'name': '#instruments'},
    {'start': -7645, 'end': -7565, 'name': '#power'},
    {'start': -7465, 'end': -7385, 'name': '#jupiter'},
    {'start': -7375, 'end': -7295, 'name': '#io'},
    {'start': -7285, 'end': -7205, 'name': '#europa'},
    {'start': -7195, 'end': -7115, 'name': '#rings'},
    {'start': -7015, 'end': -6935, 'name': '#saturn'},
    {'start': -6925, 'end': -6845, 'name': '#titan'},
    {'start': -6835, 'end': -6755, 'name': '#missing_pluto'},
    {'start': -6565, 'end': -6485, 'name': '#huygens'},
    {'start': -5035, 'end': -4955, 'name': '#uranus'},
    {'start': -4945, 'end': -4865, 'name': '#icy_moons'},
    {'start': -4855, 'end': -4775, 'name': '#miranda'},
    {'start': -4765, 'end': -4685, 'name': '#young_rings'},
    {'start': -4675, 'end': -4595, 'name': '#ariel'},
    {'start': -4585, 'end': -4505, 'name': '#magnetic_field'},
    {'start': -3865, 'end': -3785, 'name': '#neptune'},
    {'start': -3775, 'end': -3695, 'name': '#great_dark_spot'},
    {'start': -3685, 'end': -3605, 'name': '#triton'},
    {'start': -3595, 'end': -3515, 'name': '#magnetic_and_rings'},
    {'start': -3505, 'end': -3425, 'name': '#family_portrait'},
    {'start': -3415, 'end': -3335, 'name': '#pale_blue_dot'},
    {'start': -3325, 'end': -3245, 'name': '#interstellar'},
    {'start': -3235, 'end': -3155, 'name': '#heliopause'},
    {'start': -3145, 'end':  9999, 'name': '#future'},
]

const MONTHS = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

class System {
    constructor() {
        this.time = -8280;
        this.lastTouchY = 0;
        this.scale = 10;

        this.params = {
            'earth': {'r': 1, 'a': 100.73222733, 'p': 1},
            'jupiter': {'r': 5.2, 'a': 34.32353961, 'p': Math.pow(0.439, 3)},
            'saturn': {'r': 9.57, 'a': 43.92507035, 'p': Math.pow(0.325, 3)},
            'uranus': {'r': 19.17, 'a': 319.08200065, 'p': Math.pow(0.228, 3)},
            'neptune': {'r': 30.18, 'a': 306.18473198, 'p': Math.pow(0.182, 3)},
        }
    }

    year() {
        return 2000 + (this.time / 360);
    }

    month() {
        return MONTHS[Math.floor((this.year() - Math.floor(this.year())) * 12)];
    }

    voyager1() {
        // return {'x': 100, 'y': 100};
    }

    voyager2() {
        // return {'x': 100, 'y': -100};
    }

    updateSystem() {
        this.draw();
        this.setInfo();
    }

    setInfo() {
        for (const obj of INFO_CARDS) {
            let ele = document.querySelector(obj.name);
            if (this.time >= obj.start && ele.classList.contains('before'))
                ele.classList.remove('before');
            else if (this.time < obj.start && !ele.classList.contains('before'))
                ele.classList.add('before');
            if (this.time <= obj.end && ele.classList.contains('after'))
                ele.classList.remove('after');
            else if (this.time > obj.end && !ele.classList.contains('after'))
                ele.classList.add('after');
        }
    }

    draw() {
        let canvas = document.querySelector("canvas");
        let ctx = canvas.getContext('2d');
        let x,y;
        let year = document.querySelector("#year");

        if (year.innerHTML != this.month() + ' ' + Math.floor(this.year()))
            year.innerHTML = this.month() + ' ' + Math.floor(this.year());

        if (canvas.width > 768) {
            x = canvas.width / 3; y = canvas.height / 2;
            this.scale = 12;
        } else {
            x = canvas.width / 2; y = canvas.height / 4;
            this.scale = 6;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = 'grey';
        ctx.setLineDash([5,5]);
        ctx.lineWidth = 1;
        for (const key in this.params) {
            const obj = this.params[key];
            ctx.beginPath();
            ctx.ellipse(x, y, obj.r*this.scale, obj.r*this.scale, 0, 0, 2 * Math.PI);
            ctx.stroke();
            // ctx.fill();
        }

        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.ellipse(x, y, this.scale/3, this.scale/3, 0, 0, 2 * Math.PI);
        ctx.fill();
        for (const key in this.params) {
            const obj = this.params[key];
            let t = obj.p * this.time + obj.a;
            let tx = obj.r * Math.cos((t / 180) * -Math.PI - Math.PI/2) * this.scale;
            let ty = obj.r * Math.sin((t / 180) * -Math.PI - Math.PI/2) * this.scale;
            ctx.beginPath();
            ctx.ellipse(x+tx, y+ty, this.scale/5, this.scale/5, 0, 0, 2 * Math.PI);
            ctx.fill();
        }

        let v1 = this.voyager1();
        if (v1) {
            ctx.beginPath();
            ctx.ellipse(x+v1.x, y+v1.y, this.scale/5, this.scale/5, 0, 0, 2 * Math.PI);
            ctx.fill();
        }

        let v2 = this.voyager2();
        if (v2) {
            ctx.beginPath();
            ctx.ellipse(x+v2.x, y+v2.y, this.scale/5, this.scale/5, 0, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}

const system = new System();

window.addEventListener("resize", function () {
    let dimension = [document.documentElement.clientWidth, document.documentElement.clientHeight];
    let canvas = document.querySelector("canvas");
    canvas.width = dimension[0];
    canvas.height = dimension[1];
});

window.addEventListener("load", function () {
    let canvas = document.querySelector("canvas");
    let dimension = [document.documentElement.clientWidth, document.documentElement.clientHeight];
    canvas.width = dimension[0];
    canvas.height = dimension[1];

    window.addEventListener("wheel", e => {
        system.time += e.deltaY / 10;
        // console.log(system.time);
    });

    window.addEventListener("touchstart", e => {
        system.lastTouchY = e.touches[0].clientY;
    });

    window.addEventListener("touchmove", e => {
        const touchY = e.touches[0].clientY;
        const deltaY = system.lastTouchY - touchY;
        system.time += deltaY / 4;
        system.lastTouchY = touchY;
        // console.log(system.time);
    });

    setInterval(() => system.updateSystem(), 30);
});
