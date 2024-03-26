import { Room, Client } from "@colyseus/core";
import { BattleArenaRoomStateSchema } from "../schema/rooms/BattleArenaRoom";
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from "jose";
import { plainToInstance } from "class-transformer";
import { UserSchema } from "../schema/User";
import { ActionArraySchema, ActionSchema } from "../schema/Action";
import { move, resolveMove } from "../handlers/move";
import { ArraySchema } from "@colyseus/schema";
const prisma = new PrismaClient();

const CreateRoomMsg = z.object({
  maxPlayers: z.number().min(1).max(5).optional(),
  password: z.string().optional(),
  map: z.enum(["DEFAULT"]),
  ownerUserName: z.string(),
  jwt: z.string(),
});

const JoinRoomMsg = z.object({
  jwt: z.string(),
  password: z.string().optional(),
});

export class BattleArenaRoom extends Room<BattleArenaRoomStateSchema> {
  maxClients = 1;
  patchRate: number = 100; //default is 50ms, we want to match it to tick rate

  onCreate(options: any) {
    try {
      const msg = CreateRoomMsg.parse(options);
      this.setState(new BattleArenaRoomStateSchema(
        msg.ownerUserName,
        msg.password,
        msg.maxPlayers,
        msg.map
      ));

      // Sets the tick rate
      this.setSimulationInterval((dt) => this.update(dt), 100);

      this.onMessage("game:state:start", (client, message) => {
        try {
          const userObj = this.state.users.get(client.id);
          if (userObj.username === this.state.roomOptions.ownerUserName) {
            this.state.inLobby = false;
          } else {
            throw new Error("Only the owner may start the room!")
          }
        } catch (e: any) {
          client.send("error", JSON.stringify({ error: e }));
        }
      });

      const CharacterActionMsg = z.object({
        reqId: z.string(),
        type: z.enum(["MOVE", "ATTACK", "CONSUME"]),
        payload: z.any()
      });

      this.onMessage("character:action", async (client, message) => {
        try {
          if (this.state.inLobby) {
            throw new Error("Game not started yet!")
          }

          const msg = CharacterActionMsg.parse(message);
          if (this.state.clientCurrentAction.get(client.id)) {
            this.state.clientBufferedAction.set(client.id, new ActionSchema());
          } else {
            switch (msg.type) {
              case "MOVE":
                await move(this.state, client, msg.payload, msg.reqId);
                break;
              case "ATTACK":
                break;
              case "CONSUME":
                break;
            }
          }
        } catch (e: any) {
          client.send("error", JSON.stringify({ error: e.message }));
        }
      });


      console.log("Room created successfully!")
    } catch (e: any) {
      console.log("Error: ", e.message);
    }
  }

  /**
   * Called every tick
   */
  update(dt: number) {
    this.state.ticks += 1;

    // Get the ActionsQ for this Tick and process it
    if (this.state.tickQ.has(this.state.ticks.toString())) {
      const actions = this.state.tickQ.get(this.state.ticks.toString()).actions;
      this.processActionQ(actions);
    }
  }

  async processActionQ(actions: ArraySchema<ActionSchema>) {
    for (let action of actions.toArray()) {
      switch (action.actionType) {
        case "MOVE":
          await resolveMove(this.state, action);
          break;
        case "ATTACK":
          break;
        case "CONSUME":
          break;
      }
    }
  }

  async onJoin(client: Client, options: any) {
    try {
      const msg = JoinRoomMsg.parse(options);
      // Check room password
      if (this.state.roomOptions.password && msg.password != this.state.roomOptions.password) {
        throw new Error("Wrong Password!")
      }
      // Check max players in a room
      if (this.clients.length + 1 > this.state.roomOptions.maxPlayers) {
        throw new Error("Room is full!")
      }
      // Check they have a JWT signed by the server for the given User
      const { payload } = await jwtVerify(
        msg.jwt,
        new TextEncoder().encode(process.env.SERVER_JWT_KEY)
      )

      // Check to see if the User is logged in on another session
      const username = payload.username as string;
      const user = await prisma.user.findUnique({
        where: { username }
      });
      if (!user) {
        throw new Error("User not found!")
      }
      if (user.clientId !== "") {
        throw new Error("User logged in on another session!")
      }

      // Set the user client session to this one
      await prisma.user.update({
        where: {
          username: username,
        },
        data: {
          clientId: client.id
        }
      })

      // Set the user object in the room state
      const actor = await prisma.userCharacters.findFirst({
        where: {
          username: user.username,
          selected: true
        }
      });
      if (!actor) {
        throw new Error("User doesn't have a character selected");
      }

      this.state.users.set(client.id, plainToInstance(UserSchema, {
        username: user.username,
        displayName: user.displayName,
        actor: {
          vitals: actor.vitals,
          stats: actor.stats,
          skills: actor.skills,
          inventory: actor.inventory,
          worn: actor.worn
        }
      }));

    } catch (e: any) {
      console.log(e.message);
      client.send("error", JSON.stringify({ error: e.message }));
      client.leave();
    }
  }

  async onLeave(client: Client, consented: boolean) {
    try {
      const userObj = this.state.users.get(client.id);
      // Reset Client ID for user
      await prisma.user.update({
        where: {
          username: userObj.username
        },
        data: {
          clientId: ""
        }
      })
    } catch (e: any) {
      client.send("error", JSON.stringify({ error: e }));
    }
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
