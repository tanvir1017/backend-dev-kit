import { Server } from "socket.io";
class SocketServices {
  private _io: Server;

  constructor() {
    console.log("Init socket server ✨");
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });
  }

  public initListeners() {
    console.log("Init socket listeners...🦻");
    const io = this.io;
    io.on("connect", (socket) => {
      console.log("🔩 New socket connected ", socket.id);

      socket.on("event:message", async ({ message }: { message: string }) => {
        console.log("📩 New message received", message);
      });
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketServices;
