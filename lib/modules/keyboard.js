import { addShortcutsToEvent, ShortcutEvent } from './shortcutFromEvent';
import { normalizeRange } from '@typewriter/document';
import { Source } from '../Source';
// A list of bad characters that we don't want coming in from pasted content (e.g. "\f" aka line feed)
const EMPTY_OBJ = {};
const IS_CHROME = window.chrome && typeof window.chrome === 'object';
// Basic keyboard module.
export function keyboard(editor) {
    function onEnter(event) {
        if (event.defaultPrevented)
            return;
        const { typeset: { lines }, doc } = editor;
        let { selection } = doc;
        if (!selection)
            return;
        event.preventDefault();
        const [at, to] = selection;
        const isCollapsed = at === to;
        const line = doc.getLineAt(selection[0]);
        const [start, end] = doc.getLineRange(selection[0]);
        let { id, ...attributes } = line.attributes;
        let options;
        const type = lines.findByAttributes(attributes, true);
        const atStart = to === start;
        const atEnd = to === end - 1;
        if (isEmpty(line) && type !== lines.default && !type.contained && !type.defaultFollows && !type.frozen && isCollapsed) {
            // Convert a bullet point into a paragraph
            editor.formatLine(EMPTY_OBJ);
        }
        else {
            if (at === start && to === end && type.frozen) {
                options = { dontFixNewline: true };
                if (at === 0) {
                    // if single selection and line element (hr, image etc) insert new line before
                    selection = [at, at];
                }
                else {
                    selection = [to, to];
                }
                attributes = type.nextLineAttributes ? type.nextLineAttributes(attributes) : EMPTY_OBJ;
            }
            else if (atEnd && (type.nextLineAttributes || type.defaultFollows || type.frozen)) {
                attributes = type.nextLineAttributes ? type.nextLineAttributes(attributes) : EMPTY_OBJ;
            }
            else if (atStart && !atEnd) {
                if (type.defaultFollows)
                    attributes = EMPTY_OBJ;
                options = { dontFixNewline: true };
            }
            editor.insert('\n', attributes, selection, options);
            if (at === start && to === end && type.frozen) {
                editor.select(at === 0 ? 0 : to);
            }
        }
    }
    function onShiftEnter(event) {
        if (event.defaultPrevented)
            return;
        const { typeset, doc } = editor;
        if (!typeset.embeds.get('br'))
            return onEnter(event);
        if (!doc.selection)
            return;
        event.preventDefault();
        editor.insert({ br: true });
    }
    function onBackspace(event) {
        handleDelete(event, -1);
    }
    function onDelete(event) {
        handleDelete(event, 1);
    }
    function handleDelete(event, direction) {
        if (event.defaultPrevented)
            return;
        const { typeset: { lines }, doc } = editor;
        const { selection } = doc;
        if (!selection)
            return;
        const [at, to] = selection;
        const isCollapsed = at === to;
        const [start, end] = doc.getLineRange(at);
        // Allow the system to handle non-line-collapsing deletes
        // (Bug in Chrome where backspace at the end of a span can delete an entire paragraph)
        if (isCollapsed && (!IS_CHROME || event.ctrlKey || event.altKey || event.metaKey)) {
            if (direction === -1 && at !== start)
                return;
            if (direction === 1 && at !== end - 1)
                return;
        }
        event.preventDefault();
        if (direction === -1 && selection[0] + selection[1] === 0) {
            // At the beginning of the document
            unindent(doc.getLineAt(at), true);
        }
        else {
            const range = normalizeRange(selection);
            const line = doc.getLineAt(range[0]);
            const type = lines.findByAttributes(line.attributes, true);
            // If the deletion will move outside a line (collapsing 2 lines)
            const outside = isCollapsed && ((direction === -1 && at === start) || (direction === 1 && at === end - 1));
            if (outside && !type.contained) {
                // At the beginning of a line
                if (direction === -1 && unindent(doc.getLineAt(at)))
                    return;
                // Delete the next line if it is empty
                const mergingLine = doc.lines[doc.lines.indexOf(line) + direction];
                const [first, second] = direction === 1 ? [line, mergingLine] : [mergingLine, line];
                if (first && isEmpty(first) && second && !isEmpty(second)) {
                    return editor.update(editor.change.delete([range[0] + direction, range[0]], { dontFixNewline: true }), Source.input);
                }
            }
            editor.delete(direction, { dontFixNewline: type.frozen });
        }
        function unindent(line, force) {
            if (!line)
                return;
            const type = lines.findByAttributes(line.attributes, true);
            if (!type)
                return;
            if (type.indentable && line.attributes.indent) {
                editor.outdent();
                return true;
            }
            if (force || type !== lines.default && !type.defaultFollows) {
                editor.formatLine(EMPTY_OBJ);
                return true;
            }
        }
    }
    function onTab(event) {
        if (event.defaultPrevented)
            return;
        event.preventDefault();
        const shortcut = event.modShortcut;
        if (shortcut === 'Tab' || shortcut === 'Mod+]')
            editor.indent();
        else
            editor.outdent();
    }
    function onKeyDown(event) {
        var _a;
        if (event.isComposing)
            return;
        addShortcutsToEvent(event);
        const checkShortcut = shortcut => {
            const command = editor.shortcuts[shortcut];
            if (command && editor.commands[command]) {
                event.preventDefault();
                return editor.commands[command]() !== false;
            }
        };
        if (!editor.root.dispatchEvent(ShortcutEvent.fromKeyboardEvent(event))
            || checkShortcut(event.shortcut)
            || checkShortcut(event.osShortcut)
            || checkShortcut(event.modShortcut)) {
            event.preventDefault();
            return;
        }
        switch (event.modShortcut) {
            case 'Enter': return onEnter(event);
            case 'Shift+Enter': return onShiftEnter(event);
            case 'Tab':
            case 'Shift+Tab':
            case 'Mod+]':
            case 'Mod+[': return onTab(event);
        }
        switch ((_a = event.modShortcut) === null || _a === void 0 ? void 0 : _a.split('+').pop()) {
            case 'Backspace': return onBackspace(event);
            case 'Delete': return onDelete(event);
            default: return;
        }
    }
    function isEmpty(line) {
        var _a;
        return line.length === 1 && !((_a = editor.typeset.lines.findByAttributes(line.attributes)) === null || _a === void 0 ? void 0 : _a.frozen);
    }
    return {
        init() {
            editor.root.addEventListener('keydown', onKeyDown);
        },
        destroy() {
            editor.root.removeEventListener('keydown', onKeyDown);
        }
    };
}
//# sourceMappingURL=keyboard.js.map