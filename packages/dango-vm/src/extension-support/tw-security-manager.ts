/* eslint-disable no-unused-vars */
/**
 * Responsible for determining various policies related to custom extension security.
 * The default implementation attempts to retain compatibility with a vanilla scratch-vm
 * and ensure maximum security. You can manually opt-in to less security by overriding
 * methods. For example:
 * ```js
 * vm.securityManager.getSandboxMode = (url) => {
 *   if (url.startsWith("https://example.com/")) {
 *     return "unsandboxed";
 *   }
 *   return "iframe";
 * };
 * vm.securityManager.canAutomaticallyLoadExtension = (url) => {
 *   return confirm("Automatically load extension: " + url);
 * };
 * ```
 */
class SecurityManager {
    /**
     * Determine the typeof sandbox to use for a certain custom extension.
     * @param {string} extensionURL The URL of the custom extension.
     * @returns {Promise<'worker'|'iframe'|'unsandboxed'>}
     */
    getSandboxMode (extensionURL: string) {
        // Default to worker for Scratch compatibility
        return Promise.resolve('worker');
    }
    /**
     * Determine whether a custom extension that was stored inside a project may be
     * loaded. You could, for example, ask the user to confirm loading an extension
     * before resolving.
     * @param {string} extensionURL The URL of the custom extension.
     * @returns {Promise<boolean>}
     */
    canLoadExtensionFromProject (extensionURL: string) {
        // Default to false for security
        return Promise.resolve(false);
    }
}
export default SecurityManager;
