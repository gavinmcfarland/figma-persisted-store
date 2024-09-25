# Figma Store

This allows you to create stores which can persists in `clientStorage`.

> [!NOTE]
> This hasn't been packaged yet and is a work in progress.

## Setup

```js
import { persisted } from "figma-store";
```

## Usage

A persisted store takes a `key` and can be used in both the `main` code and the `ui`.

### Creating a store

```js
const greeting = persisted("greeting", "hello"); // => "hello"
```

### Updating a store

```js
greeting.update((e) => e + " world!"); // => "hello world!"
```

### Setting a store

```js
greeting.set("goodbye!"); // => "goodbye!"
```

### Subscribing to a store

```js
greeting.subscribe((value) => {
    console.log(value);
});
```

## How does it work?

When the `persisted` function is imported, a message event listener is initialized to handle communication between the Figma plugin's main thread and the UI. This listener facilitates interaction with `clientStorage`.

When a store is created, updated, or subscribed to, its value is persisted in `clientStorage`. If the operation is performed from the UI, a message is sent to the main thread, which in turn triggers `clientStorage.setAsync()` or `clientStorage.getAsync()`. This ensures that data is saved in the plugin’s local storage, even when actions are initiated from the UI.
