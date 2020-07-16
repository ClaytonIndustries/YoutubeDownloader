
export async function getVideo(url, signal, callback) {
    const response = await fetch(url, {signal});

    if (!response.ok) {
        throw new Error('Response status code did not indicate success');
    }

    const contentEncoding = response.headers.get('content-encoding');
    const contentLength = response.headers.get(contentEncoding ? 'x-file-size' : 'content-length');

    callback("size", contentLength);

    let bytesRead = 0;
    const streamResponse = new Response(
        new ReadableStream({
            start(controller) {
                const reader = response.body.getReader();

                function read() {
                    reader.read().then(({ done, value }) => {
                        if (done) {
                            controller.close();
                            return;
                        }

                        bytesRead += value.byteLength;
                        callback("progress", bytesRead);

                        controller.enqueue(value);
                        read();
                    }).catch(e => {
                        console.error(e);
                        controller.error(e);
                    });
                }

                read();
            }
        })
    );

    const data = await streamResponse.arrayBuffer();
    return new Uint8Array(data); 
}