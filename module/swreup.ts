
import SWActor from './actor/entity.js';
import SWActorSheetCharacter from './actor/sheets/character.js';
import SWActorSheetNPC from './actor/sheets/npc.js';
import SWActorSheetVehicle from './actor/sheets/vehicle.js';
import SWREUP from './config.js';
import SWItem from './item/SWItem.js';
import SWItemSheet from './item/SWItemSheet.js';

Hooks.once('init', async function () {
	console.log(`SWREUP | Initialising the Star Wars REUP System\n${SWREUP.ASCii}`);

	game.swreup = {
		config: SWREUP,
		entities: {
			SWActor,
			SWItem,
		}
	}

	CONFIG.Actor.entityClass = SWActor;
	CONFIG.Item.entityClass = SWItem;
	CONFIG.time.roundTime = 6;
	CONFIG.Combat.initiative.formula = "d6e6 + ((@attributes.dex - 3) / 3)d6 + ((@attributes.dex - 3) % 3)";

	Actors.unregisterSheet("core", ActorSheet);
	Actors.registerSheet("swreup", SWActorSheetCharacter, {
		types: ["character"],
		makeDefault: true,
		label: "SWREUP.SheetClassCharacter"
	});
	Actors.registerSheet("swreup", SWActorSheetNPC, {
		types: ["npc"],
		makeDefault: true,
		label: "SWREUP.SheetClassNPC"
	});
	Actors.registerSheet("swreup", SWActorSheetVehicle, {
		types: ["vehicle"],
		makeDefault: true,
		label: "SWREUP.SheetClassVehicle"
	});
	Items.unregisterSheet("core", ActorSheet);
	Items.registerSheet("swreup", SWItemSheet, {
		makeDefault: true,
		label: "SWREUP.SheetClassItem"
	});
});

Hooks.once("ready", async function () {
});

Handlebars.registerHelper('uppercase', function (value: string) {
	return value.toUpperCase();
});

Handlebars.registerHelper('calcd6', function (value: number | string) {
	const pips: number = typeof value === 'number' ? value : parseInt(value);
	return Math.trunc(pips / 3);
});

Handlebars.registerHelper('calcpips', function (value: number | string) {
	const pips: number = typeof value === 'number' ? value : parseInt(value);
	return Math.trunc(pips % 3);
});
