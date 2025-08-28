import { templateStore } from '../store.js'

export class TemplatesPanel extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })

        const title = document.createElement('div')
        title.className = 'tp-title'
        title.textContent = 'Templates'

        this.$list = document.createElement('div')
        this.$list.className = 'tp-list'

        const ctrls = document.createElement('div')
        ctrls.className = 'tp-controls'
        const minus = document.createElement('button')
        minus.className = 'btn-sm minus'
        minus.textContent = '-'
        const plus = document.createElement('button')
        plus.className = 'btn-sm plus'
        plus.textContent = '+'
        ctrls.append(minus, plus)

        const editLabel = document.createElement('div')
        editLabel.className = 'tp-title'
        editLabel.textContent = 'Edit template'

        this.$input = document.createElement('input')
        this.$input.placeholder = 'template'
        const inputWrap = document.createElement('div')
        inputWrap.className = 'tp-edit'
        inputWrap.append(this.$input)

        const style = document.createElement('style')
        style.textContent = `
      .tp-title { font-weight: 700; margin-bottom: 8px; }
      .tp-list { border: 1px solid #000; border-radius: 6px; padding: 6px; background: #3a3c3f; max-height: 220px; overflow: auto; }
      .tp-item { padding: 6px 8px; border-radius: 4px; cursor: pointer; color: #bdbdbd; }
      .tp-item.active { background: #4a4d50; color: #e7e7e7; }
      .tp-controls { margin: 8px 0; display: flex; gap: 8px; }
      .btn-sm { width: 28px; height: 28px; padding: 0; border-radius: 6px; border: 0; cursor: pointer; font-weight: 900; }
      .minus { background: #ff7b72; color: #1d0b0b; }
      .plus { background: #7ee787; color: #0b1c0f; }
      .tp-edit input { width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid #000; background: #1c1e20; color: #e7e7e7; }
    `

        this.shadowRoot.append(style, title, this.$list, ctrls, editLabel, inputWrap)

        this.selected = 0


        this.$list.addEventListener('click', (e) => {
            const el = e.target.closest('.tp-item')
            if (!el) return
            const idx = Number(el.dataset.idx)
            if (Number.isNaN(idx)) return
            this.selected = idx
            this._updateActiveOnly()
            this._syncInput(false)
        })


        plus.addEventListener('click', () => {
            templateStore.add('template')
            this.selected = templateStore.getAll().length - 1
            this._render()
            this._syncInput(false)
        })

        minus.addEventListener('click', () => {
            if (templateStore.getAll().length === 0) return
            const idx = this.selected
            templateStore.remove(idx)
            const size = templateStore.getAll().length
            this.selected = Math.min(idx, size - 1)
            this._render()
            this._syncInput(false)
        })

        this.$input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this._commit()
                this.$input.blur()
            }
        })
        this.$input.addEventListener('blur', () => this._commit())

        templateStore.addEventListener('change', () => this._render())
        templateStore.addEventListener('removed', () => this._render())
    }

    connectedCallback() {
        this._render()
        this._syncInput(false)
    }

    _commit() {
        if (this.selected < 0) return
        templateStore.update(this.selected, this.$input.value.trim() || 'template')
        this._syncInput(false)
    }

    _syncInput(focus) {
        const items = templateStore.getAll()
        const val = items[this.selected] ?? ''
        this.$input.value = val
        if (focus) {
            this.$input.focus()
            this.$input.select()
        }
    }

    _updateActiveOnly() {
        [...this.$list.children].forEach((n) => {
            n.classList.toggle('active', Number(n.dataset.idx) === this.selected)
        })
    }

    _render() {
        const items = templateStore.getAll()
        this.$list.innerHTML = ''
        items.forEach((text, idx) => {
            const div = document.createElement('div')
            div.className = 'tp-item' + (idx === this.selected ? ' active' : '')
            div.dataset.idx = String(idx)
            div.textContent = text
            div.title = text
            this.$list.appendChild(div)
        })
        if (items.length === 0) this.selected = -1
    }
}

customElements.define('templates-panel', TemplatesPanel)
