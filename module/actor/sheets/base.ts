export default abstract class SWActorSheet extends ActorSheet {
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ['swreup', 'sheet', 'actor'],
			// template: 'systems/swrpg-reup/templates/actor/'
			width: 600,
			height: 600,
			tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
		} as any);
	}

	/** @override */
	getData() {
		const data = super.getData();
		return data;
	}

	/** @override */
	activateListeners(html: JQuery<HTMLElement>) {
		super.activateListeners(html);

		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;

		// // Add Inventory Item
		// html.find('.item-create').click(this._onItemCreate.bind(this));

		// // Update Inventory Item
		// html.find('.item-edit').click(ev => {
		// 	const li = $(ev.currentTarget).parents(".item");
		// 	const item = this.actor.getOwnedItem(li.data("itemId"));
		// 	item.sheet.render(true);
		// });

		// // Delete Inventory Item
		// html.find('.item-delete').click(ev => {
		// 	const li = $(ev.currentTarget).parents(".item");
		// 	this.actor.deleteOwnedItem(li.data("itemId"));
		// 	li.slideUp(200, () => this.render(false));
		// });
	}
}
