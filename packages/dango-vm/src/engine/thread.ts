import log from '../util/log';
import compile from '../compiler/compile';
import RenderedTarget from '../sprites/rendered-target';
import Blocks from './blocks';
import Timer from '../util/timer';

enum ThreadStatus {
    /**
     * Thread status for initialized or running thread.
     * This is the default state for a thread - execution should run normally,
     * stepping from block to block.
     * @const
     */
    RUNNING = 0,
    /**
     * Threads are in this state when a primitive is waiting on a promise;
     * execution is paused until the promise changes thread status.
     * @const
     */
    PROMISE_WAIT = 1,
    /**
     * Thread status for yield.
     * @const
     */
    YIELD = 2,
    /**
     * Thread status for a single-tick yield. This will be cleared when the
     * thread is resumed.
     * @const
     */
    YIELD_TICK = 3,
    /**
     * Thread status for a finished/done thread.
     * Thread is in this state when there are no more blocks to execute.
     * @const
     */
    DONE = 4
};

/**
 * Recycle bin for empty stackFrame objects
 * @type Array<_StackFrame>
 */
const _stackFrameFreeList: _StackFrame[] = [];
/**
 * A frame used for each level of the stack. A general purpose
 * place to store a bunch of execution context and parameters
 * @param {boolean} warpMode Whether this level of the stack is warping
 * @constructor
 * @private
 */
class _StackFrame {
    /**
     * A context passed to block implementations.
     * @type {Object}
     */
    executionContext: null | any = null;
    /**
     * Whether this level of the stack is a loop.
     * @type {boolean}
     */
    isLoop = false;
    /**
     * Reported value from just executed block.
     * @type {Any}
     */
    justReported: unknown = null;
    /**
     * Procedure parameters.
     * @type {Object}
     */
    params: {[paramName: string]: unknown} | null = null;
    /**
     * Persists reported inputs during async block.
     * @type {Object}
     */
    reported: any = null;
    /**
     * The active block that is waiting on a promise.
     * @type {string}
     */
    reporting = '';
    /**
     * Name of waiting reporter.
     * @type {string}
     */
    waitingReporter: string | null = null;
    /**
     * Whether this level is in warp mode.  Is set by some legacy blocks and
     * "turbo mode"
     * @type {boolean}
     */
    warpMode: boolean;
    constructor (warpMode: boolean) {
        this.warpMode = warpMode;
    }
    /**
     * Reset all properties of the frame to pristine null and false states.
     * Used to recycle.
     * @return {_StackFrame} this
     */
    reset () {
        this.isLoop = false;
        this.warpMode = false;
        this.justReported = null;
        this.reported = null;
        this.waitingReporter = null;
        this.params = null;
        this.executionContext = null;
        return this;
    }
    /**
     * Reuse an active stack frame in the stack.
     * @param {?boolean} warpMode defaults to current warpMode
     * @returns {_StackFrame} this
     */
    reuse (warpMode = this.warpMode) {
        this.reset();
        this.warpMode = Boolean(warpMode);
        return this;
    }
    /**
     * Create or recycle a stack frame object.
     * @param {boolean} warpMode Enable warpMode on this frame.
     * @returns {_StackFrame} The clean stack frame with correct warpMode setting.
     */
    static create (warpMode: any) {
        const stackFrame = _stackFrameFreeList.pop();
        if (typeof stackFrame !== 'undefined') {
            stackFrame.warpMode = Boolean(warpMode);
            return stackFrame;
        }
        return new _StackFrame(warpMode);
    }
    /**
     * Put a stack frame object into the recycle bin for reuse.
     * @param {_StackFrame} stackFrame The frame to reset and recycle.
     */
    static release (stackFrame: any) {
        if (typeof stackFrame !== 'undefined') {
            _stackFrameFreeList.push(stackFrame.reset());
        }
    }
}
/**
 * A thread is a running stack context and all the metadata needed.
 * @param {?string} firstBlock First block to execute in the thread.
 * @constructor
 */
