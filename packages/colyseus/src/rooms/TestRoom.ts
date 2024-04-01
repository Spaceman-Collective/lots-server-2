import { Room, Client } from "@colyseus/core";
import { TestRoomState } from "../schema/rooms/TestRoom";

export class TestRoom extends Room<TestRoomState> {
    maxClients = 4;

    onCreate(options: any) {
        this.setState(new TestRoomState());

        this.onMessage("type", (client, message) => {
            //
            // handle "type" message
            //
        });
    }

    onJoin(client: Client, options: any) {
        console.log(client.sessionId, "joined!");
    }

    onLeave(client: Client, consented: boolean) {
        console.log(client.sessionId, "left!");
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }

}