# 📚 BKStore - Documentação Completa

**BKStore** é uma aplicação web para gerenciamento de leitura pessoal de livros. Desenvolvido como Trabalho Prático Semestral da disciplina **Arquitetura de Aplicações Web — 2026.1**.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Tecnologias Utilizadas](#tecnologias-utilizadas)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Pré-requisitos](#pré-requisitos)
5. [Instalação](#instalação)
6. [Configuração](#configuração)
7. [Como Executar](#como-executar)
8. [Endpoints da API](#endpoints-da-api)
9. [Autenticação](#autenticação)
10. [Modelos de Dados](#modelos-de-dados)
11. [Tratamento de Erros](#tratamento-de-erros)
12. [Documentação Swagger](#documentação-swagger)

---

## 🎯 Visão Geral

O **BKStore** é um sistema que permite aos usuários:

- **Registrar** uma conta pessoal
- **Autenticar-se** no sistema com email e senha
- **Gerenciar uma lista de livros** que desejam ler
- **Acompanhar o status** dos livros (não iniciado, lendo, concluído, etc.)
- **Visualizar** todos os seus livros em um dashboard

A aplicação utiliza uma **API REST** desenvolvida com Express.js e armazena os dados em **MongoDB Atlas** (nuvem).

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Versão | Descrição |
|-----------|--------|-----------|
| **Node.js** | - | Runtime JavaScript |
| **Express** | ^5.2.1 | Framework web |
| **MongoDB** | - | Banco de dados NoSQL |
| **Mongoose** | ^9.6.3 | ODM para MongoDB |
| **JWT** | ^9.0.2 | Autenticação por token |
| **bcryptjs** | ^2.4.3 | Hash de senhas |
| **CORS** | ^2.8.6 | Controle de requisições entre origens |
| **Swagger** | ^6.3.0 | Documentação de API |
| **Prisma** | 6.19 | ORM (configurado mas não utilizado no momento) |
| **dotenv** | ^17.4.2 | Gerenciamento de variáveis de ambiente |

---

## 📁 Estrutura do Projeto

```
Person/
└── API/
    └── API/
        ├── package.json                 # Dependências e scripts
        ├── README.md                    # Documentação breve
        ├── .env                         # Variáveis de ambiente (não versionado)
        ├── .gitignore                   # Arquivos ignorados pelo Git
        │
        ├── Controller/
        │   └── server.js                # Servidor Express principal
        │
        ├── View/
        │   ├── index.html               # Dashboard (protegido)
        │   └── login.html               # Página de login/registro

```

**Descrição das pastas:**

- **Controller/** - Lógica do servidor (rotas, autenticação, banco de dados)
- **View/** - Interface web (HTML, CSS, JavaScript frontend)
- **generated/** - Arquivos gerados automaticamente (Prisma)

---

## 📦 Pré-requisitos

Para executar o projeto localmente, você precisa ter instalado:

- **Node.js** (versão 16 ou superior)
- **npm** (gerenciador de pacotes do Node.js)
- **Git** (controle de versão)
- **MongoDB Atlas** (criar uma conta gratuita em https://www.mongodb.com/atlas)

---

## 🚀 Instalação

### 1️⃣ Clone o Repositório

```bash
git clone https://github.com/BiancaCosta154/BKStore.git
cd BKStore/Person/API/API
```

### 2️⃣ Instale as Dependências

```bash
npm install
```

Isso instalará todos os pacotes listados no `package.json`, incluindo:
- Express (servidor web)
- Mongoose (conexão com MongoDB)
- JWT (autenticação)
- bcryptjs (hash de senhas)
- Swagger (documentação)

---

## ⚙️ Configuração

### Crie um arquivo `.env`

Na raiz do projeto (`Person/API/API/`), crie um arquivo chamado `.env` com as seguintes variáveis:

```env
# Banco de dados MongoDB Atlas
DATABASE_URL=mongodb+srv://[USERNAME]:[PASSWORD]@[CLUSTER].mongodb.net/[DATABASE_NAME]?retryWrites=true&w=majority

# Porta do servidor
PORT=5000

# Chave secreta para JWT (use uma string segura)
JWT_SECRET=chave
```

**Onde obter a `DATABASE_URL`:**

1. Acesse [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crie uma conta e um cluster
3. Vá em "Conectar" → "Connect your application"
4. Copie a connection string
5. Substitua `[USERNAME]`, `[PASSWORD]`, `[CLUSTER]` e `[DATABASE_NAME]`

**Exemplo completo:**
```env
DATABASE_URL=mongodb+srv://usuario:senha123@cluster0.abc123.mongodb.net/:::?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=meu_jwt_
```

---

## ▶️ Como Executar

### Inicie o Servidor

```bash
npm start
```

Ou diretamente com Node.js:

```bash
node Controller/server.js
```

**Saída esperada:**
```
Conexão com MongoDB estabelecida.
Servidor rodando com sucesso em http://localhost:5000
```

### Acesse a Aplicação

- **Página de Login:** http://localhost:5000/login.html
- **API Swagger:** http://localhost:5000/api-docs
- **Dashboard:** http://localhost:5000/dashboard (após autenticação)
