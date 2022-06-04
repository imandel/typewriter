import { Delta } from '@typewriter/document';
const straitQuotes = /['"]/g;
const nonchar = /[\s\{\[\(\<'"\u2018\u201C]/;
const conversions = {
    '"': { left: '“', right: '”' },
    "'": { left: '‘', right: '’' },
};
/**
 * Replaces regular quotes with smart quotes as they are typed. Also affects pasted content.
 * Uses the text-changing event to prevent the original change and replace it with the new one. This makes the smart-
 * quotes act more seemlessly and includes them as part of regular text undo/redo instead of breaking it like the smart-
 * entry conversions do.
 */
export function smartQuotes(editor) {
    function onTextChange(event) {
        const { change, source, doc, old } = event;
        if (source === 'api' || !old.selection || !change)
            return;
        const indices = getQuoteIndices(change.delta.ops);
        if (!indices.length)
            return;
        const text = doc.getText();
        const convert = new Delta();
        let pos = 0;
        for (let i = 0; i < indices.length; i++) {
            const [index, attributes] = indices[i];
            const quote = text[index];
            const converted = !index || nonchar.test(text[index - 1]) ? conversions[quote].left : conversions[quote].right;
            convert.retain(index - pos).delete(1).insert(converted, attributes);
            pos = index + 1;
        }
        event.modify(convert);
    }
    editor.on('changing', onTextChange);
    return {
        destroy() {
            editor.off('changing', onTextChange);
        }
    };
}
function getQuoteIndices(ops) {
    const indices = [];
    let pos = 0;
    ops.forEach(op => {
        if (op.retain)
            pos += op.retain;
        else if (typeof op.insert === 'string') {
            let result;
            while ((result = straitQuotes.exec(op.insert))) {
                indices.push([pos + result.index, op.attributes]);
            }
            pos += op.insert.length;
        }
        else if (op.insert) {
            pos += 1;
        } // Delete shouldn't change anything
    });
    return indices;
}
//# sourceMappingURL=smartQuotes.js.map