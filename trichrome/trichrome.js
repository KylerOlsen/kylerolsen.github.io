// Kyler Olsen
// Feb 2026

function dark_mode() {
    if (document.querySelector("body").getAttribute("mode") == "dark") {
        document.querySelector("body").setAttribute("mode", "light");
        localStorage.setItem("purple_cello_trichrome_color_mode", "light");
    } else {
        document.querySelector("body").setAttribute("mode", "dark");
        localStorage.setItem("purple_cello_trichrome_color_mode", "dark");
    }
}

function main() {
    document.querySelector("#dark").addEventListener("click", dark_mode);

    const savedMode = localStorage.getItem("purple_cello_trichrome_color_mode");
    const isDarkMode = false; //window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedMode) {
        document.querySelector("body").setAttribute("mode", savedMode);
    } else if (isDarkMode) {
        document.querySelector("body").setAttribute("mode", "dark");
    }
}

document.addEventListener("DOMContentLoaded", main);