class Thread {
    /**
     * The Blocks this thread will execute.
     * @type {Blocks}
     */
    blockContainer: Blocks | null = null;
    /**
     * Which block ID should glow during this frame, if any.
     * @type {?string}
     */
    blockGlowInFrame: string | null = null;
    /**
     * The thread's generator.
     * @type {Generator}
     */
    generator: Generator | null = null;
    /**
     * Whether the thread is compiled.
     * @type {boolean}
     */
    isCompiled = false;
    /**
     * Whether the thread is killed in the middle of execution.
     * @type {boolean}
     */
    isKilled = false;
    justReported: unknown | null = null;
    /**
     * @type {Object.<string, import('../compiler/compile').CompiledScript>}
     */
    procedures: any = null;
    /**
     * Whether the thread requests its script to glow during this frame.
     * @type {boolean}
     */
    requestScriptGlowInFrame = false;
    /**
     * Stack for the thread. When the sequencer enters a control structure,
     * the block is pushed onto the stack so we know where to exit.
     * @type {Array.<string>}
     */
    stack: string[] = [];
    /**
     * Stack frames for the thread. Store metadata for the executing blocks.
     * @type {Array.<_StackFrame>}
     */
    stackFrames: _StackFrame[] = [];
    /**
     * Status of the thread, one of three states (below)
     * @type {number}
     */
    status: ThreadStatus = ThreadStatus.RUNNING;
    /**
     * Target of this thread.
     * @type {?Target}
    */
    target: RenderedTarget | null = null;
    // compiler data
    // these values only make sense if isCompiled == true
    timer: any = null;
    /**
    * ID of top block of the thread
    * @type {!string}
    */
    topBlock: string;
    triedToCompile = false;
    /**
     * A timer for when the thread enters warp mode.
     * Substitutes the sequencer's count toward WORK_TIME on a per-thread basis.
     * @type {?Timer}
     */
    warpTimer: Timer | null = null;
    updateMonitor = false;
    stackClick = false;
    constructor (firstBlock: string) {
        this.topBlock = firstBlock;
    }
    /**
     * Thread status for initialized or running thread.
     * This is the default state for a thread - execution should run normally,
     * stepping from block to block.
     * @const
     */
    static get STATUS_RUNNING () {
        return ThreadStatus.RUNNING; // used by compiler
    }
    
    /**
     * Threads are in this state when a primitive is waiting on a promise;
     * execution is paused until the promise changes thread status.
     * @const
     */
    static get STATUS_PROMISE_WAIT () {
        return ThreadStatus.PROMISE_WAIT; // used by compiler
    }
    /**
     * Thread status for yield.
     * @const
     */
    static get STATUS_YIELD () {
        return ThreadStatus.YIELD; // used by compiler
    }
    /**
     * Thread status for a single-tick yield. This will be cleared when the
     * thread is resumed.
     * @const
     */
    static get STATUS_YIELD_TICK () {
        return ThreadStatus.YIELD_TICK; // used by compiler
    }
    /**
     * Thread status for a finished/done thread.
     * Thread is in this state when there are no more blocks to execute.
     * @const
     */
    static get STATUS_DONE () {
        return ThreadStatus.DONE; // used by compiler
    }
    
