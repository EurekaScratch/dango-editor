import ScratchCommon from './tw-extension-api-common';
import AsyncLimiter from '../util/async-limiter';
import VirtualMachine from '../virtual-machine'
/**
 * Sets up the global.Scratch API for an unsandboxed extension.
 * @param {VirtualMachine} vm
 * @returns {Promise<object[]>} Resolves with a list of extension objects when Scratch.extensions.register is called.
 */
const createUnsandboxedExtensionAPI = (vm: VirtualMachine) => new Promise(resolve => {
    const extensionObjects: any = [];
    const register = (extensionObject: any) => {
        extensionObjects.push(extensionObject);
        resolve(extensionObjects);
    };
    // Create a new copy of global.Scratch for each extension
    // @ts-expect-error TS(2339): Property 'Scratch' does not exist on type 'typeof ... Remove this comment to see the full error message
    global.Scratch = Object.assign({}, global.Scratch || {}, ScratchCommon);
    // @ts-expect-error TS(2339): Property 'Scratch' does not exist on type 'typeof ... Remove this comment to see the full error message
    global.Scratch.vm = vm;
    // @ts-expect-error TS(2339): Property 'Scratch' does not exist on type 'typeof ... Remove this comment to see the full error message
    global.Scratch.renderer = vm.runtime.renderer;
    // @ts-expect-error TS(2339): Property 'Scratch' does not exist on type 'typeof ... Remove this comment to see the full error message
    global.Scratch.extensions = {
        unsandboxed: true,
        register
    };
    // @ts-expect-error TS(7017): Element implicitly has an 'any' type because type ... Remove this comment to see the full error message
    global.ScratchExtensions = require('./tw-scratchx-compatibility-layer');
});
/**
 * Disable the existing global.Scratch unsandboxed extension APIs.
 * This helps debug poorly designed extensions.
 */
const teardownUnsandboxedExtensionAPI = () => {
    // We can assume global.Scratch already exists.
    // @ts-expect-error TS(2339): Property 'Scratch' does not exist on type 'typeof ... Remove this comment to see the full error message
    global.Scratch.extensions.register = () => {
        throw new Error('Too late to register new extensions.');
    };
};
/**
 * Load an unsandboxed extension from an arbitrary URL. This is dangerous.
 * @param {string} extensionURL
 * @param {Virtualmachine} vm
 * @returns {Promise<object[]>} Resolves with a list of extension objects if the extension was loaded successfully.
 */
const loadUnsandboxedExtension = (extensionURL: any, vm: any) => new Promise((resolve, reject) => {
    createUnsandboxedExtensionAPI(vm).then(resolve);
    const script = document.createElement('script');
    script.onerror = () => {
        reject(new Error(`Error in unsandboxed script ${extensionURL}. Check the console for more information.`));
    };
    script.src = extensionURL;
    document.body.appendChild(script);
}).then(objects => {
    teardownUnsandboxedExtensionAPI();
    return objects;
});
// Because loading unsandboxed extensions requires messing with global state (global.Scratch),
// only let one extension load at a time.
const limiter = new AsyncLimiter(loadUnsandboxedExtension, 1);
const load = (extensionURL: any, vm: any) => limiter.do(extensionURL, vm);
export {createUnsandboxedExtensionAPI};
export {load};
export default {
    createUnsandboxedExtensionAPI,
    load
};
