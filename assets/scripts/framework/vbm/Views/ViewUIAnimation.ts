import { Animation, Component, _decorator } from "cc";

const { ccclass, property, menu } = _decorator;
@ccclass
@menu("Framework/UI/ViewUIAnimation")
export default class ViewUIAnimation extends Component {
    @property(Animation)
    private uiAnimation: Animation = null;
    @property
    private openingName: string = "Opening";
    @property
    private closeingName: string = "Closeing";

    public get hasShowAnimation() { return !String.isEmptyOrNull(this.openingName); }
    public get hasHideAnimation() { return !String.isEmptyOrNull(this.closeingName); }

    public async showAnimation() {
        return this.playAnimation(this.openingName);
    }

    public async hideAnimation() {
        return this.playAnimation(this.closeingName);
    }

    private async playAnimation(animationName: string) {
        if (String.isEmptyOrNull(animationName)) return;
        this.uiAnimation.stop();
        let animationStatus = this.uiAnimation.play(animationName);
        if (animationStatus == null) return;
        return new Promise<void>(resolve => {
            const onFinished = () => { resolve(); }
            this.uiAnimation.off(Animation.EventType.FINISHED, onFinished);
            this.uiAnimation.once(Animation.EventType.FINISHED, onFinished);
        });
    }
}