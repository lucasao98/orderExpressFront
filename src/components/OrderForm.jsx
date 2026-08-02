import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

const BASE_URL = 'http://localhost:3002/v1'

const empty = { orderStatus: 'RECEIVED' }

const STATUS_OPTIONS = ['RECEIVED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELED']

const STATUS_LABELS = {
  RECEIVED: 'Recebido',
  PREPARING: 'Em preparo',
  OUT_FOR_DELIVERY: 'Saiu para entrega',
  DELIVERED: 'Entregue',
  CANCELED: 'Cancelado',
}

export default function OrderForm({ initial, onSave, onCancel }) {
  const { user } = useAuth()
  const [form, setForm] = useState(initial || empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.orderStatus) return

    setError('')
    setSaving(true)

    try {
      const response = await fetch(`${BASE_URL}/orders/${initial.orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ order_status: form.orderStatus }),
      })

      if (!response.ok) {
        setError('Não foi possível atualizar o status do pedido.')
        setSaving(false)
        return
      }

      onSave()
    } catch (err) {
      setError('Não foi possível conectar ao servidor.')
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">
          {initial ? 'Editar pedido' : 'Novo pedido'}
        </h2>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="orderStatus">Status do pedido</label>
            <select
              id="orderStatus"
              name="orderStatus"
              value={form.orderStatus}
              onChange={handleChange}
              required
              disabled={saving}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status] || status}
                </option>
              ))}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="btn-add" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}