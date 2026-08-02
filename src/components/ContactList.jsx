export default function ContactList({ contacts, onEdit, onDelete }) {
  if (contacts.length === 0) {
    return (
      <div className="empty-state">
        <strong>Nenhum contato encontrado</strong>
        Adicione um novo contato ou ajuste sua busca.
      </div>
    )
  }

  return (
    <div className="card-grid">
      {contacts.map((c) => (
        <div className="contact-card" key={c.id}>
          <div className="contact-tab" />
          <h3 className="contact-name">{c.name}</h3>
          {c.email && <p className="contact-meta">{c.email}</p>}
          {c.phone && <p className="contact-meta">{c.phone}</p>}
          <div className="contact-actions">
            <button className="btn-mini" onClick={() => onEdit(c)}>Editar</button>
            <button className="btn-mini danger" onClick={() => onDelete(c.id)}>Excluir</button>
          </div>
        </div>
      ))}
    </div>
  )
}
