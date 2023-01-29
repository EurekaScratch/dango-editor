import Cast from '../util/cast';
class Scratch3ControlBlocks {
    _counter: any;
    runtime: any;
    constructor (runtime: any) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
        /**
         * The "counter" block value. For compatibility with 2.0.
         * @type {number}
         */
        this._counter = 0;
        this.runtime.on('RUNTIME_DISPOSED', this.clearCounter.bind(this));
    }
    /**
     * Retrieve the block primitives implemented by this package.
     * @return {object.<string, Function>} Mapping of opcode to Function.
     */
    getPrimitives () {
        return {
            control_repeat: this.repeat,
            control_repeat_until: this.repeatUntil,
            control_while: this.repeatWhile,
            control_for_each: this.forEach,
            control_forever: this.forever,
            control_wait: this.wait,
            control_wait_until: this.waitUntil,
            control_if: this.if,
            control_if_else: this.ifElse,
            control_stop: this.stop,
            control_create_clone_of: this.createClone,
            control_delete_this_clone: this.deleteClone,
            control_get_counter: this.getCounter,
            control_incr_counter: this.incrCounter,
            control_clear_counter: this.clearCounter,
            control_all_at_once: this.allAtOnce,
            control_execute: this.execute
        };
    }
    getHats () {
        return {
            control_start_as_clone: {
                restartExistingThreads: false
            }
        };
    }
    repeat (args: any, util: any) {
        const times = Math.round(Cast.toNumber(args.TIMES));
        // Initialize loop
        if (typeof util.stackFrame.loopCounter === 'undefined') {
            util.stackFrame.loopCounter = times;
        }
        // Only execute once per frame.
        // When the branch finishes, `repeat` will be executed again and
        // the second branch will be taken, yielding for the rest of the frame.
        // Decrease counter
        util.stackFrame.loopCounter--;
        // If we still have some left, start the branch.
        if (util.stackFrame.loopCounter >= 0) {
            util.startBranch(1, true);
        }
    }
    repeatUntil (args: any, util: any) {
        const condition = Cast.toBoolean(args.CONDITION);
        // If the condition is false (repeat UNTIL), start the branch.
        if (!condition) {
            util.startBranch(1, true);
        }
    }
    repeatWhile (args: any, util: any) {
        const condition = Cast.toBoolean(args.CONDITION);
        // If the condition is true (repeat WHILE), start the branch.
        if (condition) {
            util.startBranch(1, true);
        }
    }
    forEach (args: any, util: any) {
        const variable = util.target.lookupOrCreateVariable(args.VARIABLE.id, args.VARIABLE.name);
        if (typeof util.stackFrame.index === 'undefined') {
            util.stackFrame.index = 0;
        }
        if (util.stackFrame.index < Number(args.VALUE)) {
            util.stackFrame.index++;
            variable.value = util.stackFrame.index;
            util.startBranch(1, true);
        }
    }
    waitUntil (args: any, util: any) {
        const condition = Cast.toBoolean(args.CONDITION);
        if (!condition) {
            util.yield();
        }
    }
    forever (args: any, util: any) {
        util.startBranch(1, true);
    }
    wait (args: any, util: any) {
        if (util.stackTimerNeedsInit()) {
            const duration = Math.max(0, 1000 * Cast.toNumber(args.DURATION));
            util.startStackTimer(duration);
            this.runtime.requestRedraw();
            util.yield();
        } else if (!util.stackTimerFinished()) {
            util.yield();
        }
    }
    if (args: any, util: any) {
        const condition = Cast.toBoolean(args.CONDITION);
        if (condition) {
            util.startBranch(1, false);
        }
    }
    ifElse (args: any, util: any) {
        const condition = Cast.toBoolean(args.CONDITION);
        if (condition) {
            util.startBranch(1, false);
        } else {
            util.startBranch(2, false);
        }
    }
    stop (args: any, util: any) {
        const option = args.STOP_OPTION;
        if (option === 'all') {
            util.stopAll();
        } else if (option === 'other scripts in sprite' ||
            option === 'other scripts in stage') {
            util.stopOtherTargetThreads();
        } else if (option === 'this script') {
            util.stopThisScript();
        }
    }
    createClone (args: any, util: any) {
        this._createClone(Cast.toString(args.CLONE_OPTION), util.target);
    }
    _createClone (cloneOption: any, target: any) {
        // Set clone target
        let cloneTarget;
        if (cloneOption === '_myself_') {
            cloneTarget = target;
        } else {
            cloneTarget = this.runtime.getSpriteTargetByName(cloneOption);
        }
        // If clone target is not found, return
        if (!cloneTarget) {
            return;
        }
        // Create clone
        const newClone = cloneTarget.makeClone();
        if (newClone) {
            this.runtime.addTarget(newClone);
            // Place behind the original target.
            newClone.goBehindOther(cloneTarget);
        }
    }
    deleteClone (args: any, util: any) {
        if (util.target.isOriginal) {
            return;
        }
        this.runtime.disposeTarget(util.target);
        this.runtime.stopForTarget(util.target);
    }
    getCounter () {
        return this._counter;
    }
    clearCounter () {
        this._counter = 0;
    }
    incrCounter () {
        this._counter++;
    }
    allAtOnce (args: any, util: any) {
        // Since the "all at once" block is implemented for compatiblity with
        // Scratch 2.0 projects, it behaves the same way it did in 2.0, which
        // is to simply run the contained script (like "if 1 = 1").
        // (In early versions of Scratch 2.0, it would work the same way as
        // "run without screen refresh" custom blocks do now, but this was
        // removed before the release of 2.0.)
        util.startBranch(1, false);
    }
    execute (args: any) {
        if (typeof args.LAMBDA === 'function') {
            args.LAMBDA();
        }
    }
}
export default Scratch3ControlBlocks;
