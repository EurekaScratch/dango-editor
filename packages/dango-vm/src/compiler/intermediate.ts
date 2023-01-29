/**
 * @fileoverview Common intermediates shared amongst parts of the compiler.
 */
/**
 * An IntermediateScript describes a single script.
 * Scripts do not necessarily have hats.
 */
class IntermediateScript {
 arguments: any;
 cachedCompileResult: any;
 dependedProcedures: any;
 isProcedure: any;
 isWarp: any;
 procedureCode: any;
 stack: any;
 topBlockId: any;
 warpTimer: any;
 yields: any;
 constructor () {
     /**
      * The ID of the top block of this script.
      * @type {string}
      */
     this.topBlockId = null;
     /**
      * List of nodes that make up this script.
      * @type {Array|null}
      */
     this.stack = null;
     /**
      * Whether this script is a procedure.
      * @type {boolean}
      */
     this.isProcedure = false;
     /**
      * This procedure's code, if any.
      * @type {string}
      */
     this.procedureCode = '';
     /**
      * List of names of arguments accepted by this function, if it is a procedure.
      * @type {string[]}
      */
     this.arguments = [];
     /**
      * Whether this script should be run in warp mode.
      * @type {boolean}
      */
     this.isWarp = false;
     /**
      * Whether this script can `yield`
      * If false, this script will be compiled as a regular JavaScript function (function)
      * If true, this script will be compiled as a generator function (function*)
      * @type {boolean}
      */
     this.yields = true;
     /**
      * Whether this script should use the "warp timer"
      * @type {boolean}
      */
     this.warpTimer = false;
     /**
      * List of procedure IDs that this script needs.
      * @readonly
      */
     this.dependedProcedures = [];
     /**
      * Cached result of compiling this script.
      * @type {Function|null}
      */
     this.cachedCompileResult = null;
 }
}
/**
 * An IntermediateRepresentation contains scripts.
 */
class IntermediateRepresentation {
 entry: any;
 procedures: any;
 constructor () {
     /**
      * The entry point of this IR.
      * @type {IntermediateScript}
      */
     this.entry = null;
     /**
      * Maps procedure variants to their intermediate script.
      * @type {Object.<string, IntermediateScript>}
      */
     this.procedures = {};
 }
}
export {IntermediateScript};
export {IntermediateRepresentation};
export default {
    IntermediateScript,
    IntermediateRepresentation
};
