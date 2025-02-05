import { docFromDom } from './rendering/html';
// A svelte action to set the root for your Editor to an element. E.g.
// <div class="my-editor" use:asRoot={myEditor}></div>
export default function asRoot(root, editor) {
    function update(newEditor) {
        if (editor === newEditor)
            return;
        destroy();
        if (newEditor)
            newEditor.setRoot(root);
        editor = newEditor;
    }
    if (root.children.length) {
        editor.set(docFromDom(editor, root));
    }
    if (editor)
        editor.setRoot(root);
    function destroy() {
        if (editor)
            editor.destroy();
    }
    return { update, destroy };
}
//# sourceMappingURL=asRoot.js.map