import PreferenceList from "./preferencelist"
import StringParser from "./stringparser"
import Renderer from "./renderer"
import Utils from "./utils"

/**
 *
 */
export default class Coordinator {

    private controls : HTMLDivElement
    private setupWindow : HTMLDivElement
    private demoWindow : HTMLDivElement
    private textarea : HTMLTextAreaElement


    //
    private preferenceList : PreferenceList
    private stringParser : StringParser
    private renderer : Renderer

    constructor(controls : HTMLDivElement, setupWindow: HTMLDivElement, demoWindow: HTMLDivElement) {
        // set up DOM etc.
        this.controls = controls
        this.setupWindow = setupWindow
        this.demoWindow = demoWindow
        this.textarea = setupWindow.querySelector("textarea")


        controls.querySelector("button").addEventListener("click", () => {
            this.toggleWindows()
        })

        setupWindow.querySelector("#createButton").addEventListener("click", () => {
            this.startDemo()
        })


        // set up logic structure
        this.renderer = new Renderer(demoWindow.querySelector("#demoControls"),
            demoWindow.querySelector("#demoTarget"), demoWindow.querySelector("nav"))

    }


    /**
     * toggleWindows - description
     *
     * @return {type}  description
     */
    toggleWindows() {
        if (this.setupWindow.classList.contains("closed")) {
            this.setupWindow.classList.remove("closed")
            this.demoWindow.classList.add("closed")
        } else {
            this.setupWindow.classList.add("closed")
            this.demoWindow.classList.remove("closed")
        }
    }

    startDemo() {

        try {
            let text = this.textarea.value

            if (text.trim().indexOf(" ") === -1) {
                // create random table
                let n = parseInt(text.trim())
                this.preferenceList = PreferenceList.createRandom(n)
                this.renderer.setDictionary(null)
            } else {
                // create table from input
                let stringParser = new StringParser()
                let table = stringParser.parse(text, this.textarea)
                let dict = stringParser.getDictionary()
                this.preferenceList = new PreferenceList(table)
                this.renderer.setDictionary(dict)
            }

            //this.preferenceList.print()
            this.preferenceList.solve()
            let history = this.preferenceList.getHistory()

            this.renderer.setHistory(history)
            this.toggleWindows()
            this.renderer.render()

        } catch(e) {
            console.warn("fehler")
            console.warn(e)
        }

    }
}
