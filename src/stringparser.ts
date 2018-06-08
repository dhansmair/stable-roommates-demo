import Utils from "./utils"

export default class StringParser {

    private dictionary : Array<any>
    private n: number

    constructor() {
        this.dictionary = []
    }


    /**
     *
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

    private lookUp(str: string) : number {
        let i = this.dictionary.indexOf(str)

        if (i === -1) {
            throw new Error("invalid value '" + str + "' in table")
        } else {
            return i
        }
    }

    /**
     *
     */
    parse(str: string, textarea: HTMLTextAreaElement) {
        str = str.trim().replace(/\t+/g, ' ').replace(/  +/g, ' ').replace(/\r\n/g, "\n")

        textarea.value = str

        let arr = str.split("\n")
        let result : Array<Array<number>> = []

        this.n = arr.length

        // add entries to the dictionary in the same order as the rows in the table
        arr.forEach(row => {
            let splittedRow = row.trim().split(" ").map(s => s.trim())
            this.lookUpOrAdd(splittedRow[0])
        })

        for (let i = 0; i < arr.length; i++) {
            let row = arr[i],
                resultRow = [],
                splittedRow = row.trim().split(" ").map(s => s.trim())

            if (splittedRow.length - 1 != this.n) {
                throw new Error("wrong number of elements in row [" + i + "]")
            }

            if (!Utils.allDifferent(splittedRow)) {
                throw new Error("duplicated value in row with index [" + i + "]");
            }

            let first = this.lookUp(splittedRow[0])

            if (splittedRow[1] != "|") {
                throw new Error("invalid syntax, there is no | separator")
            }

            // remove head and separator
            splittedRow.shift()
            splittedRow.shift()

            for (let entry of splittedRow) {
                resultRow.push(this.lookUp(entry))
            }

            result[first] = resultRow
        }

        if (this.dictionary.length !== this.n) {
            throw new Error("invalid table")
        }

        return result
    }

}
