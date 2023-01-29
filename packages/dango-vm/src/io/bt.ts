import JSONRPC from '../util/jsonrpc';
class BT extends JSONRPC {
    _availablePeripherals: any;
    _characteristicDidChangeCallback: any;
    _connectCallback: any;
    _connected: any;
    _discoverTimeoutID: any;
    _extensionId: any;
    _messageCallback: any;
    _peripheralOptions: any;
    _resetCallback: any;
    _runtime: any;
    _socket: any;
    /**
     * A BT peripheral socket object.  It handles connecting, over web sockets, to
     * BT peripherals, and reading and writing data to them.
     * @param {Runtime} runtime - the Runtime for sending/receiving GUI update events.
     * @param {string} extensionId - the id of the extension using this socket.
     * @param {object} peripheralOptions - the list of options for peripheral discovery.
     * @param {object} connectCallback - a callback for connection.
     * @param {object} resetCallback - a callback for resetting extension state.
     * @param {object} messageCallback - a callback for message sending.
     */
    constructor (runtime: any, extensionId: any, peripheralOptions: any, connectCallback: any, resetCallback = null, messageCallback: any) {
        super();
        this._socket = runtime.getScratchLinkSocket('BT');
        this._socket.setOnOpen(this.requestPeripheral.bind(this));
        this._socket.setOnError(this._handleRequestError.bind(this));
        this._socket.setOnClose(this.handleDisconnectError.bind(this));
        this._socket.setHandleMessage(this._handleMessage.bind(this));
        this._sendMessage = this._socket.sendMessage.bind(this._socket);
        this._availablePeripherals = {};
        this._connectCallback = connectCallback;
        this._connected = false;
        this._characteristicDidChangeCallback = null;
        this._resetCallback = resetCallback;
        this._discoverTimeoutID = null;
        this._extensionId = extensionId;
        this._peripheralOptions = peripheralOptions;
        this._messageCallback = messageCallback;
        this._runtime = runtime;
        this._socket.open();
    }
    /**
     * Request connection to the peripheral.
     * If the web socket is not yet open, request when the socket promise resolves.
     */
    requestPeripheral () {
        this._availablePeripherals = {};
        if (this._discoverTimeoutID) {
            window.clearTimeout(this._discoverTimeoutID);
        }
        this._discoverTimeoutID = window.setTimeout(this._handleDiscoverTimeout.bind(this), 15000);
        this.sendRemoteRequest('discover', this._peripheralOptions)
            // @ts-expect-error TS(2554): Expected 0 arguments, but got 1.
            .catch(e => this._handleRequestError(e));
    }
    /**
     * Try connecting to the input peripheral id, and then call the connect
     * callback if connection is successful.
     * @param {number} id - the id of the peripheral to connect to
     * @param {string} pin - an optional pin for pairing
     */
    connectPeripheral (id: any, pin = null) {
        const params = {peripheralId: id};
        if (pin) {
            // @ts-expect-error TS(2339): Property 'pin' does not exist on type '{ periphera... Remove this comment to see the full error message
            params.pin = pin;
        }
        this.sendRemoteRequest('connect', params)
            .then(() => {
                this._connected = true;
                this._runtime.emit(this._runtime.constructor.PERIPHERAL_CONNECTED);
                this._connectCallback();
            })
            .catch(e => {
                // @ts-expect-error TS(2554): Expected 0 arguments, but got 1.
                this._handleRequestError(e);
            });
    }
    /**
     * Close the websocket.
     */
    disconnect () {
        if (this._connected) {
            this._connected = false;
        }
        if (this._socket.isOpen()) {
            this._socket.close();
        }
        if (this._discoverTimeoutID) {
            window.clearTimeout(this._discoverTimeoutID);
        }
        // Sets connection status icon to orange
        this._runtime.emit(this._runtime.constructor.PERIPHERAL_DISCONNECTED);
    }
    /**
     * @return {bool} whether the peripheral is connected.
     */
    isConnected () {
        return this._connected;
    }
    sendMessage (options: any) {
        return this.sendRemoteRequest('send', options)
            .catch(e => {
                // @ts-expect-error TS(2554): Expected 0 arguments, but got 1.
                this.handleDisconnectError(e);
            });
    }
    /**
     * Handle a received call from the socket.
     * @param {string} method - a received method label.
     * @param {object} params - a received list of parameters.
     * @return {object} - optional return value.
     */
    // @ts-expect-error TS(2416): Property 'didReceiveCall' in type 'BT' is not assi... Remove this comment to see the full error message
    didReceiveCall (method: any, params: any) {
        // TODO: Add peripheral 'undiscover' handling
        switch (method) {
        case 'didDiscoverPeripheral':
            this._availablePeripherals[params.peripheralId] = params;
            this._runtime.emit(this._runtime.constructor.PERIPHERAL_LIST_UPDATE, this._availablePeripherals);
            if (this._discoverTimeoutID) {
                window.clearTimeout(this._discoverTimeoutID);
            }
            break;
        case 'userDidPickPeripheral':
            this._availablePeripherals[params.peripheralId] = params;
            this._runtime.emit(this._runtime.constructor.USER_PICKED_PERIPHERAL, this._availablePeripherals);
            if (this._discoverTimeoutID) {
                window.clearTimeout(this._discoverTimeoutID);
            }
            break;
        case 'userDidNotPickPeripheral':
            this._runtime.emit(this._runtime.constructor.PERIPHERAL_SCAN_TIMEOUT);
            if (this._discoverTimeoutID) {
                window.clearTimeout(this._discoverTimeoutID);
            }
            break;
        case 'didReceiveMessage':
            this._messageCallback(params); // TODO: refine?
            break;
        default:
            return 'nah';
        }
    }
    /**
     * Handle an error resulting from losing connection to a peripheral.
     *
     * This could be due to:
     * - battery depletion
     * - going out of bluetooth range
     * - being powered down
     *
     * Disconnect the socket, and if the extension using this socket has a
     * reset callback, call it. Finally, emit an error to the runtime.
     */
    handleDisconnectError (/* e */) {
        // log.error(`BT error: ${JSON.stringify(e)}`);
        if (!this._connected) {
            return;
        }
        this.disconnect();
        if (this._resetCallback) {
            this._resetCallback();
        }
        this._runtime.emit(this._runtime.constructor.PERIPHERAL_CONNECTION_LOST_ERROR, {
            message: `Scratch lost connection to`,
            extensionId: this._extensionId
        });
    }
    _handleRequestError (/* e */) {
        // log.error(`BT error: ${JSON.stringify(e)}`);
        this._runtime.emit(this._runtime.constructor.PERIPHERAL_REQUEST_ERROR, {
            message: `Scratch lost connection to`,
            extensionId: this._extensionId
        });
    }
    _handleDiscoverTimeout () {
        if (this._discoverTimeoutID) {
            window.clearTimeout(this._discoverTimeoutID);
        }
        this._runtime.emit(this._runtime.constructor.PERIPHERAL_SCAN_TIMEOUT);
    }
}
export default BT;
