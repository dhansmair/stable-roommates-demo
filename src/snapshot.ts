
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
 * a snapshot instance stores a state of a preferencelist
 * and is rendered afterwards
 */
export default class Snapshot {
    constructor(public status: SnapshotStatus,
                public table: Array<Array<number>>,
                public proposals: Array<number>,
                public rotation: Array<Array<number>>,
                public deletion: Array<Array<number>>) {}
}
