# OrderExpress — Gerenciador de Pedidos

Projeto simples em React com tela de login e CRUD completo para simular sistema de pedidos

## Como rodar

```bash
npm install
npm run dev
```

Depois abra o endereço mostrado no terminal (geralmente `http://localhost:5173`).

## Login de demonstração

- **Email:** `admin@foody.com`
- **Senha:** `123456`


## Estrutura

```
src/
  context/AuthContext.jsx   → lógica de autenticação (mock, salva sessão no localStorage)
  components/
    ProtectedRoute.jsx      → bloqueia acesso ao dashboard sem login
    ContactForm.jsx         → modal de criar/editar contato
    ContactList.jsx         → listagem em cards
  pages/
    Login.jsx               → tela de login
    Dashboard.jsx           → tela principal com o CRUD de contatos
  App.jsx                   → rotas
  main.jsx                  → ponto de entrada
  index.css                 → estilos e tokens de design
```

## Dados

Os dados vem da api feita em Spring Boot localizadas na porta: 3002.
BaseUrl: http://localhost:3002/v1/