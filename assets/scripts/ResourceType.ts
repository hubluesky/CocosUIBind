
/** 资源类型 */
export enum ResourceType {
    /** 木材 */
    Wood,
    /** 铁矿 */
    Ore,
}

export const ResourceTypeCount = Object.keys(ResourceType).length / 2;

export interface ResourceData {
    /** 资源类型 */
    readonly type: ResourceType;
    /** 数量 */
    readonly count: number;
}