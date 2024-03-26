import { Schema, ArraySchema, type } from "@colyseus/schema";

export class TileSquare extends Schema {
    @type("float32") movingSpeed: number;

    public setMovingSpeed(movingSpeed: number) {
        this.movingSpeed = movingSpeed;
    }
}

export class Map extends Schema {
    @type("string") name: string;
    @type([TileSquare]) tiles = new ArraySchema<TileSquare>();
    @type("number") width: number;

    //i = x + width*y;
    //x = i % width;    // % is the "modulo operator", the remainder of i / width;
    //y = i / width;    // where "/" is an integer division

    public setName(name: string) {
        this.name = name;
    }

    public setTiles(tiles: TileSquare[]) {
        this.tiles = new ArraySchema<TileSquare>(...tiles);
    }

    public setWidth(width: number) {
        this.width = width;
    }

    public getXY(x: number, y: number): TileSquare {
        return this.tiles.at(x + this.width * y);
    }

    public setXY(x: number, y: number, tile: TileSquare): TileSquare[] {
        this.tiles.setAt(x + this.width * y, tile);
        return this.tiles;
    }
}
//array1d = [ a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y ]
//array2d with width 5
/*
a b c d e
f g h i j
k l m n o
p q r s t
u v w x y
*/
