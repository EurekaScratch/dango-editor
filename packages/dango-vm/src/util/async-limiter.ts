class AsyncLimiter {
    _current: any;
    _queue: any;
    callback: any;
    maxConcurrent: any;
    constructor (callback: any, maxConcurrent: any) {
        this.callback = callback;
        this.maxConcurrent = maxConcurrent;
        this._current = 0;
        this._queue = [];
    }
    do (...args: any[]) {
        return new Promise((resolve, reject) => {
            this._queue.push([resolve, reject, args]);
            this._startNext();
        });
    }
    _startNext () {
        if (this._current >= this.maxConcurrent || this._queue.length === 0) {
            return;
        }
        this._current++;
        const [resolve, reject, args] = this._queue.shift();
        this.callback.apply(null, args)
            .then((result: any) => {
                resolve(result);
                this._current--;
                this._startNext();
            })
            .catch((error: any) => {
                reject(error);
                this._current--;
                this._startNext();
            });
    }
}
export default AsyncLimiter;
