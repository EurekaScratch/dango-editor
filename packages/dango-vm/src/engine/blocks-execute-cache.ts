/**
 * A private method shared with execute to build an object containing the block
 * information execute needs and that is reset when other cached Blocks info is
 * reset.
 * @param {Blocks} blocks Blocks containing the expected blockId
 * @param {string} blockId blockId for the desired execute cache
 * @param {function} CacheType constructor for cached block information
 * @return {object} execute cache object
 */
export const getCached = function (blocks: any, blockId: any, CacheType: any) {
    let cached = blocks._cache._executeCached[blockId];
    if (typeof cached !== 'undefined') {
        return cached;
    }
    const block = blocks.getBlock(blockId);
    if (typeof block === 'undefined') {
        return null;
    }
    if (typeof CacheType === 'undefined') {
        cached = {
            id: blockId,
            opcode: blocks.getOpcode(block),
            fields: blocks.getFields(block),
            inputs: blocks.getInputs(block),
            mutation: blocks.getMutation(block)
        };
    } else {
        cached = new CacheType(blocks, {
            id: blockId,
            opcode: blocks.getOpcode(block),
            fields: blocks.getFields(block),
            inputs: blocks.getInputs(block),
            mutation: blocks.getMutation(block)
        });
    }
    blocks._cache._executeCached[blockId] = cached;
    return cached;
};
