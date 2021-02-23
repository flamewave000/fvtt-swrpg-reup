import SWActorSheet from "./base.js";


export default class SWActorSheetCharacter extends SWActorSheet {
	/** @override */
	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			classes: options.classes.concat(['character']),
			template: 'systems/swrpg-reup/templates/actor/character-sheet.hbs'
		} as any);
	}

	// /** @override */
	// protected async _updateObject(event: Event, formData?: object): Promise<any> {
	// 	console.log(formData);
	// }
}
