import { Node, Widget } from "cc";
import NodePool from "framework/asset/NodePool";
import ActionEvent, { Func } from "framework/utility/ActionEvent";
import IViewController, { OnSetParamsName } from "./IViewController";
import ViewConfig, { ViewHideRule, ViewLayer, ViewShowRule } from "./ViewConfig";

type ViewType = IViewController;

interface LayerData {
    layer: number;
    layerNode: Node;
    viewList: ViewType[];
}

interface CreateViewType {
    <T extends ViewType>(type: { prototype: T; } | string): T;
}

export default class ViewUIManager {
    private static _viewRoot: Node;
    public static get viewRoot() { return ViewUIManager._viewRoot; }
    private static _viewAssetPath: string;
    public static get viewAssetPath() { return ViewUIManager._viewAssetPath; }
    protected static viewTypeMap = new Map<any, ViewConfig>();
    protected static viewMap = new Map<any, ViewType>();
    protected static viewLayerList = new Array<LayerData>();
    protected static viewShowStackMap = new Map<number, ViewType[]>();
    public static readonly onShowViewEvent = new ActionEvent<[ViewType, boolean]>();
    private static createViewFunc: CreateViewType;

    public static Initialize(viewRoot: Node, createViewFunc: CreateViewType, viewAssetPath: string = "Prefabs/UI/", layers: number[] = ViewUIManager.enumToLayers(ViewLayer)): void {
        ViewUIManager._viewRoot = viewRoot;
        ViewUIManager._viewAssetPath = viewAssetPath;
        ViewUIManager.createViewFunc = createViewFunc;

        for (let layerValue of layers) {
            let layerNode = ViewUIManager.createLayerNode(`${layerValue}`);
            viewRoot.addChild(layerNode);
            ViewUIManager.viewLayerList.push({ layer: layerValue, layerNode: layerNode, viewList: [] });
        }
    }

    public static enumToLayers(layerType: Object): number[] {
        let layers = new Array<number>();
        for (let key of Object.keys(layerType))
            layers.push(layerType[key]);
        return layers;
    }

    private static createLayerNode(name: string): Node {
        let layerNode = new Node(name);
        let widget = layerNode.addComponent(Widget);
        widget.isAlignTop = true;
        widget.isAlignBottom = true;
        widget.isAlignLeft = true;
        widget.isAlignRight = true;
        return layerNode;
    }

    public static getLayerNode(layer: number): Node {
        let layerData = ViewUIManager.viewLayerList.find((x) => x.layer == layer);
        return layerData ? layerData.layerNode : null;
    }

    public static async createAsset(viewConfig: ViewConfig): Promise<Node> {
        let layerData = ViewUIManager.viewLayerList.find((x) => x.layer == viewConfig.layer);
        if (layerData == null)
            throw new Error(`CreateAsset failed. view layer ${viewConfig.layer} has not exist.`);
        return ViewUIManager.createNodeAsset(viewConfig.assetName, layerData.layerNode);
    }

    public static async createNodeAsset(assetName: string, parent: Node): Promise<Node> {
        const uiNode = await NodePool.createNode(ViewUIManager.viewAssetPath + assetName);
        parent.addChild(uiNode);
        return uiNode;
    }

    public static registerType<T extends ViewType>(type: { prototype: T; } | string, assetName: string, layer: number, showRule: ViewShowRule, hideRule: ViewHideRule): void {
        if (ViewUIManager.viewTypeMap.has(type))
            throw new Error(`Register view type ${type} has exist.`);
        ViewUIManager.viewTypeMap.set(type, new ViewConfig(assetName, layer, showRule, hideRule));
    }

    public static cetDeriveType<T extends ViewType>(baseType: { prototype: T; }): { prototype: T, new(); } {
        for (let entiry of ViewUIManager.viewTypeMap) {
            let type = entiry[0];
            if (baseType.isPrototypeOf(type)) return type;
        }
    }

    public static getViewConfig<T extends ViewType>(type: { prototype: T; } | string): ViewConfig {
        return ViewUIManager.viewTypeMap.get(type);
    }

    public static async loadView<T extends ViewType>(type: { prototype: T, new(); } | string): Promise<T> {
        let view = ViewUIManager.getOrCreateView(type);
        await view.createAsset();
        view.viewNode.active = false;
        return view;
    }

    public static createView<T extends ViewType>(type: { prototype: T, new(); } | string): T {
        if (ViewUIManager.viewMap.has(type))
            throw new Error("Create view failed! The uniqueId had contains " + type);
        let view: T = ViewUIManager.createViewFunc(type);
        view.setViewConfig(ViewUIManager.getViewConfig(type));
        ViewUIManager.setView(type, view);
        return view;
    }

    public static getTopVisableView(filter?: Func<boolean, [ViewType]>): ViewType | null {
        for (let l = this.viewLayerList.length - 1; l >= 0; l--) {
            let viewLayer = this.viewLayerList[l];
            for (let v = viewLayer.viewList.length - 1; v >= 0; v--) {
                let view = viewLayer.viewList[v];
                if (!view.isShowing) continue;
                if (filter != null && filter(view)) continue;
                return view;
            }
        }
        return null;
    }

    public static setView<T extends ViewType>(type: { prototype: T; } | string, view: T): void {
        ViewUIManager.viewMap.set(type, view);
    }

    public static GetView<T extends ViewType>(type: { prototype: T; } | string): T {
        return ViewUIManager.viewMap.get(type) as T;
    }

