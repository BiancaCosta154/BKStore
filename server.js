import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import dns from 'dns'
import path from 'path'
import { fileURLToPath } from 'url'

dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1'])

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()

app.use(express.json())
app.use(cors())

const DATABASE_URL = process.env.DATABASE_URL
const PORT = process.env.PORT || 5000

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

const LivroModelo = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    status: { type: String, required: true }
}, {
    
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
        }
    }
})

const Livro = mongoose.model('Livro', LivroModelo)



app.get('/api/livros', async (req, res) => {
    try {
        const livros = await Livro.find()
        res.json(livros)
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar livros no banco de dados." })
    }
})

app.post('/api/livros', async (req, res) => {
    const { title, author, status } = req.body 

    try {
        
        const novoLivro = new Livro({ title, author, status })
        
        
        await novoLivro.save()
        
        res.status(201).json(novoLivro)
    } catch (error) {
        res.status(500).json({ error: "Erro ao salvar livro." })
    }
})

app.delete('/api/livros/:id', async (req, res) => {
    const { id } = req.params 
    try {
       
        await Livro.findByIdAndDelete(id)
        res.status(200).json({ message: "Livro removido com sucesso!" })
    } catch (error) {
        res.status(500).json({ error: "Erro ao remover livro." })
    }
})