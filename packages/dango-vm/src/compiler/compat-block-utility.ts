import BlockUtility from '../engine/block-utility';
class CompatibilityLayerBlockUtility extends BlockUtility {
    _fakeBlockId: any;
    sequencer: any;
    thread: any;
    constructor () {
        super();
        /**
         * @type {string|null}
         */
        this._fakeBlockId = null;
    }
    // Branching operations are not supported.
    startBranch () {
        throw new Error('startBranch is not supported by this BlockUtility');
    }
    startProcedure () {
        throw new Error('startProcedure is not supported by this BlockUtility');
    }
    // Parameters are not used by compiled scripts.
    initParams () {
        throw new Error('initParams is not supported by this BlockUtility');
    }
    pushParam () {
        throw new Error('pushParam is not supported by this BlockUtility');
    }
    getParam () {
        throw new Error('getParam is not supported by this BlockUtility');
    }
    init (thread: any, fakeBlockId: any) {
        this.thread = thread;
        this.sequencer = thread.target.runtime.sequencer;
        thread.stack[0] = fakeBlockId;
    }
}
export default new CompatibilityLayerBlockUtility();
