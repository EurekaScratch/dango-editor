/**
 * @fileoverview
 * Many ScratchX extensions require jQuery to do things like loading scripts and making requests.
 * The real jQuery is pretty large and we'd rather not bring in everything, so this file reimplements
 * small stubs of a few jQuery methods.
 * It's just supposed to be enough to make existing ScratchX extensions work, nothing more.
 */

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'log'.
const log = require('../util/log');

const jQuery = () => {
    throw new Error('Not implemented');
};

jQuery.getScript = (src: any, callback: any) => {
    const script = document.createElement('script');
    script.src = src;
    if (callback) {
        // We don't implement callback arguments.
        script.onload = () => callback();
    }
    document.body.appendChild(script);
};

/**
 * @param {Record<string, any>|undefined} obj
 * @returns {URLSearchParams}
 */
const objectToQueryString = (obj: any) => {
    const params = new URLSearchParams();
    if (obj) {
        for (const key of Object.keys(obj)) {
            params.set(key, obj[key]);
        }
    }
    return params;
};

let jsonpCallback = 0;

jQuery.ajax = async (arg1: any, arg2: any) => {
    let options = {};

    if (arg1 && arg2) {
        options = arg2;
        // @ts-expect-error TS(2339): Property 'url' does not exist on type '{}'.
        options.url = arg1;
    } else if (arg1) {
        options = arg1;
    }

    // @ts-expect-error TS(2339): Property 'data' does not exist on type '{}'.
    const urlParameters = objectToQueryString(options.data);
    const getFinalURL = () => {
        const query = urlParameters.toString();
        // @ts-expect-error TS(2339): Property 'url' does not exist on type '{}'.
        let url = options.url;
        if (query) {
            url += `?${query}`;
        }
        // Forcibly upgrade all HTTP requests to HTTPS so that they don't error on HTTPS sites
        // All the extensions we care about work fine with this
        if (url.startsWith('http://')) {
            url = url.replace('http://', 'https://');
        }
        return url;
    };

    const successCallback = (result: any) => {
        // @ts-expect-error TS(2339): Property 'success' does not exist on type '{}'.
        if (options.success) {
            // @ts-expect-error TS(2339): Property 'success' does not exist on type '{}'.
            options.success(result);
        }
    };
    const errorCallback = (error: any) => {
        log.error(error);
        // @ts-expect-error TS(2339): Property 'error' does not exist on type '{}'.
        if (options.error) {
            // The error object we provide here might not match what jQuery provides but it's enough to
            // prevent extensions from throwing errors trying to access properties.
            // @ts-expect-error TS(2339): Property 'error' does not exist on type '{}'.
            options.error(error);
        }
    };

    try {
        // @ts-expect-error TS(2339): Property 'dataType' does not exist on type '{}'.
        if (options.dataType === 'jsonp') {
            const callbackName = `_jsonp_callback${jsonpCallback++}`;
            // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            global[callbackName] = (data: any) => {
                // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                delete global[callbackName];
                successCallback(data);
            };

            // @ts-expect-error TS(2339): Property 'jsonp' does not exist on type '{}'.
            const callbackParameterName = options.jsonp || 'callback';
            urlParameters.set(callbackParameterName, callbackName);

            jQuery.getScript(getFinalURL());
            return;
        }

        // @ts-expect-error TS(2339): Property 'dataType' does not exist on type '{}'.
        if (options.dataType === 'script') {
            jQuery.getScript(getFinalURL(), successCallback);
            return;
        }

        const res = await fetch(getFinalURL(), {
            // @ts-expect-error TS(2339): Property 'headers' does not exist on type '{}'.
            headers: options.headers
        });
        // dataType defaults to "Intelligent Guess (xml, json, script, or html)"
        // It happens that all the ScratchX extensions we care about either set dataType to "json" or
        // leave it blank and implicitly request JSON, so this works good enough for now.
        successCallback(await res.json());
    } catch (e) {
        errorCallback(e);
    }
};

module.exports = jQuery;