    public static getOrCreateView<T extends ViewType>(type: { prototype: T, new(); } | string): T {
        let view = ViewUIManager.GetView(type);
        if (view == null)
            view = ViewUIManager.createView(type);
        return view;
    }

    public static async showView<T extends ViewType>(type: { prototype: T, new(); } | string, ...params: Parameters<T[OnSetParamsName]>): Promise<ReturnType<T[OnSetParamsName]>> {
        let view = ViewUIManager.getOrCreateView(type);
        return view.showView(...params);
    }

    public static async hideView<T extends ViewType>(type: { prototype: T; } | string): Promise<void> {
        let view = ViewUIManager.GetView(type);
        if (view != null) return view.hideView();
    }

    public static showViews(): void {
        for (let i = ViewUIManager.viewLayerList.length - 1; i >= 0; i--) {
            if (ViewUIManager.showLayerViews(ViewUIManager.viewLayerList[i].layer))
                break;
        }
    }

    public static hideAllViews(withRule: boolean = false): void {
        for (let i = ViewUIManager.viewLayerList.length - 1; i >= 0; i--) {
            let layerData = ViewUIManager.viewLayerList[i];
            for (let i = layerData.viewList.length - 1; i >= 0; i--) {
                let view = layerData.viewList[i];
                if (!view.isShowing) continue;
                layerData.viewList.splice(i, 1);
                view.__internalHide();
            }
        }
        ViewUIManager.viewShowStackMap.clear();
    }

    public static unloadAllViews(): void {
        for (let stack of ViewUIManager.viewShowStackMap.values())
            stack.length = 0;

        for (let layerData of ViewUIManager.viewLayerList)
            layerData.viewList.length = 0;

        for (let view of ViewUIManager.viewMap.values())
            view.destroyAsset();
    }

    public static executeShowRule(view: ViewType): boolean {
        let indexData = ViewUIManager.viewLayerList.findIndex((x) => x.layer == view.viewConfig.layer);
        if (indexData == -1) return false;
        let layerData = ViewUIManager.viewLayerList[indexData];

        switch (view.viewConfig.showRule) {
            case ViewShowRule.HideSameLayerView:
                ViewUIManager.hideLayerViews(layerData);
                break;
            case ViewShowRule.HideLowLayerView:
                for (let i = indexData; i >= 0; i--)
                    ViewUIManager.hideLayerViews(ViewUIManager.viewLayerList[i]);
                break;
            case ViewShowRule.HideAllView:
                for (let i = ViewUIManager.viewLayerList.length - 1; i >= 0; i--)
                    ViewUIManager.hideLayerViews(ViewUIManager.viewLayerList[i]);
                break;
        }
        layerData.viewList.push(view);
        return true;
    }

    public static async __internalShowView(view: ViewType): Promise<void> {
        view.viewNode.setSiblingIndex(view.viewNode.parent.children.length - 1);
        return view.__internalShow();
    }

    protected static hideLayerViews(layerData: LayerData): void {
        for (let i = layerData.viewList.length - 1; i >= 0; i--) {
            let view = layerData.viewList[i];
            if (!view.isShowing || view.viewConfig.hideRule == ViewHideRule.NotBeHide) continue;
            layerData.viewList.splice(i, 1);
            view.__internalHide();
            if (view.viewConfig.hideRule == ViewHideRule.SaveToStack) {
                let stack = ViewUIManager.viewShowStackMap.get(view.viewConfig.layer);
                if (stack == null) {
                    stack = new Array<ViewType>();
                    ViewUIManager.viewShowStackMap.set(view.viewConfig.layer, stack);
                }
                stack.push(view);
            } else if (view.viewConfig.hideRule == ViewHideRule.DestroyAsset) {
                view.destroyAsset();
            }
        }
    }

    public static async __internalHideView(view: ViewType): Promise<void> {
        let stack = ViewUIManager.viewShowStackMap.get(view.viewConfig.layer);
        if (stack != null) {
            let index = stack.indexOf(view);
            if (index != -1) stack.splice(index, 1);
        }
        let indexData = ViewUIManager.viewLayerList.findIndex((x) => x.layer == view.viewConfig.layer);
        if (indexData == -1) return;
        let layerData = ViewUIManager.viewLayerList[indexData];
        let indexView = layerData.viewList.indexOf(view);
        if (indexView != -1)
            layerData.viewList.splice(indexView, 1);

        await view.__internalHide();
        switch (view.viewConfig.showRule) {
            case ViewShowRule.HideSameLayerView:
                ViewUIManager.showLayerViews(view.viewConfig.layer);
                break;
            case ViewShowRule.HideLowLayerView:
                for (let i = indexData; i >= 0; i--)
                    if (ViewUIManager.showLayerViews(ViewUIManager.viewLayerList[i].layer)) break;
                break;
            case ViewShowRule.HideAllView:
                for (let i = ViewUIManager.viewLayerList.length - 1; i >= 0; i--)
                    if (ViewUIManager.showLayerViews(ViewUIManager.viewLayerList[i].layer)) break;
                break;
        }
    }

    protected static showLayerViews(layer: number): boolean {
        let stack = ViewUIManager.viewShowStackMap.get(layer);
        if (stack == null) return false;
        while (stack.length > 0) {
            let view = stack.pop();
            ViewUIManager.viewLayerList[layer].viewList.push(view);
            view.__internalShow();
            if (view.viewConfig.showRule != ViewShowRule.None)
                return true;
        }
        return false;
    }
}