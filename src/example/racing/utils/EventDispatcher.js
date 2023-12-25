import { EventEmitter } from 'events';

export default class EventDispatcher {

    static instance=null

    constructor(){
       if(!EventDispatcher.instance){
            EventDispatcher.instance=new EventEmitter()
       }
       this.on=EventDispatcher.instance.on.bind(EventDispatcher.instance);
       this.emit=EventDispatcher.instance.emit.bind(EventDispatcher.instance);
    }
}