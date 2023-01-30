import Cast from '../util/cast';
import MathUtil from '../util/math-util';
class Scratch3OperatorsBlocks {
    runtime: any;
    constructor (runtime: any) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
    }
    /**
     * Retrieve the block primitives implemented by this package.
     * @return {object.<string, Function>} Mapping of opcode to Function.
     */
    getPrimitives () {
        return {
            operator_lambda: this.lambda,
            operator_add: this.add,
            operator_subtract: this.subtract,
            operator_multiply: this.multiply,
            operator_divide: this.divide,
            operator_lt: this.lt,
            operator_equals: this.equals,
            operator_gt: this.gt,
            operator_and: this.and,
            operator_or: this.or,
            operator_not: this.not,
            operator_random: this.random,
            operator_join: this.join,
            operator_join_advanced: this.joinAdvanced,
            operator_letter_of: this.letterOf,
            operator_length: this.length,
            operator_contains: this.contains,
            operator_mod: this.mod,
            operator_round: this.round,
            operator_mathop: this.mathop
        };
    }
    lambda (_: any, util: any) {
        // Don't trigger in stackClick
        if (util.thread.stackClick) return;
        // If lambda expression has been executed, restore the state.
        if (util.thread.lambdaParent) {
            util.reuseStackForNextBlock(util.thread.lambdaParent.pop());
            util.thread.goToNextBlock();
            if (util.thread.lambdaParent.length < 1) {
                delete util.thread.lambdaParent;
            }
            return;
        }
        // mark lambda's id
        const originalID = util.currentBlock.id;
        return () => {
            const currentId = util.currentBlock.id;
            // jump to lambda
            util.reuseStackForNextBlock(originalID);
            if (!util.thread.lambdaParent) {
                util.thread.lambdaParent = [];
            }
            util.thread.lambdaParent.push(currentId);
            // mark it as loop to restore original state
            util.startBranch(1, true);
        };
    }
    add (args: any) {
        return Cast.toNumber(args.NUM1) + Cast.toNumber(args.NUM2);
    }
    subtract (args: any) {
        return Cast.toNumber(args.NUM1) - Cast.toNumber(args.NUM2);
    }
    multiply (args: any) {
        return Cast.toNumber(args.NUM1) * Cast.toNumber(args.NUM2);
    }
    divide (args: any) {
        return Cast.toNumber(args.NUM1) / Cast.toNumber(args.NUM2);
    }
    lt (args: any) {
        return Cast.compare(args.OPERAND1, args.OPERAND2) < 0;
    }
    equals (args: any) {
        return Cast.compare(args.OPERAND1, args.OPERAND2) === 0;
    }
    gt (args: any) {
        return Cast.compare(args.OPERAND1, args.OPERAND2) > 0;
    }
    and (args: any) {
        return Cast.toBoolean(args.OPERAND1) && Cast.toBoolean(args.OPERAND2);
    }
    or (args: any) {
        return Cast.toBoolean(args.OPERAND1) || Cast.toBoolean(args.OPERAND2);
    }
    not (args: any) {
        return !Cast.toBoolean(args.OPERAND);
    }
    random (args: any) {
        return this._random(args.FROM, args.TO);
    }
    _random (from: any, to: any) {
        const nFrom = Cast.toNumber(from);
        const nTo = Cast.toNumber(to);
        const low = nFrom <= nTo ? nFrom : nTo;
        const high = nFrom <= nTo ? nTo : nFrom;
        if (low === high) {
            return low;
        }
        // If both arguments are ints, truncate the result to an int.
        if (Cast.isInt(from) && Cast.isInt(to)) {
            return low + Math.floor(Math.random() * ((high + 1) - low));
        }
        return (Math.random() * (high - low)) + low;
    }
    join (args: any) {
        return Cast.toString(args.STRING1) + Cast.toString(args.STRING2);
    }
    joinAdvanced (args: any) {
        let result = '';
        const ids = JSON.parse(args.mutation.argumentids);
        for (const id of ids) {
            result += Cast.toString(args[id]);
        }
        return result;
    }
    letterOf (args: any) {
        const index = Cast.toNumber(args.LETTER) - 1;
        const str = Cast.toString(args.STRING);
        // Out of bounds?
        if (index < 0 || index >= str.length) {
            return '';
        }
        return str.charAt(index);
    }
    length (args: any) {
        return Cast.toString(args.STRING).length;
    }
    contains (args: any) {
        const format = function (string: any) {
            return Cast.toString(string).toLowerCase();
        };
        return format(args.STRING1).includes(format(args.STRING2));
    }
    mod (args: any) {
        const n = Cast.toNumber(args.NUM1);
        const modulus = Cast.toNumber(args.NUM2);
        let result = n % modulus;
        // Scratch mod uses floored division instead of truncated division.
        if (result / modulus < 0) {
            result += modulus;
        }
        return result;
    }
    round (args: any) {
        return Math.round(Cast.toNumber(args.NUM));
    }
    mathop (args: any) {
        const operator = Cast.toString(args.OPERATOR).toLowerCase();
        const n = Cast.toNumber(args.NUM);
        switch (operator) {
        case 'abs': return Math.abs(n);
        case 'floor': return Math.floor(n);
        case 'ceiling': return Math.ceil(n);
        case 'sqrt': return Math.sqrt(n);
        case 'sin': return Math.round(Math.sin((Math.PI * n) / 180) * 1e10) / 1e10;
        case 'cos': return Math.round(Math.cos((Math.PI * n) / 180) * 1e10) / 1e10;
        case 'tan': return MathUtil.tan(n);
        case 'asin': return (Math.asin(n) * 180) / Math.PI;
        case 'acos': return (Math.acos(n) * 180) / Math.PI;
        case 'atan': return (Math.atan(n) * 180) / Math.PI;
        case 'ln': return Math.log(n);
        case 'log': return Math.log(n) / Math.LN10;
        case 'e ^': return Math.exp(n);
        case '10 ^': return Math.pow(10, n);
        }
        return 0;
    }
}
export default Scratch3OperatorsBlocks;
