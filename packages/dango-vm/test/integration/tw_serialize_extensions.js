const {test} = require('tap');
const VirtualMachine = require('../../src/virtual-machine');
const RenderedTarget = require('../../src/sprites/rendered-target');
const Sprite = require('../../src/sprites/sprite');

test('Serializes custom extensions', t => {
    const vm = new VirtualMachine();

    // Trick the extension manager into thinking a couple extensions are loaded.
    vm.extensionManager.workerURLs[0] = 'https://example.com/test1.js';
    vm.extensionManager.workerURLs[1] = 'https://example.com/test2.js';
    // First number in the service names corresponds to index in workerURLs
    vm.extensionManager._loadedExtensions.set('test1', 'test.0.0');
    vm.extensionManager._loadedExtensions.set('test2', 'test.1.0');

    // Create a block that uses the first extension
    const sprite = new Sprite(null, vm.runtime);
    const target = new RenderedTarget(sprite, vm.runtime);
    target.blocks.createBlock({
        id: 'a',
        opcode: 'test1_something'
    });
    vm.runtime.addTarget(target);

    // test2 isn't used, so it shouldn't be included in the JSON
    const serialized = JSON.parse(vm.toJSON());
    t.same(serialized.extensions, ['test1']);
    t.same(serialized.extensionURLs, {
        test1: 'https://example.com/test1.js'
    });

    t.end();
});
