import ArrayDatabase from "framework/database/ArrayDatabase";
import { Prototype } from "framework/database/Database";
import { registerDatabase } from "framework/database/DatabaseManager";

export class BuildingPrototype implements Prototype {

    public constructor(readonly prototypeId: number, readonly name: string, readonly iconPath:string) { }
}

const iconPath = "icons/checker/spriteFrame";

@registerDatabase()
export default class BuildingDatabase extends ArrayDatabase<BuildingPrototype> {
    protected parseDatabase(): BuildingPrototype[] {
        return [
            new BuildingPrototype(1, "MainBuilding", iconPath),
            new BuildingPrototype(2, "Wood", iconPath),
            new BuildingPrototype(3, "Ore", iconPath),
            new BuildingPrototype(4, "abc", iconPath),
            new BuildingPrototype(5, "def", iconPath),
            new BuildingPrototype(6, "gth", iconPath),
            new BuildingPrototype(7, "xyz", iconPath),
        ];
    }
}