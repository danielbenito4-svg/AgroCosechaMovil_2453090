namespace AgroCosechaMovil.Models;

// Elemento enviado por el cliente al solicitar una cotización.
public record ItemCotizacion(int InsumoId, int Cantidad);

// Datos recibidos desde la interfaz móvil.
public record CotizacionNueva(
    string Cliente,
    string Telefono,
    List<ItemCotizacion> Items);

// Cotización calculada y almacenada por el servidor.
public record Cotizacion(
    int Id,
    string Cliente,
    string Telefono,
    List<ItemCotizacion> Items,
    decimal Subtotal,
    decimal Descuento,
    decimal Total,
    DateTime Fecha);
