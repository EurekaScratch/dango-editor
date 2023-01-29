import ArgumentType from './argument-type';
import BlockType from './block-type';
import {argumentIndexToId, generateExtensionId} from './tw-scratchx-utilities';
/**
 * @typedef ScratchXDescriptor
 * @property {unknown[][]} blocks
 * @property {Record<string, unknown[]>} [menus]
 * @property {string} [url]
 * @property {string} [displayName]
 */
/**
 * @typedef ScratchXStatus
 * @property {0|1|2} status 0 is red/error, 1 is yellow/not ready, 2 is green/ready
 * @property {string} msg
 */
const parseScratchXBlockType = (type: any) => {
    if (type === '' || type === ' ' || type === 'w') {
        return {
            type: BlockType.COMMAND,
            async: type === 'w'
        };
    }
    if (type === 'r' || type === 'R') {
        return {
            type: BlockType.REPORTER,
            async: type === 'R'
        };
    }
    if (type === 'b') {
        return {
            type: BlockType.BOOLEAN,
            // ScratchX docs don't seem to mention boolean reporters that wait
            async: false
        };
    }
    if (type === 'h') {
        return {
            type: BlockType.HAT,
            async: false
        };
    }
    throw new Error(`Unknown ScratchX block type: ${type}`);
};
const isScratchCompatibleValue = (v: any) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';
/**
 * @param {string} argument ScratchX argument with leading % removed.
 * @param {unknown} defaultValue Default value, if any
 */
const parseScratchXArgument = (argument: any, defaultValue: any) => {
    const result = {};
    const hasDefaultValue = isScratchCompatibleValue(defaultValue);
    if (hasDefaultValue) {
        // @ts-expect-error TS(2339): Property 'defaultValue' does not exist on type '{}... Remove this comment to see the full error message
        result.defaultValue = defaultValue;
    }
    // TODO: ScratchX docs don't mention support for boolean arguments?
    if (argument === 's') {
        // @ts-expect-error TS(2339): Property 'type' does not exist on type '{}'.
        result.type = ArgumentType.STRING;
        if (!hasDefaultValue) {
            // @ts-expect-error TS(2339): Property 'defaultValue' does not exist on type '{}... Remove this comment to see the full error message
            result.defaultValue = '';
        }
    } else if (argument === 'n') {
        // @ts-expect-error TS(2339): Property 'type' does not exist on type '{}'.
        result.type = ArgumentType.NUMBER;
        if (!hasDefaultValue) {
            // @ts-expect-error TS(2339): Property 'defaultValue' does not exist on type '{}... Remove this comment to see the full error message
            result.defaultValue = 0;
        }
    } else if (argument[0] === 'm') {
        // @ts-expect-error TS(2339): Property 'type' does not exist on type '{}'.
        result.type = ArgumentType.STRING;
        const split = argument.split(/\.|:/);
        const menuName = split[1];
        // @ts-expect-error TS(2339): Property 'menu' does not exist on type '{}'.
        result.menu = menuName;
    } else {
        throw new Error(`Unknown ScratchX argument type: ${argument}`);
    }
    return result;
};
const wrapScratchXFunction = (originalFunction: any, argumentCount: any, async: any) => (args: any) => {
    // Convert Scratch 3's argument object to an argument list expected by ScratchX
    const argumentList: any = [];
    for (let i = 0; i < argumentCount; i++) {
        argumentList.push(args[argumentIndexToId(i)]);
    }
    if (async) {
        return new Promise(resolve => {
            originalFunction(...argumentList, resolve);
        });
    }
    return originalFunction(...argumentList);
};
/**
 * @param {string} name
 * @param {ScratchXDescriptor} descriptor
 * @param {Record<string, () => unknown>} functions
 */
const convert = (name: any, descriptor: any, functions: any) => {
    const extensionId = generateExtensionId(name);
    const info = {
        id: extensionId,
        name: descriptor.displayName || name,
        blocks: [],
        color1: '#4a4a5e',
        color2: '#31323f',
        color3: '#191a21'
    };
    const scratch3Extension = {
        getInfo: () => info,
        _getStatus: functions._getStatus
    };
    if (descriptor.url) {
        // @ts-expect-error TS(2339): Property 'docsURI' does not exist on type '{ id: s... Remove this comment to see the full error message
        info.docsURI = descriptor.url;
    }
    for (const blockDescriptor of descriptor.blocks) {
        if (blockDescriptor.length === 1) {
            // Separator
            // @ts-expect-error TS(2345): Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
            info.blocks.push('---');
            continue;
        }
        const scratchXBlockType = blockDescriptor[0];
        const blockText = blockDescriptor[1];
        const functionName = blockDescriptor[2];
        const defaultArgumentValues = blockDescriptor.slice(3);
        let scratchText = '';
        const argumentInfo = [];
        const blockTextParts = blockText.split(/%([\w.:]+)/g);
        for (let i = 0; i < blockTextParts.length; i++) {
            const part = blockTextParts[i];
            const isArgument = i % 2 === 1;
            if (isArgument) {
                // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
                parseScratchXArgument(part);
                const argumentIndex = Math.floor(i / 2).toString();
                const argumentDefaultValue = defaultArgumentValues[argumentIndex];
                const argumentId = argumentIndexToId(argumentIndex);
                argumentInfo[argumentId] = parseScratchXArgument(part, argumentDefaultValue);
                scratchText += `[${argumentId}]`;
            } else {
                scratchText += part;
            }
        }
        const scratch3BlockType = parseScratchXBlockType(scratchXBlockType);
        const blockInfo = {
            opcode: functionName,
            blockType: scratch3BlockType.type,
            text: scratchText,
            arguments: argumentInfo
        };
        // @ts-expect-error TS(2345): Argument of type '{ opcode: any; blockType: string... Remove this comment to see the full error message
        info.blocks.push(blockInfo);
        const originalFunction = functions[functionName];
        const argumentCount = argumentInfo.length;
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        scratch3Extension[functionName] = wrapScratchXFunction(originalFunction, argumentCount, scratch3BlockType.async);
    }
    const menus = descriptor.menus;
    if (menus) {
        const scratch3Menus = {};
        for (const menuName of Object.keys(menus) || {}) {
            const menuItems = menus[menuName];
            const menuInfo = {
                items: menuItems
            };
            // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            scratch3Menus[menuName] = menuInfo;
        }
        // @ts-expect-error TS(2339): Property 'menus' does not exist on type '{ id: str... Remove this comment to see the full error message
        info.menus = scratch3Menus;
    }
    return scratch3Extension;
};
const extensionNameToExtension = new Map();
const register = (name: any, descriptor: any, functions: any) => {
    const scratch3Extension = convert(name, descriptor, functions);
    extensionNameToExtension.set(name, scratch3Extension);
    // @ts-expect-error
    Scratch.extensions.register(scratch3Extension);
};
/**
 * @param {string} extensionName
 * @returns {ScratchXStatus}
 */
const getStatus = (extensionName: any) => {
    const extension = extensionNameToExtension.get(extensionName);
    if (extension) {
        return extension._getStatus();
    }
    return {
        status: 0,
        msg: 'does not exist'
    };
};
export {register};
export {getStatus};
export {convert};
export default {
    register,
    getStatus,
    convert
};
