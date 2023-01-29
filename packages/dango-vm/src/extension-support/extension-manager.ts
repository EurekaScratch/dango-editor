// @ts-nocheck
import {ExtensionMetadata, ExtensionMenu} from './extension-metadata';
import dispatch from '../dispatch/central-dispatch';
import log from '../util/log';
import maybeFormatMessage from '../util/maybe-format-message';
import BlockType from './block-type';
import SecurityManager from './tw-security-manager';
import scratch3CoreExample from '../blocks/scratch3_core_example';
import scratch3Pen from '../extensions/scratch3_pen/index';
import scratch3Wedo2 from '../extensions/scratch3_wedo2/index';
import scratch3Music from '../extensions/scratch3_music/index';
import scratch3Microbit from '../extensions/scratch3_microbit/index';
import scratch3Text2speech from '../extensions/scratch3_text2speech/index';
import scratch3Translate from '../extensions/scratch3_translate/index';
import scratch3VideoSensing from '../extensions/scratch3_video_sensing/index';
import scratch3Ev3 from '../extensions/scratch3_ev3/index';
import scratch3Makeymakey from '../extensions/scratch3_makeymakey/index';
import scratch3Boost from '../extensions/scratch3_boost/index';
import scratch3GdxFor from '../extensions/scratch3_gdx_for/index';
import tw from '../extensions/tw/index';
import {load} from './tw-unsandboxed-extension-runner';

export interface ExtensionInfo {
    // TODO
}

export interface Peripheral {
    // TODO
  }
  
// These extensions are currently built into the VM repository but should not be loaded at startup.
// TODO: move these out into a separate repository?
// TODO: change extension spec so that library info, including extension ID, can be collected through static methods
const builtinExtensions = {
    // This is an example that isn't loaded with the other core blocks,
    // but serves as a reference for loading core blocks as extensions.
    coreExample: () => scratch3CoreExample,
    // These are the non-core built-in extensions.
    pen: () => scratch3Pen,
    wedo2: () => scratch3Wedo2,
    music: () => scratch3Music,
    microbit: () => scratch3Microbit,
    text2speech: () => scratch3Text2speech,
    translate: () => scratch3Translate,
    videoSensing: () => scratch3VideoSensing,
    ev3: () => scratch3Ev3,
    makeymakey: () => scratch3Makeymakey,
    boost: () => scratch3Boost,
    gdxfor: () => scratch3GdxFor,
    // tw: core extension
    tw: () => tw
};
/**
 * @typedef {object} ArgumentInfo - Information about an extension block argument
 * @property {ArgumentType} type - the type of value this argument can take
 * @property {*|undefined} default - the default value of this argument (default: blank)
 */
 export interface ArgumentInfo {
     type: ArgumentType,
     default?: unknown;
 }
/**
 * @typedef {object} ConvertedBlockInfo - Raw extension block data paired with processed data ready for scratch-blocks
 * @property {ExtensionBlockMetadata} info - the raw block info
 * @property {object} json - the scratch-blocks JSON definition for this block
 * @property {string} xml - the scratch-blocks XML definition for this block
 */
 export interface ConvertedBlockInfo {
     info: ExtensionBlockMetadata;
     json?: object;
     xml: string;
 }
 
 export interface ConvertedCustomFieldType {
    fieldName: string;
    extendedName: string;
    argumentTypeInfo: {
        shadow: {
            type: string;
            fieldName: string;
        }
    }
    scratchBlocksDefinition: any;
    fieldImplementation: unknown;
 }
/**
 * @typedef {object} CategoryInfo - Information about a block category
 * @property {string} id - the unique ID of this category
 * @property {string} name - the human-readable name of this category
 * @property {string|undefined} blockIconURI - optional URI for the block icon image
 * @property {string} color1 - the primary color for this category, in '#rrggbb' format
 * @property {string} color2 - the secondary color for this category, in '#rrggbb' format
 * @property {string} color3 - the tertiary color for this category, in '#rrggbb' format
 * @property {Array.<ConvertedBlockInfo>} blocks - the blocks, separators, etc. in this category
 * @property {Array.<object>} menus - the menus provided by this category
 */
 export interface CategoryInfo extends ExtensionMetadata {
    blocks?: ConvertedBlockInfo[];
    menus?: object[];
    menuInfo?: Record<string, ExtensionMenu>;
    customFieldTypes?: Record<string, ConvertedCustomFieldType>;
 }
