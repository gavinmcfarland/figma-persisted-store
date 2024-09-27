import { FigmaStore } from "figma-store";

let fileKey = await FigmaStore.create("fileKey", null, (figma) => figma.root);

console.log(fileKey);

let id = "0:1";

let layerStyles = await FigmaStore.create(
	`layerStyle${id}`,
	{},
	(figma, { id }) => {
		return figma.root.findAll((node) => node.name === `layerStyle${id}`);
	},
	{ id }
);

console.log(layerStyles);
