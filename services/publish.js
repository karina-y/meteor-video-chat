import { Meteor } from 'meteor/meteor';
import CallLog from './call_log';
Meteor.publish('VideoChatPublication', function() {
    return CallLog.find({
        $or: [{
            sender: this.userId,
            status:{
                $ne:"FINISHED"
            }
        }, {
            target: this.userId,
            status:{
                $ne:"FINISHED"
            }
        }]
    });
});