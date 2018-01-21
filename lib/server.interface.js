import { Services } from './server';

const VideoCallServices = {
  checkConnect(callback){
      Services.setCheckConnect(callback);
  },
  setOnError(callback){
      Services.setOnError(callback);
  }
};

export {
    VideoCallServices
};