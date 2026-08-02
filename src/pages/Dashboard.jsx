import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import OrderList from '../components/OrderList.jsx'
import OrderForm from '../components/OrderForm.jsx'

const BASE_URL = 'http://localhost:3002/v1'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null) // pedido sendo editado, ou null
  const [showForm, setShowForm] = useState(false)

  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    setLoading(true)
    setError('')
    try {
      const url = isAdmin
        ? `${BASE_URL}/orders`
        : `${BASE_URL}/orders/user/${user.userId}`

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Não foi possível carregar os pedidos.')
      }

      const data = await response.json()
      setOrders(data)
    } catch (err) {
      setError(err.message || 'Não foi possível conectar ao servidor.')
    } finally {
      setLoading(false)
    }
  }

  function openNew() {
    setEditing(null)
    setShowForm(true)
  }

  function openEdit(order) {
    setEditing(order)
    setShowForm(true)
  }

  function handleSave() {
    setShowForm(false)
    setEditing(null)
    loadOrders()
  }

  function handleDelete(id) {
    if (confirm('Excluir este pedido?')) {
      setOrders(orders.filter((o) => o.id !== id))
    }
  }

  const filtered = orders.filter((o) =>
    o.userName.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" />
          OrderExpress
        </div>
        <div className="topbar-right">
          <span>Olá, {user.name}</span>
          <button className="logout-btn" onClick={logout}>Sair</button>
        </div>
      </header>

      <main className="content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Pedidos</h1>
            <p className="page-title-sub">{orders.length} pedidos encontrado(s)</p>
          </div>
          <button className="btn-add" onClick={openNew}>+ Novo Pedido</button>
        </div>

        {loading && <p>Carregando pedidos...</p>}
        {error && <p className="login-error">{error}</p>}

          <OrderList contacts={filtered} onEdit={openEdit} onDelete={handleDelete} />
      </main>

      {showForm && (
        <OrderForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null) }}
        />
      )}
    </div>
  )
}