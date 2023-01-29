// @ts-expect-error TS(7016): Could not find a declaration file for module 'html... Remove this comment to see the full error message
import html from 'htmlparser2';
// @ts-expect-error TS(7016): Could not find a declaration file for module 'deco... Remove this comment to see the full error message
import decodeHtml from 'decode-html';
/**
 * Convert a part of a mutation DOM to a mutation VM object, recursively.
 * @param {object} dom DOM object for mutation tag.
 * @return {object} Object representing useful parts of this mutation.
 */
const mutatorTagToObject = function (dom: any) {
    const obj = Object.create(null);
    obj.tagName = dom.name;
    obj.children = [];
    for (const prop in dom.attribs) {
        if (prop === 'xmlns') {
            continue;
        }
        obj[prop] = decodeHtml(dom.attribs[prop]);
        // Note: the capitalization of block info in the following lines is important.
        // The lowercase is read in from xml which normalizes case. The VM uses camel case everywhere else.
        if (prop === 'blockinfo') {
            obj.blockInfo = JSON.parse(obj.blockinfo);
            delete obj.blockinfo;
        }
    }
    for (let i = 0; i < dom.children.length; i++) {
        obj.children.push(mutatorTagToObject(dom.children[i]));
    }
    return obj;
};
/**
 * Adapter between mutator XML or DOM and block representation which can be
 * used by the Scratch runtime.
 * @param {(object|string)} mutation Mutation XML string or DOM.
 * @return {object} Object representing the mutation.
 */
const mutationAdpater = function (mutation: any) {
    let mutationParsed;
    // Check if the mutation is already parsed; if not, parse it.
    if (typeof mutation === 'object') {
        mutationParsed = mutation;
    } else {
        mutationParsed = html.parseDOM(mutation)[0];
    }
    return mutatorTagToObject(mutationParsed);
};
export default mutationAdpater;
