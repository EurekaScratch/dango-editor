/* eslint-env worker */

import ScratchCommon from './tw-extension-api-common';
import dispatch from '../dispatch/worker-dispatch';
import log from '../util/log';
import {isWorker} from './tw-extension-worker-context';

const loadScripts = (url: any) => {
    if (isWorker) {
        importScripts(url);
    } else {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            // @ts-expect-error TS(2794): Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
            script.onload = () => resolve();
            script.onerror = () => {
                reject(new Error(`Error in sandboxed script: ${url}. Check the console for more information.`));
            };
            script.src = url;
            document.body.appendChild(script);
        });
    }
};

class ExtensionWorker {
    extensions: any;
    firstRegistrationCallback: any;
    firstRegistrationPromise: any;
    initialRegistrations: any;
    nextExtensionId: any;
    workerId: any;
    constructor () {
        this.nextExtensionId = 0;

        this.initialRegistrations = [];

        this.firstRegistrationPromise = new Promise(resolve => {
            this.firstRegistrationCallback = resolve;
        });

        dispatch.waitForConnection.then(() => {
            dispatch.call('extensions', 'allocateWorker').then(async (x: any) => {
                const [id, extension] = x;
                this.workerId = id;

                try {
                    await loadScripts(extension);
                    await this.firstRegistrationPromise;

                    const initialRegistrations = this.initialRegistrations;
                    this.initialRegistrations = null;

                    Promise.all(initialRegistrations).then(() => dispatch.call('extensions', 'onWorkerInit', id));
                } catch (e) {
                    log.error(e);
                    dispatch.call('extensions', 'onWorkerInit', id, `${e}`);
                }
            });
        });

        this.extensions = [];
    }

    register (extensionObject: any) {
        const extensionId = this.nextExtensionId++;
        this.extensions.push(extensionObject);
        const serviceName = `extension.${this.workerId}.${extensionId}`;
        const promise = dispatch.setService(serviceName, extensionObject)
            .then(() => dispatch.call('extensions', 'registerExtensionService', serviceName));
        if (this.initialRegistrations) {
            this.firstRegistrationCallback();
            this.initialRegistrations.push(promise);
        }
        return promise;
    }
}

// @ts-expect-error TS(2339): Property 'Scratch' does not exist on type 'typeof ... Remove this comment to see the full error message
global.Scratch = global.Scratch || {};
// @ts-expect-error TS(2339): Property 'Scratch' does not exist on type 'typeof ... Remove this comment to see the full error message
Object.assign(global.Scratch, ScratchCommon);

/**
 * Expose only specific parts of the worker to extensions.
 */
const extensionWorker = new ExtensionWorker();
// @ts-expect-error TS(2339): Property 'Scratch' does not exist on type 'typeof ... Remove this comment to see the full error message
global.Scratch.extensions = {
    register: extensionWorker.register.bind(extensionWorker)
};

// @ts-expect-error TS(7017): Element implicitly has an 'any' type because type ... Remove this comment to see the full error message
global.ScratchExtensions = require('./tw-scratchx-compatibility-layer');
