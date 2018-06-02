import Utils from "./utils"

export default class StringParser {

    private dictionary : Array<any>
    private n: number

    constructor() {
        this.dictionary = []
    }


    /**
     * public getDictionary - description
     *
     * @return {type}  description
     */
    public getDictionary() {
        return this.dictionary
    }

    /**
     *
     */
    private lookUpOrAdd(str: string) : number {
        let i = this.dictionary.indexOf(str)

        if (i === -1) {
            this.dictionary.push(str)
            return this.dictionary.length - 1
        } else {
            return i
        }
    }

    /**
     * parse - description
     *
     * @param  {type} str: string description
     * @return {type}             description
     */
    parse(str: string, textarea: HTMLTextAreaElement) {
        str = str.trim().replace(/\t+/g, ' ').replace(/  +/g, ' ').replace(/\r\n/g, "\n")

        textarea.value = str

        let arr = str.split("\n")
        let result = []

        this.n = arr.length

        for (let row of arr) {
            let resultRow = []
            let splittedRow = row.trim().split(" ").map(s => s.trim())

            if (splittedRow.length - 1 != this.n) {
                throw new Error("wrong number of elements")
            }

            if (!Utils.allDifferent(splittedRow)) {
                throw new Error("duplicated value in this row");
            }

            let first = this.lookUpOrAdd(splittedRow[0])

            if (splittedRow[1] != "|") {
                throw new Error("invalid syntax")
            }

            splittedRow.shift()
            splittedRow.shift()

            for (let entry of splittedRow) {
                resultRow.push(this.lookUpOrAdd(entry))
            }

            result[first] = resultRow
        }

        if (this.dictionary.length !== this.n) {
            throw new Error("invalid table")
        }

        return result
    }






}
