import { check } from 'meteor/check';
import CallLog from './call_log';
class VideoCalLServices {
    /**
     * Call allows you to call a remote user using their userId
     * @param _id {string}
     */
    call(_id){
        check(_id, String);
        const meteorUser = Meteor.user();
        if(!meteorUser)
            throw new Meteor.Error(403, "NOT_LOGGED_IN");
        if(this.checkConnect(meteorUser._id, _id)){
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
                CallLog.insert({
                    status: "NEW",
                    target: _id,
                    caller:meteorUser._id
                });
            }
        }else {
            throw new Meteor.Error(403, "CONNECTION_NOT_ALLOWED")
        }

    }
    /**
     * Check if call connection should be permitted
     * @param _id {caller}
     * @param _id {target}
     * @returns boolean
     */
    checkConnect(caller, target){
        return true;
    }
}
Meteor.methods({

});