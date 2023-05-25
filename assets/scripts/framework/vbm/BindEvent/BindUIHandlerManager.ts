import { Component, Label, ProgressBar, RichText, Slider, Sprite, SpriteFrame, Toggle } from "cc";
import AssetManager from "framework/asset/AssetManager";
import { Action } from "framework/utility/ActionEvent";
import BindArrayEvent, { makeBindArrayProxy } from "./BindArrayEvent";
import BindArrayHandler from "./BindArrayHandler";
import BindUIComponent from "./BindUIComponent";

export default class BindUIHandlerManager {

    public static getUIHandler<T>(propertyValue: Component): Action<[BindUIComponent, any, T, any]> {
        if (propertyValue instanceof Label || propertyValue instanceof RichText) {
            return (ui, label: { string: string }, data: T, value: any) => label.string = `${value}`;
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

    public static getUIArrayHandler<T>(propertyValue: Component, dataPropertyName: PropertyKey): Action<[BindUIComponent, any, T, any]> {
        if (!(Object.hasProperty<BindArrayHandler>(propertyValue, "onPropertyChanged"))) {
            console.warn("GetUIArrayHandler failed, The property value type is not a BindArrayHandler", dataPropertyName, propertyValue);
            return (ui, v1, data, v2) => { };
        }

        return (ui, c, data: T, value: []) => {
            if (value != null) {
                if (!Array.isArray(value))
                    return console.warn("GetUIArrayHandler on array changed failed, the property is not a array.", value);
                if (!BindArrayEvent.isBindObject(value)) {
                    data[dataPropertyName] = makeBindArrayProxy(value);
                    // return;
                }
            }
            propertyValue.onPropertyChanged(value);
        };
    }
}