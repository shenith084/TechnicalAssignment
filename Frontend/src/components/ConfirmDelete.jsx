import { useState } from 'react'
import { Trash2, AlertTriangle, X, Check } from 'lucide-react'
import './ConfirmDelete.css'

export default function ConfirmDelete({ onConfirm, label = 'Delete' }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  if (open) {
    return (
      <div className="confirm-inline">
        <AlertTriangle size={13} className="confirm-icon" />
        <span className="confirm-text">Delete?</span>
        <button
          className="confirm-btn confirm-yes"
          onClick={handleConfirm}
          disabled={loading}
          title="Yes, delete"
        >
          {loading ? <span className="mini-spinner" /> : <Check size={12} />}
        </button>
        <button
          className="confirm-btn confirm-no"
          onClick={() => setOpen(false)}
          title="Cancel"
        >
          <X size={12} />
        </button>
      </div>
    )
  }

  return (
    <button
      className="btn-icon confirm-trigger"
      onClick={() => setOpen(true)}
      title={label}
    >
      <Trash2 size={14} />
    </button>
  )
}
