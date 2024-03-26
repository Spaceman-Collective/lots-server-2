import { Map, TileSquare } from "../schema/Map";

/**
 * 50x50 map
 */
const map = new Map();
map.setName("default_map");
const defaultTile = new TileSquare();
defaultTile.setMovingSpeed(1);
for (let i = 0; i < 2499; i++) {
    map.tiles.push(defaultTile);
}
map.setWidth(50);
export default map;
