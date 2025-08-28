import tinymce from 'tinymce/tinymce'
import 'tinymce/models/dom'
import 'tinymce/themes/silver'
import { templateStore } from './store.js'

export async function createEditor() {
    return tinymce.init({
        selector: '#editor',
        inline: true,
        menubar: false,
        toolbar: false,
        skin: false,
        content_css: false,
        valid_elements: '*[*]',
        setup: (editor) => {
            editor.on('keydown', (e) => {
                if (e.key !== 'Backspace' && e.key !== 'Delete') return
                const rng = editor.selection.getRng()
                if (!rng || !rng.collapsed) return

                const node = rng.startContainer
                const offset = rng.startOffset

                const prev = () => {
                    if (node.nodeType === 3) {
                        if (offset > 0) return null
                        return node.previousSibling || node.parentElement?.previousSibling
                    }
                    return node.childNodes[offset - 1] || node.previousSibling
                }
                const next = () => {
                    if (node.nodeType === 3) {
                        if (offset < node.textContent.length) return null
                        return node.nextSibling || node.parentElement?.nextSibling
                    }
                    return node.childNodes[offset] || node.nextSibling
                }

                const target = e.key === 'Backspace' ? prev() : next()
                if (target && target.nodeType === 1 && target.tagName === 'TEMPLATE-CHIP') {
                    e.preventDefault()
                    target.remove()
                    editor.nodeChanged()
                }
            })

            document.getElementById('insert-btn')?.addEventListener('click', () => {
                insertChipAtCaret(editor)
            })

            templateStore.addEventListener('change', () => editor.nodeChanged())
        }
    })
}

function insertChipAtCaret(editor) {
    const html = `<template-chip data-new="1" contenteditable="false"></template-chip>&nbsp;`
    editor.insertContent(html)
    // const chip = editor.getBody().querySelector('template-chip[data-new="1"]');
    // if (chip) {
    //     chip.removeAttribute('data-new');
    //     // if (typeof chip.open === 'function') chip.open(); // открыть меню выбора
    // }
    // editor.focus();
}
