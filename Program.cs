using AgroCosechaMovil.Models;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// La API y la aplicación móvil se sirven desde el mismo proyecto.
app.UseDefaultFiles();
app.UseStaticFiles();

var insumos = new List<Insumo>
{
    new(1, "Semilla de maíz ICTA HB-83", "Semillas", "bolsa 10 lb", 185.00m, 40),
    new(2, "Semilla de frijol negro ICTA", "Semillas", "libra", 12.50m, 120),
    new(3, "Fertilizante 15-15-15", "Fertilizantes", "saco 45 kg", 295.00m, 25),
    new(4, "Urea 46 %", "Fertilizantes", "saco 45 kg", 310.00m, 8),
    new(5, "Abono orgánico (bocashi)", "Fertilizantes", "saco 25 kg", 65.00m, 60),
    new(6, "Machete 22 pulgadas", "Herramientas", "unidad", 55.00m, 30),
    new(7, "Bomba de mochila 16 L", "Herramientas", "unidad", 425.00m, 5),
    new(8, "Fungicida a base de cobre", "Protección", "kilogramo", 98.00m, 18)
};

var cotizaciones = new List<Cotizacion>();

// GET /api/insumos?categoria=Semillas. El filtro es opcional.
app.MapGet("/api/insumos", (string? categoria) =>
{
    if (string.IsNullOrWhiteSpace(categoria))
    {
        return Results.Ok(insumos);
    }

    var filtrados = insumos
        .Where(i => i.Categoria.Equals(categoria, StringComparison.OrdinalIgnoreCase))
        .ToList();

    return Results.Ok(filtrados);
});

// GET /api/insumos/3. Devuelve 404 si el insumo no existe.
app.MapGet("/api/insumos/{id:int}", (int id) =>
{
    var insumo = insumos.FirstOrDefault(i => i.Id == id);
    return insumo is not null
        ? Results.Ok(insumo)
        : Results.NotFound(new { mensaje = $"No existe el insumo {id}" });
});

// POST /api/cotizaciones. Todas las validaciones y cálculos se hacen en el servidor.
app.MapPost("/api/cotizaciones", (CotizacionNueva datos) =>
{
    if (string.IsNullOrWhiteSpace(datos.Cliente))
    {
        return Results.BadRequest(new { mensaje = "El nombre del cliente es obligatorio." });
    }

    if (string.IsNullOrWhiteSpace(datos.Telefono) ||
        datos.Telefono.Length != 8 ||
        !datos.Telefono.All(char.IsDigit))
    {
        return Results.BadRequest(new { mensaje = "El teléfono debe contener exactamente 8 dígitos numéricos." });
    }

    if (datos.Items is null || datos.Items.Count == 0)
    {
        return Results.BadRequest(new { mensaje = "Debe agregar al menos un insumo a la cotización." });
    }

    decimal subtotal = 0m;

    foreach (var item in datos.Items)
    {
        var insumo = insumos.FirstOrDefault(i => i.Id == item.InsumoId);

        if (insumo is null)
        {
            return Results.BadRequest(new { mensaje = $"No existe el insumo {item.InsumoId}." });
        }

        if (item.Cantidad <= 0)
        {
            return Results.BadRequest(new { mensaje = $"La cantidad de {insumo.Nombre} debe ser mayor que cero." });
        }

        if (item.Cantidad > insumo.Existencias)
        {
            return Results.BadRequest(new { mensaje = $"Solo hay {insumo.Existencias} de {insumo.Nombre}" });
        }

        subtotal += insumo.Precio * item.Cantidad;
    }

    subtotal = Math.Round(subtotal, 2);
    var descuento = subtotal >= 1000m
        ? Math.Round(subtotal * 0.05m, 2)
        : 0m;
    var total = Math.Round(subtotal - descuento, 2);

    var cotizacion = new Cotizacion(
        cotizaciones.Count + 1,
        datos.Cliente.Trim(),
        datos.Telefono,
        datos.Items,
        subtotal,
        descuento,
        total,
        DateTime.Now);

    cotizaciones.Add(cotizacion);

    return Results.Created($"/api/cotizaciones/{cotizacion.Id}", cotizacion);
});

// GET /api/cotizaciones. Devuelve las cotizaciones registradas durante la ejecución.
app.MapGet("/api/cotizaciones", () => Results.Ok(cotizaciones));

app.Run();
