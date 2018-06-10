import Snapshot from "./snapshot"
import { SnapshotStatus } from "./snapshot"
import Utils from "./utils"
import { Status } from "./preferencelist"

/**
 * storage class for cell information
 */
class Cell {
    constructor(public value: number, public d = false, public r = false, public c = false) { }
}

/**
 * the renderer gets an array of snapshots and displays the current table of a snapshot,
 * and allows to go back and forward in the history.
 * It also displays the whole history in the aside-element 
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

        this.buttonLeft.addEventListener("click", () => { this.showPrev() })
        this.buttonRight.addEventListener("click", () => { this.showNext() })
        this.checkbox.addEventListener("click", () => { this.toggleShowDeletedPairs() })

        this.navigation.addEventListener("click", (e: MouseEvent) => { this.navClicked(e) })

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
     *
     */
    public setDictionary(dictionary: Array<string>) : void {
        this.dictionary = dictionary
    }

    /**
     * lookUp - description
     *
     * @param  {number} index: number description
     * @return {string}               description
     */
    private lookUp(index: number): string {
        if (this.dictionary != null && this.dictionary.length > index) {
            return this.dictionary[index]
        }
        return index.toString()
    }

    /**
     *
     */
    public setHistory(history: Array<Snapshot>): void {
        this.history = history
        this.currentIndex = 0

        if (history.length > 0) {
            this.dimensions = history[0].table.length
            this.setUp()
            this.createNav()
        }
    }

    /**
     *
     */
    public setTarget(target: HTMLTableElement) : void {
        this.target = target
    }


    /**
     * private setUp - description
     *
     */
    private setUp() : void {
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

            for (let j = 0; j < this.dimensions - 1; j++) {
                let cell = cellOriginal.cloneNode(true) as HTMLTableCellElement
                cell.innerHTML = "-"
                row.appendChild(cell)
            }

            fragment.appendChild(row)
        }

        this.target.appendChild(fragment)
    }

    /**
     *
     */
    private statusToString(status: SnapshotStatus) : string {
        switch (status) {
            case SnapshotStatus.Initial:
                return "initial table"
            case SnapshotStatus.MakeProposal:
                return "make a proposal"
            case SnapshotStatus.FindRotation:
                return "find rotation"
            case SnapshotStatus.Delete:
                return "delete pairs"
            case SnapshotStatus.Result:
                return "result"
            case SnapshotStatus.Finish:
                return "matching found"
            case SnapshotStatus.Unsolvable:
                return "unsolvable"
            default:
                return ""
        }

    }

    /**
     *
     */
    private createNav(): void {
        let fragment = document.createDocumentFragment(),
            original = document.createElement("div")

        original.classList.add("navElement")

        for (let i = 0; i < this.history.length; i++) {
            let snapshot = this.history[i]
            let div = (original.cloneNode(true) as HTMLDivElement)

            div.innerHTML += "<span>" + (i + 1).toString() + ".</span><span>" + this.statusToString(snapshot.status) + "</span>"
            div.classList.add("status-" + snapshot.status)
            div.setAttribute("index", i.toString())
            fragment.appendChild(div)
        }

        this.navigation.innerHTML = ""
        this.navigation.appendChild(fragment)
    }


    /**
     * render - description
     *
     */
    public render(): void {
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

    /**
     *
     */
    private clearDecorations() : void {
        let cells: NodeList = this.target.querySelectorAll("td")
        let cellsArray: Array<HTMLElement> = [].slice.call(cells)

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
     */
    private navClicked(e: MouseEvent) : void {
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
    private showPrev(): void {
        if (this.currentIndex > 0) {
            this.currentIndex--
            this.render()
        }
    }


    /**
     * showNext - description
     *
     * @return {type}  description
     */
    private showNext(): void {
        if (this.currentIndex + 1 < this.history.length) {
            this.currentIndex++
            this.render()
        }
    }

    /**
     *
     */
    private renderPager() : void {
        let max = this.history.length,
            current = this.currentIndex + 1

        this.pageNumber.innerHTML = current + " / " + max
        this.buttonLeft.disabled = current == 1
        this.buttonRight.disabled = current == max

        let active = this.navigation.querySelector(".navElement.active")
        if (active) active.classList.remove("active")

        let newActive = this.navigation.querySelector(".navElement[index='" + this.currentIndex + "']")

        newActive.classList.add("active")
    }

    /**
     *
     */
    private toggleShowDeletedPairs() : void {
        if (this.checkbox.checked) {
            this.target.classList.add("showDeleted")
        } else {
            this.target.classList.remove("showDeleted")
        }
    }

    /**
     *
     */
    private getElement(row: number, col = -1): HTMLSpanElement {
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
     *
     */
    private computeDiff(s: Snapshot): Array<Array<Cell>> {
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
            let originalTable = initial.table,
                currentTable = s.table

            // compute difference between original table and current table
            for (let i = 0; i < originalTable.length; i++) {
                let originalRow = originalTable[i],
                    currentRow = currentTable[i],
                    erg = []

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
