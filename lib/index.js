//jshint esversion: 6
import {Meteor} from 'meteor/meteor';
import {Client as MeteorClient } from './client';
import {Tracker} from "meteor/tracker";
import Handler from './handler';
import {client as CoreClient} from 'core-rtc';
import RTCFactory from './RTCFactory';



if (Meteor.isClient) {
    console.log("initting")




    const handler = new Handler({
        meteor: Meteor,
        core
    });
    const core = new CoreClient(handler, {
        RTCPeerConnection: window.RTCPeerConnection,
        RTCIceCandidate: window.RTCIceCandidate,
        RTCSessionDescription: window.RTCSessionDescription
    }, new RTCFactory());
    Meteor.VideoCallServices = new MeteorClient({
        meteor:Meteor,
        tracker:Tracker,
        core
    });
    Meteor.VideoCallServices.setOnError = function(onError){
        CoreClient.prototype.onError = onError;
    };

}
