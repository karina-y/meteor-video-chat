//jshint esversion: 6
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import CallLog from './call_log';

const streams = {};
const Services = {
    setOnError(callback){
        this.onError = callback; 
    },
    onError(){
        
    },
    destroyOldCalls(meteorUser) {
        CallLog.update({
            $or: [{
                status: {
                    $ne: "FINISHED"
                },
                caller: meteorUser._id
            }, {
                status: {
                    $ne: "FINISHED"
                },
                target: meteorUser._id
            }]

        }, {
            $set: {
                status: "FINISHED"
            }
        });
    },
    initializeCallSession(_id, meteorUser) {
        const oldCalls = CallLog.find({caller: meteorUser._id}).fetch();
        debugger;
        const newCalls = CallLog.find({caller: meteorUser._id}).fetch();
        Services.destroyOldCalls(meteorUser);
        const logId = CallLog.insert({
            status: "NEW",
            target: _id,
            caller: meteorUser._id,
            callerConnectionId: this.connection.id
        });
        streams[logId] = new Meteor.Streamer(logId);
        streams[logId].allowRead('all');
        streams[logId].allowWrite('all');
	    debugger;
        return logId;
    },
    getUser(){
        const meteorUser = Meteor.user();
        if (!meteorUser) {
            const err = new Meteor.Error(403, "USER_NOT_LOGGED_IN");
            this.onError(err);
            throw err;
        }
        return meteorUser;
    },
    /**
     * Call allows you to call a remote user using their userId
     * @param _id {string}
     */
    call(_id, idk) {
	    debugger;
        check(_id, String);
        //Asteroid sends null as a second param
        check(idk, Match.Maybe(null));
        const meteorUser = Services.getUser();
        if (Services.checkConnect(meteorUser._id, _id)) {
            const inCall = CallLog.findOne({
                status: "CONNECTED",
                target: _id
            });
            if (inCall) {
		    debugger;
                const err = new Meteor.Error(500, "TARGET_IN_CALL", inCall);
                this.onError(err, inCall, Meteor.userId());
                throw err;
            }
            else {
		    debugger;
                return Services.initializeCallSession.call(this, _id, meteorUser);
            }
        }
        else {
		debugger;
            Services.connectionNotAllowed(_id, meteorUser);
        }
	    debugger;

    },
    connectionNotAllowed(_id, meteorUser) {
        throw new Meteor.Error(403, "CONNECTION_NOT_ALLOWED", {
            target: meteorUser._id,
            caller: _id
        });
    },
    setCheckConnect(callback){
        this.checkConnect = callback; 
    },
    /**
     * Check if call connection should be permitted
     * @param _id {caller}
     * @param _id {target}
     * @returns boolean
     */
    checkConnect(caller, target) {
        return true;
    },
    /**
     * Answer current phone call
     */
    answer() {
	    debugger;
        const user = Services.getUser();
        const session = CallLog.findOne({
            target: user._id,
            status: 'NEW'
        });
        if (!session) {
            const err = new Meteor.Error(500, 'SESSION_NOT_FOUND', {
                target: user._id
            });
		debugger;
            this.onError(err, undefined, user);
            throw err;
        }

        else {
            CallLog.update({
                _id: session._id
            }, {
                $set: {
                    targetConnectionId: this.connection.id,
                    status: 'ACCEPTED'
                }
            });
        }
	    debugger;
    },
    /**
     * End current phone call
     */
    end() {
        const _id = Meteor.userId();
        CallLog.find({
            $or: [{
                status: {
                    $ne: 'FINISHED'
                },
                target: _id
            }, {
                status: {
                    $ne: 'FINISHED'
                },
                caller: _id
            }]
        }).forEach(call =>
            CallLog.update({
                _id: call._id
            }, {
                $set: {
                    status: 'FINISHED'
                }
            }));
    },
    /**
     * Surveil current phone call, the user who calls this will be able to see the target but the target can't see them 0__0
     */
    creepinOn(_id) {

    	let log = CallLog.findOne({callerConnectionId: this.connection.id});
    	let obj = {
            creepin: "ON",
            creepee: _id    //the person the creep request is being sent TO
	};

    	if (!log) {
    	    log = CallLog.findOne({targetConnectionId: this.connection.id});
        }

    	if (!log || !log.creeper) {
            obj.creeper = Meteor.userId();
	}

        if (log && log.callerConnectionId === this.connection.id) {
            CallLog.update({
                target: _id,
                status: 'ACCEPTED',
                callerConnectionId: this.connection.id,
            }, {
                $set: obj
            });
        } else {
            CallLog.update({
                caller: _id,
                status: 'ACCEPTED',
                targetConnectionId: this.connection.id,
            }, {
                $set: obj
            });
        }
    },
    /**
     *  reestablish communication
     */
    creepinOff(_id) {

        if (CallLog.findOne({callerConnectionId: this.connection.id})) {
            CallLog.update({
                target: _id,
                status: 'ACCEPTED',
                callerConnectionId: this.connection.id,
            }, {
                $set: {
                    creepin: "OFF",
                    creepee: _id
                }
            });
        } else {
            CallLog.update({
                caller: _id,
                status: 'ACCEPTED',
                targetConnectionId: this.connection.id,
            }, {
                $set: {
                    creepin: "OFF",
                    creepee: _id
                }
            });
        }
    },
    ackReject(id){
        check(id, String)
        CallLog.update({
            _id: id,
            caller: Meteor.userId()
        }, {
            $set: {
                status: "FINISHED"
            }
        });
    },
    reject() {
        const user = Meteor.user();
        if (user) {
            CallLog.update({
                target: user._id,
                status: 'NEW'
            }, {
                $set: {
                    status: "REJECTED"
                }
            });
        }
        else {
            const newErr = new Meteor.Error(403, "Could not find user");
            this.onError(newErr);
            throw newErr;
        }
    }
};

export {
    Services
};
