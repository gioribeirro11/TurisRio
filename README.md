[README (3).md](https://github.com/user-attachments/files/32972053/README.3.md)

# 🌴 TurisRio

Guia de turismo do **Rio de Janeiro** com pontos turísticos, roteiros prontos, eventos, gastronomia, hospedagem e recursos de acessibilidade, tudo em uma única página fácil de navegar.

![TanStack Start](https://img.shields.io/badge/TanStack_Start-ef4444?style=flat)
![React](https://img.shields.io/badge/React_19-61dafb?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06b6d4?style=flat&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ecf8e?style=flat&logo=supabase&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare_Workers-f38020?style=flat&logo=cloudflare&logoColor=white)

<!-- Adicione aqui um print ou GIF do projeto:
![Preview do TurisRio](./docs/preview.png)
-->

## ✨ Funcionalidades

- **Pontos turísticos**: Cristo Redentor, Copacabana, Pão de Açúcar, Escadaria Selarón, Arcos da Lapa e mais, com horário, preço, dica local e tags (Praia, Mirante, Aventura, Cultura, Família, Romântico, Grátis).
- **Roteiros prontos**: itinerários como "Rio em 3 dias — o essencial".
- **Eventos, cultura e gastronomia**: o que fazer, onde comer e onde ouvir samba.
- **Hospedagem**: sugestões de onde dormir, com links diretos para reserva.
- **FAQ e guia de experiências**: respostas rápidas para dúvidas comuns de quem vai viajar.
- **Contas de usuário**: cadastro e login com Supabase Auth.
- **Favoritos**: usuários logados salvam e removem lugares em `/favoritos`.
- **Suporte e feedback**: formulário para reportar bugs, tirar dúvidas ou enviar sugestões (aberto a visitantes e usuários logados).
- **Painel admin**: em `/admin/feedback`, administradores visualizam e respondem os tickets.
- **Acessibilidade**: widget com aumento/redução de fonte, alto contraste, modo calmo (pensado para autismo e TDAH), fonte para dislexia, link "Pular para o conteúdo" e navegação por teclado.

## 🧰 Tecnologias

| Camada | Tecnologia |
| --- | --- |
| Framework | [TanStack Start](https://tanstack.com/start) + [TanStack Router](https://tanstack.com/router) (SSR e rotas por arquivo) |
| UI | React 19, [Tailwind CSS 4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com) (Radix UI), Lucide Icons |
| Formulários e validação | React Hook Form, Zod |
| Dados e estado | TanStack Query |
| Backend / Auth / Banco | [Supabase](https://supabase.com) (PostgreSQL + Row Level Security) |
| Build | Vite 7 |
| Deploy | Cloudflare Workers (Wrangler) |
| Qualidade | ESLint, Prettier, TypeScript |

## 📁 Estrutura do projeto

```
TurisRio/
├── src/
│   ├── assets/                 # Imagens do Rio (hero, praias, pontos turísticos)
│   ├── components/
│   │   ├── turisrio/           # Nav e AccessibilityWidget
│   │   └── ui/                 # Componentes shadcn/ui
│   ├── contexts/               # AuthContext
│   ├── hooks/
│   ├── integrations/supabase/  # Client, tipos e middlewares de autenticação
│   ├── lib/                    # Utilitários e captura de erros
│   ├── routes/
│   │   ├── __root.tsx          # Layout raiz e metadados (SEO)
│   │   ├── index.tsx           # Página inicial
│   │   ├── auth.tsx            # Login e cadastro
│   │   ├── favoritos.tsx       # Lugares salvos do usuário
│   │   └── admin.feedback.tsx  # Painel de tickets (admin)
│   ├── server.ts               # Entrada do servidor (Cloudflare Worker)
│   └── styles.css              # Tema e estilos globais
├── supabase/
│   ├── config.toml
│   └── migrations/             # Schema, políticas RLS e roles
├── wrangler.jsonc              # Configuração do Cloudflare Workers
└── vite.config.ts
```

## 🗄️ Banco de dados

As migrations em `supabase/migrations/` criam as tabelas abaixo, todas com **Row Level Security** ativado:

| Tabela | Descrição |
| --- | --- |
| `profiles` | Perfil do usuário, criado automaticamente por trigger no cadastro |
| `favorites` | Lugares favoritos de cada usuário |
| `support_tickets` | Bugs, dúvidas e feedbacks enviados pelo formulário |
| `user_roles` | Papéis (`admin`, `moderator`, `user`), verificados pela função `has_role()` |
| `conversations` e `messages` | Estrutura para histórico de conversas por usuário |

## 🚀 Como rodar localmente

### Pré-requisitos

- [Bun](https://bun.sh) (o projeto usa `bun.lock`) ou Node.js 20+
- Um projeto no [Supabase](https://supabase.com)

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/SEU-USUARIO/TurisRio.git
cd TurisRio

# 2. Instale as dependências
bun install        # ou: npm install

# 3. Configure as variáveis de ambiente (veja a seção abaixo)

# 4. Aplique as migrations no seu projeto Supabase
#    (pelo Supabase CLI: supabase db push, ou colando os .sql no SQL Editor)

# 5. Inicie o servidor de desenvolvimento
bun run dev        # ou: npm run dev
```

### Variáveis de ambiente

Crie um arquivo `.env` na raiz com os dados do seu projeto Supabase:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publishable
VITE_SUPABASE_PROJECT_ID=seu-project-id

SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_PUBLISHABLE_KEY=sua-chave-publishable
```

> Use apenas a chave **publishable** (anon) no front-end. Nunca exponha a `service_role` key.

### Tornando um usuário admin

Depois de criar sua conta, rode no SQL Editor do Supabase:

```sql
insert into public.user_roles (user_id, role)
values ('UUID-DO-SEU-USUARIO', 'admin');
```

## 📜 Scripts disponíveis

| Comando | O que faz |
| --- | --- |
| `bun run dev` | Servidor de desenvolvimento |
| `bun run build` | Build de produção |
| `bun run build:dev` | Build em modo desenvolvimento |
| `bun run preview` | Pré-visualiza o build |
| `bun run lint` | Roda o ESLint |
| `bun run format` | Formata o código com Prettier |

## ☁️ Deploy

O projeto está configurado para **Cloudflare Workers** (`wrangler.jsonc`):

```bash
bun run build
npx wrangler deploy
```

Lembre-se de cadastrar as variáveis de ambiente no painel da Cloudflare.

## 🗺️ Próximos passos

- [ ] Adicionar print/GIF do projeto neste README
- [ ] Assistente de viagem com IA (a estrutura de `conversations` e `messages` já existe no banco)
- [ ] Mapa interativo dos pontos turísticos
- [ ] Versão em inglês e espanhol para turistas estrangeiros

## 🤝 Contribuindo

Contribuições são bem-vindas!

1. Faça um fork do projeto
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Commit suas mudanças: `git commit -m "feat: minha feature"`
4. Envie para o seu fork: `git push origin feature/minha-feature`
5. Abra um Pull Request

## 📄 Licença

Defina a licença do projeto (ex.: [MIT](https://choosealicense.com/licenses/mit/)) e adicione um arquivo `LICENSE` na raiz.

---

Feito com ☀️ para quem quer conhecer a Cidade Maravilhosa.
