import {IHandler, Message, MessageDirection, MessageType} from 'core-rtc';
export default class Handler implements IHandler {
    private meteor: any;
    private core: any;
    private stream: any;
    private client: any;
    constructor({meteor, core, client}){
        this.meteor = meteor;
        this.core = core;
        this.client = client;
    }
    emitIceCandidate(iceCandidate: Object): void {
        this.meteor.VideoCallServices.stream.emit( 'video_message', JSON.stringify({ candidate: iceCandidate  }) );
    }

    emitTargetAnswer(sessionDescription: Object): void {
        this.meteor.VideoCallServices.stream.emit( 'video_message',  JSON.stringify({ answer: sessionDescription }) );
    }

    onPeerConnectionCreated(): void {
    }

    onCallInitialised(err: Error): void {
    }


    call(_id, callback){
        this.meteor.call( 'VideoCallServices/call', _id,
            (err, _id)=>{
                callback();
            });


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
        this.meteor.VideoCallServices.stream.emit( 'video_message',  JSON.stringify({ offer:sessionDescription } ) );
    }
    onReceivePhoneCall(fields: any){

    }

}