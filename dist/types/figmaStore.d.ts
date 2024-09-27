import { get } from "svelte/store";
type NonUndefined<T> = Exclude<T, undefined>;
export declare class FigmaStore<T extends object | number | string | boolean> {
    private state;
    private store;
    private isInitialized;
    private storageKey;
    private nodeTarget?;
    constructor(storageKey: string, defaultState: NonUndefined<T>, nodeTarget?: () => SceneNode | BaseNode);
    /** Static method to create and initialize the store */
    static create<T extends object | number | string | boolean>(key: string, defaultState: NonUndefined<T>, nodeTarget?: () => SceneNode | BaseNode): Promise<FigmaStore<T>>;
    /** Initialize the store by loading state from clientStorage */
    initialize(): Promise<void>;
    /** Svelte's subscribe method */
    subscribe(run: (value: T) => void, invalidate?: (value?: T) => void): () => void;
    get(): T;
    /** Set the state immediately and persist asynchronously */
    set(newState: T): void;
    /** Update the state with a synchronous updater function */
    update(updaterFunction: (state: T) => T): void;
    /** Update the state with an asynchronous updater function */
    updateAsync(asyncUpdaterFunction: (state: T) => Promise<T>): Promise<void>;
    /** Retrieve the node target, if provided */
    getNodeTarget(): SceneNode | BaseNode | undefined;
    /** Internal method to save state */
    private _saveStateToStorage;
}
export { get };
