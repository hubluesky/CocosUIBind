import { Component, LabelComponent, ProgressBar, RichTextComponent, Slider, SpriteComponent, SpriteFrame, Toggle } from "cc";
import BindArrayEvent, { MakeBindArrayProxy } from "./BindArrayEvent";
import BindArrayHandler from "./BindArrayHandler";
import BindUIComponent from "./BindUIComponent";
import { Action } from "common/utility/ActionEvent";
import AssetManager from "common/Resource/AssetManager";

export default class BindUIHandlerManager {

    public static GetUIHandler<T>(propertyValue: Component): Action<[BindUIComponent, any, T, any]> {
        if (propertyValue instanceof LabelComponent || propertyValue instanceof RichTextComponent) {
            return (ui, label: { string: string }, data: T, value: any) => label.string = `${value}`;
        } else if (propertyValue instanceof SpriteComponent) {
            return (ui, sprite: SpriteComponent, data: T, value: any) => {
                if (typeof value === `string`)
                    AssetManager.Default.LoadSpriteFrameRes(value, sprite);
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

    public static GetUIArrayHandler<T>(propertyValue: Component, dataPropertyName: PropertyKey): Action<[BindUIComponent, any, T, any]> {
        if (!(Object.hasProperty<BindArrayHandler>(propertyValue, "OnPropertyChanged"))) {
            console.warn("GetUIArrayHandler failed, The property value type is not a BindArrayHandler", dataPropertyName, propertyValue);
            return (ui, v1, data, v2) => { };
        }

        return (ui, c, data: T, value: []) => {
            if (value != null) {
                if (!Array.isArray(value))
                    return console.warn("GetUIArrayHandler on array changed failed, the property is not a array.", value);
                if (!BindArrayEvent.IsBindObject(value)) {
                    data[dataPropertyName] = MakeBindArrayProxy(value);
                    // return;
                }
            }
            propertyValue.OnPropertyChanged(value);
        };
    }
}