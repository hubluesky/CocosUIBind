import ArrayDatabase from "framework/database/ArrayDatabase";
import { Prototype } from "framework/database/Database";
import { registerDatabase } from "framework/database/DatabaseManager";

export class BuildingPrototype implements Prototype {

    public constructor(readonly prototypeId: number, readonly name: string) { }
}

@registerDatabase()
export default class BuildingDatabase extends ArrayDatabase<BuildingPrototype> {
    protected parseDatabase(): BuildingPrototype[] {
        return [
            new BuildingPrototype(1, "MainBuilding"),
            new BuildingPrototype(2, "Wood"),
            new BuildingPrototype(3, "Ore"),
            new BuildingPrototype(4, "abc"),
        ];
    }
}