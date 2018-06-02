import Coordinator from "./coordinator"

let coordinator

window.addEventListener("DOMContentLoaded", function() {

    let controls = document.getElementById("controls"),
        setupWindow = document.getElementById("setupWindow"),
        demoWindow = document.getElementById("demoWindow")

    coordinator = new Coordinator(controls, setupWindow, demoWindow)


})

/*
console.log("works!");

var p, n = 0, s;
function start() {
    console.log("starting loop");

    do {
        n++;
        console.log("solving next (" + n + ")");

        p = PreferenceList.createRandom(8);
        p.solve();

    } while (n < 100 && (p.rejectedProposals < 3 || p.deletedRotations < 3));

    console.log("found a good PreferenceList!");
    p.print(true);
}

function parse() {
    s = new StringParser()
    let result = s.parse(document.querySelector("textarea").value)

    console.log(result)
}

window.addEventListener("DOMContentLoaded", function() {

    document.querySelector("button").addEventListener("click", start);
    document.querySelector("#startParsing").addEventListener("click", parse);

});
*/
