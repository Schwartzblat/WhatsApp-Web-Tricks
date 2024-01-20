const message_id = '' || prompt('enter the message id:');

const moduleRaid = function() {
    moduleRaid.mID = Math.random().toString(36).substring(7);
    moduleRaid.mObj = {};

    fillModuleArray = function() {
        (window.webpackChunkbuild || window.webpackChunkwhatsapp_web_client).push([
            [moduleRaid.mID], {},
            function(e) {
                Object.keys(e.m).forEach(function(mod) {
                    moduleRaid.mObj[mod] = e(mod);
                })
            }
        ]);
    }

    fillModuleArray();

    get = function get(id) {
        return moduleRaid.mObj[id]
    }

    findModule = function findModule(query) {
        results = [];
        modules = Object.keys(moduleRaid.mObj);

        modules.forEach(function(mKey) {
            mod = moduleRaid.mObj[mKey];

            if (typeof mod !== 'undefined') {
                if (typeof query === 'string') {
                    if (typeof mod.default === 'object') {
                        for (key in mod.default) {
                            if (key == query) results.push(mod);
                        }
                    }

                    for (key in mod) {
                        if (key == query) results.push(mod);
                    }
                } else if (typeof query === 'function') {
                    if (query(mod)) {
                        results.push(mod);
                    }
                } else {
                    throw new TypeError('findModule can only find via string and function, ' + (typeof query) + ' was passed');
                }

            }
        })

        return results;
    }

    return {
        modules: moduleRaid.mObj,
        constructors: moduleRaid.cArr,
        findModule: findModule,
        get: get
    }
}

if (typeof module === 'object' && module.exports) {
    module.exports = moduleRaid;
} else {
    window.mR = moduleRaid();
}

const arrayBufferToBase64 = (arrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(arrayBuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

const DownloadManager = window.mR.findModule('downloadManager')[0].downloadManager;

db = indexedDB.open('model-storage');

db.onsuccess = (event) => {
    const model_storage = event.target.result;
    messages = model_storage.transaction('message').objectStore('message')
    messages.openCursor().onsuccess = async (event) => {
        const cursor = event.target.result;
        if (cursor?.key !== message_id) {
            cursor.continue();
            return;
        }
        const msg = cursor.value;
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
        console.log(data);
        const data_uri = `data:${msg.mimetype};base64,${data}`;
        let win = window.open('about:blank');
        let iframe = win.document.body.appendChild(
            win.document.createElement('iframe')
        );
        iframe.src = data_uri;
        iframe.width = '100%';
        iframe.height = '100%';
    };
};
