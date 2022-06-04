import { docToHTML, inlineToHTML } from '../rendering/html';
import { TextDocument, normalizeRange } from '@typewriter/document';
const defaultOptions = {
    copyPlainText: true,
    copyHTML: true
};
const empty = { text: '', html: '' };
export function copy(editor, options = defaultOptions) {
    function getCopy(selection) {
        const { doc } = editor;
        const range = normalizeRange(selection || doc.selection);
        if (!range)
            return empty;
        const slice = doc.slice(range[0], range[1]);
        if (!slice.ops.length)
            return empty;
        const text = slice
            .map(op => typeof op.insert === 'string' ? op.insert : ' ')
            .join('');
        let html;
        if (text.includes('\n')) {
            slice.push({ insert: '\n', attributes: doc.getLineFormat(range[1]) });
            html = docToHTML(editor, new TextDocument(slice));
        }
        else {
            html = inlineToHTML(editor, slice);
        }
        return { text, html };
    }
    function onCopy(event) {
        if (!editor.enabled || !editor.doc.selection)
            return;
        event.preventDefault();
        const dataTransfer = event.clipboardData;
        if (!dataTransfer)
            return;
        const { text, html } = getCopy();
        if (options.copyHTML && html) {
            dataTransfer.setData('text/html', html);
        }
        if (options.copyPlainText && text) {
            dataTransfer.setData('text/plain', text);
        }
    }
    function onCut(event) {
        onCopy(event);
        editor.delete();
    }
    return {
        commands: {
            getCopy,
        },
        init() {
            editor.root.addEventListener('copy', onCopy);
            editor.root.addEventListener('cut', onCut);
        },
        destroy() {
            editor.root.removeEventListener('copy', onCopy);
            editor.root.removeEventListener('cut', onCut);
        }
    };
}
//# sourceMappingURL=copy.js.map