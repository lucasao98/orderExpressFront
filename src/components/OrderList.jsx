import { useAuth } from '../context/AuthContext.jsx'

const BASE_URL = 'http://localhost:3002/v1'

const STATUS_LABELS = {
  RECEIVED: 'Recebido',
  PREPARING: 'Em preparo',
  OUT_FOR_DELIVERY: 'Saiu para entrega',
  DELIVERED: 'Entregue',
  CANCELED: 'Cancelado',
}

export default function OrderList({ contacts, onEdit, onDelete }) {
  const { user } = useAuth()

  async function handleDelete(order) {
    if (!confirm('Excluir este pedido?')) return

    try {
      const response = await fetch(`${BASE_URL}/orders/${order.orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      })

      if (!response.ok) {
        alert('Não foi possível excluir o pedido.')
        return
      }

      onDelete()
    } catch (err) {
      alert('Não foi possível conectar ao servidor.')
    }
  }

  if (contacts.length === 0) {
    return (
      <div className="empty-state">
        <strong>Nenhum pedido encontrado</strong>
        Adicione um novo pedido ou ajuste sua busca.
      </div>
    )
  }

  return (
    <div className="card-grid">
      {contacts.map((order, index) => (
        <div className="contact-card" key={index}>
          <div className="contact-tab" />
          <h3 className="contact-name">Cliente: {order.userName}</h3>
          {order.userEmail && <p className="contact-meta">Email: {order.userEmail}</p>}
          <p className="contact-meta">
            Status: {STATUS_LABELS[order.orderStatus] || order.orderStatus}
          </p>
          <p className="contact-meta">Total: R$ {order.totalPrice.toFixed(2)}</p>
          <div className="contact-actions">
            <button className="btn-mini" onClick={() => onEdit(order)}>Editar</button>
            <button className="btn-mini danger" onClick={() => handleDelete(order)}>Excluir</button>
          </div>
        </div>
      ))}
    </div>
  )
}