class MouseWheel {
    runtime: any;
    constructor (runtime: any) {
        /**
         * Reference to the owning Runtime.
         * @type{!Runtime}
         */
        this.runtime = runtime;
    }
    /**
     * Mouse wheel DOM event handler.
     * @param  {object} data Data from DOM event.
     */
    postData (data: any) {
        const matchFields = {};
        if (data.deltaY < 0) {
            // @ts-expect-error TS(2339): Property 'KEY_OPTION' does not exist on type '{}'.
            matchFields.KEY_OPTION = 'up arrow';
        } else if (data.deltaY > 0) {
            // @ts-expect-error TS(2339): Property 'KEY_OPTION' does not exist on type '{}'.
            matchFields.KEY_OPTION = 'down arrow';
        } else {
            return;
        }
        this.runtime.startHats('event_whenkeypressed', matchFields);
    }
}
export default MouseWheel;
