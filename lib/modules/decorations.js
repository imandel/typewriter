import { TextChange } from '@typewriter/document';
import { h } from '../rendering/vdom';
import { Delta, isEqual } from '@typewriter/delta';
const endInSemicolon = /;\s*$/;
const formatDecoration = {
    name: 'decoration',
    selector: 'span.format.decoration',
    fromDom: false,
    render: (attributes, children) => {
        return applyDecorations(h('span', {}, children), attributes, ['format', 'decoration']);
    }
};
const embedDecoration = {
    name: 'decoration',
    selector: '.embed.decoration',
    fromDom: false,
    noFill: true,
    render: (attributes, children) => {
        const classes = 'embed decoration';
        const { name: type, ...props } = attributes.decoration;
        props.class = props.class ? classes + ' ' + props.class : classes;
        return h(type || 'span', props, children);
    }
};
export class DecorateEvent extends Event {
    constructor(type, init) {
        super(type, init);
        this.old = init.old;
        this.doc = init.doc;
        this.change = init.change;
        this.changedLines = init.changedLines;
    }
}
export function decorations(editor) {
    editor.typeset.formats.add(formatDecoration);
    editor.typeset.embeds.add(embedDecoration);
    const decorations = new Map();
    let original = editor.doc;
    let old = original;
    let doc = original;
    let decorating = false;
    editor.on('change', onChange);
    editor.on('render', onRender);
    function getDecorator(name) {
        if (!name)
            throw new TypeError('A decoration name is required');
        const decoration = decorations.get(name);
        return new Decorator(name, editor.doc, decoration, apply, removeDecorations);
    }
    function removeDecorations(name) {
        var _a, _b;
        if (!name)
            throw new TypeError('A decoration name is required');
        const decoration = decorations.get(name);
        if (!decoration)
            return false;
        const inverted = invert(name, decoration, original);
        decorations.delete(name);
        if (!decorations.size) {
            doc = original;
        }
        else {
            doc = doc.apply(inverted);
        }
        if (!decorating) {
            (_a = editor.modules.rendering) === null || _a === void 0 ? void 0 : _a.render({ old, doc });
            (_b = editor.modules.selection) === null || _b === void 0 ? void 0 : _b.renderSelection();
        }
        return true;
    }
    function clearDecorations() {
        if (decorations.size) {
            decorations.clear();
        }
        doc = original;
    }
    function apply(name, delta) {
        var _a, _b;
        const existing = decorations.get(name);
        const decoration = existing ? existing.compose(delta, true) : delta;
        if (isEqual(decoration, existing) || (!existing && !decoration.ops.length))
            return;
        if (!decoration.ops.length) {
            decorations.delete(name);
        }
        else {
            decorations.set(name, decoration);
        }
        doc = decorations.size ? doc.apply(delta, null) : original;
        if (!decorating) {
            (_a = editor.modules.rendering) === null || _a === void 0 ? void 0 : _a.render({ old, doc });
            (_b = editor.modules.selection) === null || _b === void 0 ? void 0 : _b.renderSelection();
        }
    }
    function onChange(event) {
        const { change, changedLines } = event;
        original = event.doc;
        if (change) {
            if (change.contentChanged) {
                for (let [key, decoration] of decorations) {
                    decoration = change.delta.transform(decoration, true);
                    if (decoration.ops.length)
                        decorations.set(key, decoration);
                    else
                        decorations.delete(key); // all content with decoration was deleted
                }
                doc = decorations.size ? doc.apply(change.delta, null) : original;
                if (decorations.size) {
                    // Ensure the id of each line is the same
                    doc.lines.forEach((line, i) => {
                        const origLine = original.lines[i];
                        if (line !== origLine && line.id !== origLine.id) {
                            line.id = origLine.id;
                        }
                    });
                }
            }
        }
        else {
            clearDecorations();
        }
        gatherDecorations(change, changedLines);
    }
    function gatherDecorations(change, changedLines) {
        const init = { old, doc: original, change, changedLines };
        decorating = true;
        editor.dispatchEvent(new DecorateEvent('decorate', init));
        decorating = false;
    }
    function onRender() {
        old = doc; // Update old after a render
    }
    return {
        get old() { return old; },
        get doc() { return doc; },
        getDecorator,
        removeDecorations,
        clearDecorations,
        gatherDecorations,
        init() {
            gatherDecorations();
        },
        destroy() {
            editor.off('change', onChange);
            editor.off('render', onRender);
        }
    };
}
export class Decorator {
    constructor(name, doc, decoration, apply, remove) {
        this._name = name;
        this._doc = doc;
        this.change = new TextChange(doc);
        this._decoration = decoration;
        this._apply = apply;
        this._remove = remove;
    }
    hasDecorations() {
        return !!this._decoration && this._decoration.ops.length > 0 || this.change.delta.ops.length > 0;
    }
    getDecoration() {
        return this._decoration ? this._decoration.compose(this.change.delta) : this.change.delta;
    }
    apply() {
        return this._apply(this._name, this.change.delta);
    }
    remove() {
        return this._remove(this._name);
    }
    clear(range) {
        if (!this.hasDecorations())
            return this;
        if (!range) {
            this.change.setDelta(this.invert());
        }
        else {
            this.change.setDelta(this.change.delta.compose(this.invert(range)));
        }
        return this;
    }
    clearLines(lines) {
        if (!lines.length)
            return this;
        const doc = this._doc;
        const range = [doc.getLineRange(lines[0])[0], doc.getLineRange(lines[lines.length - 1])[1]];
        const contiguous = lines.length === 1 || lines.every((line, i) => !i || doc.getLineRange(lines[i - 1])[1] === doc.getLineRange(line)[0]);
        if (contiguous) {
            return this.clear(range);
        }
        const inverted = this.invert(range);
        const delta = new Delta();
        let pos = 0;
        lines.forEach(line => {
            const [start, end] = doc.getLineRange(line);
            delta.retain(start - pos).concat(inverted.slice(start, end));
            pos = end;
        });
        this.change.setDelta(this.change.delta.compose(delta));
        return this;
    }
    // Clear line of these decorations at position, by id, or by instance
    clearLine(value) {
        const doc = this._doc;
        const line = typeof value === 'number'
            ? doc.getLineAt(value)
            : typeof value === 'string'
                ? doc.getLineBy(value)
                : value;
        return this.clearLines([line]);
    }
    invert(range) {
        if (!this._decoration)
            return new Delta();
        return invert(this._name, this._decoration, this._doc, range);
    }
    decorateText(range, decoration = { class: this._name }) {
        this.change.formatText(range, { decoration: { [this._name]: decoration } });
        return this;
    }
    decorateLine(range, decoration = { class: this._name }) {
        this.change.formatLine(range, { decoration: { [this._name]: decoration } }, true);
        return this;
    }
    insertDecoration(at, decoration = { class: this._name }) {
        if (typeof decoration === 'string') {
            throw new Error('You may only insert embed decorations');
        }
        this.change.insert(at, { decoration });
        return this;
    }
}
export function applyDecorations(vnode, attributes, defaultClasses) {
    if (!attributes || !attributes.decoration)
        return vnode;
    const classes = new Set(defaultClasses);
    let styles = '';
    let props = vnode.props;
    Object.values(attributes.decoration).forEach((decorations) => {
        const { class: className, style, ...attributes } = decorations;
        if (className)
            classes.add(className.trim());
        if (style)
            styles += style.trim();
        if (styles && !endInSemicolon.test(styles))
            styles += ';';
        props = { ...attributes, ...props };
    });
    const className = Array.from(classes).join(' ').trim();
    if (className)
        props.class = props.class ? props.class + ' ' + className : className;
    if (styles)
        props.style = props.style ? props.style + ';' + styles : styles;
    vnode.props = props;
    return vnode;
}
function invert(name, delta, doc, range) {
    let docDelta = doc.toDelta();
    if (range) {
        docDelta = docDelta.slice(range[0], range[1]);
        delta = delta.slice(range[0], range[1]);
    }
    delta = delta.invert(docDelta);
    delta.ops.forEach(op => {
        var _a;
        if (((_a = op.attributes) === null || _a === void 0 ? void 0 : _a.decoration) === null) {
            op.attributes.decoration = { [name]: null };
        }
    });
    if (range) {
        delta = new Delta().retain(range[0]).concat(delta);
    }
    return delta;
}
//# sourceMappingURL=decorations.js.map