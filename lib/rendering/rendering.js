import { h, patch } from './vdom';
import { applyDecorations } from '../modules/decorations';
import { isEqual } from '@typewriter/delta';
const EMPTY_ARR = [];
const BR = h('br', {});
const nodeFormatType = new WeakMap();
const linesType = new WeakMap();
const linesMultiples = new WeakMap();
const linesCombined = new WeakMap();
const nodeRanges = new WeakMap();
export function getLineNodeStart(root, node) {
    var _a, _b;
    return (_b = (_a = nodeRanges.get(root)) === null || _a === void 0 ? void 0 : _a.get(node)) === null || _b === void 0 ? void 0 : _b[0];
}
export function getLineNodeEnd(root, node) {
    var _a, _b;
    return (_b = (_a = nodeRanges.get(root)) === null || _a === void 0 ? void 0 : _a.get(node)) === null || _b === void 0 ? void 0 : _b[1];
}
export function setLineNodesRanges(editor) {
    const { root, doc } = editor;
    const combined = combineLines(editor, doc.lines);
    const ranges = new WeakMap();
    for (let i = 0; i < root.children.length; i++) {
        const child = root.children[i];
        if (!child.key)
            continue;
        const entry = combined.byKey[child.key];
        if (!entry)
            continue;
        if (Array.isArray(entry)) {
            // set the range for the entire combined section
            ranges.set(child, [doc.getLineRange(entry[0])[0], doc.getLineRange(entry[entry.length - 1])[1]]);
            // set the ranges for each line inside
            const lineElements = child.querySelectorAll(editor.typeset.lines.selector);
            for (let i = 0; i < lineElements.length; i++) {
                const lineElement = lineElements[i];
                const line = doc.getLineBy(lineElement.key);
                if (!line)
                    continue;
                ranges.set(lineElement, doc.getLineRange(line));
            }
        }
        else {
            ranges.set(child, doc.getLineRange(entry));
        }
    }
    const lineElements = root.querySelectorAll(editor.typeset.lines.selector);
    for (let i = 0; i < lineElements.length; i++) {
        const lineElement = lineElements[i];
        if (ranges.has(lineElement) || !lineElement.key)
            continue;
        const line = doc.getLineBy(lineElement.key);
        ranges.set(lineElement, doc.getLineRange(line));
    }
    nodeRanges.set(root, ranges);
}
export function render(editor, doc) {
    const { root } = editor;
    editor.dispatchEvent(new Event('rendering'));
    patch(root, renderDoc(editor, doc));
    setLineNodesRanges(editor);
    editor.dispatchEvent(new Event('render'));
    editor.dispatchEvent(new Event('rendered'));
}
export function renderChanges(editor, oldDoc, newDoc) {
    const { root } = editor;
    // Ranges of line indexes, not document indexes
    const oldCombined = combineLines(editor, oldDoc.lines).combined;
    const newCombined = combineLines(editor, newDoc.lines).combined;
    const [oldRange, newRange] = getChangedRanges(oldCombined, newCombined);
    // If the changes include added or deleted lines, expand ranges by 1 on each side to ensure the vdom can rerender
    if (!isEqual(oldRange, newRange)) {
        oldRange[0] = Math.max(0, oldRange[0] - 1);
        newRange[0] = Math.max(0, newRange[0] - 1);
        oldRange[1] = Math.min(oldCombined.length, oldRange[1] + 1);
        newRange[1] = Math.min(newCombined.length, newRange[1] + 1);
        if (root.childNodes.length !== oldCombined.length) {
            // The DOM has changed since we last rendered, adjust the oldRange accordingly to get the correct slice
            oldRange[1] += root.childNodes.length - oldCombined.length;
        }
    }
    const oldSlice = Array.from(root.childNodes).slice(oldRange[0], oldRange[1]);
    const newSlice = newCombined.slice(newRange[0], newRange[1]);
    if (!oldSlice.length && !newSlice.length)
        return render(editor, newDoc);
    editor.dispatchEvent(new Event('rendering'));
    patch(root, renderCombined(editor, newSlice), oldSlice);
    setLineNodesRanges(editor);
    editor.dispatchEvent(new Event('render'));
    editor.dispatchEvent(new Event('rendered'));
}
export function renderDoc(editor, doc, forHTML) {
    return renderCombined(editor, combineLines(editor, doc.lines).combined, forHTML);
}
export function renderCombined(editor, combined, forHTML) {
    return combined.map(line => renderLine(editor, line, forHTML)).filter(Boolean);
}
export function renderLine(editor, line, forHTML) {
    return Array.isArray(line) ? renderMultiLine(editor, line, forHTML) : renderSingleLine(editor, line, forHTML);
}
export function renderSingleLine(editor, line, forHTML) {
    const type = getLineType(editor, line);
    if (!type.render)
        throw new Error('No render method defined for line');
    const node = type.render(line.attributes, renderInline(editor, line.content), editor, forHTML);
    applyDecorations(node, line.attributes);
    node.key = line.id;
    return node;
}
export function renderMultiLine(editor, lines, forHTML) {
    const type = getLineType(editor, lines[0]);
    if (!type.renderMultiple)
        throw new Error('No render method defined for line');
    const node = type.renderMultiple(lines.map(line => [line.attributes, renderInline(editor, line.content), line.id]), editor, forHTML);
    node.key = lines[0].id;
    return node;
}
// Join multi-lines into arrays. Memoize the results.
export function combineLines(editor, lines) {
    const cache = linesCombined.get(lines);
    if (cache)
        return cache;
    const combined = [];
    const byKey = {};
    let collect = [];
    lines.forEach((line, i) => {
        const type = getLineType(editor, line);
        if (type.shouldCombine) {
            collect.push(line);
            const next = lines[i + 1];
            if (!next || getLineType(editor, next) !== type || !type.shouldCombine(line.attributes, next.attributes)) {
                // By keeping the last array reference we can optimize updates
                const last = linesMultiples.get(collect[0]);
                if (last && last.length === collect.length && collect.every((v, i) => last[i] === v)) {
                    collect = last;
                }
                else {
                    linesMultiples.set(collect[0], collect);
                }
                combined.push(collect);
                byKey[collect[0].id] = collect;
                collect = [];
            }
        }
        else if (type.render) {
            combined.push(line);
            byKey[line.id] = line;
        }
    });
    const data = { combined, byKey };
    linesCombined.set(lines, data);
    return data;
}
// Most changes will occur to adjacent lines, so the simplistic approach
export function getChangedRanges(oldC, newC) {
    const oldLength = oldC.length;
    const newLength = newC.length;
    const minLength = Math.min(oldLength, newLength);
    let oldStart = 0, oldEnd = 0, newStart = 0, newEnd = 0;
    for (let i = 0; i < minLength; i++) {
        if (!isSame(oldC[i], newC[i])) {
            oldStart = newStart = i;
            break;
        }
    }
    for (let i = 0; i < minLength; i++) {
        if (!isSame(oldC[oldLength - i - 1], newC[newLength - i - 1])) {
            oldEnd = oldLength - i;
            newEnd = newLength - i;
            break;
        }
    }
    return [[oldStart, oldEnd], [newStart, newEnd]];
}
export function renderInline(editor, delta, forHTML) {
    const { formats, embeds } = editor.typeset;
    let inlineChildren = [];
    let trailingBreak = true;
    delta.ops.forEach((op, i, array) => {
        let children = [];
        if (typeof op.insert === 'string') {
            const prev = array[i - 1];
            const next = array[i + 1];
            let str = op.insert.replace(/  /g, '\xA0 ').replace(/  /g, ' \xA0');
            if (!prev || typeof prev.insert === 'object')
                str = str.replace(/^ /, '\xA0');
            if (!next || typeof next.insert === 'object' || startsWithSpace(next))
                str = str.replace(/ $/, '\xA0');
            trailingBreak = false;
            children.push(str);
        }
        else if (op.insert) {
            const embed = embeds.findByAttributes(op.insert);
            if (embed === null || embed === void 0 ? void 0 : embed.render) {
                children.push(embed.render(op.insert, EMPTY_ARR, editor, forHTML));
                if (embed.name === 'br')
                    trailingBreak = true;
                else if (!embed.noFill)
                    trailingBreak = false;
            }
        }
        if (op.attributes) {
            // Sort them by the order found in formats
            Object.keys(op.attributes).sort((a, b) => formats.priority(b) - formats.priority(a)).forEach(name => {
                const type = formats.get(name);
                if (type === null || type === void 0 ? void 0 : type.render) {
                    const node = type.render(op.attributes, children, editor, forHTML);
                    if (node) {
                        nodeFormatType.set(node, type); // Store for merging
                        children = [node];
                    }
                }
            });
        }
        inlineChildren.push.apply(inlineChildren, children);
    });
    // Merge marks to optimize
    inlineChildren = mergeChildren(inlineChildren);
    if (trailingBreak)
        inlineChildren.push(BR);
    return inlineChildren;
}
function isSame(oldEntry, newEntry) {
    if (oldEntry === newEntry)
        return true;
    return Array.isArray(oldEntry)
        && Array.isArray(newEntry)
        && oldEntry.length === newEntry.length
        && oldEntry.every((b, i) => b === newEntry[i]);
}
function getLineType(editor, line) {
    let type = linesType.get(line.attributes);
    if (!type) {
        type = editor.typeset.lines.findByAttributes(line.attributes, true);
        linesType.set(line.attributes, type);
    }
    return type;
}
// Joins adjacent mark nodes
function mergeChildren(oldChildren) {
    const children = [];
    oldChildren.forEach((next, i) => {
        const index = children.length - 1;
        const prev = children[index];
        if (prev && typeof prev !== 'string' && typeof next !== 'string' && nodeFormatType.has(prev) &&
            nodeFormatType.get(prev) === nodeFormatType.get(next) && isEqual(prev.props, next.props)) {
            prev.children = prev.children.concat(next.children);
        }
        else if (prev && typeof prev === 'string' && typeof next === 'string') {
            children[index] += next; // combine adjacent text nodes
        }
        else {
            children.push(next);
            if (prev && typeof prev !== 'string' && prev.children) {
                prev.children = mergeChildren(prev.children);
            }
        }
    });
    if (children.length) {
        const last = children[children.length - 1];
        if (last && typeof last !== 'string' && last.children) {
            last.children = mergeChildren(last.children);
        }
    }
    return children;
}
function startsWithSpace(op) {
    return typeof op.insert === 'string' && op.insert[0] === ' ';
}
//# sourceMappingURL=rendering.js.map