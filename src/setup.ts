import { Server } from "socket.io";
import http from "node:http";

export const setupSocket = (app) => {
    const server = http.createServer(app);
    const socket = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL,
      },
    });
    socket.on("connection", (client) => {
      client.on("event", (data) => {
        console.log("socket connection ", data);
      });
      client.on("disconnect", (reason) => {
        console.log(reason);
      });
    });
  
    return [socket, server];
  };