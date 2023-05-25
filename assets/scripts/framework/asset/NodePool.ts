import { director, instantiate, Node, Prefab, Quat, Vec3 } from "cc";
import AssetManager from "./AssetManager";

type KeyType = Node | Prefab;

declare module "cc" {
    interface Node {
        _poolKey: KeyType;
    }
}

export default class NodePool {
    private static pool = new Map<KeyType, Node[]>();
    private static root: Node;

    public static initilaize(root: Node): void {
        NodePool.root = root;
    }

    public static finalize(): void {
        NodePool.pool.clear();
        NodePool.root = null;
    }

    public static cacheNodes(prefab: KeyType, count: number): void {
        const list = NodePool.getPoolList(prefab);
        for (let i = 0; i < count; i++) {
            let node = NodePool.instantiateNode(prefab, NodePool.root);
            list.push(node);
            node.active = false;
        }
    }

    private static getPoolList(prefab: KeyType): Node[] {
        let list = NodePool.pool.get(prefab);
        if (list == null) {
            list = [];
            NodePool.pool.set(prefab, list);
        }
        return list;
    }

    public static async createNode(assetPath: string | KeyType, position?: Readonly<Vec3>, rotation?: Readonly<Quat>): Promise<Node> {
        if (typeof assetPath === `string`)
            assetPath = await AssetManager.Default.LoadRes<Prefab>(assetPath, Prefab);
        const list = NodePool.getPoolList(assetPath);
        let node = list.pop();
        if (node == null)
            node = NodePool.instantiateNode(assetPath, NodePool.root, position, rotation);
        node.active = true;
        return node;
    }

    public static destroyNode(...nodes: Node[]): void {
        for (const node of nodes) {
            if (node == null) continue;

            if (node._poolKey == null) {
                if (node.isValid) node.destroy();
            } else {
                const list = NodePool.pool.get(node._poolKey);
                if (list != null) {
                    list.push(node);
                    node.setParent(NodePool.root);
                } else if (node.isValid) {
                    node.destroy();
                }
            }
        }
    }

    public static instantiateNode(prefab: KeyType, parent?: Node, position?: Readonly<Vec3>, rotation?: Readonly<Quat>): Node {
        const node = instantiate(prefab) as Node;
        node._poolKey = prefab;
        if (position != null)
            node.position = position;
        if (rotation != null)
            node.rotation = rotation;
        if (parent == null)
            director.getScene().addChild(node);
        else
            node.setParent(parent);
        return node;
    }
}