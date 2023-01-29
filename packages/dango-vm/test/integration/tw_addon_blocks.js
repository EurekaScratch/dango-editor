const tap = require('tap');
const fs = require('fs');
const path = require('path');
const VirtualMachine = require('../../src/virtual-machine');

const fixtureData = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'tw-addon-blocks.sb3'));

const runExecutionTests = compilerEnabled => async test => {
    const load = async () => {
        const vm = new VirtualMachine();
        vm.setCompilerOptions({
            enabled: compilerEnabled
        });
        await vm.loadProject(fixtureData);
        vm.on('COMPILE_ERROR', (target, error) => test.fail(`Compile error ${target.getName()} ${error}`));
        return vm;
    };

    const getOutput = vm => vm.runtime.getTargetForStage().lookupVariableByNameAndType('output').value;

    await test.test('simple use', async t => {
        t.plan(7);

        const vm = await load();

        let calledBlock1 = false;
        let calledBlock2 = false;
    
        vm.addAddonBlock({
            procedureCode: 'block 2 %s',
            callback: (args, util) => {
                calledBlock1 = true;
                t.type(util.thread, 'object');
                // may have to update this ID when the project changes to match whatever the ID is for the
                // procedures_call block to block 2 %s
                t.equal(util.thread.peekStack(), 'c');
                t.same(args, {
                    'number or text': 'banana'
                });
            },
            arguments: ['number or text']
        });
    
        vm.addAddonBlock({
            procedureCode: 'block 3',
            // eslint-disable-next-line no-unused-vars
            callback: (args, util) => {
                calledBlock2 = true;
                t.same(args, {});
            },
            arguments: []
        });
    
        vm.greenFlag();
        vm.runtime._step();

        t.equal(getOutput(vm), 'block 1 value');
        t.ok(calledBlock1);
        t.ok(calledBlock2);
        t.end();
    });

    await test.test('yield by thread.status = STATUS_PROMISE_WAIT', async t => {
        const vm = await load();

        let threadToResume;

        vm.addAddonBlock({
            procedureCode: 'block 1',
            callback: (args, util) => {
                util.thread.status = 1; // STATUS_PROMISE_WAIT
                threadToResume = util.thread;
            },
            arguments: []
        });

        vm.greenFlag();
        vm.runtime._step();
        if (!threadToResume) {
            t.fail('did not run addon block');
        }

        t.equal(getOutput(vm), 'initial value');
        threadToResume.status = 0; // STATUS_RUNNING
        vm.runtime._step();
        t.equal(getOutput(vm), 'block 3 value');

        t.end();
    });

    await test.test('yield by block utility methods', async t => {
        const vm = await load();

        let shouldYield = true;

        vm.addAddonBlock({
            procedureCode: 'block 1',
            callback: (args, util) => {
                if (shouldYield) {
                    util.runtime.requestRedraw();
                    util.yield();
                }
            },
            arguments: []
        });

        vm.greenFlag();
        for (let i = 0; i < 10; i++) {
            vm.runtime._step();
        }
        t.equal(getOutput(vm), 'initial value');

        shouldYield = false;
        vm.runtime._step();
        t.equal(getOutput(vm), 'block 3 value');

        t.end();
    });

    await test.test('yield by returning Promise', async t => {
        const vm = await load();

        let resolveCallback;
        vm.addAddonBlock({
            procedureCode: 'block 1',
            callback: () => new Promise(resolve => {
                resolveCallback = resolve;
            }),
            arguments: []
        });

        vm.greenFlag();
        vm.runtime._step();
        t.equal(getOutput(vm), 'initial value');

        resolveCallback();
        // Allow the promise callback to run
        await Promise.resolve();

        vm.runtime._step();
        t.equal(getOutput(vm), 'block 3 value');

        t.end();
    });

    test.end();
};

tap.test('with compiler disabled', runExecutionTests(false));
tap.test('with compiler enabled', runExecutionTests(true));

tap.test('block info', t => {
    const vm = new VirtualMachine();

    const BLOCK_INFO_ID = 'a-b';

    vm.addAddonBlock({
        procedureCode: 'hidden %s',
        arguments: ['number or text'],
        callback: () => {},
        hidden: true
    });

    let blockInfo = vm.runtime._blockInfo.find(i => i.id === BLOCK_INFO_ID);
    t.equal(blockInfo, undefined);

    vm.addAddonBlock({
        procedureCode: 'something %s',
        arguments: ['number or text'],
        callback: () => {}
    });

    blockInfo = vm.runtime._blockInfo.find(i => i.id === BLOCK_INFO_ID);
    t.type(blockInfo.id, 'string');
    t.type(blockInfo.name, 'string');
    t.type(blockInfo.color1, 'string');
    t.type(blockInfo.color2, 'string');
    t.type(blockInfo.color3, 'string');
    t.same(blockInfo.blocks, [
        {
            info: {},
            // eslint-disable-next-line max-len
            xml: '<block type="procedures_call" gap="16"><mutation generateshadows="true" warp="false" proccode="something %s" argumentnames="[&quot;number or text&quot;]" argumentids="[&quot;arg0&quot;]" argumentdefaults="[&quot;&quot;]"></mutation></block>'
        }
    ]);

    t.end();
});