    /**
     * @param {Target} target The target running the thread.
     * @param {string} topBlock ID of the thread's top block.
     * @returns {string} A unique ID for this target and thread.
     */
    static getIdFromTargetAndBlock (target: RenderedTarget, topBlock: string) {
        // & should never appear in any IDs, so we can use it as a separator
        return `${target.id}&${topBlock}`;
    }
    getId () {
        if (!this.target) throw new Error('target has not been initialized in this thread');
        return Thread.getIdFromTargetAndBlock(this.target, this.topBlock);
    }
    /**
     * Push stack and update stack frames appropriately.
     * @param {string} blockId Block ID to push to stack.
     */
    pushStack (blockId: string) {
        this.stack.push(blockId);
        // Push an empty stack frame, if we need one.
        // Might not, if we just popped the stack.
        if (this.stack.length > this.stackFrames.length) {
            const parent = this.stackFrames[this.stackFrames.length - 1];
            this.stackFrames.push(_StackFrame.create(typeof parent !== 'undefined' && parent.warpMode));
        }
    }
    /**
     * Reset the stack frame for use by the next block.
     * (avoids popping and re-pushing a new stack frame - keeps the warpmode the same
     * @param {string} blockId Block ID to push to stack.
     */
    reuseStackForNextBlock (blockId: string) {
        this.stack[this.stack.length - 1] = blockId;
        this.stackFrames[this.stackFrames.length - 1].reuse();
    }
    /**
     * Pop last block on the stack and its stack frame.
     * @return {string} Block ID popped from the stack.
     */
    popStack () {
        _StackFrame.release(this.stackFrames.pop());
        return this.stack.pop();
    }
    /**
     * Pop back down the stack frame until we hit a procedure call or the stack frame is emptied
     */
    stopThisScript () {
        let blockID = this.peekStack();
        while (blockID !== null) {
            const block = this.target?.blocks.getBlock(blockID);
            if (typeof block !== 'undefined' &&
                (block.opcode === 'procedures_call' || block.opcode === 'procedures_call_return')) {
                break;
            }
            this.popStack();
            blockID = this.peekStack();
        }
        if (this.stack.length === 0) {
            // Clean up!
            this.requestScriptGlowInFrame = false;
            this.status = Thread.STATUS_DONE;
        }
    }
    /**
     * Get top stack item.
     * @return {?string} Block ID on top of stack.
     */
    peekStack () {
        return this.stack.length > 0 ? this.stack[this.stack.length - 1] : null;
    }
    /**
     * Get top stack frame.
     * @return {?object} Last stack frame stored on this thread.
     */
    peekStackFrame () {
        return this.stackFrames.length > 0 ? this.stackFrames[this.stackFrames.length - 1] : null;
    }
    /**
     * Get stack frame above the current top.
     * @return {?object} Second to last stack frame stored on this thread.
     */
    peekParentStackFrame () {
        return this.stackFrames.length > 1 ? this.stackFrames[this.stackFrames.length - 2] : null;
    }
    /**
     * Push a reported value to the parent of the current stack frame.
     * @param {*} value Reported value to push.
     */
    pushReportedValue (value: unknown) {
        this.justReported = typeof value === 'undefined' ? null : value;
    }
    /**
     * Initialize procedure parameters on this stack frame.
     */
    initParams () {
        const stackFrame = this.peekStackFrame();
        if (stackFrame?.params === null) {
            stackFrame.params = {};
        }
    }
    /**
     * Add a parameter to the stack frame.
     * Use when calling a procedure with parameter values.
     * @param {!string} paramName Name of parameter.
     * @param {*} value Value to set for parameter.
     */
    pushParam (paramName: string, value: unknown) {
        const stackFrame = this.peekStackFrame();
        if (!stackFrame) throw new Error('stackFrame not found in this thread');
        if (stackFrame.params === null) throw new Error('param has not been initialized yet');
        stackFrame.params[paramName] = value;
    }
    /**
     * Get a parameter at the lowest possible level of the stack.
     * @param {!string} paramName Name of parameter.
     * @return {*} value Value for parameter.
     */
    getParam (paramName: string) {
        for (let i = this.stackFrames.length - 1; i >= 0; i--) {
            const frame = this.stackFrames[i];
            if (frame.params === null) {
                continue;
            }
            if (frame.params.hasOwnProperty(paramName)) {
                return frame.params[paramName];
            }
            return null;
        }
        return null;
    }
    getAllparams () {
        const stackFrame = this.peekStackFrame();
        return stackFrame?.params;
    }
    /**
     * Whether the current execution of a thread is at the top of the stack.
     * @return {boolean} True if execution is at top of the stack.
     */
    atStackTop () {
        return this.peekStack() === this.topBlock;
    }
    /**
     * Switch the thread to the next block at the current level of the stack.
     * For example, this is used in a standard sequence of blocks,
     * where execution proceeds from one block to the next.
     */
    goToNextBlock () {
        const nextBlockId = this.target?.blocks.getNextBlock(this.peekStack());
        this.reuseStackForNextBlock(nextBlockId);
    }
    /**
     * Attempt to determine whether a procedure call is recursive,
     * by examining the stack.
     * @param {!string} procedureCode Procedure code of procedure being called.
     * @return {boolean} True if the call appears recursive.
     */
    isRecursiveCall (procedureCode: string) {
        let callCount = 5; // Max number of enclosing procedure calls to examine.
        const sp = this.stack.length - 1;
        for (let i = sp - 1; i >= 0; i--) {
            const block = this.target?.blocks.getBlock(this.stack[i]);
            if ((block.opcode === 'procedures_call' || block.opcode === 'procedures_call_return') &&
                block.mutation.proccode === procedureCode) {
                return true;
            }
            if (--callCount < 0) {
                return false;
            }
        }
        return false;
    }
    /**
     * Attempt to compile this thread.
     */
    tryCompile () {
        if (!this.blockContainer) {
            return;
        }
        this.triedToCompile = true;
        const topBlock = this.topBlock;
        // Flyout blocks are stored in a special block container.
        const blocks = this.blockContainer.getBlock(topBlock) ? this.blockContainer : this.target?.runtime.flyoutBlocks;
        const cachedResult = blocks.getCachedCompileResult(topBlock);
        // If there is a cached error, do not attempt to recompile.
        if (cachedResult && !cachedResult.success) {
            return;
        }
        let result;
        if (cachedResult) {
            result = cachedResult.value;
        } else {
            try {
                result = compile(this);
                blocks.cacheCompileResult(topBlock, result);
            } catch (error) {
                log.error('cannot compile script', this.target?.getName(), error);
                blocks.cacheCompileError(topBlock, error);
                this.target?.runtime.emitCompileError(this.target, error);
                return;
            }
        }
        this.procedures = {};
        for (const procedureCode of Object.keys(result.procedures)) {
            this.procedures[procedureCode] = result.procedures[procedureCode](this);
        }
        this.generator = result.startingFunction(this)();
        if (!this.blockContainer.forceNoGlow) {
            this.blockGlowInFrame = this.topBlock;
            this.requestScriptGlowInFrame = true;
        }
        this.isCompiled = true;
    }
}
export default Thread;
