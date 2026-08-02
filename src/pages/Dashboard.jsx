import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import OrderList from '../components/OrderList.jsx'
import OrderForm from '../components/OrderForm.jsx'
import AddressForm from '../components/AddressForm.jsx'

const BASE_URL = 'http://localhost:3002/v1'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null) // pedido sendo editado, ou null
  const [showForm, setShowForm] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)

  // Busca de pedido por id
  const [orderIdSearch, setOrderIdSearch] = useState('')
  const [searchedOrder, setSearchedOrder] = useState(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

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

  async function handleSearchOrder(e) {
    e.preventDefault()
    if (!orderIdSearch.trim()) return

    setSearching(true)
    setSearchError('')
    setSearchedOrder(null)

    try {
      const response = await fetch(`${BASE_URL}/orders/${orderIdSearch.trim()}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Pedido não encontrado.')
      }

      const data = await response.json()
      setSearchedOrder(data)
    } catch (err) {
      setSearchError(err.message || 'Não foi possível conectar ao servidor.')
    } finally {
      setSearching(false)
    }
  }

  function clearSearch() {
    setOrderIdSearch('')
    setSearchedOrder(null)
    setSearchError('')
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

  function handleAddressSave() {
    setShowAddressForm(false)
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
          <div>
            <button className="btn-secondary" onClick={() => setShowAddressForm(true)}>
              + Novo Endereço
            </button>
            <button className="btn-add" onClick={openNew}>+ Novo Pedido</button>
          </div>
        </div>

        <form onSubmit={handleSearchOrder} className="field" style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="orderIdSearch">Buscar pedido por ID</label>
            <input
              id="orderIdSearch"
              value={orderIdSearch}
              onChange={(e) => setOrderIdSearch(e.target.value)}
              placeholder="Cole o ID do pedido"
            />
          </div>
          <button type="submit" className="btn-secondary" disabled={searching}>
            {searching ? 'Buscando...' : 'Buscar'}
          </button>
          {(searchedOrder || searchError) && (
            <button type="button" className="btn-mini" onClick={clearSearch}>
              Limpar
            </button>
          )}
        </form>

        {searchError && <p className="login-error">{searchError}</p>}

        {searchedOrder && (
          <>
            <p className="page-title-sub">Resultado da busca:</p>
            <OrderList contacts={[searchedOrder]} onEdit={openEdit} onDelete={handleDelete} />
          </>
        )}

        {loading && <p>Carregando pedidos...</p>}
        {error && <p className="login-error">{error}</p>}

        {!searchedOrder && (
          <OrderList contacts={filtered} onEdit={openEdit} onDelete={handleDelete} />
        )}
      </main>

      {showForm && (
        <OrderForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null) }}
        />
      )}

      {showAddressForm && (
        <AddressForm
          onSave={handleAddressSave}
          onCancel={() => setShowAddressForm(false)}
        />
      )}
    </div>
  )
}