import { Tracker } from 'meteor/tracker';
class VideoCallServices {

    constructor(){
        Tracker.autorun(()=>{
            this.sub = Meteor.subscribe('VideoChatPublication');
            console.log("vid chat pub")
        });
        Meteor.connection._stream.on('message', (msg) => {

            msg = JSON.parse(msg);
            if( msg.collection === 'VideoChatCallLog'
                && msg.msg === 'added'
                && msg.fields.target === Meteor.userId()
            && msg.fields.status == "NEW"){
                console.log("added", msg)
                this.callLog = msg.fields;
                this.onReceivePhoneCall(msg.id);
                this.stream = new Meteor.Streamer(msg.id);
                this.stream.on('video_message', function(stream_data) {
                    console.log("target", stream_data)
                    if( stream_data.offer ){
                        navigator.mediaDevices.getUserMedia().then( stream => {
                            this.setupPeerConnection( stream, stream_data.offer );
                        });
                    }
                    if( stream_data.answer ){
                        this.peerConnection.setRemoteDescription( stream_data.answer );
                    }
                    if( stream_data.candidate ){
                        this.peerConnection.addIceCandidate( stream_data.candidate );
                    }
                });
            }
            if( msg.collection === 'VideoChatCallLog'
                && msg.msg === 'added'
                && msg.fields.caller === Meteor.userId() ){
                this.callLog = msg.fields;
                this.stream = new Meteor.Streamer(msg.id);
                this.stream.on('video_message', function(stream_data) {
                    console.log("sender", stream_data)
                    if( stream_data.offer ){
                        navigator.mediaDevices.getUserMedia().then( stream => {
                            this.setupPeerConnection( stream, stream_data.offer );
                        });
                    }
                    if( stream_data.answer ){
                        this.peerConnection.setRemoteDescription( stream_data.answer );
                    }
                    if( stream_data.candidate ){
                        this.peerConnection.addIceCandidate( stream_data.candidate );
                    }
                });
            }
            if (msg.msg == 'changed'
                && msg.collection == 'VideoChatCallLog'
                && msg.fields != undefined){
                const { fields } = msg;
                this.callLog = Object.assign({}, this.callLog, fields);
                if ( fields.status == 'ACCEPTED' && this.caller == Meteor.userId() ){
                    navigator.mediaDevices.getUserMedia().then( stream => {
                        if(this.local)
                            this.local.src = stream.toDataURL();
                        this.setupPeerConnection(stream);
                    }).error( err => {
                        console.log(err);
                    });
                }
            }
        });

    }
    setupPeerConnection( stream, remoteDescription ){
        this.peerConnection = new RTCPeerConnection();
        this.setPeerConnectionCallbacks();
        this.peerConnection.addStream( stream );
        if( remoteDescription )
            this.createTargetSession( remoteDescription );
        else
            this.createCallSession();
    }
    setPeerConnectionCallbacks(){
        this.peerConnection.onicecandidate = function ( event ) {
          if( event.candidate ){
              this.stream.emit( 'video_message', { candidate : event.candidate });
          }
        };
        this.peerConnection.oniceconnectionstatechange = function ( event ) {
          console.log(event);
        };
    }
    createTargetSession( remoteDescription ){
        this.peerConnection.setRemoteDescription( remoteDescription ).then( () => {

        });
        this.peerConnection.createAnswer().then( answer => {
           this.peerConnection.setLocalDescription( answer );
           this.stream.emit( 'video_message', { answer } );
        });
    }
    createCallSession( ){
        this.peerConnection.createOffer().then( offer => {
            this.peerConnection.setLocalDescription( offer );
            this.stream.emit( 'video_message', { offer } );
        }).error( error => {
            console.log( error );
        });
    }
    /**
     * Call allows you to call a remote user using their userId
     * @param _id {string}
     */
    call(_id, local, remote){
        this.local = local;
        this.remote = remote;
        Meteor.call('VideoCallServices/call', _id);
    }

    answerPhoneCall(local, remote){
        this.local = local;
        this.remote = remote;
        Meteor.call('VideoCallServices/answer');
    }

    /**
     * Call allows you to call a remote user using their userId
     * @param _id {string}
     */

    onTargetAccept(){

    }
    onReceivePhoneCall(fields){

    }
}


Meteor.VideoCallServices = new VideoCallServices();