const SOUP = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#%()*+,-./:;=?@[]^_`{|}~';
const generateId = (i: any) => {
    let str = '';
    while (i >= 0) {
        str = SOUP[i % SOUP.length] + str;
        i = Math.floor(i / SOUP.length) - 1;
    }
    return str;
};
class Pool {
    generatedIds: any;
    references: any;
    skippedIds: any;
    constructor () {
        this.generatedIds = new Map();
        this.references = new Map();
        this.skippedIds = new Set();
        // IDs in Object.keys(vm.runtime.monitorBlocks._blocks) already have meaning, so make sure to skip those
        // We don't bother listing many here because most would take more than ten million items to be used
        this.skippedIds.add('of');
    }
    skip (id: any) {
        this.skippedIds.add(id);
    }
    addReference (id: any) {
        const currentCount = this.references.get(id) || 0;
        this.references.set(id, currentCount + 1);
    }
    generateNewIds () {
        const entries = Array.from(this.references.entries());
        // The most used original IDs should get the shortest new IDs.
        // @ts-expect-error TS(2571): Object is of type 'unknown'.
        entries.sort((a, b) => b[1] - a[1]);
        let i = 0;
        let newId;
        for (const entry of entries) {
            // @ts-expect-error TS(2571): Object is of type 'unknown'.
            const oldId = entry[0];
            while (true) {
                newId = generateId(i);
                if (this.skippedIds.has(newId)) {
                    i++;
                } else {
                    break;
                }
            }
            this.generatedIds.set(oldId, newId);
            i++;
        }
    }
    getNewId (originalId: any) {
        if (this.generatedIds.has(originalId)) {
            return this.generatedIds.get(originalId);
        }
        return originalId;
    }
}
const compress = (projectData: any) => {
    // projectData is modified in-place
    // The optimization here is not optimal. This is intentional.
    // We only compress block and comment IDs because we want to maintain 100% (not 99.99%; 100%) compatibility and be
    // truly lossless. Optimizing things like variable IDs will cause things such as the editor's backpack feature
    // to misbehave.
    // We use the same variable pool for all objects to avoid any possible issues if IDs are ever treated as unique
    // within a given project.
    const pool = new Pool();
    for (const target of projectData.targets) {
        // While we don't compress these IDs, we need to make sure that our compressed IDs
        // do not intersect, which could happen if the project was compressed with a
        // different tool.
        for (const variableId of Object.keys(target.variables)) {
            pool.skip(variableId);
        }
        for (const listId of Object.keys(target.lists)) {
            pool.skip(listId);
        }
        for (const broadcastId of Object.keys(target.broadcasts)) {
            pool.skip(broadcastId);
        }
        for (const blockId of Object.keys(target.blocks)) {
            const block = target.blocks[blockId];
            pool.addReference(blockId);
            if (Array.isArray(block)) {
                // Compressed native
                continue;
            }
            if (block.parent) {
                pool.addReference(block.parent);
            }
            if (block.next) {
                pool.addReference(block.next);
            }
            if (block.comment) {
                pool.addReference(block.comment);
            }
            for (const input of Object.values(block.inputs)) {
                // @ts-expect-error TS(2571): Object is of type 'unknown'.
                for (let i = 1; i < input.length; i++) {
                    // @ts-expect-error TS(2571): Object is of type 'unknown'.
                    const inputValue = input[i];
                    if (typeof inputValue === 'string') {
                        pool.addReference(inputValue);
                    }
                }
            }
        }
        for (const commentId of Object.keys(target.comments)) {
            const comment = target.comments[commentId];
            pool.addReference(commentId);
            if (comment.blockId) {
                pool.addReference(comment.blockId);
            }
        }
    }
    pool.generateNewIds();
    for (const target of projectData.targets) {
        const newBlocks = {};
        const newComments = {};
        for (const blockId of Object.keys(target.blocks)) {
            const block = target.blocks[blockId];
            // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            newBlocks[pool.getNewId(blockId)] = block;
            if (Array.isArray(block)) {
                // Compressed native
                continue;
            }
            if (block.parent) {
                block.parent = pool.getNewId(block.parent);
            }
            if (block.next) {
                block.next = pool.getNewId(block.next);
            }
            if (block.comment) {
                block.comment = pool.getNewId(block.comment);
            }
            for (const input of Object.values(block.inputs)) {
                // @ts-expect-error TS(2571): Object is of type 'unknown'.
                for (let i = 1; i < input.length; i++) {
                    // @ts-expect-error TS(2571): Object is of type 'unknown'.
                    const inputValue = input[i];
                    if (typeof inputValue === 'string') {
                        // @ts-expect-error TS(2571): Object is of type 'unknown'.
                        input[i] = pool.getNewId(inputValue);
                    }
                }
            }
        }
        for (const commentId of Object.keys(target.comments)) {
            const comment = target.comments[commentId];
            // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            newComments[pool.getNewId(commentId)] = comment;
            if (comment.blockId) {
                comment.blockId = pool.getNewId(comment.blockId);
            }
        }
        target.blocks = newBlocks;
        target.comments = newComments;
    }
};
export default compress;
