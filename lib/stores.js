import { derived, readable, writable, get } from 'svelte/store';
import { TextDocument } from '@typewriter/document';
import { isEqual } from '@typewriter/delta';
const EMPTY_NOPTIFIER = () => { };
const EMPTY_ACTIVE = readable({}, EMPTY_NOPTIFIER);
const EMPTY_DOC = readable(new TextDocument(), EMPTY_NOPTIFIER);
const EMPTY_SELECTION = readable(null, EMPTY_NOPTIFIER);
const EMPTY_ROOT = readable(undefined, EMPTY_NOPTIFIER);
export function editorStores(editor) {
    const active = proxy(activeStore(editor));
    const doc = proxy(docStore(editor));
    const selection = proxy(selectionStore(editor));
    const root = proxy(rootStore(editor));
    const focus = focusStore(selection);
    function updateEditor(value) {
        if (value === editor)
            return;
        editor = value;
        active.set(activeStore(editor));
        doc.set(docStore(editor));
        selection.set(selectionStore(editor));
        root.set(rootStore(editor));
    }
    return {
        active,
        doc,
        selection,
        root,
        focus,
        updateEditor,
    };
}
export function activeStore(editor) {
    if (!editor)
        return EMPTY_ACTIVE;
    let active = editor.getActive();
    return readable(active, set => {
        const update = () => {
            const newActive = editor.getActive();
            if (!isEqual(active, newActive))
                set(active = newActive);
        };
        editor.on('changed', update);
        editor.on('format', update);
        return () => {
            editor.off('changed', update);
            editor.off('format', update);
        };
    });
}
export function docStore(editor) {
    if (!editor)
        return EMPTY_DOC;
    return readable(editor.doc, set => {
        const update = () => set(editor.doc);
        update();
        editor.on('changed', update);
        return () => editor.off('changed', update);
    });
}
export function selectionStore(editor) {
    if (!editor)
        return EMPTY_SELECTION;
    return readable(editor.doc.selection, set => {
        const update = () => set(editor.doc.selection);
        update();
        editor.on('changed', update);
        return () => editor.off('changed', update);
    });
}
export function focusStore(selection) {
    return derived(selection, selection => !!selection);
}
export function rootStore(editor) {
    if (!editor)
        return EMPTY_ROOT;
    return readable(editor._root, set => {
        const update = () => set(editor._root);
        update();
        editor.on('root', update);
        return () => editor.off('root', update);
    });
}
// Can be create in a component on init and set to another store async, allowing for $mystore use
export function proxy(defaultValueOrStore) {
    const defaultValue = 'subscribe' in defaultValueOrStore ? get(defaultValueOrStore) : defaultValueOrStore;
    const { set: write, subscribe } = writable(defaultValue);
    let unsub;
    if ('subscribe' in defaultValueOrStore) {
        set(defaultValueOrStore);
    }
    function set(store) {
        if (unsub)
            unsub();
        if (store)
            unsub = store.subscribe(value => write(value));
    }
    return {
        set,
        subscribe
    };
}
//# sourceMappingURL=stores.js.map