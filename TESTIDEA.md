### Create a store

```js
let sites = store("sites", []);
```

### Initialising a store

```js
await sites.init();
```

### Fetching data during intialisation

```js
await sites.init((sites) => {
    let { data, error } = fetch();

    return data;
});
```
