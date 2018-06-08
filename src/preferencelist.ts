import Utils from "./utils"
import Snapshot from "./snapshot"
import {SnapshotStatus} from "./snapshot"

const RUNNING_1 = 0
const RUNNING_2 = 1
const SOLVED = 2
const UNSOLVABLE = 3

export enum Status {
    Running_1 = "Phase 1 running",
    Running_2 = "Phase 2 running",
    Solved = "solved",
    Unsolvable = "unsolvable"
}


/**
 *
 */
export default class PreferenceList {

    private status: Status
    private table: Array<Array<number>>
    private proposals: Array<number>
    private history: Array<Snapshot>

    constructor(table: Array<Array<number>>) {
        this.status = Status.Running_1
        this.table = table
        this.proposals = []

        for (let i = 0; i < table.length; i++) {
            this.proposals.push(null)
        }

        this.history = []
    }

    /**
     * public getHistory - description
     *
     * @return {Array<Snapshot>}  description
     */
    public getHistory() : Array<Snapshot> {
        return this.history
    }

    /**
     * getStatus - description
     *
     * @return {number}  description
     */
    getStatus() : Status {
        return this.status
    }


    /**
     * checkStatus - description
     *
     * @return {type}  description
     */
    checkStatus() : Status {
        let allOne = true

        if (this.status == Status.Running_1 && this.getFreePerson() == null) {
            this.status = Status.Running_2
        }

        for (let i = 0; i < this.table.length; i++) {
            if (this.table[i].length > 1) allOne = false
        }

        if (allOne) this.status = Status.Solved
        return this.status
    }

    /**
        only needed during first phase of the algorithm.
        returns a person which is not semiengaged to anybody
    */
    getFreePerson() : number {
        for (var i = 0; i < this.proposals.length; i++) {
            if (this.proposals[i] === null) return i
        }
        return null
    }


    /**
     * getPerson - finds an entry point for a rotation: the first person with
     * more than one person remaining in its perference list
     *
     * @return {number|null}  description
     */
    getPerson() : number {
        for (var i = 0; i < this.table.length; i++) {
            if (this.table[i].length > 1) return i
        }
        return null
    }


    /**
     * firstOf - description
     *
     * @param  {type} i description
     * @return {type}   description
     */
    firstOf(i:number) : number {
        return this.table[i][0]
    }


    /**
     * secondOf - description
     *
     * @param  {type} i description
     * @return {type}   description
     */
    secondOf(i:number) : number {
        return this.table[i][1]
    }

    /**
     * lastOf - description
     *
     * @param  {type} i description
     * @return {type}   description
     */
    lastOf(i:number) : number {
        return this.table[i][this.table[i].length-1]
    }

    /**
     * nextOf - description
     *
     * @param  {type} i description
     * @return {type}   description
     */
    nextOf(i:number) : number {
        return this.lastOf(this.secondOf(i))
    }

    /**
     * removePair - removes pair {x, y}
     * so removes x from y's preferenceList and vice versa
     *
     * @param  {number} x person 1
     * @param  {number} y person 2
     * @throws {Error} if any preferenceList gets empty
     */
    removePair(x:number, y:number) : void {
        if (this.table[x].indexOf(y) == -1 || this.table[y].indexOf(x) == -1) {
            return
        }

        this.table[x].splice(this.table[x].indexOf(y), 1)
        this.table[y].splice(this.table[y].indexOf(x), 1)

        if (this.table[x].length == 0 || this.table[y].length == 0) {
            this.status = Status.Unsolvable
            throw new Error("empty preferencelist, no stable matching possible")
        }
    }

    removePairs(arr: Array<Array<number>>) {
        arr.forEach(pair => {this.removePair(pair[0], pair[1])})
    }


    findAllAfter(x:number, y:number) : Array<Array<number>> {
        let result = []
        let yInX = this.table[x].indexOf(y) + 1

        while (yInX < this.table[x].length) {
            result.push([x, this.table[x][yInX]])
            yInX++
        }

        return result
    }

    /**
     * removeAllAfter - (procedural) removes all persons after y in x's list
     *
     * @param  {number} x person 1
     * @param  {number} y person 2
     *
    removeAllAfter(x:number, y:number) : void {
        let yInX = this.table[x].indexOf(y) + 1

        while (this.table[x].length > yInX) {
            this.removePair(x, this.table[x][yInX])
        }
    }*/


    /**
     * propose - only needed during phase 1
     * person x makes a proposal to person y, therefore each pair {y, z} with
     * z coming after x on y's list will be deleted
     *
     * @param  {number} x person 1 makes proposal
     * @param  {number} y person 2 receives proposal
     */
    propose(x:number, y:number) : void {
        // eventually reject previous proposal
        let s = this.proposals.indexOf(y)
        if (s != -1) this.proposals[s] = null
        this.proposals[x] = y
    }


