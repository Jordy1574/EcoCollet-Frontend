# Backend para EcoCollet - Instrucciones de Implementación

## Tecnologías Recomendadas

### Opción 1: Node.js con Express y MongoDB
```bash
# Crear directorio del backend
mkdir ecocollet-backend
cd ecocollet-backend

# Inicializar npm
npm init -y

# Instalar dependencias principales
npm install express mongoose cors dotenv bcryptjs jsonwebtoken helmet morgan compression
npm install -D nodemon @types/node typescript ts-node

# Instalar tipos de TypeScript
npm install -D @types/express @types/bcryptjs @types/jsonwebtoken @types/cors
```

### Opción 2: Node.js con Express y PostgreSQL
```bash
# Instalar dependencias para PostgreSQL
npm install express pg sequelize cors dotenv bcryptjs jsonwebtoken helmet morgan compression
npm install -D nodemon @types/node typescript ts-node @types/express @types/pg
```

### Opción 3: Python con FastAPI
```bash
# Crear entorno virtual
python -m venv ecocollet-env
source ecocollet-env/bin/activate  # Linux/Mac
# o
ecocollet-env\Scripts\activate  # Windows

# Instalar dependencias
pip install fastapi uvicorn sqlalchemy psycopg2-binary alembic python-jose[cryptography] passlib[bcrypt] python-multipart
```

## Estructura del Backend (Node.js + Express)

```
ecocollet-backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   └── environment.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Recoleccion.ts
│   │   ├── Cliente.ts
│   │   └── Recolector.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── recolector.ts
│   │   ├── usuario.ts
│   │   └── admin.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   └── errorHandler.ts
│   ├── services/
│   │   ├── AuthService.ts
│   │   ├── RecolectorService.ts
│   │   └── EmailService.ts
│   ├── controllers/
│   │   ├── AuthController.ts
│   │   ├── RecolectorController.ts
│   │   └── UsuarioController.ts
│   └── app.ts
├── package.json
├── tsconfig.json
├── .env
└── server.ts
```

## APIs que necesitas implementar

### 1. Autenticación
- `POST /api/auth/login` - Login de usuario
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/refresh` - Refrescar token
- `GET /api/auth/verify` - Verificar token
- `POST /api/auth/logout` - Cerrar sesión

### 2. Recolector
- `GET /api/recolector/stats` - Estadísticas del recolector
- `GET /api/recolector/agenda` - Agenda del día
- `GET /api/recolector/recolecciones` - Lista de recolecciones
- `GET /api/recolector/recolecciones/:id` - Detalles de recolección
- `PATCH /api/recolector/recolecciones/:id/iniciar` - Iniciar recolección
- `PATCH /api/recolector/recolecciones/:id/completar` - Completar recolección
- `GET /api/recolector/historial` - Historial de recolecciones
- `GET /api/recolector/rendimiento/semanal` - Rendimiento semanal
- `POST /api/recolector/ubicacion` - Actualizar ubicación
- `GET /api/recolector/ruta` - Obtener ruta optimizada

### 3. Usuario
- `GET /api/usuario/stats` - Estadísticas del usuario
- `POST /api/usuario/recoleccion` - Agendar recolección
- `GET /api/usuario/recolecciones` - Mis recolecciones
- `GET /api/usuario/puntos` - Puntos de reciclaje
- `GET /api/usuario/recompensas` - Recompensas disponibles

## Ejemplo de Implementación (Express.js)

### 1. Configuración básica (server.ts)
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';

import authRoutes from './src/routes/auth';
import recolectorRoutes from './src/routes/recolector';
import usuarioRoutes from './src/routes/usuario';
import { errorHandler } from './src/middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/recolector', recolectorRoutes);
app.use('/api/usuario', usuarioRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});
```

### 2. Modelo de Usuario (models/User.ts)
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'recolector' | 'usuario';
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'recolector', 'usuario'], required: true },
  phone: String,
  address: String,
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
```

### 3. Controlador de Autenticación (controllers/AuthController.ts)
```typescript
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validar usuario
      const user = await User.findOne({ email, isActive: true });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales incorrectas'
        });
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales incorrectas'
        });
      }

      // Generar tokens
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          token,
          refreshToken
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async register(req: Request, res: Response) {
    try {
      const { name, email, password, role, phone, address } = req.body;

      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }

      // Hashear contraseña
      const hashedPassword = await bcrypt.hash(password, 12);

      // Crear usuario
      const user = new User({
        name,
        email,
        password: hashedPassword,
        role,
        phone,
        address
      });

      await user.save();

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
```

## Variables de Entorno (.env)

```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017/ecocollet
# o para PostgreSQL:
# DATABASE_URL=postgresql://username:password@localhost:5432/ecocollet

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_REFRESH_SECRET=tu_refresh_secret_super_seguro
JWT_EXPIRES_IN=24h

# Servidor
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:4200

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password
```

## Comandos para ejecutar

```bash
# Desarrollo
npm run dev

# Producción
npm start

# Script en package.json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

## Próximos pasos

1. **Implementa el backend** usando una de las opciones tecnológicas
2. **Conecta la base de datos** (MongoDB o PostgreSQL)
3. **Implementa las APIs** según los endpoints definidos
4. **Testa las conexiones** entre frontend y backend
5. **Agrega autenticación y autorización**
6. **Implementa validaciones** de datos
7. **Agrega logging** y monitoreo
8. **Prepara para producción** con Docker o similares

## Herramientas de testing

- **Postman** o **Insomnia** para probar APIs
- **MongoDB Compass** para ver la base de datos
- **pgAdmin** para PostgreSQL

El frontend ya está preparado para conectar con cualquiera de estas implementaciones de backend. Solo necesitas cambiar la URL en `environment.ts` una vez que tengas el backend funcionando.