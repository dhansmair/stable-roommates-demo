import PreferenceList from "./preferencelist"
import StringParser from "./stringparser"
import Renderer from "./renderer"
import Utils from "./utils"

/**
 * coordinates page interactions, initializes the renderer 
 */
export default class Coordinator {

    private controls: HTMLDivElement
    private setupWindow: HTMLDivElement
    private demoWindow: HTMLDivElement
    private textarea: HTMLTextAreaElement


    //
    private preferenceList: PreferenceList
    private stringParser: StringParser
    private renderer: Renderer

    constructor(controls: HTMLDivElement, setupWindow: HTMLDivElement, demoWindow: HTMLDivElement) {
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

        // start demo on ctrl + enter
        window.addEventListener('keydown', (e) => {
            if (e.keyCode == 13 && e.ctrlKey) {
                this.startDemo()
            }
        }, true)

        // set up a renderer
        this.renderer = new Renderer(demoWindow.querySelector("#controls"),
            demoWindow.querySelector("#demoTarget"), demoWindow.querySelector("nav"))

    }


    /**
     * toggleWindows - description
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

    /**
     *
     */
    startDemo(): void {

        try {
            let text = this.textarea.value

            if (text.trim().indexOf(" ") === -1) {
                // create random table
                let n = parseInt(text.trim())

                if (n < 2 || n % 2 != 0) {
                    throw new Error("invalid number passed")
                }

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

            this.preferenceList.solve()
            let history = this.preferenceList.getHistory()

            this.renderer.setHistory(history)
            this.toggleWindows()
            this.renderer.render()

        } catch (e) {
            console.warn(e)
            alert(e)
        }

    }
}
