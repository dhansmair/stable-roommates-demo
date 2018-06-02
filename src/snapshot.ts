import Utils from "./utils"
import {Status} from "./preferencelist"
import PreferenceList from "./preferencelist"

export enum SnapshotStatus {
    Initial,
    MakeProposal,
    FindRotation,
    Delete,
    Result,
    Finish,
    Unsolvable
}

/**
 *
 */
export default class Snapshot {

    status: SnapshotStatus
    table: Array<Array<number>>
    proposals: Array<number>
    rotation: Array<Array<number>>
    deletion: Array<Array<number>>

    /**
     *
     */
    constructor(status: SnapshotStatus,
                table: Array<Array<number>>,
                proposals: Array<number>,
                rotation: Array<Array<number>>,
                deletion: Array<Array<number>>) {

        this.status = status
        this.table = table
        this.proposals = proposals
        this.rotation = rotation
        this.deletion = deletion
    }

    /**
     * constructor - description
     *
     * @param  {type} p:PreferenceList description
     * @return {type}                  description
     *
    constructor(p:PreferenceList) {
        this.status = p.getStatus()
        this.table = Utils.clone(p.table) // deep copy
        this.proposals = Utils.clone(p.proposals) // deep copy

        if (p.getHistory().length === 0) {
            this.initialSnapshot = null
        } else {
            this.initialSnapshot = p.getHistory()[0]
        }

        this.rotation = Utils.clone(p.getRotation())
    }*/

}
