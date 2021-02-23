
export default class SWActor extends Actor {
	/** @override */
	public prepareBaseData() {
		switch (this.data.type) {
			case "character":
				return this._prepareCharacterData(this.data);
			case "npc":
				return this._prepareNPCData(this.data);
			case "vehicle":
				return this._prepareVehicleData(this.data);
		}
	}

	/** @override */
	public prepareData() {
		if(!this.data.data.details.name) {
			this.data.data.details.name = this.data.name;
		}
		for(let key of Object.keys(this.data.data.attributes)) {
			const pts: number = this.data.data.attributes[key];
			this.data.data.attributes[key] = {};
			this.data.data.attributes[key].dice = Math.trunc(pts / 3);
			this.data.data.attributes[key].pips = Math.trunc(pts % 3);
		}
	}

	/** @override */
	public prepareDerivedData() {
	}

	private _prepareCharacterData(data: any) {
	}
	private _prepareNPCData(data: any) {
	}
	private _prepareVehicleData(data: any) {
	}
}
