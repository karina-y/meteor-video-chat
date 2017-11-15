export default class Handler {
	constructor({meteor}){
		this.meteor = meteor;
	}
	call(_id, callback){
		this.meteor.call( 'VideoCallServices/call', _id, callback);
		this.stream = new this.meteor.Streamer( _id );
		this.stream.on( 'video_message', this.handleCallerStream.bind(this) );
	}
	endPhoneCall(onError){
		this.meteor.call( "VideoCallServices/end", err => {
			if(err){
				onError(err);
			}
		});
	}
	answerPhoneCall(onError){
		this.meteor.call( 'VideoCallServices/answer', err => {
			if ( err ) {
				onError( err );
			}
		} );
	}
	emitSenderDescription(sessionDescription){

	}
}