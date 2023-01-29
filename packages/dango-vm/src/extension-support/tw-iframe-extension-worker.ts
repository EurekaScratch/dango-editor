import uid from '../util/uid';
// @ts-expect-error TS(2307): Cannot find module './tw-load-script-as-plain-text... Remove this comment to see the full error message
import frameSource from './tw-load-script-as-plain-text!./tw-iframe-extension-worker-entry';
const none = "'none'";
const featurePolicy = {
    'accelerometer': none,
    'ambient-light-sensor': none,
    'battery': none,
    'camera': none,
    'display-capture': none,
    'document-domain': none,
    'encrypted-media': none,
    'fullscreen': none,
    'geolocation': none,
    'gyroscope': none,
    'magnetometer': none,
    'microphone': none,
    'midi': none,
    'payment': none,
    'picture-in-picture': none,
    'publickey-credentials-get': none,
    'speaker-selection': none,
    'usb': none,
    'vibrate': none,
    'vr': none,
    'screen-wake-lock': none,
    'web-share': none,
    'interest-cohort': none
};
const generateAllow = () => Object.entries(featurePolicy)
    .map(([name, permission]) => `${name} ${permission}`)
    .join('; ');
class IframeExtensionWorker {
    id: any;
    iframe: any;
    isRemote: any;
    queuedMessages: any;
    ready: any;
    constructor () {
        this.id = uid();
        this.isRemote = true;
        this.ready = false;
        this.queuedMessages = [];
        this.iframe = document.createElement('iframe');
        this.iframe.className = 'tw-custom-extension-frame';
        this.iframe.dataset.id = this.id;
        this.iframe.style.display = 'none';
        this.iframe.setAttribute('aria-hidden', 'true');
        this.iframe.sandbox = 'allow-scripts';
        this.iframe.allow = generateAllow();
        document.body.appendChild(this.iframe);
        window.addEventListener('message', this._onWindowMessage.bind(this));
        const blob = new Blob([
            // eslint-disable-next-line max-len
            `<!DOCTYPE html><body><script>window.__WRAPPED_IFRAME_ID__=${JSON.stringify(this.id)};${frameSource}</script></body>`
        ], {
            type: 'text/html; charset=utf-8'
        });
        this.iframe.src = URL.createObjectURL(blob);
    }
    _onWindowMessage (e: any) {
        if (!e.data || e.data.vmIframeId !== this.id) {
            return;
        }
        if (e.data.ready) {
            this.ready = true;
            for (const {data, transfer} of this.queuedMessages) {
                this.postMessage(data, transfer);
            }
            this.queuedMessages.length = 0;
        }
        if (e.data.message) {
            // @ts-expect-error TS(2554): Expected 0 arguments, but got 1.
            this.onmessage({
                data: e.data.message
            });
        }
    }
    onmessage () {
        // Should be overridden
    }
    postMessage (data: any, transfer: any) {
        if (this.ready) {
            if (transfer) {
                this.iframe.contentWindow.postMessage(data, '*', transfer);
            } else {
                this.iframe.contentWindow.postMessage(data, '*');
            }
        } else {
            this.queuedMessages.push({data, transfer});
        }
    }
}
export default IframeExtensionWorker;
