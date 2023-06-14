import { Component, Label, ProgressBar, _decorator, tween } from "cc";

const { ccclass, property, menu } = _decorator;
@ccclass
@menu("Framework/UI/LoadingUI")
export default class LoadingUI extends Component {
    private static _default: LoadingUI;
    public static get Default() { return LoadingUI._default; }

    @property(ProgressBar)
    readonly progressBar: ProgressBar = null;
    @property(Label)
    readonly progressLabel: Label = null;

    protected __preload(): void {
        super.__preload?.();
        LoadingUI._default = this;
    }

    public show(progress: number = 0): void {
        this.node.active = true;
        this.node.alpha = 1;
        this.onProgressChanged(progress);
    }

    public async hide(fadeoutTime?: number) {
        if (fadeoutTime == null || fadeoutTime <= 0) {
            this.node.active = false;
        } else {
            return new Promise<void>((resolve) => {
                tween(this.node).to(fadeoutTime, { "alpha": 0 }).call(() => {
                    this.node.active = false;
                    resolve();
                }).start();
            });
        }
    }

    public onProgressChanged(progress: number, text: string = ""): void {
        this.progressBar.progress = progress;
        if (this.progressLabel != null)
            this.progressLabel.string = `${text}${Math.round(progress * 100)}%`;
    }

    public setProgressText(text: string): void {
        if (this.progressLabel != null)
            this.progressLabel.string = text;
    }
}