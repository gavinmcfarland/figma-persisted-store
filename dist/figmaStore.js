import { writable } from "svelte/store";
import { figmaAPI } from "./figmaAPI";
export class FigmaStore {
    state;
    store;
    isInitialized;
    storageKey;
    nodeTarget;
    constructor(storageKey, defaultState, nodeTarget) {
        // Check if we're in the Figma main code environment
        if (typeof figma !== "undefined") {
            throw new Error("FigmaStore cannot be used in the Figma main thread.");
        }
        this.state = defaultState;
        this.store = writable(this.state);
        this.isInitialized = false;
        this.storageKey = storageKey;
        this.nodeTarget = nodeTarget;
    }
    /** Static method to create and initialize the store */
    static async create(key, defaultState, nodeTarget) {
        const store = new FigmaStore(key, defaultState, nodeTarget);
        await store.initialize();
        return store;
    }
    /** Initialize the store by loading state from clientStorage */
    async initialize() {
        if (this.isInitialized)
            return;
        try {
            const storedState = await figmaAPI.run(async (figma, { key }) => {
                return await figma.clientStorage.getAsync(key);
            }, { key: this.storageKey });
            // Ensure that storedState is only applied if it is not undefined
            if (typeof storedState !== "undefined") {
                this.state = storedState;
            }
            this.isInitialized = true;
            console.log("initialize state");
            this.store.set(this.state); // Update the Svelte store
        }
        catch (error) {
            console.error(`Failed to load state from storage for key "${this.storageKey}":`, error);
        }
    }
    /** Svelte's subscribe method */
    subscribe(run, invalidate) {
        return this.store.subscribe(run, invalidate);
    }
    /** Set the state immediately and persist asynchronously */
    set(newState) {
        console.log("set state");
        this.state = newState;
        this.store.set(this.state); // Update the Svelte store
        this._saveStateToStorage();
    }
    /** Update the state with a synchronous updater function */
    update(updaterFunction) {
        console.log("update state");
        this.state = updaterFunction(this.state);
        if (typeof this.state !== "undefined") {
            this.store.set(this.state); // Update the Svelte store
            this._saveStateToStorage();
        }
    }
    /** Update the state with an asynchronous updater function */
    async updateAsync(asyncUpdaterFunction) {
        try {
            const storedState = await figmaAPI.run(async (figma, { key, asyncUpdaterFunction, initialValue }) => {
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
            }, {
                key: this.storageKey,
                asyncUpdaterFunction,
                initialValue: this.state,
            });
            this.state = storedState || this.state;
            this.store.set(this.state); // Update the Svelte store
        }
        catch (error) {
            console.error("Failed to update state asynchronously:", error);
        }
    }
    /** Retrieve the node target, if provided */
    getNodeTarget() {
        return this.nodeTarget ? this.nodeTarget() : undefined;
    }
    /** Internal method to save state */
    async _saveStateToStorage() {
        try {
            await figmaAPI.run(async (figma, { key, value }) => {
                await figma.clientStorage.setAsync(key, value);
                return value;
            }, { key: this.storageKey, value: this.state });
        }
        catch (error) {
            console.error(`Failed to save state to storage for key "${this.storageKey}":`, error);
        }
    }
}
