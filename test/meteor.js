class Connection{
	constructor(){
		this._stream = {
			on:()=>{}
		}
	}
}

export default new class {
	constructor(){
		this.connection = new Connection();
	}
	subscribe( subName ){
		console.log("sub name", subName);
	}
};

