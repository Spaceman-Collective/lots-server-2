import { Room, Client } from "@colyseus/core";
import { BattleArenaRoomStateSchema } from "../schema/rooms/BattleArenaRoom";
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from "jose";
import { plainToInstance } from "class-transformer";
import { UserSchema } from "../schema/User";
import { ActionSchema } from "../schema/Action";
import { move, resolveMove } from "../handlers/move";
import { ArraySchema } from "@colyseus/schema";
import { attack, resolveAttack } from "../handlers/attack";
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
  maxClients = 5;
  patchRate: number = 100; //default is 50ms, we want to match it to tick rate
  autoDispose = false;

  onCreate(options: any) {
    try {
      const msg = CreateRoomMsg.parse(options);
      this.setState(new BattleArenaRoomStateSchema(
        msg.ownerUserName,
        msg.password,
        msg.maxPlayers,
        msg.map
      ));

      this.maxClients = msg.maxPlayers ? msg.maxPlayers : 5;

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
        type: z.enum(["MOVE", "ATTACK", "ITEM"]),
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
                await attack(this.state, client, msg.payload, msg.reqId)
                break;
              case "ITEM":
                break;
            }
          }
        } catch (e: any) {
          console.error(e.message);
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
    // Only process ticks if the game is running
    if (this.state.inLobby) {
      return;
    }
    this.state.ticks += 1;

    // Get the ActionsQ for this Tick and process it
    if (this.state.tickQ.has(this.state.ticks.toString())) {
      const actions = this.state.tickQ.get(this.state.ticks.toString()).actions;
      this.processActionQ(this.state.ticks.toString(), actions);
    }

    // Get the EffectsQ for this Tick and process it

    // if %10 (every second), run the vitals recovery
    if (this.state.ticks % 10 == 0) {
      this.vitalsRecovery();
    }
  }

  async vitalsRecovery() {
    for (let user of this.state.users.entries()) {
      try {
        const newHP = user[1].actor.vitals.health + user[1].actor.vitals.healthRecovery;
        if (newHP > user[1].actor.vitals.healthMax) {
          user[1].actor.vitals.health = user[1].actor.vitals.healthMax;
        } else {
          user[1].actor.vitals.health = newHP;
        }

        const newArmor = user[1].actor.vitals.armor + user[1].actor.vitals.armorRecovery;
        if (newArmor > user[1].actor.vitals.armorMax) {
          user[1].actor.vitals.armor = user[1].actor.vitals.armorMax;
        } else {
          user[1].actor.vitals.armor = newArmor;
        }

        const newShields = user[1].actor.vitals.shields + user[1].actor.vitals.shieldsRecovery;
        if (newShields > user[1].actor.vitals.shieldsMax) {
          user[1].actor.vitals.shields = user[1].actor.vitals.shieldsMax;
        } else {
          user[1].actor.vitals.shields = newShields;
        }

        const newBarrier = user[1].actor.vitals.barrier + user[1].actor.vitals.barrierRecovery;
        if (newBarrier > user[1].actor.vitals.barrierMax) {
          user[1].actor.vitals.barrier = user[1].actor.vitals.barrierMax;
        } else {
          user[1].actor.vitals.barrier = newBarrier;
        }

        const newStamina = user[1].actor.vitals.stamina + user[1].actor.vitals.staminaRecovery;
        if (newStamina > user[1].actor.vitals.staminaMax) {
          user[1].actor.vitals.stamina = user[1].actor.vitals.staminaMax;
        } else {
          user[1].actor.vitals.stamina = newStamina;
        }
      } catch (e: any) {
        this.clients.getById(this.state.usernameToClientId.get(user[1].username)).send("error", JSON.stringify({ error: e.message }))
      }
    }
  }

  async processActionQ(tick: string, actions: ArraySchema<ActionSchema>) {
    for (let action of actions.toArray()) {
      try {
        switch (action.actionType) {
          case "MOVE":
            await resolveMove(this.state, action);
            break;
          case "ATTACK":
            await resolveAttack(this.state, action);
            break;
          case "ITEM":
            break;
        }
        this.state.clientCurrentAction.delete(action.clientId);
        if (this.state.clientBufferedAction.has(action.clientId)) {
          // if there's an action q'd up, add it to current action and process it
          const newAction = this.state.clientBufferedAction.get(action.clientId);
          switch (newAction.actionType) {
            case "MOVE":
              await move(this.state, this.clients.getById(newAction.clientId), JSON.parse(newAction.payload), newAction.reqId);
              break;
            case "ATTACK":
              await attack(this.state, this.clients.getById(newAction.clientId), JSON.parse(newAction.payload), newAction.reqId)
              break;
            case "ITEM":
              break;
          }
          this.state.clientBufferedAction.delete(action.clientId);
        }
        this.state.tickQ.delete(tick);
      } catch (e: any) {
        this.clients.getById(action.clientId).send("error", JSON.stringify({ error: e.message }));
      }
    }
  }

  async onJoin(client: Client, options: any) {
    try {
      const msg = JoinRoomMsg.parse(options);
      // Check room password
      if (this.state.roomOptions.password != "" && msg.password != this.state.roomOptions.password) {
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
      if (!user.clientId.includes("not_logged_in")) {
        throw new Error("User logged in on another session!")
      }

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

      const userInventory = await prisma.userEquipment.findUnique({
        where: {
          username: user.username
        }
      });


      this.state.users.set(client.id, plainToInstance(UserSchema, {
        username: user.username,
        displayName: user.displayName,
        actor: {
          vitals: actor.vitals,
          stats: actor.stats,
          skills: actor.skills,
          inventory: JSON.parse(userInventory.inventory),
          worn: JSON.parse(userInventory.worn),
          isAlive: true,
        }
      }));


      // Reverse look up
      this.state.usernameToClientId.set(user.username, client.id);

      // Set the user client session to this one
      await prisma.user.update({
        where: {
          username: username,
        },
        data: {
          clientId: client.id
        }
      })
    } catch (e: any) {
      console.error(e.message);
      client.send("error", JSON.stringify({ error: e.message }));
      client.leave();
    }
  }

  onLeave(client: Client, consented: boolean) {
    try {
      const userObj = this.state.users.get(client.id);
      // Reset Client ID for user
      prisma.user.update({
        where: {
          username: userObj.username
        },
        data: {
          clientId: "not_logged_in"
        }
      }).then(() => {
        console.log(`${client.id} logged out`);
        this.state.users.delete(client.sessionId);
        this.state.usernameToClientId.delete(userObj.username);
        if (this.clients.length == 0) {
          this.disconnect();
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
