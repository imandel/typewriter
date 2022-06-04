import { TextDocument, Line, EditorRange, TextChange } from '@typewriter/document';
import { Delta, AttributeMap } from '@typewriter/delta';
import Editor from '../Editor';
import { VNode } from '../rendering/vdom';
export interface Decorations {
    class?: string;
    style?: string;
    [attributeName: string]: any;
}
export interface DecorateEventInit extends EventInit {
    old: TextDocument;
    doc: TextDocument;
    change?: TextChange;
    changedLines?: Line[];
}
export declare class DecorateEvent extends Event {
    old: TextDocument;
    doc: TextDocument;
    change?: TextChange;
    changedLines?: Line[];
    constructor(type: string, init: DecorateEventInit);
}
export interface DecorationsModule {
    readonly old: TextDocument;
    readonly doc: TextDocument;
    getDecorator: (name: string) => Decorator;
    removeDecorations: (name: string) => boolean;
    clearDecorations: () => void;
    gatherDecorations: (change?: TextChange | undefined, changedLines?: Line[] | undefined) => void;
    init(): void;
    destroy(): void;
}
export declare function decorations(editor: Editor): DecorationsModule;
export declare class Decorator {
    change: TextChange;
    private _name;
    private _doc;
    private _decoration;
    private _apply;
    private _remove;
    constructor(name: string, doc: TextDocument, decoration: Delta | undefined, apply: (name: string, updates: Delta) => void, remove: (name: string) => void);
    hasDecorations(): boolean;
    getDecoration(): Delta;
    apply(): void;
    remove(): void;
    clear(range?: EditorRange): this;
    clearLines(lines: Line[]): this;
    clearLine(value: number | string | Line): this;
    invert(range?: EditorRange): Delta;
    decorateText(range: EditorRange, decoration?: Decorations): this;
    decorateLine(range: EditorRange | number, decoration?: Decorations): this;
    insertDecoration(at: number, decoration?: Decorations): this;
}
export declare function applyDecorations(vnode: VNode, attributes: AttributeMap | undefined, defaultClasses?: string[]): VNode;
