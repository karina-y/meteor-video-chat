//jshint esversion: 6
Package.describe({
    name: 'elmarti:video-chat',
    version: '2.0.0',
    summary: 'Simple WebRTC Video Chat for your app.',
    git: 'https://github.com/elmarti/meteor-video-chat',
    documentation: 'README.md'
});

Package.onUse(api => {

    Npm.depends({
        "core-rtc": "0.0.2-alpha-18"
    });


    api.versionsFrom('1.5');
    api.use('ecmascript');
    api.use("rocketchat:streamer@0.5.0");
    api.use("mizzao:user-status@0.6.6");
    api.addFiles(['lib/index.js'], "client");
    api.addFiles(['lib/publish.js'], "server");
    api.addFiles(['lib/index.server.js'], 'server');
    api.addFiles(['lib/adapter.js'], "client");
});
