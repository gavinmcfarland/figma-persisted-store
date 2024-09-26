import { writable, type Writable } from "svelte/store";
import { figmaAPI } from "./figmaAPI";

type NonUndefined<T> = Exclude<T, undefined>;

export class FigmaStore<T extends object | number | string | boolean> {
	private state: T;
	private store: Writable<T>;
	private isInitialized: boolean;
	private storageKey: string;
	private nodeTarget?: () => SceneNode | BaseNode;

	constructor(
		storageKey: string,
		defaultState: NonUndefined<T>,
		nodeTarget?: () => SceneNode | BaseNode
	) {
		this.state = defaultState;
		this.store = writable(this.state);
		this.isInitialized = false;
		this.storageKey = storageKey;
		this.nodeTarget = nodeTarget;
	}

	/** Static method to create and initialize the store */
	static async create<T extends object | number | string | boolean>(
		key: string,
		defaultState: NonUndefined<T>,
		nodeTarget?: () => SceneNode | BaseNode
	): Promise<FigmaStore<T>> {
		const store = new FigmaStore(key, defaultState, nodeTarget);
		await store.initialize();
		return store;
	}

	/** Initialize the store by loading state from clientStorage */
	async initialize(): Promise<void> {
		if (this.isInitialized) return;

		try {
			const storedState = await figmaAPI.run(
				async (figma, { key }) => {
					return await figma.clientStorage.getAsync(key);
				},
				{ key: this.storageKey }
			);

			// Ensure that storedState is only applied if it is not undefined
			if (typeof storedState !== "undefined") {
				this.state = storedState;
			}
			this.isInitialized = true;
			console.log("initialise state");
			this.store.set(this.state); // Update the Svelte store
		} catch (error) {
			console.error(
				`Failed to load state from storage for key "${this.storageKey}":`,
				error
			);
		}
	}

	/** Svelte's subscribe method */
	subscribe(
		run: (value: T) => void,
		invalidate?: (value?: T) => void
	): () => void {
		return this.store.subscribe(run, invalidate);
	}

	// NOTE: Disable now because error when store hasn't been created during reactive state
	// /** Get the current state synchronously */
	// get(): T {
	// 	console.log('get state')
	// 	return this.state
	// }

	/** Set the state immediately and persist asynchronously */
	set(newState: T): void {
		console.log("set state");
		this.state = newState;
		this.store.set(this.state); // Update the Svelte store
		this._saveStateToStorage();
	}

	/** Update the state with a synchronous updater function */
	update(updaterFunction: (state: T) => T): void {
		console.log("update state");
		this.state = updaterFunction(this.state);
		if (typeof this.state !== "undefined") {
			this.store.set(this.state); // Update the Svelte store
			this._saveStateToStorage();
		}
	}

	/** Update the state with an asynchronous updater function */
	async updateAsync(
		asyncUpdaterFunction: (state: T) => Promise<T>
	): Promise<void> {
		try {
			const storedState = await figmaAPI.run(
				async (figma, { key, asyncUpdaterFunction, initialValue }) => {
					// Get store
					let store = await figma.clientStorage.getAsync(key);

					// Use initialValue if store is undefined
					if (typeof store === "undefined") {
						store = initialValue;
					}

					// Do something with store
					const updatedValue = await asyncUpdaterFunction(store);

					if (typeof updatedValue !== "undefined") {
						// Set new store
						await figma.clientStorage.setAsync(key, updatedValue);
						return updatedValue;
					}
				},
				{
					key: this.storageKey,
					asyncUpdaterFunction,
					initialValue: this.state,
				}
			);

			this.state = storedState || this.state;
			this.store.set(this.state); // Update the Svelte store
		} catch (error) {
			console.error("Failed to update state asynchronously:", error);
		}
	}

	/** Retrieve the node target, if provided */
	getNodeTarget(): SceneNode | BaseNode | undefined {
		return this.nodeTarget ? this.nodeTarget() : undefined;
	}

	/** Internal method to save state */
	private async _saveStateToStorage(): Promise<void> {
		try {
			await figmaAPI.run(
				async (figma, { key, value }) => {
					await figma.clientStorage.setAsync(key, value);
					return value;
				},
				{ key: this.storageKey, value: this.state }
			);
		} catch (error) {
			console.error(
				`Failed to save state to storage for key "${this.storageKey}":`,
				error
			);
		}
	}
}
