const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const multer = require('multer')
const path = require('path')

// Cargar variables de entorno
dotenv.config()

// Inicializar app
const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(bodyParser.json())
app.use(express.static('public'))

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/
    const mimetype = filetypes.test(file.mimetype)
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    
    if (mimetype && extname) {
      return cb(null, true)
    }
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif)'))
  }
})

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) return res.sendStatus(401)
  
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || 'secret_key_for_development', (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommunitas', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error al conectar a MongoDB:', err))

// Modelos
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String },
  bio: { type: String },
  location: { type: String },
  createdAt: { type: Date, default: Date.now }
})

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  condition: { type: String, required: true },
  location: { type: String, required: true },
  imageUrl: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
})

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
})

const User = mongoose.model('User', userSchema)
const Item = mongoose.model('Item', itemSchema)
const Message = mongoose.model('Message', messageSchema)

// Rutas de autenticación
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' })
    }
    
    // Crear nuevo usuario
    const user = new User({
      name,
      email,
      password // En producción, hashear la contraseña
    })
    
    await user.save()
    
    // Generar token
    const token = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET || 'secret_key_for_development', {
      expiresIn: '7d'
    })
    
    res.status(201).json({ token })
  } catch (err) {
    console.error('Error en registro:', err)
    res.status(500).json({ message: 'Error en el servidor' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    // Buscar usuario
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Credenciales incorrectas' })
    }
    
    // Verificar contraseña (en producción, comparar hash)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Credenciales incorrectas' })
    }
    
    // Generar token
    const token = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET || 'secret_key_for_development', {
      expiresIn: '7d'
    })
    
    res.json({ token })
  } catch (err) {
    console.error('Error en login:', err)
    res.status(500).json({ message: 'Error en el servidor' })
  }
})

// Rutas de artículos
app.get('/api/items/search', async (req, res) => {
  try {
    const { q, category, location, condition, sort, page = 1, limit = 12 } = req.query
    const skip = (page - 1) * limit
    
    // Construir filtro
    const filter = {}
    if (q) filter.title = { $regex: q, $options: 'i' }
    if (category) filter.category = category
    if (location) filter.location = { $regex: location, $options: 'i' }
    if (condition) filter.condition = condition
    
    // Construir ordenamiento
    let sortOption = { createdAt: -1 } // Por defecto, más recientes primero
    if (sort === 'oldest') sortOption = { createdAt: 1 }
    if (sort === 'az') sortOption = { title: 1 }
    if (sort === 'za') sortOption = { title: -1 }
    
    // Ejecutar consulta
    const items = await Item.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('owner', 'name')
    
    const total = await Item.countDocuments(filter)
    
    res.json({ items, total })
  } catch (err) {
    console.error('Error en búsqueda:', err)
    res.status(500).json({ message: 'Error al buscar artículos' })
  }
})

app.get('/api/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('owner', 'name')
    
    if (!item) {
      return res.status(404).json({ message: 'Artículo no encontrado' })
    }
    
    res.json(item)
  } catch (err) {
    console.error('Error al obtener artículo:', err)
    res.status(500).json({ message: 'Error al obtener artículo' })
  }
})

app.post('/api/items', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, category, condition, location } = req.body
    
    // Crear nuevo artículo
    const item = new Item({
      title,
      description,
      category,
      condition,
      location,
      owner: req.user.id,
      imageUrl: req.files && req.files.length > 0 ? `/uploads/${req.files[0].filename}` : null
    })
    
    await item.save()
    res.status(201).json(item)
  } catch (err) {
    console.error('Error al crear artículo:', err)
    res.status(500).json({ message: 'Error al crear artículo' })
  }
})

// Rutas de mensajes
app.post('/api/messages', authenticateToken, async (req, res) => {
  try {
    const { receiverId, content, itemId } = req.body
    
    // Crear nuevo mensaje
    const message = new Message({
      sender: req.user.id,
      receiver: receiverId,
      content,
      item: itemId || null
    })
    
    await message.save()
    res.status(201).json(message)
  } catch (err) {
    console.error('Error al enviar mensaje:', err)
    res.status(500).json({ message: 'Error al enviar mensaje' })
  }
})

