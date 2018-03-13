
import { VideoCallServices as MeteorClient } from './lib/client';




import { client as CoreClient } from 'rtcfly';

const AsteroidVideoChatMixin = () =>{
    return {
        init: function(){
            const Meteor = {
              call:this.call  
            };
            this.VideoCallServices = MeteorVideoChat({
                
            });
        }
    }
};


const VideoCallServices = MeteorVideoChat({
    Meteor,
    MeteorClient,
    Tracker,
    CoreClient
});

export {
    VideoCallServices
}
