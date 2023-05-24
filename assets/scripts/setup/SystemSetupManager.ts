import Action from "../Extension/Action";
import SetupConfig from "./SetupConfig";

/**
 *  It must a static function
 */
export function RegisterSystemSetup(priority: number) {
    return function (target: Function, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        SystemSetupManager.RegisterSetup(priority, target[propertyKey]);
    };
}

export interface SetupSystem {
    priority: number;
    initFunction: Action<SetupConfig>;
}

export default class SystemSetupManager {
    public static readonly setupSystemFunctions: SetupSystem[] = [];

    public static RegisterSetup(priority: number, initFunction: Action<SetupConfig>): void {
        SystemSetupManager.setupSystemFunctions.push({ priority, initFunction });
    }

    public static Intialize(): void {
        SystemSetupManager.setupSystemFunctions.sort((a, b) => a.priority - b.priority);
    }
}