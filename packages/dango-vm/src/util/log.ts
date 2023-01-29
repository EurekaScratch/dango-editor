// @ts-expect-error TS(7016): Could not find a declaration file for module 'mini... Remove this comment to see the full error message
import * as minilog from 'minilog';
minilog.enable();
export default minilog.default('vm');
