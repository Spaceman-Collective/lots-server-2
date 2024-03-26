import { Client } from "colyseus";
import { BattleArenaRoomStateSchema } from "../schema/rooms/BattleArenaRoom";
import { z } from 'zod';
import { plainToInstance } from "class-transformer";
import { ActionSchema } from "../schema/Action";

const TICKS_PER_SQ = 5;
const MoveMsg = z.object({
    targetTile: z.object({
        x: z.number(),
        y: z.number(),
    })
});

export async function move(state: BattleArenaRoomStateSchema, client: Client, msg: any, reqId: string) {
    try {
        const { targetTile } = MoveMsg.parse(msg);
        // Check if Tile Is movable
        if (state.map.getXY(targetTile.x, targetTile.y).movingSpeed < 0) {
            throw new Error("Tile is obstructed!");
        }

        const actor = state.users.get(client.id).actor;
        // Check if distance to tile is 1
        const distance = Math.sqrt(
            Math.pow(targetTile.x - actor.x, 2) +
            Math.pow(targetTile.y - actor.y, 2)
        );
        if (distance > 1.9) {
            //diagonal is 1.4
            throw new Error("Next tile is more than 1 square away.");
        }
        // Calculate next tick and add it to state
        const actorMoveUpdateTick = state.ticks + TICKS_PER_SQ;
        state.addToTickQ(actorMoveUpdateTick, plainToInstance(ActionSchema, {
            actionType: "MOVE",
            reqId,
            clientId: client.id,
            payload: JSON.stringify(msg),
            tickStartedAt: state.ticks.toString(),
            tickEndsAt: actorMoveUpdateTick.toString()
        }))
    } catch (e: any) {
        throw e;
    }
}

export async function resolveMove(state: BattleArenaRoomStateSchema, action: ActionSchema) {
    try {
        const { targetTile } = MoveMsg.parse(JSON.parse(action.payload));
        state.users.get(action.clientId).actor.x = targetTile.x;
        state.users.get(action.clientId).actor.y = targetTile.y;
    } catch (e: any) {
        throw new Error("Couldn't resolve move!")
    }
}