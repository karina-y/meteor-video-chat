# Meteor Video Chat
This extension allows you to implement user-to-user video calling in React, Angular and Blaze.


[Example](https://meteorvideochat.herokuapp.com) - Click register to create a user

[![Stories in Ready](https://badge.waffle.io/elmarti/meteor-video-chat.svg?label=ready&title=Ready)](http://waffle.io/elmarti/meteor-video-chat)
[![Travis CI](https://travis-ci.org/elmarti/meteor-video-chat.svg?branch=master)](https://travis-ci.org/elmarti/meteor-video-chat)
## Configuration
Here you can set the [RTCConfiguration](https://developer.mozilla.org/en-US/docs/Web/API/RTCConfiguration). If you are testing outside of a LAN, you'll need to procure some [STUN & TURN](https://gist.github.com/yetithefoot/7592580) servers.

```
Meteor.VideoCallServices.RTCConfiguration = [{'iceServers': [{
    'urls': 'stun:stun.example.org'
  }]
}];
```
####Calling a user
To call a user, call the following method with their _id, the local video element/ react ref and the target video/react ref.
```
Meteor.VideoCallServices.call(tartUserId, this.refs.caller, this.refs.target);
```
####Deciding who can connect to whom
The follow method can be overridden on the server side to implement some kind of filtering. Returning `false` will cancel the call, and `true` will allow it to go ahead.
```
Meteor.VideoCallServices.checkConnect = function(caller, target){
return *can caller and target call each other"
};
```
####Answering a call
The first step is to handle the onReceivePhoneCall callback and then to accept the call. The answerPhoneCall method accepts the local video and the target video.
```
 Meteor.VideoCallServices.onReceivePhoneCall = (userId) => {
Meteor.VideoCallServices.answerPhoneCall(this.refs.caller, this.refs.target);
        };

```
####Ending phone call
Simply call
```
Meteor.VideoCallServices.end();
```
####Other events
The following method is invoked when the callee accepts the phone call.
```
Meteor.VideoCallServices.onTargetAccept = () => {
}
```
The following method is invoked when either user ends the call
```
Meteor.VideoCallServices.onTerminateCall = () => {
}
```

Current issues:
- Cross browser compatibility not checked

Cross browser won't be a problem when I get to test with BrowserStack



[![BrowserStack](https://www.browserstack.com/images/layout/browserstack-logo-600x315.png)](https://www.browserstack.com/)