"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventEmitter = void 0;
exports.createWebSocketServer = createWebSocketServer;
// src/websocket.ts
const ws_1 = require("ws");
const events_1 = require("events");
const eventEmitter = new events_1.EventEmitter();
exports.eventEmitter = eventEmitter;
function createWebSocketServer(httpServer) {
    const wss = new ws_1.Server({ server: httpServer });
    wss.on("connection", (ws) => {
        console.log("WebSocket connection established");
        ws.on("message", (message) => {
            const parsedMessage = JSON.parse(message.toString());
            if (parsedMessage.type === "subscribe") {
                const event = parsedMessage.event;
                const listener = (data) => {
                    ws.send(JSON.stringify({ type: "event", event, data }));
                };
                eventEmitter.on(event, listener);
                ws.on("close", () => {
                    eventEmitter.removeListener(event, listener);
                });
            }
        });
        ws.on("close", () => {
            console.log("WebSocket connection closed");
        });
    });
    return wss;
}
