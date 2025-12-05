# 🔍 Verificación del Redirect URI - Error 400 redirect_uri_mismatch

## ❌ Error Actual
```
Error 400: redirect_uri_mismatch
```

Esto significa que el URI que envía tu app NO está registrado en Google Cloud Console.

## 📋 Pasos para Solucionar

### 1️⃣ Identifica el URI EXACTO

**Abre la consola del navegador** (F12) y busca:

```
🔧 Google OAuth Configuration Debug
🔗 Redirect URI: [COPIA ESTE VALOR EXACTO]
```

**Posibles valores que verás:**

- `econexion://redirect` ← Para Expo Go en dispositivo
- `http://localhost:8081` ← Para web/navegador
- `exp://192.168.X.X:8081` ← Formato antiguo (si no funciona el scheme)

### 2️⃣ Registra en Google Cloud Console

**Ve a:** https://console.cloud.google.com/apis/credentials

1. Selecciona tu proyecto
2. Click en tu **OAuth 2.0 Client ID** (el que tiene el WEB_CLIENT_ID)
3. Click en **"EDIT"** (ícono de lápiz)
4. Scroll hasta **"Authorized redirect URIs"**
5. Click **"+ ADD URI"**
6. **Pega EXACTAMENTE el URI** que copiaste de la consola

### 3️⃣ Agrega TODOS estos URIs (para cubrir todos los casos)

```
econexion://redirect
https://auth.expo.io/@Eco-nexion/econexion-app
http://localhost:8081
https://localhost:8081
```

**Nota:** Si usas un dominio propio, agrégalo también.

### 4️⃣ Guarda y Espera

1. Click en **"SAVE"** en Google Cloud Console
2. **Espera 5-10 minutos** para que los cambios se propaguen
3. **Cierra y vuelve a abrir** la app
4. Intenta login de nuevo

## 🧪 Verificación Rápida

**Para verificar si el URI está registrado:**

1. Ve a Google Cloud Console
2. Abre tu OAuth Client ID
3. En "Authorized redirect URIs" deberías ver:
   - ✅ `econexion://redirect`
   - ✅ `https://auth.expo.io/@Eco-nexion/econexion-app`
   - ✅ `http://localhost:8081`

## 🎯 Prueba Alternativa: Usar Expo Auth Proxy

Si los URIs personalizados siguen fallando, prueba usar el proxy de Expo (más fácil):

**Modifica `app/index.tsx` línea ~30:**

```typescript
// OPCIÓN 1 (actual):
const redirectUri = makeRedirectUri({
    scheme: 'econexion',
    path: 'redirect',
});

// OPCIÓN 2 (usar proxy de Expo):
const redirectUri = makeRedirectUri({
    useProxy: true,
});
```

Con `useProxy: true`:
- URI generado: `https://auth.expo.io/@Eco-nexion/econexion-app`
- Solo necesitas registrar **UN** URI en Google Cloud
- Funciona en todos los entornos (Expo Go, web, standalone)

## 📸 Screenshot para Compartir

Si sigue fallando, comparte:

1. **Screenshot de la consola** mostrando:
   ```
   🔗 Redirect URI: [el valor]
   ```

2. **Screenshot de Google Cloud Console** mostrando:
   - La sección "Authorized redirect URIs"
   - Los URIs que tienes registrados

3. **El error completo** que aparece en el navegador/app

## 🆘 Troubleshooting Adicional

### Error persiste después de agregar URIs
- ✅ Verifica que guardaste en Google Cloud Console
- ✅ Espera 10 minutos completos
- ✅ Limpia caché: `pnpm start --clear`
- ✅ Cierra Expo Go completamente y vuelve a escanear QR
- ✅ Prueba en modo incógnito/privado

### Error en dispositivo físico pero funciona en web
- Registra: `econexion://redirect`
- Verifica que `app.json` tenga `"scheme": "econexion"`

### Error en web pero funciona en dispositivo
- Registra: `http://localhost:8081`
- Si usas HTTPS local, registra también: `https://localhost:8081`

## 📞 Siguiente Paso

**Copia el URI exacto de tus logs y compártelo para ayudarte a registrarlo correctamente.**
