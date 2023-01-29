class JSONRPC {
    _openRequests: any;
    _requestID: any;
    constructor () {
        this._requestID = 0;
        this._openRequests = {};
    }
    /**
     * Make an RPC request and retrieve the result.
     * @param {string} method - the remote method to call.
     * @param {object} params - the parameters to pass to the remote method.
     * @returns {Promise} - a promise for the result of the call.
     */
    sendRemoteRequest (method: any, params: any) {
        const requestID = this._requestID++;
        const promise = new Promise((resolve, reject) => {
            this._openRequests[requestID] = {resolve, reject};
        });
        this._sendRequest(method, params, requestID);
        return promise;
    }
    /**
     * Make an RPC notification with no expectation of a result or callback.
     * @param {string} method - the remote method to call.
     * @param {object} params - the parameters to pass to the remote method.
     */
    sendRemoteNotification (method: any, params: any) {
        // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
        this._sendRequest(method, params);
    }
    /**
     * Handle an RPC request from remote, should return a result or Promise for result, if appropriate.
     * @param {string} method - the method requested by the remote caller.
     * @param {object} params - the parameters sent with the remote caller's request.
     */
    didReceiveCall (/* method , params */) {
        throw new Error('Must override didReceiveCall');
    }
    _sendMessage (/* jsonMessageObject */) {
        throw new Error('Must override _sendMessage');
    }
    _sendRequest (method: any, params: any, id: any) {
        const request = {
            jsonrpc: '2.0',
            method,
            params
        };
        if (id !== null) {
            // @ts-expect-error TS(2339): Property 'id' does not exist on type '{ jsonrpc: s... Remove this comment to see the full error message
            request.id = id;
        }
        // @ts-expect-error TS(2554): Expected 0 arguments, but got 1.
        this._sendMessage(request);
    }
    _handleMessage (json: any) {
        if (json.jsonrpc !== '2.0') {
            throw new Error(`Bad or missing JSON-RPC version in message: ${json}`);
        }
        if (json.hasOwnProperty('method')) {
            this._handleRequest(json);
        } else {
            this._handleResponse(json);
        }
    }
    _sendResponse (id: any, result: any, error: any) {
        const response = {
            jsonrpc: '2.0',
            id
        };
        if (error) {
            // @ts-expect-error TS(2339): Property 'error' does not exist on type '{ jsonrpc... Remove this comment to see the full error message
            response.error = error;
        } else {
            // @ts-expect-error TS(2339): Property 'result' does not exist on type '{ jsonrp... Remove this comment to see the full error message
            response.result = result || null;
        }
        // @ts-expect-error TS(2554): Expected 0 arguments, but got 1.
        this._sendMessage(response);
    }
    _handleResponse (json: any) {
        const {result, error, id} = json;
        const openRequest = this._openRequests[id];
        delete this._openRequests[id];
        if (openRequest) {
            if (error) {
                openRequest.reject(error);
            } else {
                openRequest.resolve(result);
            }
        }
    }
    _handleRequest (json: any) {
        const {method, params, id} = json;
        // @ts-expect-error TS(2554): Expected 0 arguments, but got 2.
        const rawResult = this.didReceiveCall(method, params);
        if (id) {
            Promise.resolve(rawResult).then(result => {
                // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
                this._sendResponse(id, result);
            }, error => {
                this._sendResponse(id, null, error);
            });
        }
    }
}
export default JSONRPC;
