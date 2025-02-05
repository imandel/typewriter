import { getIndexFromNodeAndOffset, getNodesForRange } from './position';
/**
 * Get the selection range from the current browser selection
 */
export function getSelection(editor) {
    var _a;
    const { root } = editor;
    const current = editor.doc.selection;
    if (!root.ownerDocument)
        return null;
    const selection = root.ownerDocument.getSelection();
    const { lines } = editor.typeset;
    if (selection == null || selection.anchorNode == null || selection.focusNode == null || !root.contains(selection.anchorNode)) {
        return null;
    }
    else {
        const anchorIndex = getIndexFromNodeAndOffset(editor, selection.anchorNode, selection.anchorOffset, current && current[0]);
        const isCollapsed = selection.anchorNode === selection.focusNode && selection.anchorOffset === selection.focusOffset;
        const isFrozen = lines.findByAttributes((_a = editor.doc.getLineAt(anchorIndex)) === null || _a === void 0 ? void 0 : _a.attributes, true).frozen;
        // selection.isCollapsed causes a re-layout on Chrome, manual detection does not.
        let focusIndex = isCollapsed
            ? anchorIndex
            : getIndexFromNodeAndOffset(editor, selection.focusNode, selection.focusOffset, !isFrozen && current ? current[1] : null);
        return [anchorIndex, focusIndex];
    }
}
/**
 * Set the current browser selection to the given selection range
 */
export function setSelection(editor, range) {
    const { root } = editor;
    if (!root.ownerDocument)
        return;
    const selection = root.ownerDocument.getSelection();
    if (!selection)
        return;
    const hasFocus = selection.anchorNode && root.contains(selection.anchorNode) && document.activeElement !== document.body;
    if (range == null) {
        if (hasFocus) {
            selection.removeAllRanges();
            if (root.classList.contains('focus'))
                root.classList.remove('focus');
        }
    }
    else {
        const [anchorNode, anchorOffset, focusNode, focusOffset] = getNodesForRange(editor, range);
        const type = range[0] === range[1] ? 'Caret' : 'Range';
        if (anchorNode && focusNode) {
            if (selection.anchorNode !== anchorNode || selection.anchorOffset !== anchorOffset ||
                selection.focusNode !== focusNode || selection.focusOffset !== focusOffset || selection.type !== type) {
                selection.setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset);
            }
        }
        if (!hasFocus)
            root.focus();
        if (!root.classList.contains('focus'))
            root.classList.add('focus');
    }
    root.dispatchEvent(new Event('select', { bubbles: true }));
}
//# sourceMappingURL=selection.js.map