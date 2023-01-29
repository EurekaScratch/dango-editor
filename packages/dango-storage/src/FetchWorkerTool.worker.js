/* eslint-env worker */

const saferFetchAsArrayBuffer = require('./safer-fetch');

const complete = [];

let timeoutId = null;

const checkCompleted = () => {
    if (timeoutId) return;
    timeoutId = setTimeout(() => {
        timeoutId = null;
        if (complete.length) {
            // Send our chunk of completed requests and instruct postMessage to
            // transfer the buffers instead of copying them.
            postMessage(
                complete.slice(),
                // Instruct postMessage that these buffers in the sent message
                // should use their Transferable trait. After the postMessage
                // call the "buffers" will still be in complete if you looked,
                // but they will all be length 0 as the data they reference has
                // been sent to the window. This lets us send a lot of data
                // without the normal postMessage behaviour of making a copy of
                // all of the data for the window.
                complete.map(response => response.buffer).filter(Boolean)
            );
            complete.length = 0;
        }
    });
};

/**
 * Receive a job from the parent and fetch the requested data.
 * @param {object} options.job A job id, url, and options descriptor to perform.
 */
const onMessage = ({data: job}) => {
    saferFetchAsArrayBuffer(job.url, job.options)
        .then(buffer => complete.push({id: job.id, buffer}))
        .catch(error => complete.push({id: job.id, error: (error && error.message) || `Failed request: ${job.url}`}))
        .then(checkCompleted);
};

if (self.fetch) {
    postMessage({support: {fetch: true}});
    self.addEventListener('message', onMessage);
} else {
    postMessage({support: {fetch: false}});
    self.addEventListener('message', ({data: job}) => {
        postMessage([{id: job.id, error: 'fetch is unavailable'}]);
    });
}
