import uid from '../util/uid';
import { ScratchCompatibleValue } from '../virtual-machine';
import xmlEscape from '../util/xml-escape';

export type VariableValue = ScratchCompatibleValue | ScratchList;
export interface ScratchList extends Array<ScratchCompatibleValue> {
    _monitorUpToDate?: boolean;
  }

class Variable {
    id: any;
    isCloud: any;
    name: any;
    type: any;
    value: any;
    /**
     * @param {string} id Id of the variable.
     * @param {string} name Name of the variable.
     * @param {string} type Type of the variable, one of '' or 'list'
     * @param {boolean} isCloud Whether the variable is stored in the cloud.
     * @constructor
     */
    constructor (id: any, name: any, type: any, isCloud: any) {
        this.id = id || uid();
        this.name = name;
        this.type = type;
        this.isCloud = isCloud;
        switch (this.type) {
        case Variable.SCALAR_TYPE:
            this.value = 0;
            break;
        case Variable.LIST_TYPE:
            this.value = [];
            break;
        case Variable.BROADCAST_MESSAGE_TYPE:
            this.value = this.name;
            break;
        default:
            throw new Error(`Invalid variable type: ${this.type}`);
        }
    }
    toXML (isLocal: any) {
        isLocal = (isLocal === true);
        return `<variable type="${this.type}" id="${this.id}" islocal="${isLocal}" iscloud="${this.isCloud}">${xmlEscape(this.name)}</variable>`;
    }
    /**
     * Type representation for scalar variables.
     * This is currently represented as ''
     * for compatibility with blockly.
     * @const {string}
     */
    static get SCALAR_TYPE () {
        return ''; // used by compiler
    }
    /**
     * Type representation for list variables.
     * @const {string}
     */
    static get LIST_TYPE () {
        return 'list'; // used by compiler
    }
    /**
     * Type representation for list variables.
     * @const {string}
     */
    static get BROADCAST_MESSAGE_TYPE () {
        return 'broadcast_msg';
    }
}
export default Variable;
