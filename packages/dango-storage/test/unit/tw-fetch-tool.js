const test = require('tap').test;
const FetchTool = require('../../src/FetchTool');

test('get() returns success for status: 0, ok: false', t => {
    const text = 'successful response';
    const encoding = 'utf-8';
    const encoded = new TextEncoder().encode(text);
    const decoder = new TextDecoder(encoding);

    global.fetch = () => Promise.resolve({
        // This is what fetch() resolves with in a WKWebView when requesting a file: URL from a file: URL.
        ok: false,
        status: 0,
        arrayBuffer: () => Promise.resolve(encoded.buffer)
    });

    const tool = new FetchTool();
    
    return t.resolves(
        tool.get({url: 'url'}).then(result => {
            t.equal(decoder.decode(result), text);
        })
    );
});

test('get() retries on error', t => {
    const text = 'successful response';
    const encoding = 'utf-8';
    const encoded = new TextEncoder().encode(text);
    const decoder = new TextDecoder(encoding);

    let attempt = 0;
    global.fetch = () => {
        attempt++;
        if (attempt === 1) {
            // eslint-disable-next-line prefer-promise-reject-errors
            return Promise.reject('Intentional error for testing');
        }
        return Promise.resolve({
            ok: true,
            arrayBuffer: () => Promise.resolve(encoded.buffer)
        });
    };

    const tool = new FetchTool();
    return t.resolves(
        tool.get({url: 'url'}).then(result => {
            t.equal(decoder.decode(result), text);
        })
    );
});
