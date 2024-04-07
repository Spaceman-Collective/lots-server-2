import config from "@colyseus/tools";
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";
import { WebSocketTransport } from "@colyseus/ws-transport";
/**
 * Import your Room files
 */
import { BattleArenaRoom } from "./rooms/BattleArenaRoom";
import { createAccount, login } from "./api/login";
import { selectCharacter, selectSkin } from "./api/selectCharacter";
import { TestRoom } from "./rooms/TestRoom";
import { getUser } from "./api/fetchUser";
import { inventory } from "./api/inventory";

export default config({

    initializeGameServer: (gameServer) => {
        /**
         * Define your room handlers:
         */
        gameServer.define("battlearena", BattleArenaRoom);
        gameServer.define("testroom", TestRoom);
    },

    initializeTransport: function (opts) {
        return new WebSocketTransport({
            ...opts,
            pingInterval: 6000,
            pingMaxRetries: 4,
        });
    },

    initializeExpress: (app) => {
        /**
         * Bind your custom express routes here:
         * Read more: https://expressjs.com/en/starter/basic-routing.html
         */
        app.get("/hello_world", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });

        app.post("/createaccount", async (req, res) => {
            await createAccount(req, res);
        })

        app.post("/login", async (req, res) => {
            await login(req, res);
        })

        app.post("/characters/select", async (req, res) => {
            await selectCharacter(req, res);
        })

        app.post("/skin/select", async (req, res) => {
            await selectSkin(req, res);
        })

        app.post("/characters/get", async (req, res) => {
            await getUser(req, res);
        })

        app.post("/characters/inventory", async (req, res) => {
            await inventory(req, res);
        })

        /**
         * Use @colyseus/playground
         * (It is not recommended to expose this route in a production environment)
         */
        if (process.env.NODE_ENV !== "production") {
            app.use("/", playground);
        }

        /**
         * Use @colyseus/monitor
         * It is recommended to protect this route with a password
         * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
         */
        app.use("/colyseus", monitor());
    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});
