class VariablePool {
    count: any;
    prefix: any;
    /**
     * @param {string} prefix The prefix at the start of the variable name.
     */
    constructor (prefix: any) {
        if (prefix.trim().length === 0) {
            throw new Error('prefix cannot be empty');
        }
        this.prefix = prefix;
        /**
         * @private
         */
        this.count = 0;
    }
    next () {
        return `${this.prefix}${this.count++}`;
    }
}
export default VariablePool;
