import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import ContactList from '../components/ContactList.jsx'
import ContactForm from '../components/ContactForm.jsx'

const STORAGE_KEY = 'cm_contacts'

const seed = [
  { id: 1, name: 'Marina Souza', email: 'marina@exemplo.com', phone: '(11) 98888-1234' },
  { id: 2, name: 'Carlos Andrade', email: 'carlos@exemplo.com', phone: '(21) 97777-5678' },
]

function loadContacts() {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved ? JSON.parse(saved) : seed
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [contacts, setContacts] = useState(loadContacts)
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null) // contato sendo editado, ou null
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts))
  }, [contacts])

  function openNew() {
    setEditing(null)
    setShowForm(true)
  }

  function openEdit(contact) {
    setEditing(contact)
    setShowForm(true)
  }

  function handleSave(form) {
    if (editing) {
      setContacts(contacts.map((c) => (c.id === editing.id ? { ...c, ...form } : c)))
    } else {
      setContacts([...contacts, { ...form, id: Date.now() }])
    }
    setShowForm(false)
    setEditing(null)
  }

  function handleDelete(id) {
    if (confirm('Excluir este contato?')) {
      setContacts(contacts.filter((c) => c.id !== id))
    }
  }

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" />
          OrderExpress
        </div>
        <div className="topbar-right">
          <span>Olá, {user.username}</span>
          <button className="logout-btn" onClick={logout}>Sair</button>
        </div>
      </header>

      <main className="content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Contatos</h1>
            <p className="page-title-sub">{contacts.length} contato(s) cadastrado(s)</p>
          </div>
          <button className="btn-add" onClick={openNew}>+ Novo contato</button>
        </div>

        <div className="search-row">
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <ContactList contacts={filtered} onEdit={openEdit} onDelete={handleDelete} />
      </main>

      {showForm && (
        <ContactForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null) }}
        />
      )}
    </div>
  )
}
