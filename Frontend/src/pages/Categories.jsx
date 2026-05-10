import { useState, useEffect, useCallback } from 'react'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/categories'
import Modal from '../components/Modal'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'
import './Categories.css'

const emptyForm = { name: '', type: 'expense' }

const defaultIncomeCategories = ['Salary', 'Freelance', 'Investments', 'Bonus', 'Other Income']
const defaultExpenseCategories = ['Food', 'Transport', 'Rent', 'Entertainment', 'Healthcare', 'Shopping', 'Utilities', 'Other']

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getCategories()
      setCategories(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  function openAdd(defaultType = 'expense') {
    setEditingId(null)
    setForm({ ...emptyForm, type: defaultType })
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(c) {
    setEditingId(c.id)
    setForm({ name: c.name, type: c.type })
    setFormError('')
    setModalOpen(true)
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this category? Transactions using it will lose their category.')) return
    await deleteCategory(id)
    fetchCategories()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      setFormError('Name is required')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      if (editingId) {
        await updateCategory(editingId, form)
      } else {
        await createCategory(form)
      }
      setModalOpen(false)
      fetchCategories()
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  const incomeCategories = categories.filter(c => c.type === 'income')
  const expenseCategories = categories.filter(c => c.type === 'expense')

  return (
    <div className="categories-page">
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Organize your income and expenses</p>
        </div>
        <button className="btn btn-primary" id="add-category-btn" onClick={() => openAdd()}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex-center" style={{ height: 200 }}><div className="spinner" /></div>
      ) : (
        <div className="categories-grid">
          <CategorySection
            title="Income Categories"
            type="income"
            items={incomeCategories}
            defaults={defaultIncomeCategories}
            onAdd={() => openAdd('income')}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
          <CategorySection
            title="Expense Categories"
            type="expense"
            items={expenseCategories}
            defaults={defaultExpenseCategories}
            onAdd={() => openAdd('expense')}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Category' : 'Add Category'} size="sm">
        <form onSubmit={handleSubmit} className="modal-form">
          {formError && <div className="error-message">{formError}</div>}
          <div className="form-group">
            <label className="form-label" htmlFor="cat-name">Category Name</label>
            <input id="cat-name" className="form-input" placeholder="e.g. Groceries" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="cat-type">Type</label>
            <select id="cat-type" className="form-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="flex gap-3" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" id="save-category-btn" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function CategorySection({ title, type, items, defaults, onAdd, onEdit, onDelete }) {
  const colorClass = type === 'income' ? 'section-income' : 'section-expense'
  return (
    <div className={`card cat-section ${colorClass}`}>
      <div className="flex-between" style={{ marginBottom: 16 }}>
        <div>
          <h2 className="cat-section-title">{title}</h2>
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>{items.length} categories</p>
        </div>
        <button className="btn btn-ghost btn-sm" id={`add-${type}-category-btn`} onClick={onAdd}>
          <Plus size={14} /> Add
        </button>
      </div>

      {items.length === 0 ? (
        <div className="empty-state" style={{ padding: '30px 0' }}>
          <Tag size={28} />
          <p style={{ fontSize: '0.875rem' }}>No {type} categories yet</p>
          <button className="btn btn-ghost btn-sm" onClick={onAdd}><Plus size={14} /> Add one</button>
        </div>
      ) : (
        <div className="cat-list">
          {items.map(c => (
            <div key={c.id} className="cat-item">
              <div className={`cat-badge cat-badge-${type}`}>
                <Tag size={13} />
                {c.name}
              </div>
              <div className="flex gap-2">
                <button className="btn-icon" id={`edit-cat-${c.id}`} onClick={() => onEdit(c)}><Pencil size={13} /></button>
                <button className="btn-icon" id={`del-cat-${c.id}`} style={{ color: 'var(--red)' }} onClick={() => onDelete(c.id)}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 && (
        <div className="cat-suggestions">
          <p className="suggestions-label">Suggestions:</p>
          <div className="suggestions-list">
            {defaults.map(name => (
              <span key={name} className="suggestion-chip">{name}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
