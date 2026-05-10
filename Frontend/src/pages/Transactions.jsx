import { useState, useEffect, useCallback } from 'react'
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../api/transactions'
import { getCategories } from '../api/categories'
import Modal from '../components/Modal'
import { Plus, Pencil, Trash2, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import './Transactions.css'

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0)
}

const emptyForm = { title: '', amount: '', type: 'expense', category_id: '', date: new Date().toISOString().slice(0, 10), note: '' }

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [filters, setFilters] = useState({ type: '', category_id: '', date_from: '', date_to: '' })
  const [showFilters, setShowFilters] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.type) params.type = filters.type
      if (filters.category_id) params.category_id = filters.category_id
      if (filters.date_from) params.date_from = filters.date_from
      if (filters.date_to) params.date_to = filters.date_to
      const [txns, cats] = await Promise.all([getTransactions(params), getCategories()])
      setTransactions(txns)
      setCategories(cats)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchData() }, [fetchData])

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(t) {
    setEditingId(t.id)
    setForm({
      title: t.title,
      amount: String(t.amount),
      type: t.type,
      category_id: t.category_id ? String(t.category_id) : '',
      date: t.date,
      note: t.note || '',
    })
    setFormError('')
    setModalOpen(true)
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this transaction?')) return
    await deleteTransaction(id)
    fetchData()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.amount) {
      setFormError('Title and amount are required')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        category_id: form.category_id ? parseInt(form.category_id) : null,
      }
      if (editingId) {
        await updateTransaction(editingId, payload)
      } else {
        await createTransaction(payload)
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save transaction')
    } finally {
      setSaving(false)
    }
  }

  const filteredCategories = categories.filter(c => !form.type || c.type === form.type)

  return (
    <div className="transactions-page">
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">{transactions.length} transaction{transactions.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-ghost" id="toggle-filters-btn" onClick={() => setShowFilters(v => !v)}>
            <Filter size={16} /> Filters
          </button>
          <button className="btn btn-primary" id="add-transaction-btn" onClick={openAdd}>
            <Plus size={16} /> Add Transaction
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="card filters-bar">
          <div className="filters-grid">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-input" value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={filters.category_id} onChange={e => setFilters(f => ({ ...f, category_id: e.target.value }))}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">From</label>
              <input type="date" className="form-input" value={filters.date_from} onChange={e => setFilters(f => ({ ...f, date_from: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">To</label>
              <input type="date" className="form-input" value={filters.date_to} onChange={e => setFilters(f => ({ ...f, date_to: e.target.value }))} />
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ type: '', category_id: '', date_from: '', date_to: '' })}>
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="flex-center" style={{ height: 200 }}><div className="spinner" /></div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <ArrowLeftRight size={40} />
            <p>No transactions found</p>
            <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add your first transaction</button>
          </div>
        ) : (
          <table className="txn-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id} className="txn-row">
                  <td>
                    <div className="txn-title-cell">
                      <div className="txn-icon" style={{ background: t.type === 'income' ? 'var(--green-bg)' : 'var(--red-bg)' }}>
                        {t.type === 'income' ? <ArrowUpRight size={14} color="var(--green)" /> : <ArrowDownRight size={14} color="var(--red)" />}
                      </div>
                      <div>
                        <p className="txn-name">{t.title}</p>
                        {t.note && <p className="txn-note">{t.note}</p>}
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge badge-${t.type}`}>{t.type}</span></td>
                  <td className="text-secondary">{t.category_name || '—'}</td>
                  <td className="text-muted">{t.date}</td>
                  <td className={`txn-amount ${t.type === 'income' ? 'text-green' : 'text-red'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn-icon" id={`edit-txn-${t.id}`} onClick={() => openEdit(t)}><Pencil size={14} /></button>
                      <button className="btn-icon" id={`del-txn-${t.id}`} style={{ color: 'var(--red)' }} onClick={() => handleDelete(t.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Transaction' : 'Add Transaction'}
      >
        <form onSubmit={handleSubmit} className="modal-form">
          {formError && <div className="error-message">{formError}</div>}
          <div className="form-group">
            <label className="form-label" htmlFor="txn-title">Title</label>
            <input id="txn-title" className="form-input" placeholder="e.g. Grocery shopping" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="txn-amount">Amount</label>
              <input id="txn-amount" type="number" min="0.01" step="0.01" className="form-input" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="txn-type">Type</label>
              <select id="txn-type" className="form-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value, category_id: '' }))}>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="txn-category">Category</label>
              <select id="txn-category" className="form-input" value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
                <option value="">No Category</option>
                {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="txn-date">Date</label>
              <input id="txn-date" type="date" className="form-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="txn-note">Note (optional)</label>
            <textarea id="txn-note" className="form-input" rows={2} placeholder="Add a note..." value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} style={{ resize: 'vertical' }} />
          </div>
          <div className="flex gap-3" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" id="save-transaction-btn" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Update' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function ArrowLeftRight({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3L4 7l4 4" /><path d="M4 7h16" /><path d="M16 21l4-4-4-4" /><path d="M20 17H4" />
    </svg>
  )
}
