import fs from 'fs';
import VirtualMachine from '../virtual-machine';

/* eslint-disable no-console */

const file = process.argv[2];
if (!file) {
    throw new Error('Invalid file');
}

const runProject = async (buffer: any) => {
    const vm = new VirtualMachine();
    vm.runtime.on('SAY', (target: any, type: any, text: any) => {
        console.log(text);
    });
    vm.setCompatibilityMode(true);
    vm.clear();
    await vm.loadProject(buffer);
    vm.start();
    vm.greenFlag();
    await new Promise(resolve => {
        const interval = setInterval(() => {
            let active = 0;
            const threads = vm.runtime.threads;
            for (let i = 0; i < threads.length; i++) {
                if (!threads[i].updateMonitor) {
                    active += 1;
                }
            }
            if (active === 0) {
                clearInterval(interval);
                // @ts-expect-error TS(2794): Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
                resolve();
            }
        }, 50);
    });
    vm.stopAll();
    vm.stop();
};

runProject(fs.readFileSync(file));
export {}
