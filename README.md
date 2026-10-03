# Agroservicio La Cosecha — Catálogo móvil (Tarea 6)

**Estudiante:** Gerson Daniel Benito Chávez  
**Carné:** 2453090  
**Curso:** Programación WEB  
**Semana:** 11

## Descripción del caso

Prototipo de aplicación web móvil (PWA) para Agroservicio La Cosecha. Permite consultar insumos agrícolas, filtrar por categoría, buscar productos, agregar cantidades a una cotización y solicitarla al servidor. El servidor valida los datos, calcula el subtotal y aplica un descuento del 5 % cuando la compra alcanza Q1,000.00 o más.

## Requisitos

- .NET SDK 10.0
- Visual Studio Code + C# Dev Kit
- Git 2.45 o superior
- Google Chrome o Microsoft Edge

## Cómo ejecutar

Desde la carpeta raíz del proyecto:

```bash
dotnet build
dotnet run --urls "http://localhost:5090"
```

Luego abre en el navegador:

```text
http://localhost:5090
```

## Endpoints

| Verbo | Ruta | Descripción |
|---|---|---|
| GET | `/api/insumos` | Lista todos los insumos. Acepta `?categoria=...` |
| GET | `/api/insumos/{id}` | Devuelve un insumo o 404 si no existe |
| POST | `/api/cotizaciones` | Valida y crea una cotización; responde 201 o 400 |
| GET | `/api/cotizaciones` | Lista las cotizaciones registradas durante la ejecución |

## Validaciones del POST

El servidor responde `400 Bad Request` cuando:

- el nombre del cliente está vacío;
- el teléfono no tiene exactamente 8 dígitos numéricos;
- no se agregaron insumos;
- un insumo no existe o la cantidad es menor o igual a cero;
- la cantidad solicitada supera las existencias.

Si los datos son válidos, el servidor calcula el subtotal, aplica un 5 % de descuento cuando el subtotal es mayor o igual a Q1,000.00, guarda la cotización en memoria y devuelve `201 Created`.

## PWA

La aplicación incluye:

- `wwwroot/manifest.json` con nombre, nombre corto y colores de la marca;
- `wwwroot/img/icono.svg` como icono propio solicitado en la guía;
- `wwwroot/img/icon-192.png` y `wwwroot/img/icon-512.png` como variantes PNG usadas por el manifest;
- `wwwroot/sw.js` para guardar archivos estáticos en caché;
- exclusión explícita de `/api/` del caché del service worker.

## Repositorio público

https://github.com/danielbenito4-svg/AgroCosechaMovil_2453090

## Evidencias

La carpeta `capturas/` contiene las evidencias requeridas; la captura `04_pwa.png` se agrega al finalizar la comprobación manual en DevTools:

1. `01_movil_catalogo.png` — vista móvil a 375 px con catálogo y búsqueda.
2. `02_movil_cotizacion.png` — vista móvil con una cotización y descuento aplicado.
3. `03_escritorio.png` — vista a 1100 px con tres columnas.
4. `04_pwa.png` — DevTools → Application mostrando manifest y service worker.
5. `05_git_log.png` — terminal con `git log --oneline`.
