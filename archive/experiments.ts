import { derived, writable, get } from "svelte/store";
import { nanoid } from "nanoid";
import { figmaAPI } from "./utils/figmaAPI";
import { tick } from "svelte";
import { delay } from "./utils/testing";

export function createClientStore(key: string, initialValue: any) {
	const store = writable(initialValue); // Initialize with a value
	const { subscribe, set, update } = store; // Destructure original methods

	async function init() {
		try {
			let result = await figmaAPI.run(
				async (figma, { key }) => {
					return await figma.clientStorage.getAsync(key);
				},
				{ key }
			);
			// console.log('result', result, typeof result === 'number')
			if (typeof result !== "undefined") {
				set(result);
			}
		} catch (error) {
			console.log(error);
		}
	}

	return {
		init,
		subscribe,
		async set(value: any) {
			let result = await figmaAPI.run(
				async (figma, { key, value }) => {
					await figma.clientStorage.setAsync(key, value);
					return value;
				},
				{ key, value }
			);
			if (typeof result !== "undefined") {
				set(value);
			}
		},
		async update(callback: (value?: any) => any) {
			// update(callback)

			let result = await figmaAPI.run(
				async (figma, { key, callback, initialValue }) => {
					// Get store
					let store = await figma.clientStorage.getAsync(key);

					// Not sure if should do this, but it prevents some issues if running update without a value
					if (typeof store === "undefined") {
						store = initialValue;
					}

					// Do something with store
					let updatedValue = callback(store);

					if (typeof updatedValue !== "undefined") {
						// Set new store
						await figma.clientStorage.setAsync(key, updatedValue);
						return updatedValue;
					}
				},
				{ key, callback, initialValue }
			);

			if (typeof result !== "undefined") {
				set(result);
			}
		},
		// update: async (callback: Function) => {
		// 	update(callback)
		// 	let result = await figmaAPI.run(
		// 		async (figma, { key, callback }) => {
		// 			// Get store
		// 			let store = await figma.clientStorage.getAsync(key)

		// 			// Do something with store
		// 			let updatedValue = callback(store)

		// 			// Set new store
		// 			figma.clientStorage.setAsync(key, updatedValue)
		// 			return store
		// 		},
		// 		{ key, callback }
		// 	)

		// 	// I don't think we have to use update
		// 	// update((currentValue) => {
		// 	// 	const newValue = callback(currentValue) // Apply the update function
		// 	// 	return newValue // Return the new value for the store
		// 	// })
		// },
	};
}

// export function createPluginDataStore(getNode: Function, key: string, initialValue: any) {
// 	const store = writable(initialValue) // Initialize with a value
// 	const { subscribe, set, update } = store // Destructure original methods

// 	return {
// 		subscribe,
// 		set: async (value: any) => {
// 			console.log('Intercepted set:', value) // Your interception logic here
// 			let result = await figmaAPI.run(
// 				async (figma, { getNode }) => {
// 					// Get node
// 					let node = getNode()
// 					// Set pluginData on node
// 					node.setPluginData(key, value)
// 					// Return so value can be set in UI
// 					return value
// 				},
// 				{ key, getNode }
// 			)
// 			set(result)
// 		},
// 		update: async (callback: Function) => {
// 			let result = await figmaAPI.run(
// 				async (figma, { getNode }) => {
// 					// Get node
// 					let node = getNode()
// 					// Get pluginData on node
// 					let store = node.getPluginData(key)
// 					// Do something with store
// 					let updatedValue = callback(store)
// 					// Set new value in pluginData
// 					node.setPluginData(key, updatedValue)
// 					// Return so value can be set in UI
// 					return updatedValue
// 				},
// 				{ key, getNode }
// 			)

// 			// I don't think we have to use update
// 			// update((currentValue) => {
// 			// 	const newValue = callback(currentValue) // Apply the update function
// 			// 	return newValue // Return the new value for the store
// 			// })
// 			set(result)
// 		},
// 	}
// }

export let xsites = createClientStore("test-count", 0);
