import { StaticAuthProvider } from 'twitch-auth';
import { ChatClient } from 'twitch-chat-client';
import fetch from 'node-fetch';

const clientId = "tnjjsvaj7qyuem2as13e4gjsxwftcd";
const clientSecret = "zhrfat92uyenv1t7ak1gnp2rfgs1vp";
const redirectUrl = "http://localhost:3000/";

const twitch = {
    "access_token": "oa64indhc1gq63z3k1m3s9um6nc40p",
    "expires_in": 14127,
    "refresh_token": "b3qzvptaf6mprqqebztqib7a5xwqdk1tfdf6wiv9t6n2vfrxcm",
    "scope": ["chat:edit", "chat:read"],
    "token_type": "bearer"
}

const eventListeners = {};

export default class Chat {

    constructor() {
        const auth = new StaticAuthProvider(clientId, twitch.access_token);

        const chatClient = new ChatClient(auth, { channels: ['summit1g'] });
        chatClient.connect();

        chatClient.onMessage((channel, user, message) => {
            this.emit('message', {
                channel, user, message
            })
        });
    }

    on(type, callback) {
        if(!eventListeners[type])
            eventListeners[type] = [];

        eventListeners[type].push(callback);
    }

    emit(type, data) {
        for(let callback of eventListeners[type]) {
            callback(data);
        }
    }

}