import { useEffect, useRef, useState } from 'react'
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
  const submittingRef = useRef(false) // trava síncrona contra duplo clique/submit

  // Dados para criação de um novo pedido
  const [items, setItems] = useState([])
  const [addresses, setAddresses] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState('')
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [orderItems, setOrderItems] = useState([]) // itens já adicionados ao pedido
  const [selectedAddressIndex, setSelectedAddressIndex] = useState('')

  const isEditing = Boolean(initial)

  useEffect(() => {
    if (!isEditing) {
      loadOptions()
    }
  }, [])

  async function loadOptions() {
    setLoadingOptions(true)
    setError('')
    try {
      const [itemsResponse, addressesResponse] = await Promise.all([
        fetch(`${BASE_URL}/itens`, {
          headers: { 'Authorization': `Bearer ${user.token}` },
        }),
        fetch(`${BASE_URL}/users/address/${user.userId}`, {
          headers: { 'Authorization': `Bearer ${user.token}` },
        }),
      ])

      if (!itemsResponse.ok || !addressesResponse.ok) {
        throw new Error('Não foi possível carregar itens ou endereços.')
      }

      const itemsData = await itemsResponse.json()
      const addressesData = await addressesResponse.json()

      setItems(itemsData)
      setAddresses(addressesData)
    } catch (err) {
      setError(err.message || 'Não foi possível conectar ao servidor.')
    } finally {
      setLoadingOptions(false)
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const selectedItem = items.find((item) => String(item.item_id) === String(selectedItemId))
  const alreadyAdded = orderItems.some((oi) => String(oi.item_id) === String(selectedItemId))

  function handleAddItem() {
    if (!selectedItemId || !selectedItem) return
    if (alreadyAdded) {
      setError('Esse item já foi adicionado ao pedido.')
      return
    }

    const quantity = Math.max(1, Math.min(Number(selectedQuantity) || 1, selectedItem.quantity_available))

    setOrderItems((prev) => [
      ...prev,
      {
        item_id: selectedItem.item_id,
        item_name: selectedItem.item_name,
        price: selectedItem.price,
        quantity,
      },
    ])
    setSelectedItemId('')
    setSelectedQuantity(1)
    setError('')
  }

  function handleRemoveItem(itemId) {
    setOrderItems((prev) => prev.filter((oi) => oi.item_id !== itemId))
  }

  function formatAddress(address) {
    return `${address.street}, ${address.number} - ${address.city}/${address.state}`
  }

  const totalPrice = orderItems.reduce((sum, oi) => sum + oi.price * oi.quantity, 0)

  async function handleSubmit(e) {
    e.preventDefault()

    // Bloqueia imediatamente qualquer clique/submit repetido, sem esperar o re-render
    if (submittingRef.current) return
    submittingRef.current = true

    setError('')

    if (isEditing) {
      if (!form.orderStatus) {
        submittingRef.current = false
        return
      }

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
          submittingRef.current = false
          return
        }

        onSave()
      } catch (err) {
        setError('Não foi possível conectar ao servidor.')
        setSaving(false)
        submittingRef.current = false
      }
      return
    }

    // Criação de novo pedido
    if (selectedAddressIndex === '') {
      setError('Selecione um endereço de entrega.')
      submittingRef.current = false
      return
    }
    if (orderItems.length === 0) {
      setError('Adicione ao menos um item.')
      submittingRef.current = false
      return
    }

    const address = addresses[selectedAddressIndex]

    if (!address.addressId) {
      setError('Endereço sem identificador. Não é possível criar o pedido.')
      submittingRef.current = false
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          order_status: 'RECEIVED',
          total_price: totalPrice,
          user_id: user.userId,
          address_id: address.addressId,
          items: orderItems.map((oi) => ({
            item_id: oi.item_id,
            quantity: oi.quantity,
          })),
        }),
      })

      if (!response.ok) {
        setError('Não foi possível criar o pedido.')
        setSaving(false)
        submittingRef.current = false
        return
      }

      onSave()
    } catch (err) {
      setError('Não foi possível conectar ao servidor.')
      setSaving(false)
      submittingRef.current = false
    }
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">
          {isEditing ? 'Editar pedido' : 'Novo pedido'}
        </h2>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {isEditing ? (
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
          ) : (
            <>
              {loadingOptions && <p>Carregando itens e endereços...</p>}

              {!loadingOptions && (
                <>
                  <div className="field">
                    <label htmlFor="itemSelect">Item</label>
                    <select
                      id="itemSelect"
                      value={selectedItemId}
                      onChange={(e) => {
                        setSelectedItemId(e.target.value)
                        setSelectedQuantity(1)
                      }}
                      disabled={saving}
                    >
                      <option value="" disabled>Selecione um item</option>
                      {items.map((item) => (
                        <option
                          key={item.item_id}
                          value={item.item_id}
                          disabled={item.quantity_available <= 0}
                        >
                          {item.item_name} — R$ {item.price.toFixed(2)} (estoque: {item.quantity_available})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedItem && (
                    <div className="field">
                      <label htmlFor="itemQuantity">Quantidade</label>
                      <input
                        id="itemQuantity"
                        type="number"
                        min="1"
                        max={selectedItem.quantity_available}
                        value={selectedQuantity}
                        onChange={(e) => setSelectedQuantity(e.target.value)}
                        disabled={saving}
                      />
                      <button type="button" className="btn-secondary" onClick={handleAddItem} disabled={saving}>
                        Adicionar
                      </button>
                    </div>
                  )}

                  {orderItems.length > 0 && (
                    <div className="field">
                      <label>Itens do pedido</label>
                      <ul>
                        {orderItems.map((oi) => (
                          <li key={oi.item_id}>
                            {oi.item_name} — {oi.quantity}x (R$ {oi.price.toFixed(2)} cada)
                            {' '}
                            <button
                              type="button"
                              className="btn-mini danger"
                              onClick={() => handleRemoveItem(oi.item_id)}
                              disabled={saving}
                            >
                              Remover
                            </button>
                          </li>
                        ))}
                      </ul>
                      <p><strong>Total: R$ {totalPrice.toFixed(2)}</strong></p>
                    </div>
                  )}

                  <div className="field">
                    <label htmlFor="address">Endereço de entrega</label>
                    <select
                      id="address"
                      value={selectedAddressIndex}
                      onChange={(e) => setSelectedAddressIndex(e.target.value)}
                      required
                      disabled={saving}
                    >
                      <option value="" disabled>Selecione um endereço</option>
                      {addresses.map((address, index) => (
                        <option key={index} value={index}>
                          {formatAddress(address)}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="btn-add" disabled={saving || loadingOptions}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}