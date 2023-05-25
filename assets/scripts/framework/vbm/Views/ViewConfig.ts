export enum ViewShowRule {
    /** 显示时不作处理 */
    None,
    /** 隐藏相同层其它UI */
    HideSameLayerView,
    /** 隐藏低于等于自己层其它UI */
    HideLowLayerView,
    /** 隐藏其它所有UI */
    HideAllView,
}

export enum ViewHideRule {
    /** 被隐藏时不作处理 */
    None,
    /** 被隐藏时保存到UI栈上，当上层UI被隐藏后，会再次从栈上恢复显示 */
    SaveToStack,
    /** 隐藏时销毁资源 */
    DestroyAsset,
    /** 不会被规则隐藏 */
    NotBeHide,
}

export enum ViewLayer {
    /** 背景层，用于背景，或者远景 */
    BackgroundLayer,
    /** 前景层，用于前景 */
    ForegroundLayer,
    /** 普通层，正常全屏类窗口 */
    NormalLayer,
    /** 弹出层，弹出式窗口 */
    PopupLayer,
    /** 顶层，用于MessageBox */
    TopLayer,
    /** 最顶层，用于Tips,引导 */
    MostTopLayer,
}

export default class ViewConfig {
    public readonly layer: number;
    public readonly assetName: string;
    public readonly showRule: ViewShowRule;
    public readonly hideRule: ViewHideRule;

    public constructor(assetName: string, layer: number, showRule: ViewShowRule = ViewShowRule.None, hideRule: ViewHideRule = ViewHideRule.None) {
        this.assetName = assetName;
        this.layer = layer;
        this.showRule = showRule;
        this.hideRule = hideRule;
    }
}