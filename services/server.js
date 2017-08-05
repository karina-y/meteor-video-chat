import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import CallLog from './call_log';
Meteor.users.find({ "status.online": true }).observe({
    removed: function({_id}) {
        console.log('removed', _id)
        CallLog.find({
            $or:[{
                status:{
                    $ne:'FINISHED'
                },
                target:_id
            },{
                status:{
                    $ne:'FINISHED'
                },
                caller:_id
            }]
        }).forEach( call =>
            CallLog.update({
                _id:call._id
            },{
                $set:{
                    status:'FINISHED'
                }
            }));
    }
});
const streams = {};
const services = {
    /**
     * Call allows you to call a remote user using their userId
     * @param _id {string}
     */
    call(_id){
        check(_id, String);
        const meteorUser = Meteor.user();
        if(!meteorUser)
            throw new Meteor.Error(403, "NOT_LOGGED_IN");
        if(services.checkConnect(meteorUser._id, _id)){
            const inCall =  CallLog.findOne({
                status:"CONNECTED",
                target:_id
            });
            if (inCall)
                throw new Meteor.Error(500, "TARGET_IN_CALL");
            else {
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
                const logId = CallLog.insert({
                    status: "NEW",
                    target: _id,
                    caller:meteorUser._id
                });
               streams[logId] = new Meteor.Streamer(logId);
                streams[logId].allowRead('all');
                streams[logId].allowWrite('all');
               return logId;
            }
        } else {
            throw new Meteor.Error(403, "CONNECTION_NOT_ALLOWED")
        }

    },
    /**
     * Check if call connection should be permitted
     * @param _id {caller}
     * @param _id {target}
     * @returns boolean
     */
    checkConnect(caller, target){
        return true;
    },
    answer(){
        const user = Meteor.user();
        if(!user)
            throw new Meteor.Error(403, "User not logged in");
        const session = CallLog.findOne({
           target : user._id,
            status : 'NEW'
        });
        if (!session)
            throw new Meteor.Error(500, 'SESSION_NOT_FOUND');
        else {
            CallLog.update({
                _id : session._id
            }, {
                $set : {
                    status : 'ACCEPTED'
                }
            });
        }
    },
    end(){
        const _id = Meteor.userId();
        CallLog.find({
            $or:[{
                status:{
                    $ne:'FINISHED'
                },
                target:_id
            },{
                status:{
                    $ne:'FINISHED'
                },
                caller:_id
            }]
        }).forEach( call =>
            CallLog.update({
                _id:call._id
            },{
                $set:{
                    status:'FINISHED'
                }
            }));
    }

}
Meteor.methods({
    'VideoCallServices/call' : services.call,
    'VideoCallServices/answer' : services.answer,
    'VideoCallServices/end' : services.end
});