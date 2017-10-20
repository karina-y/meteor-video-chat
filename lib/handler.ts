import {IHandler, Message, MessageDirection, MessageType} from 'core-rtc';
export default class Handler implements IHandler {
    private meteor: any;
    private core: any;
    private stream: any;
    constructor({meteor, core}){
        this.meteor = meteor;
        this.core = core;
    }
    emitIceCandidate(iceCandidate: Object): void {
        this.stream.emit( 'video_message', { candidate: iceCandidate  } );
    }

    emitTargetAnswer(sessionDescription: Object): void {
        this.stream.emit( 'video_message',  { answer:sessionDescription } );
    }

    onPeerConnectionCreated(): void {
    }

    onCallInitialised(err: Error): void {
    }


    call(_id, callback){
        this.meteor.call( 'VideoCallServices/call', _id, callback);
        this.stream = new this.meteor.Streamer( _id );
        this.stream.on( 'video_message', streamData => {
            if ( typeof streamData === 'string' ){
                streamData = JSON.parse( streamData );
            }
            if ( streamData.answer ) {
                const message = {
                    data:streamData.answer,
                    Direction:MessageDirection.Sender,
                    Type:MessageType.SessionDescription

                } as Message;
                this.core.handleSenderStream(message);
            }
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
        this.stream.emit( 'video_message',  { offer:sessionDescription }  );
    }
    onReceivePhoneCall(fields: any){

    }

}