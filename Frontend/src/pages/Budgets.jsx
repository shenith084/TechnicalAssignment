import { useState, useEffect, useCallback } from 'react'
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../api/budgets'
import { getCategories } from '../api/categories'
import { getBudgetProgress } from '../api/dashboard'
import Modal from '../components/Modal'
import ConfirmDelete from '../components/ConfirmDelete'
import { Plus, Pencil, PiggyBank, AlertTriangle } from 'lucide-react'
import './Budgets.css'

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)
}

const today = new Date()
const emptyForm = { category_id: '', amount: '', month: today.getMonth() + 1, year: today.getFullYear() }

export default function Budgets() {
  const [budgets, setBudgets] = useState([])
  const [progress, setProgress] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(today.getFullYear())

  // Fetch budgets, budget progress, and available categories for the selected month/year
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [b, p, cats] = await Promise.all([
        getBudgets({ month: selectedMonth, year: selectedYear }),
        getBudgetProgress({ month: selectedMonth, year: selectedYear }),
        getCategories({ type: 'expense' }),
      ])
      setBudgets(b)
      setProgress(p)
      setCategories(cats)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [selectedMonth, selectedYear])

  useEffect(() => { fetchData() }, [fetchData])

  function openAdd() {
    setEditingId(null)
    setForm({ ...emptyForm, month: selectedMonth, year: selectedYear })
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(b) {
    setEditingId(b.id)
    setForm({
      category_id: String(b.category_id),
      amount: String(b.amount),
      month: b.month,
      year: b.year,
    })
    setFormError('')
    setModalOpen(true)
  }

  async function handleDelete(id) {
    try {
      await deleteBudget(id)
      fetchData()
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  // Handle creating a new budget or updating an existing one
  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.category_id || !form.amount) {
      setFormError('Category and amount are required')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const payload = {
        category_id: parseInt(form.category_id),
        amount: parseFloat(form.amount),
        month: parseInt(form.month),
        year: parseInt(form.year),
      }
      if (editingId) {
        await updateBudget(editingId, payload)
      } else {
        await createBudget(payload)
      }
      setModalOpen(false)
      setSelectedMonth(payload.month)
      setSelectedYear(payload.year)
      
      // If the month/year didn't change, manually trigger fetch
      if (payload.month === selectedMonth && payload.year === selectedYear) {
        fetchData()
      }
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save budget')
    } finally {
      setSaving(false)
    }
  }

  const progressMap = {}
  progress.forEach(p => { progressMap[p.category] = p })

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className="budgets-page">
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="page-subtitle">Manage your monthly spending limits</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <select className="form-input" style={{ width: 'auto' }} value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <input type="number" className="form-input" style={{ width: 90 }} value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} />
          <button className="btn btn-primary" id="add-budget-btn" onClick={openAdd}>
            <Plus size={16} /> Add Budget
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-center" style={{ height: 200 }}><div className="spinner" /></div>
      ) : budgets.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <PiggyBank size={40} />
            <p>No budgets for {months[selectedMonth - 1]} {selectedYear}</p>
            <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Set a Budget</button>
          </div>
        </div>
      ) : (
        <div className="budgets-grid">
          {budgets.map(b => {
            const p = progressMap[b.category_name] || {}
            const pct = p.percentage || 0
            const exceeded = p.exceeded || false
            return (
              <div key={b.id} className={`card budget-card ${exceeded ? 'budget-exceeded' : ''}`}>
                <div className="budget-card-header">
                  <div>
                    <h3 className="budget-cat-name">{b.category_name}</h3>
                    <p className="budget-period">{months[b.month - 1]} {b.year}</p>
                  </div>
                  <div className="flex gap-2" style={{ alignItems: 'center' }}>
                    <button className="btn-icon" id={`edit-budget-${b.id}`} onClick={() => openEdit(b)}><Pencil size={14} /></button>
                    <ConfirmDelete onConfirm={() => handleDelete(b.id)} label="Delete budget" />
                  </div>
                </div>
                <div className="budget-amounts-row">
                  <div>
                    <p className="budget-label">Spent</p>
                    <p className="budget-spent" style={{ color: exceeded ? 'var(--red)' : 'var(--text-primary)' }}>
                      {formatCurrency(p.spent || 0)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p className="budget-label">Budget</p>
                    <p className="budget-total">{formatCurrency(b.amount)}</p>
                  </div>
                </div>
                <div className="progress-bar" style={{ height: 10, marginTop: 4 }}>
                  <div
                    className={`progress-fill ${exceeded ? 'exceeded' : pct > 75 ? 'warning' : ''}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <div className="budget-pct-row">
                  <span className={pct >= 100 ? 'text-red' : pct > 75 ? 'text-yellow' : 'text-green'}>
                    {pct.toFixed(0)}% used
                  </span>
                  {!exceeded && <span className="text-muted">Remaining: {formatCurrency(p.remaining || 0)}</span>}
                </div>
                {exceeded && (
                  <div className="budget-alert-box">
                    <AlertTriangle size={14} />
                    Over budget by {formatCurrency((p.spent || 0) - b.amount)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Budget' : 'Add Budget'}>
        <form onSubmit={handleSubmit} className="modal-form">
          {formError && <div className="error-message">{formError}</div>}
          <div className="form-group">
            <label className="form-label" htmlFor="budget-category">Category</label>
            {categories.length === 0 ? (
              <div className="budget-alert-box" style={{ marginBottom: '8px', background: 'var(--yellow-bg, #fef3c7)', color: 'var(--yellow, #d97706)', borderColor: 'rgba(217, 119, 6, 0.2)' }}>
                You need to create an expense category first in the Categories page.
              </div>
            ) : null}
            <select id="budget-category" className="form-input" value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} required disabled={categories.length === 0}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="budget-amount">Budget Amount</label>
            <input id="budget-amount" type="number" min="0.01" step="0.01" className="form-input" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="budget-month">Month</label>
              <select id="budget-month" className="form-input" value={form.month} onChange={e => setForm(f => ({ ...f, month: Number(e.target.value) }))}>
                {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="budget-year">Year</label>
              <input id="budget-year" type="number" className="form-input" value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="flex gap-3" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" id="save-budget-btn" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Update' : 'Add Budget'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
