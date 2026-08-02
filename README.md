# OrderExpress — Gerenciador de Contatos

Projeto simples em React com tela de login e CRUD completo (criar, ler, editar, excluir).

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

Os contatos ficam salvos no `localStorage` do navegador (não há backend).
Isso é só para fins de demonstração — para persistência real, troque as
funções `loadContacts` / `setContacts` em `Dashboard.jsx` por chamadas
a uma API (ex: `fetch('/api/contacts')`).

## Onde editar para deixar do seu jeito

- **Cores e tipografia:** `src/index.css` (variáveis no topo do arquivo, em `:root`)
- **Campos do formulário:** `src/components/ContactForm.jsx`
- **Regras de login:** `src/context/AuthContext.jsx`
