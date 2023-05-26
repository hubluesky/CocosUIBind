import { Component, Label, ProgressBar, RichText, Slider, Sprite, SpriteFrame, Toggle, Node } from "cc";
import AssetManager from "framework/asset/AssetManager";
import { Action } from "framework/utility/ActionEvent";
import BindArrayHandler from "./BindArrayHandler";
import BindUIComponent from "./BindUIComponent";
import BindArrayComponent from "./BindArrayComponent";
import { BindArrayEventType, isBindObject, makeBindArrayProxy } from "./BindBaseEvent";
import BindArrayEvent from "./BindArrayEvent";

export default class BindUIHandlerManager {

    public static getUIHandler<T>(propertyValue: Component): Action<[BindUIComponent, any, T, any]> {
        if (propertyValue instanceof Label || propertyValue instanceof RichText) {
            return (ui, label: { string: string; }, data: T, value: any) => label.string = `${value}`;
        } else if (propertyValue instanceof Sprite) {
            return (ui, sprite: Sprite, data: T, value: any) => {
                if (typeof value === `string`)
                    AssetManager.loadSpriteFrameRes(value, sprite);
                else if (value instanceof SpriteFrame)
                    sprite.spriteFrame = value;
            };
        } else if (propertyValue instanceof Toggle) {
            return (ui, toggle: Toggle, data: T, value: any) => toggle.isChecked = !!value;
        } else if (propertyValue instanceof ProgressBar) {
            return (ui, progressBar: ProgressBar, data: T, value: any) => progressBar.progress = value;
        } else if (propertyValue instanceof Slider) {
            return (ui, slider: Slider, data: T, value: any) => slider.progress = value;
        }
    }

    public static getUIArrayHandler<T>(propertyValue: Component | Node, dataPropertyName: PropertyKey, onPropertyChanged?: Action<[T[], BindArrayEventType, PropertyKey, T, T]>): Action<[BindUIComponent, any, T, any]> {
        // if (!(Object.hasProperty<BindArrayHandler>(propertyValue, "onPropertyChanged"))) {
        //     console.warn("GetUIArrayHandler failed, The property value type is not a BindArrayHandler", dataPropertyName, propertyValue);
        //     return (ui, v1, data, v2) => { };
        // }

        let bindArrayEvent: BindArrayEvent<T>;
        if (onPropertyChanged != null) {
            bindArrayEvent = new BindArrayEvent<T>();
            bindArrayEvent.addArrayChanged(onPropertyChanged);
        } else if (propertyValue instanceof BindArrayComponent) {
            // const bindArrayComponent = propertyValue.addComponent(BindArrayComponent);
            // onPropertyChanged = bindArrayComponent.onPropertyChanged as any;
            bindArrayEvent = propertyValue.bindArrayEvent;
        } else {
            bindArrayEvent = propertyValue.addComponent(BindArrayComponent).bindArrayEvent;
        }

        return (ui, c, data: T, value: []) => {
            if (value != null) {
                if (!Array.isArray(value))
                    return console.warn("GetUIArrayHandler on array changed failed, the property is not a array.", value);
                // if (!isBindObject(value)) {
                //     data[dataPropertyName] = makeBindArrayProxy(value);
                //     // return;
                // }
                data[dataPropertyName] = bindArrayEvent.bindObject(value);
            }
            // onPropertyChanged();
        };
    }
}