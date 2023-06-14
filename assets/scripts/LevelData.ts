import { registerBindObject } from "framework/vbm/bindEvent/RegisterBindObject";
import { ResourceType } from "./ResourceType";
import Serializable, { serializeClass, serializeField } from "framework/vbm/storage/Serializable";

@serializeClass("ld")
@registerBindObject
export default class LevelData extends Serializable {
    /** 资源总容量 */
    @serializeField("a")
    readonly resourceCapacitys: ResourceType[] = [0, 0];
    /** 资源产出/每分钟的数量 */
    @serializeField("b")
    readonly resourceProductions: ResourceType[] = [0, 0];
    /** 当前资源值 */
    @serializeField("c")
    readonly resourceValues: ResourceType[] = [0, 0];

    testNumber = 3;

    /**
     * 获得资源容量
     * @param type 资源类型
     * @returns 资源容量
     */
    public getResourceCapacity(type: ResourceType): number {
        return this.resourceCapacitys[type];
    }

    /**
     * 改变资源容量
     * @param type 资源类型
     * @param count 新增容量上限值
     */
    public modifyResourceCapacity(type: ResourceType, count: number): void {
        this.resourceCapacitys[type] += count;
        console.assert(this.resourceCapacitys[type] > 0, "资源容量必须大于0");
    }

    /**
     * 获得资源产出值
     * @param type 资源类型
     * @returns 资源产出值
     */
    public getResourceProduction(type: ResourceType): number {
        return this.resourceProductions[type];
    }

    /**
     * 修改资源产出
     * @param type 资源类型
     * @param count 新增资源产出值
     */
    public modifyResourceProduction(type: ResourceType, count: number): void {
        this.resourceProductions[type] += count;
    }

    /**
     * 获得当前资源值
     * @param type 资源类型
     * @returns 当前资源值
     */
    public getResourceValue(type: ResourceType): number {
        return this.resourceValues[type];
    }

    /**
     * 修改当前资源值
     * @param type 资源类型
     * @param count 资源数量
     * @returns 如果是减少资源值的，会进行数值检查，数量不足时，修改失败。
     */
    public modifyResourceValue(type: ResourceType, count: number): boolean {
        if (count < 0 && this.resourceValues[type] < -count) return false;
        this.resourceValues[type] = Math.minmax(0, this.resourceCapacitys[type], this.resourceValues[type] + count);
        return true;
    }
}