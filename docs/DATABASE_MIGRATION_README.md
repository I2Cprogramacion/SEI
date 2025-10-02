# 🗄️ Guía de Migración de Base de Datos

Este proyecto ahora soporta múltiples tipos de base de datos con una interfaz unificada.

## 🚀 **Bases de Datos Soportadas**

- ✅ **SQLite** (desarrollo local)
- ✅ **PostgreSQL** (desarrollo y producción)
- ✅ **MySQL** (desarrollo y producción)
- 🔄 **MongoDB** (estructura preparada)

## 🔧 **Configuración Actual**

Por defecto, el proyecto usa **SQLite** para desarrollo local.

### **Cambiar a PostgreSQL:**

1. **Instalar dependencias:**
```bash
npm install pg @types/pg
```

2. **Modificar `lib/database-config.ts`:**
```typescript
export const currentDatabaseConfig: DatabaseConfig = {
  type: 'postgresql',
  host: 'localhost',
  port: 5432,
  database: 'researcher_platform_dev',
  username: 'postgres',
  password: 'tu_password'
}
```

3. **Crear la base de datos:**
```sql
CREATE DATABASE researcher_platform_dev;
```

### **Cambiar a MySQL:**

1. **Instalar dependencias:**
```bash
npm install mysql2 @types/mysql
```

2. **Modificar `lib/database-config.ts`:**
```typescript
export const currentDatabaseConfig: DatabaseConfig = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  database: 'researcher_platform_dev',
  username: 'root',
  password: 'tu_password'
}
```

## 🌍 **Configuración por Entorno**

### **Desarrollo:**
```typescript
import { usePredefinedConfig } from './lib/database-config'

// Usar SQLite
usePredefinedConfig('development', 'sqlite')

// Usar PostgreSQL
usePredefinedConfig('development', 'postgresql')

// Usar MySQL
usePredefinedConfig('development', 'mysql')
```

### **Producción:**
```typescript
// Usar PostgreSQL en producción
usePredefinedConfig('production', 'postgresql')

// Usar MySQL en producción
usePredefinedConfig('production', 'mysql')
```

## 🔄 **Variables de Entorno**

Para producción, configura estas variables:

```bash
# PostgreSQL
DB_HOST=tu-host-postgresql
DB_PORT=5432
DB_NAME=researcher_platform
DB_USER=tu_usuario
DB_PASSWORD=tu_password

# MySQL
DB_HOST=tu-host-mysql
DB_PORT=3306
DB_NAME=researcher_platform
DB_USER=tu_usuario
DB_PASSWORD=tu_password
```

## 📊 **Migración de Datos**

### **De SQLite a PostgreSQL:**

1. **Exportar datos de SQLite:**
```bash
sqlite3 database.db ".dump" > backup.sql
```

2. **Convertir sintaxis SQLite a PostgreSQL:**
   - Cambiar `AUTOINCREMENT` por `SERIAL`
   - Ajustar tipos de datos
   - Modificar placeholders de `?` a `$1, $2, etc.`

3. **Importar a PostgreSQL:**
```bash
psql -U tu_usuario -d researcher_platform -f backup_converted.sql
```

### **De SQLite a MySQL:**

1. **Exportar datos de SQLite:**
```bash
sqlite3 database.db ".dump" > backup.sql
```

2. **Convertir sintaxis:**
   - Cambiar `AUTOINCREMENT` por `AUTO_INCREMENT`
   - Ajustar tipos de datos
   - Modificar placeholders

3. **Importar a MySQL:**
```bash
mysql -u tu_usuario -p researcher_platform < backup_converted.sql
```

## 🛠️ **Funciones Disponibles**

Todas las bases de datos implementan la misma interfaz:

```typescript
interface DatabaseInterface {
  // Métodos de investigadores
  guardarInvestigador(datos: any): Promise<Result>
  obtenerInvestigadores(): Promise<Investigador[]>
  obtenerInvestigadorPorId(id: number): Promise<Investigador | null>
  verificarCredenciales(email: string, password: string): Promise<AuthResult>
  
  // Métodos de conexión
  conectar(): Promise<void>
  desconectar(): Promise<void>
  
  // Métodos de inicialización
  inicializar(): Promise<void>
  
  // Métodos de migración
  ejecutarMigracion(sql: string): Promise<void>
}
```

## 🔍 **Verificar Configuración Actual**

```typescript
import { getCurrentConfigString } from './lib/database-config'

console.log('Base de datos actual:', getCurrentConfigString())
// Output: "sqlite" o "postgresql@localhost/researcher_platform"
```

## ⚠️ **Notas Importantes**

1. **SQLite** es perfecto para desarrollo y pruebas
2. **PostgreSQL** es recomendado para producción (mejor rendimiento)
3. **MySQL** es una alternativa sólida a PostgreSQL
4. **MongoDB** está preparado pero requiere implementación completa

## 🆘 **Solución de Problemas**

### **Error de conexión:**
- Verificar credenciales
- Verificar que el servicio esté corriendo
- Verificar firewall/red

### **Error de migración:**
- Verificar sintaxis SQL
- Verificar permisos de usuario
- Verificar que la base de datos exista

### **Error de tipos:**
- Verificar que los tipos coincidan entre bases de datos
- Usar tipos genéricos cuando sea posible

## 📚 **Recursos Adicionales**

- [Documentación de PostgreSQL](https://www.postgresql.org/docs/)
- [Documentación de MySQL](https://dev.mysql.com/doc/)
- [Documentación de SQLite](https://www.sqlite.org/docs.html)
- [Guía de migración de Next.js](https://nextjs.org/docs)
