import { Tracker } from 'meteor/tracker';
class VideoCallServices {
    RTCConfiguration = {};
    constructor(){
        this.iceCandidates = [];
        Tracker.autorun(()=>{
            this.sub = Meteor.subscribe('VideoChatPublication');
            console.log("vid chat pub")
        });
        let callLog;
        Meteor.connection._stream.on('message', (msg) => {

            msg = JSON.parse(msg);
            if( msg.collection === 'VideoChatCallLog'
            && msg.msg === 'removed'){
                this.onTerminateCall();
            }
            if( msg.collection === 'VideoChatCallLog'
                && msg.msg === 'added'
                && msg.fields.target === Meteor.userId()
            && msg.fields.status == "NEW"){
                console.log("added", msg)
                callLog = msg.fields;
                this.stream = new Meteor.Streamer(msg.id);
                this.stream.on('video_message', (stream_data) => {
                    console.log("target", stream_data)
                    if( typeof stream_data == "string")
                        stream_data = JSON.parse(stream_data);
                    if( stream_data.offer ){
                        console.log("got offer")
                        navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then( stream => {
                            if(this.localVideo)
                                this.localVideo.src = URL.createObjectURL(stream);
                            this.setupPeerConnection( stream, stream_data.offer );
                        });
                    }
                    if( stream_data.candidate ){
                        if(this.peerConnection)
                            this.peerConnection.addIceCandidate( JSON.parse(stream_data.candidate) );
                        else this.iceCandidates.push(JSON.parse(stream_data.candidate));
                    }
                });
                this.onReceivePhoneCall(msg.id);
            }
            if( msg.collection === 'VideoChatCallLog'
                && msg.msg === 'added'
                && msg.fields.caller === Meteor.userId()
            && msg.fields.status === 'NEW'){
                callLog = msg.fields;
            }
            if (msg.msg == 'changed'
                && msg.collection == 'VideoChatCallLog'
                && msg.fields != undefined){
                const { fields } = msg;
                if ( fields.status == 'ACCEPTED' && callLog.caller == Meteor.userId() ){
                    this.onTargetAccept();
                    navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then( stream => {
                        if(this.localVideo)
                            this.localVideo.src = URL.createObjectURL(stream);
                        this.setupPeerConnection(stream);
                    });
                }
            }
        });

    }
    setupPeerConnection( stream, remoteDescription ){
        console.log("setup peer connection", stream, remoteDescription)
        this.peerConnection = new RTCPeerConnection(this.RTCConfiguration);
        this.onPeerConnectionCreated();
        this.setPeerConnectionCallbacks();
        this.peerConnection.addStream( stream );
        if( remoteDescription )
            this.createTargetSession( remoteDescription );
        else
            this.createCallSession();
    }
    setPeerConnectionCallbacks(){
        this.peerConnection.onicecandidate =  ( event ) => {
          if( event.candidate ){
              this.stream.emit( 'video_message', { candidate : JSON.stringify(event.candidate) });
          }
        };
        this.peerConnection.oniceconnectionstatechange =  ( event ) => {
          console.log(event);
        };
        this.peerConnection.onaddstream = function( stream ) {
            console.log("got remote stream", stream);
            if(this.remoteVideo)
          this.remoteVideo.src = URL.createObjectURL(stream.stream);
        }.bind(this);
    }
    createTargetSession( remoteDescription ){
        const { iceCandidates } = this;
        console.log("dave", iceCandidates)
        this.iceCandidates = [];
        let i ;
        for (i = 0; i< iceCandidates.length; i++)
            this.peerConnection.addIceCandidate(iceCandidates[i]);

        this.peerConnection.setRemoteDescription( remoteDescription ).then( () => {

            this.peerConnection.createAnswer().then( answer => {
                this.peerConnection.setLocalDescription( answer );
                this.stream.emit( 'video_message', JSON.stringify({ answer }) );
            });
        });

    }
    createCallSession( ){
        this.peerConnection.createOffer().then( offer => {
            this.peerConnection.setLocalDescription( offer );
            this.stream.emit( 'video_message', JSON.stringify({ offer }) );
        });
    }
    /**
     * Call allows you to call a remote user using their userId
     * @param _id {string}
     */
    call(_id, local, remote) {
        if (local)
            this.localVideo = local;
        if (remote)
            this.remoteVideo = remote;
        Meteor.call('VideoCallServices/call', _id, ( err, _id )=>{
            this.stream = new Meteor.Streamer(_id);
            this.stream.on('video_message', (stream_data) => {
                if(typeof stream_data == 'string')
                    stream_data = JSON.parse(stream_data);
                console.log("sender", stream_data)
                if( stream_data.answer ){
                    this.peerConnection.setRemoteDescription( stream_data.answer );
                }
                if( stream_data.candidate ){
                    this.peerConnection.addIceCandidate( JSON.parse(stream_data.candidate) );
                }
            });
        });
    }

    answerPhoneCall(local, remote){
        if (local)
            this.localVideo = local;
        if (remote)
            this.remoteVideo = remote;
        Meteor.call('VideoCallServices/answer');
    }
    endPhoneCall(){
        Meteor.call("VideoCallServices/end");
    }

    /**
     * Call allows you to call a remote user using their userId
     * @param _id {string}
     */

    onTargetAccept(){

    }
    onReceivePhoneCall(fields){

    }
    onTerminateCall(){

    }
    onPeerConnectionCreated(){

    }
}


Meteor.VideoCallServices = new VideoCallServices();