import { Readable } from 'svelte/store';
import { EditorRange, TextDocument } from '@typewriter/document';
import Editor from './Editor';
import { AttributeMap } from '@typewriter/delta';
export interface EditorStores {
    active: Readable<AttributeMap>;
    doc: Readable<TextDocument>;
    selection: Readable<EditorRange | null>;
    root: Readable<HTMLElement | undefined>;
    focus: Readable<boolean>;
    updateEditor(editor: Editor): void;
}
export declare function editorStores(editor: Editor): EditorStores;
export declare function activeStore(editor?: Editor): Readable<AttributeMap>;
export declare function docStore(editor: Editor): Readable<TextDocument>;
export declare function selectionStore(editor: Editor): Readable<EditorRange | null>;
export declare function focusStore(selection: Readable<EditorRange | null>): Readable<boolean>;
export declare function rootStore(editor: Editor): Readable<HTMLElement | undefined>;
export declare function proxy<T>(defaultValueOrStore: T | Readable<T>): {
    set: (store: Readable<T>) => void;
    subscribe: (this: void, run: import("svelte/store").Subscriber<T>, invalidate?: ((value?: T | undefined) => void) | undefined) => import("svelte/store").Unsubscriber;
};
