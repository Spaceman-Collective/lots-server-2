import { BattleMap, TileSquare } from "../schema/BattleMap";

/**
 * 50x50 map
 */
const bmap = new BattleMap();
bmap.setName("default_map");
const defaultTile = new TileSquare();
let newTiles: TileSquare[] = [];
defaultTile.setMovingSpeed(1);
for (let i = 0; i < 2499; i++) {
    newTiles.push(null);
}
bmap.setTiles(newTiles);
bmap.setWidth(50);
export default bmap;
