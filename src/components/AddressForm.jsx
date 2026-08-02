import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

const BASE_URL = 'http://localhost:3002/v1'

const empty = { street: '', number: '', city: '', state: '' }

export default function AddressForm({ onSave, onCancel }) {
  const { user } = useAuth()
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.street.trim() || !form.number || !form.city.trim() || !form.state.trim()) return

    setError('')
    setSaving(true)

    try {
      const response = await fetch(`${BASE_URL}/users/address/${user.userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          street: form.street,
          number: Number(form.number),
          city: form.city,
          state: form.state,
        }),
      })

      if (!response.ok) {
        setError('Não foi possível cadastrar o endereço.')
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
        <h2 className="modal-title">Novo endereço</h2>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="street">Rua</label>
            <input
              id="street"
              name="street"
              value={form.street}
              onChange={handleChange}
              required
              disabled={saving}
            />
          </div>
          <div className="field">
            <label htmlFor="number">Número</label>
            <input
              id="number"
              name="number"
              type="number"
              value={form.number}
              onChange={handleChange}
              required
              disabled={saving}
            />
          </div>
          <div className="field">
            <label htmlFor="city">Cidade</label>
            <input
              id="city"
              name="city"
              value={form.city}
              onChange={handleChange}
              required
              disabled={saving}
            />
          </div>
          <div className="field">
            <label htmlFor="state">Estado</label>
            <input
              id="state"
              name="state"
              value={form.state}
              onChange={handleChange}
              placeholder="Ex: SP"
              maxLength={2}
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