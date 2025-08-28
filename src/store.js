export class TemplateStore extends EventTarget {
    constructor(initial = []) {
        super()
         const saved = (() => {
            try { return JSON.parse(localStorage.getItem('templates:list') || '[]') }
            catch { return [] }
        })()
        this.items = saved.length ? saved : [...initial]
        this._persist()
    }

    _emit() {
        this._persist()
        this.dispatchEvent(new CustomEvent('change', { detail: { items: [...this.items] } }))
    }

    _persist() {
        try { localStorage.setItem('templates:list', JSON.stringify(this.items)) } catch {}
    }

    getAll() { return [...this.items]; }

    add(text = 'template') {
        this.items.push(String(text))
        this._emit()
    }

    remove(index) {
        if (index < 0 || index >= this.items.length) return
        const [removed] = this.items.splice(index, 1)
        this.dispatchEvent(new CustomEvent('removed', { detail: { removed, index } }))
        this._emit()
    }

    update(index, text) {
        if (index < 0 || index >= this.items.length) return
        this.items[index] = String(text)
        this._emit()
    }

    indexOf(text) { return this.items.findIndex(x => x === text) }

    exists(text) { return this.indexOf(text) !== -1 }
}


export const templateStore = new TemplateStore(['template 1', 'template 2', 'template 3'])
