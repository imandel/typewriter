export interface Props {
    [key: string]: any;
}
export declare type VChild = VNode | string;
export interface VNode {
    type: string;
    props: Props;
    children: VChild[];
    key: any;
}
export declare const options: {
    renderKeys: boolean;
};
declare type Node = Element | Text;
export declare const recycleNode: (dom: Node) => string | VNode;
export declare const h: (type: string | Function, props?: Props | null, ch?: VChild | VChild[]) => any;
export declare const React: {
    createElement: (type: string | Function, props?: Props | null, ch?: VChild | VChild[]) => any;
};
export declare const patch: (dom: Node, vdom: VNode | VNode[], oldKids?: ChildNode[]) => Node;
export {};
