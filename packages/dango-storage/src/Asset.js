// Use JS implemented TextDecoder and TextEncoder if it is not provided by the
// browser.
if (typeof TextDecoder === 'undefined' || typeof TextEncoder === 'undefined') {
    // Wait to require the text encoding polyfill until we know it's needed.
    // eslint-disable-next-line global-require
    require('fastestsmallesttextencoderdecoder');
}

const md5 = require('js-md5');

/**
 * The maximum length of a chunk before encoding it into base64.
 *
 * 32766 is a multiple of 3 so btoa does not need to use padding characters
 * except for the final chunk where that is fine. 32766 is also close to
 * 32768 so it is close to a size an memory allocator would prefer.
 * @const {number}
 */
const BTOA_CHUNK_MAX_LENGTH = 32766;

/**
 * An array cache of bytes to characters.
 * @const {?Array.<string>}
 */
let fromCharCode = null;

const memoizedStrings = {};

const memoizedToString = (assetId, data) => {
    if (!Object.prototype.hasOwnProperty.call(memoizedStrings, assetId)) {
        if (typeof btoa === 'undefined') {
            // Use a library that does not need btoa to run.
            /* eslint-disable-next-line global-require */
            const base64js = require('base64-js');
            memoizedStrings[assetId] = base64js.fromByteArray(data);
        } else {
            // Native btoa is faster than javascript translation. Use js to
            // create a "binary" string and btoa to encode it.
            if (fromCharCode === null) {
                // Cache the first 256 characters for input byte values.
                fromCharCode = new Array(256);
                for (let i = 0; i < 256; i++) {
                    fromCharCode[i] = String.fromCharCode(i);
                }
            }

            const {length} = data;
            let s = '';
            // Iterate over chunks of the binary data.
            for (let i = 0, e = 0; i < length; i = e) {
                // Create small chunks to cause more small allocations and
                // less large allocations.
                e = Math.min(e + BTOA_CHUNK_MAX_LENGTH, length);
                let s_ = '';
                for (let j = i; j < e; j += 1) {
                    s_ += fromCharCode[data[j]];
                }
                // Encode the latest chunk so the we create one big output
                // string instead of creating a big input string and then
                // one big output string.
                s += btoa(s_);
            }
            memoizedStrings[assetId] = s;
        }
    }
    return memoizedStrings[assetId];
};

const assetIdCounts = {};

/* globals FinalizationRegistry */
const finalizationRegistry = typeof FinalizationRegistry === 'function' ? new FinalizationRegistry(assetId => {
    const count = assetIdCounts[assetId];
    if (count === 1) {
        // This was the last reference
        delete assetIdCounts[assetId];
        delete memoizedStrings[assetId];
    } else {
        assetIdCounts[assetId] = count - 1;
    }
}) : null;

const addFinalizationReference = finalizationRegistry ? asset => {
    const assetId = asset.assetId;
    const count = assetIdCounts[assetId] || 0;
    assetIdCounts[assetId] = count + 1;
    finalizationRegistry.register(asset, assetId);
} : () => {};

class Asset {
    /**
     * Construct an Asset.
     * @param {AssetType} assetType - The type of this asset (sound, image, etc.)
     * @param {string} assetId - The ID of this asset.
     * @param {DataFormat} [dataFormat] - The format of the data (WAV, PNG, etc.); required iff `data` is present.
     * @param {Buffer} [data] - The in-memory data for this asset; optional.
     * @param {bool} [generateId] - Whether to create id from an md5 hash of data
     */
    constructor (assetType, assetId, dataFormat, data, generateId) {
        /** @type {AssetType} */
        this.assetType = assetType;

        /** @type {string} */
        this.assetId = assetId;

        this.setData(data, dataFormat || assetType.runtimeFormat, generateId);

        /** @type {Asset[]} */
        this.dependencies = [];

        addFinalizationReference(this);
    }

    setData (data, dataFormat, generateId) {
        if (data && !dataFormat) {
            throw new Error('Data provided without specifying its format');
        }

        /** @type {DataFormat} */
        this.dataFormat = dataFormat;

        /** @type {Buffer} */
        this.data = data;

        if (generateId) this.assetId = md5(data);

        // Mark as clean only if set is being called without generateId
        // If a new id is being generated, mark this asset as not clean
        this.clean = !generateId;
    }

    /**
     * @returns {string} - This asset's data, decoded as text.
     */
    decodeText () {
        const decoder = new TextDecoder();
        return decoder.decode(this.data);
    }

    /**
     * Same as `setData` but encodes text first.
     * @param {string} data - the text data to encode and store.
     * @param {DataFormat} dataFormat - the format of the data (DataFormat.SVG for example).
     * @param {bool} generateId - after setting data, set the id to an md5 of the data?
     */
    encodeTextData (data, dataFormat, generateId) {
        const encoder = new TextEncoder();
        this.setData(encoder.encode(data), dataFormat, generateId);
    }

    /**
     * @param {string} [contentType] - Optionally override the content type to be included in the data URI.
     * @returns {string} - A data URI representing the asset's data.
     */
    encodeDataURI (contentType) {
        contentType = contentType || this.assetType.contentType;
        return `data:${contentType};base64,${memoizedToString(this.assetId, this.data)}`;
    }
}

module.exports = Asset;
