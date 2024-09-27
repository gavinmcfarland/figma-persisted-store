import { writable, get } from "svelte/store";
import { msgr, Msgr } from "../messenger";

export function listeners() {
	new Msgr({
		handlers: {
			"persistable-set-client-storage": ({ key, value }) => {
				console.log("--- set client storage", key, value);
				if (key) {
					figma.clientStorage.setAsync(key, value);
				}
			},
			"persistable-get-client-storage": async ({ key }) => {
				console.log("--- get client storage", key);
				if (key) {
					return await figma.clientStorage.getAsync(key);
				}
			},
		},
	});
}

export function persisted(key: string, initialValue: any) {
	const store = writable(initialValue);

	// Load initial value from clientStorage
	if (typeof window !== "undefined") {
		msgr.emit("persistable-get-client-storage", { key }).then((value) => {
			if (value !== undefined) {
				store.set(value); // Set the initial value if it exists in client storage
			}
		});
	} else {
		figma.clientStorage.getAsync(key).then((value) => {
			if (value !== undefined) {
				store.set(value); // Set the initial value if it exists in Figma clientStorage
			}
		});
	}

	// Intercept the `subscribe` method
	const customStore = {
		subscribe(
			run: (value: any) => void,
			invalidate?: (value?: any) => void
		) {
			console.log("Subscribing to store");

			// Call original store subscribe
			return store.subscribe(run, invalidate);
		},

		// Intercept the `set` method
		async set(value: any) {
			console.log("Setting value:", value);
			store.set(value); // Set the value in the original store

			// Save to clientStorage
			if (typeof window !== "undefined") {
				await msgr.emit("persistable-set-client-storage", {
					key,
					value,
				});
			} else {
				await figma.clientStorage.setAsync(key, value);
			}
		},

		// Intercept the `update` method
		async update(updater: (value: any) => any) {
			console.log("Updating value");
			store.update(updater); // Call the update function on the original store

			const value = get(store); // Get the current value from the store after the update

			// Save updated value to clientStorage
			if (typeof window !== "undefined") {
				await msgr.emit("persistable-set-client-storage", {
					key,
					value,
				});
			} else {
				await figma.clientStorage.setAsync(key, value);
			}
		},

		// Expose a `get` method to retrieve the current store value
		async get() {
			if (typeof window !== "undefined") {
				return await msgr.emit("persistable-get-client-storage", {
					key,
				});
			} else {
				return await figma.clientStorage.getAsync(key);
			}
		},
	};

	return customStore;
}
