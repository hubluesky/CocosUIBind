import { Action } from "framework/utility/ActionEvent";
import { CustomLoadTask } from "../Loading/LoadingManager";
import SetupConfig from "./SetupConfig";

/**
 *  It must a static function
 */
export function RegisterSystemSetup(priority: number) {
    return function (target: Function, propertyKey: string, descriptor: PropertyDescriptor) {
        SystemSetupManager.RegisterSetup(priority, propertyKey, target[propertyKey]);
    };
}

export interface SetupSystem {
    readonly priority: number;
    readonly name: string;
    readonly initFunction: Action<[SetupConfig]>;
}

export default class SystemSetupManager {
    public static readonly setupSystemFunctions: SetupSystem[] = [];

    public static RegisterSetup(priority: number, name: string, initFunction: Action<[SetupConfig]>): void {
        SystemSetupManager.setupSystemFunctions.push({ priority, name, initFunction });
    }

    public static Intialize(): void {
        SystemSetupManager.setupSystemFunctions.sort((a, b) => a.priority - b.priority);
    }

    public static getSystemSetupTasks(config: SetupConfig): readonly CustomLoadTask[] {
        const systemsLoadTask: CustomLoadTask[] = [];
        for (const system of SystemSetupManager.setupSystemFunctions) {
            systemsLoadTask.push(new CustomLoadTask(system.initFunction.bind(null, config)));
        }
        return systemsLoadTask;
    }
}