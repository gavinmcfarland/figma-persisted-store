### Create a store

**Client storage**

Storing data on clientStorage.

```js
let store = await Store.create("key", { count: 0 });
```

**Plugin data**

Storing data on the file root.

```js
let store = await Store.create("fileKey", { count: 0 }, (figma) => figma.root);
```

Setting data on several nodes.

```js
let store = await Store.create({ count: 0 }, `layerStyle`, (figma, styleId) => {
    return figma.root.findAll((node) => node.name === "Rectangle");
});
```

### Setting a store

```js
await sites.set([]);
```

### Updating a store

```js
await sites.update((data) => {
    // do some stuff
    return data;
});
```

### Updating a store asyncronously

```js
await sites.updateAsync((data) => {
    // do some stuff
    return data;
});
```
