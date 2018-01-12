import {IHandler, Message, MessageDirection, MessageType} from 'core-rtc';
export default class Handler implements IHandler {
    private meteor: any;
    private core: any;
    private stream: any;
    private client: any;
    constructor({meteor, core, client}){
        this.meteor = meteor;
        this.core = core;
        this.client = client;
    }


    emitSenderDescription(sessionDescription){
    }
    onReceivePhoneCall(fields: any){

    }

}