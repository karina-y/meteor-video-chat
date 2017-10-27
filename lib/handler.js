"use strict";
var Handler = (function () {
    function Handler(_a) {
        var meteor = _a.meteor, core = _a.core, client = _a.client;
        this.meteor = meteor;
        this.core = core;
        this.client = client;
    }
    Handler.prototype.emitIceCandidate = function (iceCandidate) {
        this.meteor.VideoCallServices.stream.emit('video_message', JSON.stringify({ candidate: iceCandidate }));
    };
    Handler.prototype.emitTargetAnswer = function (sessionDescription) {
        this.meteor.VideoCallServices.stream.emit('video_message', JSON.stringify({ answer: sessionDescription }));
    };
    Handler.prototype.onPeerConnectionCreated = function () {
    };
    Handler.prototype.onCallInitialised = function (err) {
    };
    Handler.prototype.call = function (_id, callback) {
        this.meteor.call('VideoCallServices/call', _id, function (err, _id) {
            callback();
        });
    };
    Handler.prototype.endPhoneCall = function (onError) {
        this.meteor.call("VideoCallServices/end", function (err) {
            if (err) {
                onError(err);
            }
        });
    };
    Handler.prototype.answerPhoneCall = function (onError) {
        this.meteor.call('VideoCallServices/answer', function (err) {
            if (err) {
                onError(err);
            }
        });
    };
    Handler.prototype.emitSenderDescription = function (sessionDescription) {
        this.meteor.VideoCallServices.stream.emit('video_message', JSON.stringify({ offer: sessionDescription }));
    };
    Handler.prototype.onReceivePhoneCall = function (fields) {
    };
    return Handler;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Handler;
