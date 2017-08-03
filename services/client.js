class VideoCallServices {
    /**
     * Call allows you to call a remote user using their userId
     * @param _id {string}
     */
    call(_id){
        Meteor.call("VideoCallServices/call", _id);
    }
}


Meteor.VideoCallServices = new VideoCallServices();