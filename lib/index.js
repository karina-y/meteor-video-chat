//jshint esversion: 6
import { Meteor } from 'meteor/meteor';
import { Client as MeteorClient } from './client';
import { Tracker } from "meteor/tracker";
import Handler from './handler';
import { client as CoreClient } from 'rtcfly';
import RTCFactory from './RTCFactory';



if (Meteor.isClient) {
    const core = new CoreClient({});
    core.on('emitIceCandidate', iceCandidate =>
        Meteor.VideoCallServices.stream.emit('video_message', JSON.stringify({ candidate: iceCandidate }))
    );
    core.on('emitTargetAnswer', answer =>
        Meteor.VideoCallServices.stream.emit('video_message', JSON.stringify({ answer }))
    );
    core.on('peerConnectionCreated', () =>
        console.log("peerConnectionCreated")
    );
    core.on('callInitialized', (params) =>
        Meteor.call('VideoCallServices/call', params.id,
            (err, _id) => {})
    );
    core.on('endPhoneCall', () => {
        Meteor.call("VideoCallServices/end", err => {
            if (err) {
                core.events.callEvent('error')(err);
            } else {
                Meteor.VideoCallServices.onTerminateCall();
            }
        });
    });
    core.on('answerPhoneCall', () => {
        Meteor.call('VideoCallServices/answer', err => {
            if (err) {
                core.events.callEvent("error")(err);
            }
        });
    });
    core.on('emitSenderDescription', sessionDescription =>
        Meteor.VideoCallServices.stream.emit('video_message', JSON.stringify({ offer: sessionDescription }))
    );
    core.on('error', err => console.log("error", err));
    Meteor.VideoCallServices = new MeteorClient({
        meteor: Meteor,
        tracker: Tracker,
        core
    });
    core.on('recievePhoneCall', Meteor.VideoCallServices.onReceivePhoneCall);
    core.init({
        iceServers: [
            { url: 'stun:stun.l.google.com:19302' }
        ]
    });
    Meteor.VideoCallServices.setOnError = function(onError) {
        CoreClient.prototype.onError = onError;
    };

}
