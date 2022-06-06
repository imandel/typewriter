import { TextDocument, TextChange, EditorRange, Line } from '@typewriter/document';
import { Typeset, TypesetTypes, Commands } from './typesetting/typeset';
import EventDispatcher from './util/EventDispatcher';
import { SourceString, Source } from './Source';
import { Delta, AttributeMap } from '@typewriter/delta';
export interface EditorOptions {
    identifier?: any;
    root?: HTMLElement | false;
    types?: TypesetTypes;
    doc?: TextDocument;
    modules?: ModuleInitializers;
    enabled?: boolean;
    text?: string;
    html?: string;
    dev?: boolean;
    throwOnError?: boolean;
}
export interface Shortcuts {
    [shortcut: string]: string;
}
export interface Module {
    init?: () => void;
    destroy?: () => void;
    shortcuts?: Shortcuts;
    commands?: Commands;
    getActive?: () => AttributeMap;
    trimSelection?: (range: EditorRange) => EditorRange;
    [name: string]: any;
}
export interface ModuleInitializers {
    [name: string]: ModuleInitializer;
}
export interface ModuleInitializer {
    (editor: Editor): Module;
}
export interface Modules {
    [name: string]: Module;
}
export interface EditorChangeEventInit extends EventInit {
    old: TextDocument;
    doc: TextDocument;
    change?: TextChange;
    changedLines?: Line[];
    source: SourceString;
}
export declare class EditorChangeEvent extends Event {
    old: TextDocument;
    doc: TextDocument;
    change?: TextChange;
    changedLines?: Line[];
    source: SourceString;
    constructor(type: string, init: EditorChangeEventInit);
    modify(delta: Delta): void;
}
export interface EditorFormatEventInit extends EventInit {
    formats: AttributeMap;
}
export declare class EditorFormatEvent extends Event {
    formats: AttributeMap;
    constructor(type: string, init: EditorFormatEventInit);
}
export default class Editor extends EventDispatcher {
    identifier: any;
    typeset: Typeset;
    doc: TextDocument;
    activeFormats: AttributeMap;
    commands: Commands;
    shortcuts: Shortcuts;
    modules: Modules;
    catchErrors: boolean;
    throwOnError: boolean;
    _root: HTMLElement;
    private _modules;
    private _enabled;
    constructor(options?: EditorOptions);
    get root(): HTMLElement;
    get enabled(): boolean;
    set enabled(value: boolean);
    get change(): TextChange;
    setRoot(root: HTMLElement): this;
    update(changeOrDelta: TextChange | Delta, source?: SourceString): this;
    set(docOrDelta: TextDocument | Delta, source?: SourceString, change?: TextChange, changedLines?: Line[]): this;
    getHTML(): string;
    setHTML(html: string, selection?: EditorRange | null, source?: SourceString): this;
    getDelta(): Delta;
    setDelta(delta: Delta, selection?: EditorRange | null, source?: SourceString): this;
    getText(range?: EditorRange): string;
    setText(text: string, selection?: EditorRange | null, source?: SourceString): this;
    trimSelection(selection: EditorRange): EditorRange;
    getActive(): {
        [x: string]: any;
    };
    select(at: EditorRange | number | null, source?: Source): this;
    insert(insert: string | object, format?: AttributeMap, selection?: EditorRange | null, options?: {
        dontFixNewline?: boolean;
    }): this;
    insertContent(content: Delta, selection?: EditorRange | null): this;
    delete(directionOrSelection?: -1 | 1 | EditorRange, options?: {
        dontFixNewline?: boolean;
    }): this;
    formatText(format: AttributeMap | string, selection?: EditorRange | null): this;
    toggleTextFormat(format: AttributeMap | 'string', selection?: EditorRange | null): this;
    formatLine(format: AttributeMap | string, selection?: EditorRange | number | null): this;
    toggleLineFormat(format: AttributeMap | string, selection?: EditorRange | null): this;
    indent(): this;
    outdent(): this;
    removeFormat(selection?: EditorRange | null): this;
    getBounds(range: EditorRange | number, relativeTo?: Element, relativeInside?: boolean): DOMRect | undefined;
    getAllBounds(range: EditorRange | number, relativeTo?: Element, relativeInside?: boolean): DOMRect[] | undefined;
    getIndexFromPoint(x: number, y: number): number | null;
    render(): this;
    init(): void;
    destroy(): void;
}
