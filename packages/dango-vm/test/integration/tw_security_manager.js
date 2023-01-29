const {test} = require('tap');
const fs = require('fs');
const path = require('path');
const VirtualMachine = require('../../src/virtual-machine');

const testProject = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'tw-project-with-extensions.sb3'));

// The test project contains two extensions: a fetch one and a bitwise one.
const FETCH_EXTENSION = 'https://extensions.turbowarp.org/fetch.js';
const BITWISE_EXTENSION = 'https://extensions.turbowarp.org/bitwise.js';

test('Deny both extensions', async t => {
    const vm = new VirtualMachine();
    vm.extensionManager.loadExtensionURL = () => {
        t.fail();
    };
    vm.securityManager.canLoadExtensionFromProject = () => false;
    try {
        await vm.loadProject(testProject);
        // loadProject() should fail because extensions were denied
        t.fail();
    } catch (e) {
        t.pass();
    }
    t.end();
});

test('Deny 1 of 2 extensions', async t => {
    const vm = new VirtualMachine();
    vm.extensionManager.loadExtensionURL = () => {
        t.fail();
    };
    vm.securityManager.canLoadExtensionFromProject = url => Promise.resolve(url === FETCH_EXTENSION);
    try {
        await vm.loadProject(testProject);
        // loadProject() should fail because extensions were denied
        t.fail();
    } catch (e) {
        t.pass();
    }
    t.end();
});

test('Allow both extensions', async t => {
    const vm = new VirtualMachine();
    const loadedExtensions = [];
    vm.extensionManager.loadExtensionURL = url => {
        loadedExtensions.push(url);
        return Promise.resolve();
    };
    vm.securityManager.canLoadExtensionFromProject = url => {
        if (url === FETCH_EXTENSION) {
            return true;
        }
        if (url === BITWISE_EXTENSION) {
            return Promise.resolve(true);
        }
        t.fail('unknown extension');
    };
    await vm.loadProject(testProject);
    t.same(new Set(loadedExtensions), new Set([FETCH_EXTENSION, BITWISE_EXTENSION]));
    t.end();
});
