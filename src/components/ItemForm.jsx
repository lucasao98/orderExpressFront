import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

const BASE_URL = 'http://localhost:3002/v1'

const empty = { name: '', price: '', stock: '' }

export default function ItemForm({ onSave, onCancel }) {
  const { user } = useAuth()
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.price || !form.stock) return

    setError('')
    setSaving(true)

    try {
      const response = await fetch(`${BASE_URL}/itens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          item_name: form.name,
          quantity_available: Number(form.stock),
          price: Number(form.price),
        }),
      })

      if (!response.ok) {
        setError('Não foi possível cadastrar o item.')
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
        <h2 className="modal-title">Novo item</h2>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Nome</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              disabled={saving}
            />
          </div>
          <div className="field">
            <label htmlFor="price">Preço (R$)</label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={handleChange}
              required
              disabled={saving}
            />
          </div>
          <div className="field">
            <label htmlFor="stock">Quantidade disponível em estoque</label>
            <input
              id="stock"
              name="stock"
              type="number"
              step="1"
              min="0"
              value={form.stock}
              onChange={handleChange}
              required
              disabled={saving}
            />
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
