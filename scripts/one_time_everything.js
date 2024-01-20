const db = indexedDB.open('model-storage');

db.onsuccess = (event) => {
    const model_storage = event.target.result;
    const messages = model_storage.transaction(['message'], 'readwrite').objectStore('message');
    const keys_request = messages.getAllKeys();
    keys_request.onsuccess = (event) => {
        const keys = event.target.result;
        for (const key of keys) {
            const request = messages.get(key);
            request.onsuccess = (event) => {
                const data = event.target.result;
                if (data?.isViewOnce !== true) {
                    return;
                }
                data.isViewOnce = false;
                const requestUpdate = messages.put(data);
                requestUpdate.onerror = (event) => {
                    console.log('ERROR')
                };
                requestUpdate.onsuccess = (event) => {
                    console.log('SUCCESS')
                };
            }
        }
    }
}
