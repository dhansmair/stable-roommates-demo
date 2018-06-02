import Snapshot from "./snapshot"
import {SnapshotStatus} from "./snapshot"
import Utils from "./utils"
import {Status} from "./preferencelist"

class Cell {
    constructor(public value: number, public d = false, public r = false, public c = false) {}
}

/**
 *
 */
export default class Renderer {

    dictionary: Array<string>
    controls: HTMLDivElement
    navigation: HTMLElement
    target: HTMLTableElement
    history: Array<Snapshot>
    currentIndex: number
    dimensions: number

    buttonLeft: HTMLButtonElement
    buttonRight: HTMLButtonElement
    pageNumber: HTMLSpanElement
    checkbox: HTMLInputElement

    /**
     *
     */
    constructor(controls = document.createElement("div"), target = document.createElement("table"), navigation = document.createElement("nav")) {
        this.controls = controls
        this.target = target
        this.navigation = navigation

        // set up controls and target properly
        this.buttonLeft = document.createElement("button")
        this.buttonRight = document.createElement("button")
        this.pageNumber = document.createElement("span")
        this.buttonLeft.textContent = "<"
        this.buttonRight.textContent = ">"
        this.pageNumber.textContent = "0"

        this.checkbox = document.createElement("input")
        this.checkbox.type = "checkbox"

        this.controls.appendChild(this.buttonLeft)
        this.controls.appendChild(this.pageNumber)
        this.controls.appendChild(this.buttonRight)
        this.controls.appendChild(this.checkbox)
        this.controls.appendChild(document.createTextNode("show deleted pairs"))

        this.buttonLeft.addEventListener("click", () => {this.showPrev()})
        this.buttonRight.addEventListener("click", () => {this.showNext()})
        this.checkbox.addEventListener("click", () => {this.toggleShowDeletedPairs()})

        this.navigation.addEventListener("click", (e:MouseEvent) => {this.navClicked(e)})

        // key controls
        document.addEventListener("keydown", e => {
            if (this.history && (e.keyCode == 37 || e.keyCode == 38)) {
                this.showPrev()
            } else if (this.history && (e.keyCode == 39 || e.keyCode == 40)) {
                this.showNext()
            }
        })

    }


    /**
     * public setDictionary - description
     *
     * @param  {type} dictionary : Array<string> description
     * @return {type}                            description
     */
    public setDictionary(dictionary : Array<string>) {
        this.dictionary = dictionary
    }

    /**
     * lookUp - description
     *
     * @param  {type} index: number description
     * @return {type}               description
     */
    private lookUp(index: number) {
        if (this.dictionary != null && this.dictionary.length > index) {
            return this.dictionary[index]
        }
        return index.toString()
    }

    /**
     *
     */
    public setHistory(history: Array<Snapshot>) : void {
        this.history = history
        this.currentIndex = 0

        if (history.length > 0) {
            this.dimensions = history[0].table.length
            this.setUp()
            this.createNav()
        }
    }


    /**
     * setTarget - description
     *
     * @param  {type} target: HTMLDivElement description
     * @return {type}                        description
     */
    public setTarget(target: HTMLTableElement) {
        this.target = target
    }


    /**
     * private setUp - description
     *
     * @return {type}  description
     */
    private setUp() {
        this.target.innerHTML = ""
        let fragment = document.createDocumentFragment()
        let rowOriginal = document.createElement("tr")
        let cellOriginal = document.createElement("td")

        for (let i = 0; i < this.dimensions; i++) {
            // create row
            let row = rowOriginal.cloneNode(true) as HTMLTableRowElement

            // create head element
            let first = cellOriginal.cloneNode(true) as HTMLTableCellElement
            first.classList.add("head")
            first.innerHTML = i.toString()
            row.appendChild(first)

            // create |
            let separator = cellOriginal.cloneNode(true) as HTMLTableCellElement
            separator.innerHTML = " | "
            row.appendChild(separator)

            for (let j = 0; j < this.dimensions-1; j++) {
                let cell = cellOriginal.cloneNode(true) as HTMLTableCellElement
                cell.innerHTML = "-"
                row.appendChild(cell)
            }

            fragment.appendChild(row)
        }

        this.target.appendChild(fragment)
    }

/*
    statusToClassName(s : Status) {
        switch(s) {
            case Status.Running_1:
                return "running_1"
            case Status.Running_2:
                return "running_2"
            case Status.Solved:
                return "solved"
            default:
                return "unsolvable"

        }
    }
*/

    createNav() {
        let fragment = document.createDocumentFragment()
        let original = document.createElement("div")
        original.classList.add("navElement")

        for (let i = 0; i < this.history.length; i++) {
            let snapshot = this.history[i]
            let div = (original.cloneNode(true) as HTMLDivElement)

            div.innerHTML += "<span>" + (i+1).toString() + ". step</span><span>" +  snapshot.status + "</span>"
            div.classList.add("status-" + snapshot.status)
            div.setAttribute("index", i.toString())
            fragment.appendChild(div)
        }

        this.navigation.innerHTML = ""
        this.navigation.appendChild(fragment)
    }


