import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import dns from 'dns'
import path from 'path'
import { fileURLToPath } from 'url'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import bcrypt from 'bcryptjs' // ### ADICIONADO: bcrypt para hash de senha
import jwt from 'jsonwebtoken' // ### ADICIONADO: JWT para autenticação baseada em token

dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1'])

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static(path.join(__dirname, '../View'))) // ### ADICIONADO: serve as páginas estáticas de View

const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Livros',
            version: '1.0.0',
            description: 'Documentação da API de livros',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5000}`,
            },
        ],
    },
    apis: [path.join(__dirname, 'server.js').replace(/\\/g, '/')],
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

const DATABASE_URL = process.env.DATABASE_URL
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || 'minha_chave_super_secreta' // ### ADICIONADO: segredo para JWT

mongoose.set('strictQuery', false)

if (!DATABASE_URL) {
  console.error('Erro: a variável de ambiente DATABASE_URL não está definida.')
  process.exit(1)
}

async function startServer() {
  try {
    await mongoose.connect(DATABASE_URL, { serverSelectionTimeoutMS: 10000 })
    console.log('Conexão com MongoDB estabelecida.')

    app.listen(PORT, () => {
      console.log(`Servidor rodando com sucesso em http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Erro ao realizar a conexão com o MongoDB:', error)
    process.exit(1)
  }
}

startServer()

// ### ADICIONADO: modelo de usuário para login e registro
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}, {
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret._id.toString()
            delete ret._id
            delete ret.__v
            delete ret.password
        }
    }
})

// ### ADICIONADO: modelo de livro vinculado ao usuário autenticado
const LivroModelo = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    status: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // ### ADICIONADO: relaciona cada livro a um usuário
}, {
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id.toString()
            delete ret._id
            delete ret.__v
        }
    }
})

const User = mongoose.model('User', UserSchema)
const Livro = mongoose.model('Livro', LivroModelo)

// ### ADICIONADO: middleware de autenticação JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido.' })
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET)
        req.userId = payload.userId
        next()
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido ou expirado.' })
    }
}

app.get('/', (req, res) => {
    res.redirect('/login.html')
})

// ### ADICIONADO: cria novo usuário e retorna token JWT
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' })
    }

    try {
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ error: 'Já existe uma conta com esse email.' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new User({ name, email, password: hashedPassword })
        await newUser.save()

        const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '1d' })
        res.status(201).json({ user: newUser, token })
    } catch (error) {
        console.error('Erro ao registrar usuário:', error)
        res.status(500).json({ error: 'Erro ao criar usuário.' })
    }
})

// ### ADICIONADO: autentica usuário e retorna token JWT
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' })
    }

    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ error: 'Credenciais inválidas.' })
        }

        const passwordMatches = await bcrypt.compare(password, user.password)
        if (!passwordMatches) {
            return res.status(400).json({ error: 'Credenciais inválidas.' })
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' })
        res.json({ user, token })
    } catch (error) {
        console.error('Erro ao efetuar login:', error)
        res.status(500).json({ error: 'Erro ao efetuar login.' })
    }
})

// ### ADICIONADO: retorna dados do usuário autenticado
app.get('/api/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId)
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' })
        }
        res.json({ user })
    } catch (error) {
        console.error('Erro ao buscar usuário:', error)
        res.status(500).json({ error: 'Erro ao buscar usuário.' })
    }
})

// ### ADICIONADO: busca livros apenas do usuário autenticado
app.get('/api/livros', authenticateToken, async (req, res) => {
    try {
        const livros = await Livro.find({ userId: req.userId })
        res.json(livros)
    } catch (error) {
        console.error('Erro ao buscar livros:', error)
        res.status(500).json({ error: 'Erro ao buscar livros no banco de dados.' })
    }
})

/**
 * @swagger
 * /api/livros:
 *   get:
 *     summary: Lista todos os livros do usuário autenticado
 *     responses:
 *       200:
 *         description: Lista de livros
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro ao buscar livros no banco de dados
 */

// ### ADICIONADO: cria livro associado ao usuário autenticado
app.post('/api/livros', authenticateToken, async (req, res) => {
    const { title, author, status } = req.body

    if (!title || !author || !status) {
        return res.status(400).json({ error: 'Título, autor e status são obrigatórios.' })
    }

    try {
        const novoLivro = new Livro({ title, author, status, userId: req.userId })
        await novoLivro.save()
        res.status(201).json(novoLivro)
    } catch (error) {
        console.error('Erro ao salvar livro:', error)
        res.status(500).json({ error: 'Erro ao salvar livro.' })
    }
})

/**
 * @swagger
 * /api/livros:
 *   post:
 *     summary: Cria um novo livro para o usuário autenticado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - status
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Livro criado com sucesso
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro ao salvar livro
 */

app.delete('/api/livros/:id', authenticateToken, async (req, res) => {
    const { id } = req.params
    try {
        const livroRemovido = await Livro.findOneAndDelete({ _id: id, userId: req.userId })
        if (!livroRemovido) {
            return res.status(404).json({ error: 'Livro não encontrado ou não pertence ao usuário.' })
        }
        res.status(200).json({ message: 'Livro removido com sucesso!' })
    } catch (error) {
        console.error('Erro ao remover livro:', error)
        res.status(500).json({ error: 'Erro ao remover livro.' })
    }
})

/**
 * @swagger
 * /api/livros/{id}:
 *   delete:
 *     summary: Remove um livro pelo id para o usuário autenticado
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Livro removido com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Livro não encontrado
 *       500:
 *         description: Erro ao remover livro
 */

// ### ADICIONADO: rota protegida que serve o index.html após login
app.get('/dashboard', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, '../View/index.html'))
})

// ### ADICIONADO: rota de logout que redireciona para login
app.get('/logout', (req, res) => {
    res.redirect('/login.html')
})