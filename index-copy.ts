import { derived, writable } from "svelte/store";
import { Msgr } from "./messenger";

class PersistedStore {
	private isHandlersInitialized = false;

	constructor() {
		this.initializeHandlers();
	}

	// Initialize the event listeners for clientStorage
	private initializeHandlers() {
		if (!this.isHandlersInitialized) {
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

			console.log("Client storage handlers initialized.");
			this.isHandlersInitialized = true;
		}
	}

	// Allow the class to be called like a function
	public create(key: string, initialValue: any) {
		const store = writable(initialValue);
		const msgr = new Msgr();
		// Load initial value from clientStorage
		if (typeof window !== "undefined") {
			msgr.emit("persistable-get-client-storage", { key }).then(
				(value) => {
					if (value !== undefined) {
						// store.set(value); // Set the initial value if it exists in client storage
					}
				}
			);
		} else {
			figma.clientStorage.getAsync(key).then((value) => {
				if (value !== undefined) {
					// store.set(value);
				}
			});
		}
		return {
			subscribe(
				run: (value: any) => void,
				invalidate?: (value?: any) => void
			) {
				console.log("Subscribing to store");
				// return store.subscribe(run, invalidate);
			},
			async set(value: any) {
				console.log("Setting value:", value);
				// store.set(value);
				if (typeof window !== "undefined") {
					msgr.emit("persistable-set-client-storage", { key, value });
				} else {
					await figma.clientStorage.setAsync(key, value);
				}
			},
			async update(updater: (value: any) => any) {
				console.log("Updating value");
				// store.update(updater);
				// const value = get(store);
				if (typeof window !== "undefined") {
					await msgr.emit("persistable-set-client-storage", {
						key,
						value,
					});
				} else {
					await figma.clientStorage.setAsync(key, value);
				}
			},
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
	}
}

// // Allow the user to directly call `PersistedStore` without needing `new`
const persisted = new PersistedStore().create.bind(new PersistedStore());

export { persisted };
