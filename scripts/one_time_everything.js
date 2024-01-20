const db = indexedDB.open('model-storage');

db.onsuccess = (event) => {
	const model_storage = event.target.result;
	const messages = model_storage.transaction(['message'], 'readwrite').objectStore('message');
	messages.getAllKeys().onsuccess = (event) => {
		event.target.result.forEach((key) => {
			const request = messages.get(key);
			request.onsuccess = (event) => {
				const data = event.target.result;
				if (data?.isViewOnce) {
					data.isViewOnce = false;
					messages.put(data).onsuccess = () => console.log('SUCCESS');
					messages.put(data).onerror = () => console.log('ERROR');
				}
			}
		});
	}
}
