import IRGenerator from './irgen';
import JSGenerator from './jsgen';
const compile = (thread: any) => {
    const irGenerator = new IRGenerator(thread);
    const ir = irGenerator.generate();
    const procedures = {};
    const target = thread.target;
    const compileScript = (script: any) => {
        if (script.cachedCompileResult) {
            return script.cachedCompileResult;
        }
        const compiler = new JSGenerator(script, ir, target);
        const result = compiler.compile();
        script.cachedCompileResult = result;
        return result;
    };
    const entry = compileScript(ir.entry);
    for (const procedureVariant of Object.keys(ir.procedures)) {
        const procedureData = ir.procedures[procedureVariant];
        const procedureTree = compileScript(procedureData);
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        procedures[procedureVariant] = procedureTree;
    }
    return {
        startingFunction: entry,
        procedures
    };
};
export default compile;
