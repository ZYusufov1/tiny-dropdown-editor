import { templateStore } from '../store.js'

export class TemplateChip extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })

        this._value = this.hasAttribute('value') ? this.getAttribute('value') : null
        this._open = false

        this.$chip = document.createElement('button')
        this.$chip.part = 'chip'
        this.$chip.type = 'button'
        this.$chip.tabIndex = -1
        this.$chip.textContent = this._label()
        this.$chip.style.position = 'relative'

        this.$menu = document.createElement('div')
        this.$menu.part = 'menu'
        this.$menu.style.display = 'none'
        this.$menu.style.position = 'absolute'
        this.$menu.style.top = '100%'
        this.$menu.style.left = '0'

        const wrap = document.createElement('span')
        wrap.style.position = 'relative'
        wrap.append(this.$chip, this.$menu)

        this.shadowRoot.append(wrap)

        this._onDocClick = this._onDocClick.bind(this)
        this._onStore = this._onStore.bind(this)
    }

    static get observedAttributes() { return ['value'] }

    attributeChangedCallback(name, _old, val) {
        if (name === 'value') {
            this._value = (val === null || val === '') ? null : val
            this._refresh()
        }
    }

    connectedCallback() {
        this.setAttribute('contenteditable', 'false')
        this.setAttribute('draggable', 'false')


        this.$chip.addEventListener('mousedown', (e) => {
            e.preventDefault()
            e.stopPropagation()
            this.toggle()
        })
        this.$chip.addEventListener('click', (e) => {
            e.preventDefault()
            e.stopPropagation()
        })

        document.addEventListener('mousedown', this._onDocClick)
        templateStore.addEventListener('change', this._onStore)
        templateStore.addEventListener('removed', this._onStore)

        this._renderMenu()
        this._refresh()
    }

    disconnectedCallback() {
        document.removeEventListener('mousedown', this._onDocClick)
        templateStore.removeEventListener('change', this._onStore)
        templateStore.removeEventListener('removed', this._onStore)
    }

    _onDocClick(e) {
        if (!this.contains(e.target) && !this.shadowRoot.contains(e.target)) {
            this.close()
        }
    }

    _onStore() {
        const hasValue = !!this._value
        const exists = hasValue && templateStore.exists(this._value)
        this.dataset.error = hasValue && !exists ? 'true' : 'false'
        this.$chip.textContent = this._label()
        this._renderMenu()
    }

    _label() {
        if (!this._value) return 'select'
        return templateStore.exists(this._value) ? this._value : 'ERROR'
    }

    _renderMenu() {
        this.$menu.innerHTML = ''
        const items = templateStore.getAll()
        items.forEach(text => {
            const a = document.createElement('a')
            a.href = '#'
            a.part = 'menu-item'
            a.textContent = text

            a.addEventListener('mousedown', (e) => {
                e.preventDefault()
                e.stopPropagation()
                this.value = text
                this.close()
            })
            a.addEventListener('click', (e) => {
                e.preventDefault()
                e.stopPropagation()
            })
            this.$menu.appendChild(a)
        })
    }

    _refresh() {
        const hasValue = !!this._value
        const exists = hasValue && templateStore.exists(this._value)
        this.dataset.error = hasValue && !exists ? 'true' : 'false'
        this.$chip.textContent = this._label()
    }

    open() { this._open = true; this.$menu.style.display = 'block'; }
    close() { this._open = false; this.$menu.style.display = 'none'; }
    toggle() { this._open ? this.close() : this.open(); }

    get value() { return this._value }
    set value(v) {
        this._value = (v === null || v === '') ? null : String(v)
        if (this._value === null) this.removeAttribute('value')
        else this.setAttribute('value', this._value)
        this._refresh()
    }
}

customElements.define('template-chip', TemplateChip)
