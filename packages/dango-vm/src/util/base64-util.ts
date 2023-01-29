// @ts-expect-error TS(7016): Could not find a declaration file for module 'atob... Remove this comment to see the full error message
import atob from 'atob';
// @ts-expect-error TS(7016): Could not find a declaration file for module 'btoa... Remove this comment to see the full error message
import btoa from 'btoa';
class Base64Util {
    /**
     * Convert a base64 encoded string to a Uint8Array.
     * @param {string} base64 - a base64 encoded string.
     * @return {Uint8Array} - a decoded Uint8Array.
     */
    static base64ToUint8Array (base64: string) {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const array = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            array[i] = binaryString.charCodeAt(i);
        }
        return array;
    }
    /**
     * Convert a Uint8Array to a base64 encoded string.
     * @param {Uint8Array} array - the array to convert.
     * @return {string} - the base64 encoded string.
     */
    static uint8ArrayToBase64 (array: Uint8Array) {
        let binary = '';
        const len = array.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(array[i]);
        }
        return btoa(binary);
    }
    /**
    * Convert an array buffer to a base64 encoded string.
    * @param {ArrayBufferLike} buffer - an array buffer to convert.
    * @return {string} - the base64 encoded string.
    */
    static arrayBufferToBase64 (buffer: ArrayBufferLike) {
        return Base64Util.uint8ArrayToBase64(new Uint8Array(buffer));
    }
}
export default Base64Util;
