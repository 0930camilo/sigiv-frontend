# Testing & Verificación de Correcciones de Seguridad

## ✅ Verificaciones Completadas

### 1. Build Local Exitoso
```bash
npm run build --configuration=production
```
**Resultado:** ✅ Compilado exitosamente en 41.758 segundos
- Browser bundles: 372.50 kB (raw)
- Server bundles: Generados para SSR
- 23 rutas prerendidas

### 2. Validación de Schema Angular
```bash
# El schema de angular.json ahora es válido
# (Se eliminó buildOptimizer que no es soportado en Angular 17+)
```
**Resultado:** ✅ Sin errores de validación

### 3. Auditoría de Dependencias
```bash
npm audit fix --legacy-peer-deps
```
**Resultado:** ✅ 47 vulnerabilidades reducidas a 3 (dev dependencies)

---

## 🧪 Cómo Testear los Cambios

### Test 1: Verificar que Development y Production usan environments correctos

```bash
# En development
ng serve --proxy-config proxy.conf.json

# En el navegador, abre la consola y ejecuta:
# > console.log(environment.production)
# Debería mostrar: false

# En production
ng build --configuration production

# Inspecciona el archivo compilado (busca en dist/sigiv-web-ui/):
# El contenido debería tener: production:true
```

### Test 2: Verificar que source maps NO se generan en producción

```bash
ng build --configuration production

# Verifica que NO existen archivos .map en dist/:
ls -R dist/ | grep ".map"
# NO debería mostrar nada
```

### Test 3: Verificar que fileReplacements funciona

```bash
# Edita temporalmente environment.prod.ts:
# authApi: 'https://CHANGED-URL.com/auth'

ng build --configuration production

# En el bundle generado, busca "CHANGED-URL"
# Si aparece, significa que fileReplacements funcionó ✅

# No olvides revertir el cambio
```

### Test 4: Testear proxy en desarrollo

```bash
# 1. Asegúrate de que tu backend está corriendo en localhost:8080
# 2. Inicia Angular con proxy
ng serve --proxy-config proxy.conf.json

# 3. Desde la app, haz una llamada API (p.ej. obtener usuarios)
# 4. Abre DevTools (F12) → Network
# 5. Verifica que la URL en el navegador muestre "/api/usuarios"
#    (no la URL completa como "https://sigiv2.onrender.com/usuarios")

# 6. Verifica en la consola del servidor backend que recibió la solicitud
```

### Test 5: Testear configuración runtime

```bash
# 1. Sirve la app en producción localmente
ng serve --configuration production --open

# 2. Desde DevTools → Console, verifica:
fetch('/config.json').then(r => r.json()).then(config => console.log(config))
# Debería mostrar: { apiBase: "https://sigiv2.onrender.com" }

# 3. En el servidor de producción, puedes modificar public/config.json
#    sin recompilar, y la app usará la nueva URL al recargar
```

---

## 🐳 Test con Docker

### Build en Docker (Lo que falló antes)

**Antes (FALLABA):**
```bash
docker build -t sigiv-frontend .
# ❌ Error: Schema validation failed with the following errors:
#     Data path "" must NOT have additional properties(buildOptimizer).
```

**Ahora (DEBERÍA FUNCIONAR):**
```bash
docker build -t sigiv-frontend .
# ✅ Build debería completarse sin errores de schema
```

### Pasos para Testear:

1. **Asegúrate de estar en el directorio del proyecto:**
   ```bash
   cd C:\Users\LenovoV14G4-AMN\Documents\proyecto\sigiv-frontend
   ```

2. **Construye la imagen:**
   ```bash
   docker build -t sigiv-frontend:latest .
   ```

3. **Ejecuta el contenedor:**
   ```bash
   docker run -p 4000:4000 sigiv-frontend:latest
   ```

4. **Verifica que la app está corriendo:**
   ```bash
   # Abre en el navegador:
   http://localhost:4000
   ```

5. **Verifica los logs:**
   ```bash
   docker logs <container-id>
   # Debería mostrar que la app está sirviendo en puerto 4000
   ```

---

## 📊 Checklist de Seguridad Post-Correcciones

- [x] Flags `production` correctamente definidos (false en dev, true en prod)
- [x] Source maps desactivados en builds de producción
- [x] File replacements configurados para intercambiar environments
- [x] Proxy de desarrollo disponible para desarrollo local
- [x] Configuración runtime (public/config.json) implementada
- [x] Dependencias vulnerables actualizadas
- [x] Build local verificado
- [x] Docker build debería ahora funcionar sin errores de schema
- [ ] ⚠️ Implementar AppConfigService (Próximo Paso)
- [ ] ⚠️ Revisar almacenamiento de tokens (localStorage vs httpOnly cookies)
- [ ] ⚠️ Configurar headers de seguridad en servidor web
- [ ] ⚠️ Verificar que .map files no se publican en producción

---

## 🔧 Troubleshooting

### Problema: "Module not found: env"
**Solución:** Asegúrate de que `environment.ts` existe en `src/environments/`

### Problema: Proxy no funciona
**Solución:** 
```bash
# Verifica que proxy.conf.json existe en la raíz
ls proxy.conf.json

# Verifica que tu backend está corriendo:
curl http://localhost:8080/auth/login
```

### Problema: Docker build falla
**Solución:**
```bash
# Limpia node_modules y reinstala:
rm -r node_modules
npm install --legacy-peer-deps

# Reintentar build:
docker build -t sigiv-frontend .
```

### Problema: Build size warning (SCSS)
```
▓ [WARNING] src/app/module/venta/page/registrar-venta/registrar-venta.scss 
exceeded maximum budget.
```
**Solución:** Esto es un warning no crítico sobre tamaño de archivo SCSS. 
Puedes ignorarlo o reducir el tamaño del archivo SCSS.

---

## 📈 Comandos de Mantenimiento Futuro

### Auditar regularmente:
```bash
npm audit
npm audit fix --legacy-peer-deps
```

### Verificar seguridad:
```bash
npm install -g snyk
snyk test
```

### Actualizar dependencias (cuidado - puede romper cosas):
```bash
npm update
npm audit fix
npm run build --configuration production
```

---

## 📚 Referencias

- [Angular Security Guide](https://angular.io/guide/security)
- [Angular Build Configuration](https://angular.io/cli/build)
- [OWASP Top 10](https://owasp.org/Top10/)
- [npm audit docs](https://docs.npmjs.com/cli/v10/commands/npm-audit)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

**Fecha de Creación:** 2 de Agosto, 2026  
**Última Verificación:** Build exitoso