    /**
     * render - description
     * TODO
     * @return {type}  description
     */
    render() {
        let snapshot = this.history[this.currentIndex]
        let diff = this.computeDiff(snapshot)

        this.clearDecorations()

        for (let i = 0; i < diff.length; i++) {
            let headCell = this.getElement(i)
            headCell.textContent = this.lookUp(i)

            if (snapshot.proposals != undefined && snapshot.proposals[i] != null) {
                headCell.innerHTML += "<span class='sub'> &#x1F48D;" + this.lookUp(snapshot.proposals[i]) + "</span>"
            }

            for (let j = 0; j < diff[i].length; j++) {
                let cell = diff[i][j]
                let tr = this.getElement(i, j)

                tr.textContent = this.lookUp(cell.value)

                // for each cell, check:
                // 1. is it in a rotation?
                if (cell.r) tr.classList.add('highlight-3')
                // 2. is it a death candidate?
                if (cell.c) tr.classList.add('highlight-2')
                // 3. is it dead?
                if (cell.d) tr.classList.add('dead')
            }
        }

        // display rotations
        if (snapshot.rotation != null) {
            snapshot.rotation.forEach(pair => {
                this.getElement(pair[0]).classList.add("highlight-3")
            })
        }


        this.renderPager()
    }

    private clearDecorations() {
        let cells : NodeList = this.target.querySelectorAll("td")
        let cellsArray : Array<HTMLElement> = [].slice.call(cells)

        for (let i = 0; i < cellsArray.length; i++) {
            cellsArray[i].classList.remove("dead")
            cellsArray[i].classList.remove("highlight-1")
            cellsArray[i].classList.remove("highlight-2")
            cellsArray[i].classList.remove("highlight-3")
            cellsArray[i].classList.remove("highlight-4")
        }
    }


    /**
     * navClicked - description
     *
     * @param  {type} e : MouseEvent description
     * @return {type}                description
     */
    navClicked(e : MouseEvent) {
        let el = (e.target as HTMLElement)

        while (!el.classList.contains("navElement") && el.nodeName != "NAV") {
            el = el.parentElement
        }

        if (el.classList.contains("navElement")) {
            this.currentIndex = parseInt(el.getAttribute("index"))
            this.render()
        }

    }


    /**
     * showPrev - description
     *
     * @return {type}  description
     */
    showPrev() : void {
        if (this.currentIndex > 0) {
            this.currentIndex--
            this.render()

        } else {

        }
    }


    /**
     * showNext - description
     *
     * @return {type}  description
     */
    showNext() : void {
        if (this.currentIndex+1 < this.history.length) {
            this.currentIndex++
            this.render()

        } else {

        }
    }

    private renderPager() {
        let max = this.history.length
        let current = this.currentIndex + 1
        this.pageNumber.innerHTML = current + " / " + max
        this.buttonLeft.disabled = current == 1
        this.buttonRight.disabled = current == max

        let active = this.navigation.querySelector(".navElement.active")
        if (active) active.classList.remove("active")

        let newActive = this.navigation.querySelector(".navElement[index='" + this.currentIndex + "']")

        newActive.classList.add("active")
    }

    toggleShowDeletedPairs() {
        if (this.checkbox.checked) {
            this.target.classList.add("showDeleted")
        } else {
            this.target.classList.remove("showDeleted")
        }
    }

    /**
     *
     */
    getElement(row: number, col = -1) : HTMLSpanElement {
        let queryString = ""
        row += 1

        if (col == -1) {
            queryString = "tr:nth-child(" + row + ") td.head"
        } else {
            col += 3
            queryString = "tr:nth-child(" + row + ") td:nth-child(" + col + ")"
        }

        return this.target.querySelector(queryString)
    }


    /**
     * @static computeDiff - description
     *
     * @param  {type} s : Snapshot description
     * @return {type}              description
     */
    computeDiff(s: Snapshot) {
        let result = [],
            initial = this.history[0]

        if (s.status == SnapshotStatus.Initial) {
            for (let i = 0; i < s.table.length; i++) {
                let row = s.table[i]
                let erg = []

                for (let j = 0; j < row.length; j++) {
                    erg.push(new Cell(row[j]))
                }
                result.push(erg)
            }
        } else {
            let originalTable = initial.table
            let currentTable = s.table

            // rotationen und deletions aufbereiten
            // statt {x, y} mache {x, indexOf(y)}
            /*
            if (s.rotation !== undefined) {
                s.rotation.forEach(pair => {
                    pair[1] = originalTable[pair[0]].indexOf(pair[1])
                })
            }
            if (s.deletion !== undefined) {
                s.deletion.forEach(pair => {
                    pair[1] = originalTable[pair[0]].indexOf(pair[1])
                })
            }*/


            // compute difference between original table and current table
            for (let i = 0; i < originalTable.length; i++) {
                let originalRow = originalTable[i]
                let currentRow = currentTable[i]
                let erg = []

                for (let j = 0; j < originalRow.length; j++) {
                    let originalCell = originalRow[j]

                    if (currentRow.indexOf(originalCell) === -1) {
                        // add dead cell
                        erg.push(new Cell(originalCell, true))
                    } else {
                        // add alive cell
                        let cell = new Cell(originalCell)

                        if (s.rotation !== undefined) {
                            s.rotation.forEach(pair => {
                                if (pair[0] === i && originalTable[pair[0]].indexOf(pair[1]) === j) {
                                    cell.r = true
                                }

                            })
                        }
                        if (s.deletion !== undefined) {
                            s.deletion.forEach(pair => {
                                if (pair[0] === i && originalTable[pair[0]].indexOf(pair[1]) === j
                                 || pair[1] === i && originalTable[pair[1]].indexOf(pair[0]) === j) {
                                    cell.c = true
                                }
                            })
                        }

                        erg.push(cell)
                    }
                }

                result.push(erg)
            }

        }

        return result
    }



}
