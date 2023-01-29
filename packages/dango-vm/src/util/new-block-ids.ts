import uid from './uid';
export default (blocks: any) => {
    const oldToNew = {};
    // First update all top-level IDs and create old-to-new mapping
    for (let i = 0; i < blocks.length; i++) {
        const newId = uid();
        const oldId = blocks[i].id;
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        blocks[i].id = oldToNew[oldId] = newId;
    }
    // Then go back through and update inputs (block/shadow)
    // and next/parent properties
    for (let i = 0; i < blocks.length; i++) {
        for (const key in blocks[i].inputs) {
            const input = blocks[i].inputs[key];
            // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            input.block = oldToNew[input.block];
            // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            input.shadow = oldToNew[input.shadow];
        }
        if (blocks[i].parent) {
            // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            blocks[i].parent = oldToNew[blocks[i].parent];
        }
        if (blocks[i].next) {
            // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            blocks[i].next = oldToNew[blocks[i].next];
        }
    }
};
