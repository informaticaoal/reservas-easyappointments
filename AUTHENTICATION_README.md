# Sistema de Autenticación para Booking

## Cambios Implementados

### 1. **Controlador de Registro** (`application/controllers/Register.php`)
- Nuevo controlador que maneja el registro de usuarios
- Crea usuarios en la tabla `ea_users` con rol de cliente
- Crea credenciales en `ea_user_settings` con username y password hasheado
- Validaciones: email único, contraseña mínima 7 caracteres
- Genera username automático basado en el email

### 2. **Vista de Registro** (`application/views/pages/register.php`)
- Formulario con campos:
  - Nombre (requerido)
  - Apellido (requerido)  
  - Email (requerido)
  - Contraseña (mínimo 7 caracteres)
  - Confirmar contraseña
- Enlace para volver al login
- Mensajes de éxito/error

### 3. **JavaScript para Registro**
- `assets/js/http/register_http_client.js`: Cliente HTTP para llamadas AJAX
- `assets/js/pages/register.js`: Lógica del formulario
  - Validación de contraseñas coincidentes
  - Envío del formulario
  - Redirección automática al login tras registro exitoso

### 4. **Protección del Booking** (`application/controllers/Booking.php`)
- Añadida verificación de sesión en el método `index()`
- Si no hay `user_id` en sesión, redirige a login
- Guarda la URL destino para volver después del login

### 5. **Actualización de Login** (`application/views/pages/login.php`)
- Añadido enlace "Regístrate aquí" que lleva a la página de registro

### 6. **Ruta por Defecto** (`application/config/routes.php`)
- Cambiada de `'booking'` a `'login'`
- Ahora al abrir la aplicación, lo primero es el login

## Flujo de Usuario

1. **Usuario nuevo accede a la aplicación** → Se muestra login
2. **Usuario hace clic en "Regístrate aquí"** → Va a `/register`
3. **Usuario completa el formulario de registro** → Se crea cuenta en BD
4. **Tras registro exitoso** → Redirige automáticamente a login
5. **Usuario inicia sesión** → Accede al booking
6. **Usuario intenta acceder a `/booking` sin login** → Redirige a login

## Estructura de Base de Datos

### Tabla `ea_users`
```sql
- id (AUTO_INCREMENT)
- first_name (VARCHAR)
- last_name (VARCHAR)
- email (VARCHAR) - usado para login
- phone_number (VARCHAR)
- id_roles (INT) - FK a ea_roles (rol "customer")
- timezone (VARCHAR)
- language (VARCHAR)
- create_datetime (DATETIME)
- update_datetime (DATETIME)
```

### Tabla `ea_user_settings`
```sql
- id_users (INT) - FK a ea_users
- username (VARCHAR) - generado automáticamente
- password (VARCHAR) - hasheado con password_hash()
- notifications (TINYINT)
- calendar_view (VARCHAR)
```

## Cómo Probar

1. **Abre la aplicación**: `http://localhost/easyappointments`
2. **Verás la página de login**
3. **Haz clic en "Regístrate aquí"**
4. **Completa el formulario**:
   - Nombre: Test
   - Apellido: Usuario
   - Email: test@test.com
   - Contraseña: password123
   - Confirmar: password123
5. **Haz clic en "Registrarse"**
6. **Tras el mensaje de éxito, serás redirigido al login**
7. **Inicia sesión con**:
   - Username: test (generado automáticamente del email)
   - Password: password123
8. **Serás redirigido al booking**

## Notas Importantes

- El **username se genera automáticamente** del email (parte antes del @)
- Si el username ya existe, añade un número secuencial (test1, test2, etc.)
- Las contraseñas se almacenan hasheadas con `password_hash()` (seguro)
- Todos los usuarios registrados tienen rol "customer"
- El campo `salt` en `ea_user_settings` ya no se usa pero se mantiene por compatibilidad
- La sesión se verifica en cada acceso al booking

## Archivos Creados/Modificados

**Creados:**
- `application/controllers/Register.php`
- `application/views/pages/register.php`
- `assets/js/http/register_http_client.js`
- `assets/js/pages/register.js`

**Modificados:**
- `application/controllers/Booking.php` (añadida verificación de sesión)
- `application/views/pages/login.php` (añadido enlace a registro)
- `application/config/routes.php` (cambiada ruta por defecto)
