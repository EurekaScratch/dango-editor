const context = require('./tw-extension-worker-context');

const jQuery = require('./tw-jquery-shim');
// @ts-expect-error TS(7017): Element implicitly has an 'any' type because type ... Remove this comment to see the full error message
global.$ = jQuery;
// @ts-expect-error TS(2339): Property 'jQuery' does not exist on type 'typeof g... Remove this comment to see the full error message
global.jQuery = jQuery;

// @ts-expect-error TS(2339): Property '__WRAPPED_IFRAME_ID__' does not exist on... Remove this comment to see the full error message
const id = window.__WRAPPED_IFRAME_ID__;

context.isWorker = false;
context.centralDispatchService = {
    postMessage (message: any, transfer: any) {
        const data = {
            vmIframeId: id,
            message
        };
        if (transfer) {
            window.parent.postMessage(data, '*', transfer);
        } else {
            window.parent.postMessage(data, '*');
        }
    }
};

require('./extension-worker');

window.parent.postMessage({
    vmIframeId: id,
    ready: true
}, '*');