    /**
     * findRotation - finds a rotation exposed in the current table
     * note that there can be multiple exposed rotations, but this method only returns one of them
     *
     * @return {array}  array of the form [[x1, y1], [x2, y2], ...]
     */
    findRotation() : Array<Array<number>> {
        let stack = [], rotation = [], p = this.getPerson()

        while (stack.indexOf(p) === -1) {
            stack.push(p)
            p = this.nextOf(p)
        }

        rotation.push([p, this.firstOf(p)])
        let p2 = stack.pop()

        while (p2 != p) {
            rotation.unshift([p2, this.firstOf(p2)]) // prepend pair to the rotation array
            p2 = stack.pop()
        }

        return rotation
    }

    /**
     *
     */
    findRotationVictims(rotation: Array<Array<number>>) : Array<Array<number>> {
        let result: Array<Array<number>> = [],
            n = rotation.length

        for (let i = 0; i < n; i++) {
            result = result.concat(this.findAllAfter(rotation[(i+1) % n][1], rotation[i][0]))
        }

        return result
    }

    /**
     * deleteRotation - description
     *
     * @param  {type} rotation description
     * @return {type}          description
     *
    deleteRotation(rotation:Array<Array<number>>) : void {
        let n = rotation.length
        for (let i = 0; i < n; i++) {
            this.removeAllAfter(rotation[(i+1) % n][1], rotation[i][0])
        }
    }*/

    /**
     * print - writes the current state of the table to the console
     *
     * @param  {boolean} orig = false wheter to print the original table or the current status during the reduction
     */
    print() : void {
        let table = this.table
        let s = ""

        for (let i = 0; i < table.length; i++) {
            s += i + "[" + (this.proposals[i] === null ? "-" : this.proposals[i]) + "]| "

            for (let j = 0; j < table[i].length; j++) {
                s += table[i][j] + "  "
            }

            s += "\n"
        }

        console.log(s)
    }

    /**
     * solve - tries to fully reduce the preferenceList instance.
     * returns a possible stable matching, or null if no stable matching exists
     *
     * @return {array|null}  description
     */
    solve() : Array<Array<number>> {
        try {
            // add initial snapshot
            this.history.push(new Snapshot(SnapshotStatus.Initial, Utils.clone(this.table), Utils.clone(this.proposals), null, null))

            // perform phase 1
            while (this.checkStatus() === Status.Running_1) {
                let x = this.getFreePerson(),
                    y = this.firstOf(x)

                this.propose(x, y)
                // add snapshot where x proposes to y
                this.history.push(new Snapshot(SnapshotStatus.MakeProposal, Utils.clone(this.table), Utils.clone(this.proposals), undefined, undefined))
                let candidates = this.findAllAfter(y, x)
                // add snapshot with all candidates that will be deleted
                this.history.push(new Snapshot(SnapshotStatus.Delete, Utils.clone(this.table), Utils.clone(this.proposals), undefined, candidates))
                this.removePairs(candidates)
                // add result snapshot
                this.history.push(new Snapshot(SnapshotStatus.Result, Utils.clone(this.table), Utils.clone(this.proposals), undefined, undefined))
            }

            // perform phase 2
            while (this.checkStatus() === Status.Running_2) {
                let r = this.findRotation()
                // add snapshot where found rotation is highlighted
                this.history.push(new Snapshot(SnapshotStatus.FindRotation, Utils.clone(this.table), undefined, r, undefined))
                // find candidates that will be deleted because of this rotation
                let candidates = this.findRotationVictims(r)
                // take snapshot with candidates
                this.history.push(new Snapshot(SnapshotStatus.Delete, Utils.clone(this.table), undefined, r, candidates))
                this.removePairs(candidates)
                // add result snapshot
                this.history.push(new Snapshot(SnapshotStatus.Result, Utils.clone(this.table), undefined, undefined, undefined))
            }

            this.history.push(new Snapshot(SnapshotStatus.Finish, Utils.clone(this.table), undefined, undefined, undefined))

            return this.table
        } catch(error) {

            this.history.push(new Snapshot(SnapshotStatus.Unsolvable, Utils.clone(this.table), undefined, undefined, undefined))

            console.warn(error.message)
            return null
        }
    }

    /**
        creates a random preference table and returns an instance of PreferenceList
    */
    static createRandom(n : number) : PreferenceList {
        let table = Utils.rand(n)
        return new PreferenceList(table)
    }
}