app.get('/api/messages/conversations', authenticateToken, async (req, res) => {
  try {
    // Obtener todas las conversaciones del usuario
    const messages = await Message.find({
      $or: [
        { sender: req.user.id },
        { receiver: req.user.id }
      ]
    }).sort({ createdAt: -1 }).populate('sender receiver', 'name profileImage')
    
    // Agrupar mensajes por conversación
    const conversations = {}
    
    messages.forEach(message => {
      const otherUserId = message.sender._id.toString() === req.user.id ? 
        message.receiver._id.toString() : message.sender._id.toString()
      
      if (!conversations[otherUserId]) {
        const otherUser = message.sender._id.toString() === req.user.id ? 
          message.receiver : message.sender
          
        conversations[otherUserId] = {
          _id: otherUserId,
          otherUser: {
            _id: otherUser._id,
            name: otherUser.name,
            profileImage: otherUser.profileImage
          },
          messages: [],
          lastMessage: message,
          unreadCount: 0
        }
      }
      
      conversations[otherUserId].messages.push(message)
      
      // Contar mensajes no leídos
      if (!message.read && message.receiver._id.toString() === req.user.id) {
        conversations[otherUserId].unreadCount++
      }
    })
    
    res.json(Object.values(conversations))
  } catch (err) {
    console.error('Error al obtener conversaciones:', err)
    res.status(500).json({ message: 'Error al obtener conversaciones' })
  }
})

app.get('/api/messages/:userId', authenticateToken, async (req, res) => {
  try {
    const otherUserId = req.params.userId
    
    // Obtener mensajes entre los dos usuarios
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user.id }
      ]
    }).sort({ createdAt: 1 }).populate('sender receiver', 'name profileImage')
    
    // Marcar mensajes como leídos
    await Message.updateMany(
      { sender: otherUserId, receiver: req.user.id, read: false },
      { read: true }
    )
    
    res.json(messages)
  } catch (err) {
    console.error('Error al obtener mensajes:', err)
    res.status(500).json({ message: 'Error al obtener mensajes' })
  }
})

// Ruta para marcar artículo como no disponible
app.patch('/api/items/:id/availability', authenticateToken, async (req, res) => {
  try {
    const { isAvailable } = req.body
    
    // Verificar que el artículo existe y pertenece al usuario
    const item = await Item.findOne({ _id: req.params.id, owner: req.user.id })
    
    if (!item) {
      return res.status(404).json({ message: 'Artículo no encontrado o no tienes permiso para modificarlo' })
    }
    
    // Actualizar disponibilidad
    item.isAvailable = isAvailable
    await item.save()
    
    res.json(item)
  } catch (err) {
    console.error('Error al actualizar disponibilidad:', err)
    res.status(500).json({ message: 'Error al actualizar disponibilidad' })
  }
})

// Ruta para obtener artículos del usuario
app.get('/api/user/items', authenticateToken, async (req, res) => {
  try {
    const items = await Item.find({ owner: req.user.id }).sort({ createdAt: -1 })
    res.json(items)
  } catch (err) {
    console.error('Error al obtener artículos del usuario:', err)
    res.status(500).json({ message: 'Error al obtener artículos' })
  }
})

// Ruta para obtener perfil de usuario
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }
    res.json(user)
  } catch (err) {
    console.error('Error al obtener perfil:', err)
    res.status(500).json({ message: 'Error al obtener perfil' })
  }
})

// Ruta para actualizar perfil de usuario
app.patch('/api/user/profile', authenticateToken, upload.single('profileImage'), async (req, res) => {
  try {
    const { name, bio, location } = req.body
    
    const updateData = {
      name: name || undefined,
      bio: bio || undefined,
      location: location || undefined
    }
    
    // Si se subió una imagen de perfil
    if (req.file) {
      updateData.profileImage = `/uploads/${req.file.filename}`
    }
    
    // Actualizar solo los campos proporcionados
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password')
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }
    
    res.json(user)
  } catch (err) {
    console.error('Error al actualizar perfil:', err)
    res.status(500).json({ message: 'Error al actualizar perfil' })
  }
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
})