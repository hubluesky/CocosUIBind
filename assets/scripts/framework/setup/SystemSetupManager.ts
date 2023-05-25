import { Action } from "framework/utility/ActionEvent";
import { CustomLoadTask } from "../Loading/LoadingManager";
import SetupConfig from "./SetupConfig";

/**
 * 注册系统启动函数。
 *  It must a static function
 */
export function registerSystemSetup(priority: number) {
    return function (target: Function, propertyKey: string, descriptor: PropertyDescriptor) {
        SystemSetupManager.registerSetup(priority, propertyKey, target[propertyKey]);
    };
}

/** 系统启动统一接口 */
export interface ISetupSystem {
    readonly priority: number;
    readonly name: string;
    readonly initFunction: Action<[SetupConfig]>;
}

/**
 * 系统启动管理器
 */
export default class SystemSetupManager {
    public static readonly setupSystemFunctions: ISetupSystem[] = [];

    public static registerSetup(priority: number, name: string, initFunction: Action<[SetupConfig]>): void {
        SystemSetupManager.setupSystemFunctions.push({ priority, name, initFunction });
    }

    public static initialize(): void {
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