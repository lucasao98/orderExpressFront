import { useState } from 'react'

const empty = { orderStatus: 'RECEIVED' }

const STATUS_OPTIONS = ['RECEIVED', 'PREPARING', 'DELIVERED', 'CANCELED']

export default function OrderForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || empty)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.orderStatus) return
    onSave(form)
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">
          {initial ? 'Editar pedido' : 'Novo pedido'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="orderStatus">Status do pedido</label>
            <select
              id="orderStatus"
              name="orderStatus"
              value={form.orderStatus}
              onChange={handleChange}
              required
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn-add">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}