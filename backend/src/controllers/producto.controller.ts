import { Request, Response } from "express";
import { catchAsync } from "../middlewares/errorHandler";
import { productoService } from "../services/producto.service";
import {
  actualizarProductoSchema,
  crearProductoSchema,
} from "../types/producto.types";

// Helper: convierte Decimal de Prisma a número para evitar "precio":"45.5" como string
function serializar(data: any): any {
  return JSON.parse(
    JSON.stringify(data, (_key, value) =>
      typeof value?.toNumber === "function" ? value.toNumber() : value
    )
  );
}

export const listarProductos = catchAsync(async (_req: Request, res: Response) => {
  const productos = await productoService.listar();
  res.json({ ok: true, data: serializar(productos) });
});

export const obtenerProducto = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const producto = await productoService.obtenerPorId(id);
  res.json({ ok: true, data: serializar(producto) });
});

export const crearProducto = catchAsync(async (req: Request, res: Response) => {
  const datos = crearProductoSchema.parse(req.body);
  const producto = await productoService.crear(datos);
  res.status(201).json({ ok: true, data: serializar(producto) });
});

export const actualizarProducto = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const datos = actualizarProductoSchema.parse(req.body);
  const producto = await productoService.actualizar(id, datos);
  res.json({ ok: true, data: serializar(producto) });
});

export const eliminarProducto = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await productoService.eliminar(id);
  res.json({ ok: true, mensaje: "Producto eliminado correctamente" });
});

export const productosStockBajo = catchAsync(async (_req: Request, res: Response) => {
  const productos = await productoService.listarConStockBajo();
  res.json({ ok: true, data: productos });
});
