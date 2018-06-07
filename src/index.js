import Coordinator from "./coordinator"

let coordinator

window.addEventListener("DOMContentLoaded", function() {

    let controls = document.getElementById("controls"),
        setupWindow = document.getElementById("setupWindow"),
        demoWindow = document.getElementById("demoWindow")

    coordinator = new Coordinator(controls, setupWindow, demoWindow)
})
