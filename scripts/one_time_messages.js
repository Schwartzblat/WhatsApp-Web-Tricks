const message_id = '' || prompt('enter the message id:');

const arrayBufferToBase64 = (arrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(arrayBuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

const DownloadManager = require('WAWebDownloadManager').downloadManager;

const db = indexedDB.open('model-storage');

db.onsuccess = (event) => {
    const model_storage = event.target.result;
    const request = model_storage.transaction('message').objectStore('message').get(message_id);
    request.onsuccess = async (event) => {
        const msg = event.target.result;
        const decryptedMedia = await DownloadManager.downloadAndMaybeDecrypt({
            directPath: msg.directPath,
            encFilehash: msg.encFilehash,
            filehash: msg.filehash,
            mediaKey: msg.mediaKey,
            mediaKeyTimestamp: msg.mediaKeyTimestamp,
            type: msg.type,
            signal: (new AbortController).signal
        });

        const data = arrayBufferToBase64(decryptedMedia);
        const data_uri = `data:${msg.mimetype};base64,${data}`;
        let win = window.open('about:blank');
        let iframe = win.document.body.appendChild(
            win.document.createElement('iframe')
        );
        iframe.src = data_uri;
        iframe.width = '100%';
        iframe.height = '100%';
    }
};
