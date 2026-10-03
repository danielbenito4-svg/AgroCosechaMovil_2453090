namespace AgroCosechaMovil.Models;

// Representa un insumo agrícola disponible en el catálogo.
public record Insumo(
    int Id,
    string Nombre,
    string Categoria,
    string Unidad,
    decimal Precio,
    int Existencias);
