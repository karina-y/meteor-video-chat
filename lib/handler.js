"use strict";
var core_rtc_1 = require('core-rtc');
var Handler = (function () {
    function Handler(_a) {
        var meteor = _a.meteor, core = _a.core;
        this.meteor = meteor;
        this.core = core;
    }
    Handler.prototype.emitIceCandidate = function (iceCandidate) {
        this.stream.emit('video_message', JSON.stringify({ candidate: iceCandidate }));
    };
    Handler.prototype.emitTargetAnswer = function (sessionDescription) {
        this.stream.emit('video_message', JSON.stringify({ answer: sessionDescription }));
    };
    Handler.prototype.onPeerConnectionCreated = function () {
    };
    Handler.prototype.onCallInitialised = function (err) {
    };
    Handler.prototype.call = function (_id, callback) {
        var _this = this;
        this.meteor.call('VideoCallServices/call', _id, function (err, _id) {
            _this.stream = new _this.meteor.Streamer(_id);
            _this.stream.on('video_message', function (streamData) {
                if (typeof streamData === 'string') {
                    streamData = JSON.parse(streamData);
                }
                if (streamData.answer) {
                    var message = {
                        data: streamData.answer,
                        Direction: core_rtc_1.MessageDirection.Sender,
                        Type: core_rtc_1.MessageType.SessionDescription
                    };
                    _this.core.handleSenderStream(message);
                }
            });
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
        this.stream.emit('video_message', JSON.stringify({ offer: sessionDescription }));
    };
    Handler.prototype.onReceivePhoneCall = function (fields) {
    };
    return Handler;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Handler;
