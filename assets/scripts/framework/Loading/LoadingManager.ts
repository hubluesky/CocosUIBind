import { Asset, director, resources } from "cc";

export enum LoadUrlType {
    /** 本地资源 */
    LocalAsset,
    /** 本地资源目录 */
    LocalAssetDir,
    /** 远程资源 */
    RemoteAsset,
    /** 子包资源 */
    Subpackage,
    /** 场景资源 */
    Scene,
    /** 自定义资源 */
    Custom,
    /** 本地缓存资源，即使用AssetManager加载资源 */
    LocalCachAsset,
    /** 远程缓存资源，即使用AssetManager加载资源  */
    RemoteCachAsset,
}

export interface ILoadResult {
    error: Error | string;
    asset?: any;
}

export interface ILoadTask {
    /** 资源路径，可以是远程文件路径，也可以是本地文件路径 */
    url: string;
    /** 资源自动释放 */
    autoRelease?: boolean;
    /** 资源路径类型 */
    urlType: LoadUrlType;
    /** 资源类型 */
    assetType?: typeof Asset;
    /** 自定义资源加载 */
    loadCustomAsset?: (onCompleted: (task: ILoadResult) => void) => void;
    /** 资源加载成功回调，失败不会回调 */
    onSuccessCompleted?: (task: ILoadTask, asset: any, urls?: string[]) => void;
}

export class CustomLoadTask implements ILoadTask {
    public readonly url: string = null;
    public readonly urlType: LoadUrlType = LoadUrlType.Custom;
    public readonly loadCustomAsset: (onCompleted: (task: ILoadResult) => void) => void;
    public readonly onSuccessCompleted: (task: ILoadTask, asset: any, urls?: string[]) => void;

    public constructor(customFunction: () => Promise<ILoadResult | void> | void, onSuccessCompleted?: (task: ILoadTask, asset: any, urls?: string[]) => void) {
        this.loadCustomAsset = async (onCompleted) => {
            let result = customFunction();
            let loadResult: ILoadResult = (result instanceof Promise ? await result : null) || { error: null };
            onCompleted(loadResult);
        };
        this.onSuccessCompleted = onSuccessCompleted;
    }
}

// export class LoadTask<T extends Asset> implements ILoadTask {
//     public readonly url: string;
//     public readonly urlType: LoadUrlType;
//     public readonly assetType: typeof Asset;
//     public readonly onSuccessCompleted: (asset: T) => void;

//     public constructor(url: string, urlType: LoadUrlType, assetType: typeof Asset, onCompleted?: (asset: T) => void) {
//         this.url = url;
//         this.urlType = urlType;
//         this.onCompleted = onCompleted;
//         this.assetType = assetType;
//     }
// }

export default class LoadingManager {
    public static readonly Default = new LoadingManager();
    private onProgressChanged: (progress: number) => void;
    private onCompleteFunc: (wasError: boolean) => void;
    private taskCount: number = 0;
    private completedCount: number = 0;
    private isError: boolean = false;

    /**
     * 开始加载
     * @param completeFunc 完成函数回调
     * @param progressFunc 进度函数回调
     * @param taskList 任务队列
     */
    public run(completeFunc: (wasError: boolean) => void, progressFunc: (progress: number) => void, ...taskList: ILoadTask[]): void {
        this.onCompleteFunc = completeFunc;
        this.onProgressChanged = progressFunc;
        this.runBackground(...taskList);
    }

    /**
     * 开始后台加载，如果后台未加载完成就开始新的加载，则新的加载会和后台加载一起完成。
     * @param taskList 任务队列
     */
    public runBackground(...taskList: ILoadTask[]): void {
        this.taskCount += taskList.length;
        for (let task of taskList) {
            this.loadingTask(task, this.onLoadingCompleted.bind(this));
        }
    }

    /**
     * 开始加载，按顺序一个一个加载
     * @param completeFunc 完成函数回调
     * @param progressFunc 进度函数回调
     * @param taskList 任务队列
     */
    public runOrder(completeFunc: (wasError: boolean) => void, progressFunc: (progress: number) => void, ...taskList: ILoadTask[]): void {
        this.onProgressChanged = progressFunc;
        this.onCompleteFunc = completeFunc;
        this.runOrderBackground(...taskList);
    }

    /**
     * 开始后台顺序加载，如果后台未加载完成就开始新的加载，则新的加载会和后台加载一起完成。
     * @param taskList 任务队列
     */
    public runOrderBackground(...taskList: ILoadTask[]): void {
        this.taskCount += taskList.length;
        this.loadingTaskOrder(taskList);
    }

    private async loadingTaskOrder(taskList: ILoadTask[]) {
        for (let task of taskList) {
            await new Promise<void>((resolve) => {
                this.loadingTask(task, (task: ILoadTask, error: Error | string, asset: any) => {
                    this.onLoadingCompleted(task, error, asset);
                    resolve();
                });
            });
        }
    }

    private loadingTask(task: ILoadTask, onCompleted: (task: ILoadTask, error: Error | string, asset?: any) => void): void {
        switch (task.urlType) {
            case LoadUrlType.LocalAsset:
                resources.load(task.url, task.assetType, null, (error, asset) => onCompleted(task, error, asset));
                break;
            case LoadUrlType.LocalAssetDir:
                resources.loadDir(task.url, task.assetType, null, (error, assets) => onCompleted(task, error, assets));
                break;
            case LoadUrlType.RemoteAsset:
                // loader.load({ url: task.url, type: typeof task.assetType }, (error, asset) => onCompleted(task, error, asset));
                break;
            case LoadUrlType.Subpackage:
                // try {
                //     loader.downloader.loadSubpackage(task.url, (error) => {
                //         onCompleted(task, error);
                //     });
                // } catch (error) {
                //     onCompleted(task, error);
                // }
                break;
            case LoadUrlType.Scene: {
                let progressScale: number = 1 / this.taskCount / 100;
                director.preloadScene(task.url, (progressCount, totalCount) => {
                    let progress = progressCount / totalCount;
                    this.callProgressChanged(this.completedCount / this.taskCount + progress * progressScale);
                }, (error, asset) => {
                    onCompleted(task, error, asset);
                });
                break;
            }
            case LoadUrlType.Custom:
                task.loadCustomAsset((result) => onCompleted(task, result.error, result.asset));
                break;
        }
    }

    private callProgressChanged(progress: number): void {
        if (this.onProgressChanged) this.onProgressChanged(progress);
    }

    private onLoadingCompleted(task: ILoadTask, error: Error | string, asset: any, urls?: string[]): void {
        this.completedCount++;
        this.callProgressChanged(this.completedCount / this.taskCount);
        if (error) {
            this.isError = true;
            console.warn("Load asset failed", task, error);
        } else if (task.onSuccessCompleted) {
            task.onSuccessCompleted(task, asset, urls);
            if (task.autoRelease) {
                switch (task.urlType) {
                    case LoadUrlType.LocalAsset:
                        // loader.releaseRes(task.url);
                        break;
                    case LoadUrlType.LocalAssetDir:
                        // loader.releaseResDir(task.url);
                        break;
                }
            }
        }
        if (this.completedCount >= this.taskCount) {
            let wasError = this.isError;
            this.completedCount = 0;
            this.taskCount = 0;
            this.isError = false;
            if (this.onCompleteFunc) this.onCompleteFunc(wasError);
        }
    }
}