import Database from "./Database";

export function RegisterDatabase(assetName?: string): Function {
    return function (target: Function) {
        if (!Database.isPrototypeOf(target))
            throw new Error(`Register database can only be used on a Database class.`);
        DatabaseManager.RegisterType(target, assetName);
    }
}

type Type<T extends Database> = { prototype: T };
type TypeDatabase = Type<Database>;

export default class DatabaseManager {
    private static typeMap = new Map<TypeDatabase, string>();
    private static databaseMap = new Map<TypeDatabase, Database>();
    private static _assetPath: string;
    public static get assetPath() { return DatabaseManager._assetPath; }

    public static RegisterType(type: TypeDatabase, assetName: string): void {
        if (DatabaseManager.typeMap.has(type))
            throw new Error(`Register database type ${type} has exist.`);
        DatabaseManager.typeMap.set(type, assetName);
    }

    public static async Initialized(assetPath: string) {
        DatabaseManager._assetPath = assetPath;
        let values = Array.from(DatabaseManager.typeMap.entries());
        for (let entry of values) {
            if (DatabaseManager.databaseMap.has(entry[0])) continue;
            let database = DatabaseManager.CreateDatabase(entry[0]);
            await database.Initialize(entry[1] ? DatabaseManager.assetPath + entry[1] : null);
        }
    }

    public static CreateDatabase<T extends Database>(type: Type<T>): T {
        let database = Object.createInstance<T>(type.prototype);
        DatabaseManager.databaseMap.set(type, database);
        return database;
    }

    public static Get<T extends Database>(type: { prototype: T }): T {
        return DatabaseManager.databaseMap.get(type) as T;
    }

    public static async GetOrCreate<T extends Database>(type: Type<T>): Promise<T> {
        let database = DatabaseManager.databaseMap.get(type) as T;
        if (database != null) return database;
        let assetName = DatabaseManager.typeMap.get(type);
        database = DatabaseManager.CreateDatabase(type);
        await database.Initialize(assetName ? DatabaseManager.assetPath + assetName : null);
        return database;
    }

    public static GetOrCreateSync<T extends Database>(type: Type<T>): T {
        let database = DatabaseManager.databaseMap.get(type) as T;
        if (database != null) return database;
        let assetName = DatabaseManager.typeMap.get(type);
        database = DatabaseManager.CreateDatabase(type);
        database.Initialize(assetName ? DatabaseManager.assetPath + assetName : null);
        return database;
    }
}