/**
 * @typedef {object} PendingExtensionWorker - Information about an extension worker still initializing
 * @property {string} extensionURL - the URL of the extension to be loaded by this worker
 * @property {Function} resolve - function to call on successful worker startup
 * @property {Function} reject - function to call on failed worker startup
 */
const createExtensionService = (extensionManager: any) => {
    const service = {};
    // @ts-expect-error TS(2339): Property 'registerExtensionServiceSync' does not e... Remove this comment to see the full error message
    service.registerExtensionServiceSync = extensionManager.registerExtensionServiceSync.bind(extensionManager);
    // @ts-expect-error TS(2339): Property 'allocateWorker' does not exist on type '... Remove this comment to see the full error message
    service.allocateWorker = extensionManager.allocateWorker.bind(extensionManager);
    // @ts-expect-error TS(2339): Property 'onWorkerInit' does not exist on type '{}... Remove this comment to see the full error message
    service.onWorkerInit = extensionManager.onWorkerInit.bind(extensionManager);
    // @ts-expect-error TS(2339): Property 'registerExtensionService' does not exist... Remove this comment to see the full error message
    service.registerExtensionService = extensionManager.registerExtensionService.bind(extensionManager);
    return service;
};
class ExtensionManager {
    _loadedExtensions: any;
    asyncExtensionsLoadedCallbacks: any;
    loadingAsyncExtensions: any;
    nextExtensionWorker: any;
    pendingExtensions: any;
    pendingWorkers: any;
    runtime: any;
    securityManager: any;
    vm: any;
    workerURLs: any;
    constructor (vm: any) {
        /**
         * The ID number to provide to the next extension worker.
         * @type {int}
         */
        this.nextExtensionWorker = 0;
        /**
         * FIFO queue of extensions which have been requested but not yet loaded in a worker,
         * along with promise resolution functions to call once the worker is ready or failed.
         *
         * @type {Array.<PendingExtensionWorker>}
         */
        this.pendingExtensions = [];
        /**
         * Map of worker ID to workers which have been allocated but have not yet finished initialization.
         * @type {Array.<PendingExtensionWorker>}
         */
        this.pendingWorkers = [];
        /**
         * Map of worker ID to the URL where it was loaded from.
         * @type {Array<string>}
         */
        this.workerURLs = [];
        /**
         * Map of loaded extension URLs/IDs to service names.
         * @type {Map.<string, string>}
         * @private
         */
        this._loadedExtensions = new Map();
        /**
         * Responsible for determining security policies related to custom extensions.
         */
        this.securityManager = new SecurityManager();
        /**
         * @type {VirtualMachine}
         */
        this.vm = vm;
        /**
         * Keep a reference to the runtime so we can construct internal extension objects.
         * TODO: remove this in favor of extensions accessing the runtime as a service.
         * @type {Runtime}
         */
        this.runtime = vm.runtime;
        this.loadingAsyncExtensions = 0;
        this.asyncExtensionsLoadedCallbacks = [];
        dispatch.setService('extensions', createExtensionService(this)).catch(e => {
            log.error(`ExtensionManager was unable to register extension service: ${JSON.stringify(e)}`);
        });
    }
    /**
     * Check whether an extension is registered or is in the process of loading. This is intended to control loading or
     * adding extensions so it may return `true` before the extension is ready to be used. Use the promise returned by
     * `loadExtensionURL` if you need to wait until the extension is truly ready.
     * @param {string} extensionID - the ID of the extension.
     * @returns {boolean} - true if loaded, false otherwise.
     */
    isExtensionLoaded (extensionID: any) {
        return this._loadedExtensions.has(extensionID);
    }
    /**
     * Determine whether an extension with a given ID is built in to the VM, such as pen.
     * Note that "core extensions" like motion will return false here.
     * @param {string} extensionId
     * @returns {boolean}
     */
    isBuiltinExtension (extensionId: any) {
        return Object.prototype.hasOwnProperty.call(builtinExtensions, extensionId);
    }
    /**
     * Synchronously load an internal extension (core or non-core) by ID. This call will
     * fail if the provided id is not does not match an internal extension.
     * @param {string} extensionId - the ID of an internal extension
     */
    loadExtensionIdSync (extensionId: any) {
        if (!this.isBuiltinExtension(extensionId)) {
            log.warn(`Could not find extension ${extensionId} in the built in extensions.`);
            return;
        }
        /** @TODO dupe handling for non-builtin extensions. See commit 670e51d33580e8a2e852b3b038bb3afc282f81b9 */
        if (this.isExtensionLoaded(extensionId)) {
            const message = `Rejecting attempt to load a second extension with ID ${extensionId}`;
            log.warn(message);
            return;
        }
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        const extension = builtinExtensions[extensionId]();
        const extensionInstance = new extension(this.runtime);
        const serviceName = this._registerInternalExtension(extensionInstance);
        this._loadedExtensions.set(extensionId, serviceName);
        this.runtime.compilerRegisterExtension(extensionId, extensionInstance);
    }
    _isValidExtensionURL (extensionURL: any) {
        try {
            const parsedURL = new URL(extensionURL);
            return (parsedURL.protocol === 'https:' ||
                parsedURL.protocol === 'http:' ||
                parsedURL.protocol === 'data:' ||
                parsedURL.protocol === 'file:');
        } catch (e) {
            return false;
        }
    }
    /**
     * Load an extension by URL or internal extension ID
     * @param {string} extensionURL - the URL for the extension to load OR the ID of an internal extension
     * @returns {Promise} resolved once the extension is loaded and initialized or rejected on failure
     */
    async loadExtensionURL (extensionURL: any) {
        if (this.isBuiltinExtension(extensionURL)) {
            this.loadExtensionIdSync(extensionURL);
            return;
        }
        if (this.isExtensionURLLoaded(extensionURL)) {
            // Extension is already loaded.
            return;
        }
        if (!this._isValidExtensionURL(extensionURL)) {
            throw new Error(`Invalid extension URL: ${extensionURL}`);
        }
        this.runtime.setExternalCommunicationMethod('customExtensions', true);
        this.loadingAsyncExtensions++;
        const sandboxMode = await this.securityManager.getSandboxMode(extensionURL);
        if (sandboxMode === 'unsandboxed') {
            const extensionObjects = await load(extensionURL, this.vm)
                .catch(error => this._failedLoadingExtensionScript(error));
            const fakeWorkerId = this.nextExtensionWorker++;
            this.workerURLs[fakeWorkerId] = extensionURL;
            // @ts-expect-error TS(2571): Object is of type 'unknown'.
            for (const extensionObject of extensionObjects) {
                const extensionInfo = extensionObject.getInfo();
                const serviceName = `unsandboxed.${fakeWorkerId}.${extensionInfo.id}`;
                dispatch.setServiceSync(serviceName, extensionObject);
                dispatch.callSync('extensions', 'registerExtensionServiceSync', serviceName);
                this._loadedExtensions.set(extensionInfo.id, serviceName);
            }
            this._finishedLoadingExtensionScript();
            return;
        }
        /* eslint-disable max-len */
        let ExtensionWorker: any;
        if (sandboxMode === 'worker') {
            ExtensionWorker = require('worker-loader?name=js/extension-worker/extension-worker.[hash].js!./extension-worker');
        } else if (sandboxMode === 'iframe') {
            ExtensionWorker = (await import(/* webpackChunkName: "iframe-extension-worker" */ './tw-iframe-extension-worker')).default;
        } else {
            throw new Error(`Invalid sandbox mode: ${sandboxMode}`);
        }
        /* eslint-enable max-len */
        return new Promise((resolve, reject) => {
            this.pendingExtensions.push({extensionURL, resolve, reject});
            dispatch.addWorker(new ExtensionWorker());
        }).catch(error => this._failedLoadingExtensionScript(error));
    }
    /**
     * Wait until all async extensions have loaded
     * @returns {Promise} resolved when all async extensions have loaded
     */
    allAsyncExtensionsLoaded () {
        if (this.loadingAsyncExtensions === 0) {
            return;
        }
        return new Promise((resolve, reject) => {
            this.asyncExtensionsLoadedCallbacks.push({
                resolve,
                reject
            });
        });
    }
    /**
     * Regenerate blockinfo for any loaded extensions
     * @returns {Promise} resolved once all the extensions have been reinitialized
     */
    refreshBlocks () {
        const allPromises = Array.from(this._loadedExtensions.values()).map(serviceName => dispatch.call(serviceName, 'getInfo')
            .then(info => {
                info = this._prepareExtensionInfo(serviceName, info);
                dispatch.call('runtime', '_refreshExtensionPrimitives', info);
            })
            .catch(e => {
                log.error(`Failed to refresh built-in extension primitives: ${JSON.stringify(e)}`);
            }));
        return Promise.all(allPromises);
    }
    allocateWorker () {
        const id = this.nextExtensionWorker++;
        const workerInfo = this.pendingExtensions.shift();
        this.pendingWorkers[id] = workerInfo;
        this.workerURLs[id] = workerInfo.extensionURL;
        return [id, workerInfo.extensionURL];
    }
    /**
     * Synchronously collect extension metadata from the specified service and begin the extension registration process.
     * @param {string} serviceName - the name of the service hosting the extension.
     */
    registerExtensionServiceSync (serviceName: any) {
        const info = dispatch.callSync(serviceName, 'getInfo');
        this._registerExtensionInfo(serviceName, info);
    }
    /**
     * Collect extension metadata from the specified service and begin the extension registration process.
     * @param {string} serviceName - the name of the service hosting the extension.
     */
    registerExtensionService (serviceName: any) {
        dispatch.call(serviceName, 'getInfo').then(info => {
            // @ts-expect-error
            this._loadedExtensions.set(info.id, serviceName);
            this._registerExtensionInfo(serviceName, info);
            this._finishedLoadingExtensionScript();
        });
    }
    _finishedLoadingExtensionScript () {
        this.loadingAsyncExtensions--;
        if (this.loadingAsyncExtensions === 0) {
            this.asyncExtensionsLoadedCallbacks.forEach((i: any) => i.resolve());
            this.asyncExtensionsLoadedCallbacks = [];
        }
    }
    _failedLoadingExtensionScript (error: any) {
        // Don't set the current extension counter to 0, otherwise it will go negative if another
        // extension finishes or fails to load.
        this.loadingAsyncExtensions--;
        this.asyncExtensionsLoadedCallbacks.forEach((i: any) => i.reject(error));
        this.asyncExtensionsLoadedCallbacks = [];
        // Re-throw error so the promise still rejects.
        throw error;
    }
    /**
     * Called by an extension worker to indicate that the worker has finished initialization.
     * @param {int} id - the worker ID.
     * @param {*?} e - the error encountered during initialization, if any.
     */
    onWorkerInit (id: any, e: any) {
        const workerInfo = this.pendingWorkers[id];
        delete this.pendingWorkers[id];
        if (e) {
            workerInfo.reject(e);
        } else {
            workerInfo.resolve();
        }
    }
    /**
     * Register an internal (non-Worker) extension object
     * @param {object} extensionObject - the extension object to register
     * @returns {string} The name of the registered extension service
     */
    _registerInternalExtension (extensionObject: any) {
        const extensionInfo = extensionObject.getInfo();
        const fakeWorkerId = this.nextExtensionWorker++;
        const serviceName = `extension_${fakeWorkerId}_${extensionInfo.id}`;
        dispatch.setServiceSync(serviceName, extensionObject);
        dispatch.callSync('extensions', 'registerExtensionServiceSync', serviceName);
        return serviceName;
    }
    /**
     * Sanitize extension info then register its primitives with the VM.
     * @param {string} serviceName - the name of the service hosting the extension
     * @param {ExtensionInfo} extensionInfo - the extension's metadata
     * @private
     */
    _registerExtensionInfo (serviceName: any, extensionInfo: any) {
        extensionInfo = this._prepareExtensionInfo(serviceName, extensionInfo);
        dispatch.call('runtime', '_registerExtensionPrimitives', extensionInfo).catch(e => {
            log.error(`Failed to register primitives for extension on service ${serviceName}:`, e);
        });
    }
    /**
     * Modify the provided text as necessary to ensure that it may be used as an attribute value in valid XML.
     * @param {string} text - the text to be sanitized
     * @returns {string} - the sanitized text
     * @private
     */
    _sanitizeID (text: any) {
        return text.toString().replace(/[<"&]/, '_');
    }
    /**
     * Apply minor cleanup and defaults for optional extension fields.
     * TODO: make the ID unique in cases where two copies of the same extension are loaded.
     * @param {string} serviceName - the name of the service hosting this extension block
     * @param {ExtensionInfo} extensionInfo - the extension info to be sanitized
     * @returns {ExtensionInfo} - a new extension info object with cleaned-up values
     * @private
     */
    _prepareExtensionInfo (serviceName: any, extensionInfo: any) {
        extensionInfo = Object.assign({}, extensionInfo);
        if (!/^[a-z0-9]+$/i.test(extensionInfo.id)) {
            throw new Error('Invalid extension id');
        }
        extensionInfo.name = extensionInfo.name || extensionInfo.id;
        extensionInfo.blocks = extensionInfo.blocks || [];
        extensionInfo.targetTypes = extensionInfo.targetTypes || [];
        extensionInfo.blocks = extensionInfo.blocks.reduce((results: any, blockInfo: any) => {
            try {
                let result;
                switch (blockInfo) {
                case '---': // separator
                    result = '---';
                    break;
                default: // an ExtensionBlockMetadata object
                    result = this._prepareBlockInfo(serviceName, blockInfo);
                    break;
                }
                results.push(result);
            } catch (e) {
                // TODO: more meaningful error reporting
                // @ts-expect-error TS(2571): Object is of type 'unknown'.
                log.error(`Error processing block: ${e.message}, Block:\n${JSON.stringify(blockInfo)}`);
            }
            return results;
        }, []);
        extensionInfo.menus = extensionInfo.menus || {};
        extensionInfo.menus = this._prepareMenuInfo(serviceName, extensionInfo.menus);
        return extensionInfo;
    }
    /**
     * Prepare extension menus. e.g. setup binding for dynamic menu functions.
     * @param {string} serviceName - the name of the service hosting this extension block
     * @param {Array.<MenuInfo>} menus - the menu defined by the extension.
     * @returns {Array.<MenuInfo>} - a menuInfo object with all preprocessing done.
     * @private
     */
    _prepareMenuInfo (serviceName: any, menus: any) {
        const menuNames = Object.getOwnPropertyNames(menus);
        for (let i = 0; i < menuNames.length; i++) {
            const menuName = menuNames[i];
            let menuInfo = menus[menuName];
            // If the menu description is in short form (items only) then normalize it to general form: an object with
            // its items listed in an `items` property.
            if (!menuInfo.items) {
                menuInfo = {
                    items: menuInfo
                };
                menus[menuName] = menuInfo;
            }
            // If `items` is a string, it should be the name of a function in the extension object. Calling the
            // function should return an array of items to populate the menu when it is opened.
            if (typeof menuInfo.items === 'string') {
                const menuItemFunctionName = menuInfo.items;
                const serviceObject = dispatch.services[serviceName];
                // Bind the function here so we can pass a simple item generation function to Scratch Blocks later.
                menuInfo.items = this._getExtensionMenuItems.bind(this, serviceObject, menuItemFunctionName);
            }
        }
        return menus;
    }
    /**
     * Fetch the items for a particular extension menu, providing the target ID for context.
     * @param {object} extensionObject - the extension object providing the menu.
     * @param {string} menuItemFunctionName - the name of the menu function to call.
     * @returns {Array} menu items ready for scratch-blocks.
     * @private
     */
    _getExtensionMenuItems (extensionObject: any, menuItemFunctionName: any) {
        // Fetch the items appropriate for the target currently being edited. This assumes that menus only
        // collect items when opened by the user while editing a particular target.
        const editingTarget = this.runtime.getEditingTarget() || this.runtime.getTargetForStage();
        const editingTargetID = editingTarget ? editingTarget.id : null;
        const extensionMessageContext = this.runtime.makeMessageContextForTarget(editingTarget);
        // TODO: Fix this to use dispatch.call when extensions are running in workers.
        const menuFunc = extensionObject[menuItemFunctionName];
        const menuItems = menuFunc.call(extensionObject, editingTargetID).map((item: any) => {
            // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
            item = maybeFormatMessage(item, extensionMessageContext);
            switch (typeof item) {
            case 'object':
                return [
                    // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
                    maybeFormatMessage(item.text, extensionMessageContext),
                    item.value
                ];
            case 'string':
                return [item, item];
            default:
                return item;
            }
        });
        if (!menuItems || menuItems.length < 1) {
            throw new Error(`Extension menu returned no items: ${menuItemFunctionName}`);
        }
        return menuItems;
    }
    /**
     * Apply defaults for optional block fields.
     * @param {string} serviceName - the name of the service hosting this extension block
     * @param {ExtensionBlockMetadata} blockInfo - the block info from the extension
     * @returns {ExtensionBlockMetadata} - a new block info object which has values for all relevant optional fields.
     * @private
     */
    _prepareBlockInfo (serviceName: any, blockInfo: any) {
        blockInfo = Object.assign({}, {
            blockType: BlockType.COMMAND,
            terminal: false,
            blockAllThreads: false,
            arguments: {}
        }, blockInfo);
        blockInfo.opcode = blockInfo.opcode && this._sanitizeID(blockInfo.opcode);
        blockInfo.text = blockInfo.text || blockInfo.opcode;
        switch (blockInfo.blockType) {
        case BlockType.EVENT:
            if (blockInfo.func) {
                log.warn(`Ignoring function "${blockInfo.func}" for event block ${blockInfo.opcode}`);
            }
            break;
        case BlockType.BUTTON:
            if (blockInfo.opcode) {
                log.warn(`Ignoring opcode "${blockInfo.opcode}" for button with text: ${blockInfo.text}`);
            }
            break;
        default: {
            if (!blockInfo.opcode) {
                throw new Error('Missing opcode for block');
            }
            const funcName = blockInfo.func ? this._sanitizeID(blockInfo.func) : blockInfo.opcode;
            const getBlockInfo = blockInfo.isDynamic ?
                (args: any) => args && args.mutation && args.mutation.blockInfo :
                () => blockInfo;
            const callBlockFunc = (() => {
                if (dispatch._isRemoteService(serviceName)) {
                    return (args: any, util: any, realBlockInfo: any) => dispatch.call(serviceName, funcName, args, util, realBlockInfo)
                        .then(result => {
                            // Scratch is only designed to handle these types.
                            // If any other value comes in such as undefined, null, an object, etc.
                            // we'll convert it to a string to avoid undefined behavior.
                            if (typeof result === 'number' ||
                                typeof result === 'string' ||
                                typeof result === 'boolean') {
                                return result;
                            }
                            return `${result}`;
                        })
                    // When an error happens, instead of returning undefined, we'll return a stringified
                    // version of the error so that it can be debugged.
                        .catch(err => {
                            // We want the full error including stack to be printed but the log helper
                            // messes with that.
                            // eslint-disable-next-line no-console
                            console.error('Custom extension block error', err);
                            return `${err}`;
                        });
                }
                // avoid promise latency if we can call direct
                const serviceObject = dispatch.services[serviceName];
                if (!serviceObject[funcName]) {
                    // The function might show up later as a dynamic property of the service object
                    log.warn(`Could not find extension block function called ${funcName}`);
                }
                return (args: any, util: any, realBlockInfo: any) => serviceObject[funcName](args, util, realBlockInfo);
            })();
            blockInfo.func = (args: any, util: any) => {
                const realBlockInfo = getBlockInfo(args);
                // TODO: filter args using the keys of realBlockInfo.arguments? maybe only if sandboxed?
                return callBlockFunc(args, util, realBlockInfo);
            };
            break;
        }
        }
        return blockInfo;
    }
    getExtensionURLs () {
        const extensionURLs = {};
        for (const [extensionId, serviceName] of this._loadedExtensions.entries()) {
            if (builtinExtensions.hasOwnProperty(extensionId)) {
                continue;
            }
            // Service names for extension workers are in the format "extension.WORKER_ID.EXTENSION_ID"
            const workerId = +serviceName.split('.')[1];
            const extensionURL = this.workerURLs[workerId];
            if (typeof extensionURL === 'string') {
                // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                extensionURLs[extensionId] = extensionURL;
            }
        }
        return extensionURLs;
    }
    isExtensionURLLoaded (url: any) {
        return Object.values(this.workerURLs).includes(url);
    }
}
export default ExtensionManager;
