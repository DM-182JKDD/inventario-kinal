import { prisma } from "../config/prisma";
import { AppError } from "../middlewares/errorHandler";
import { movimientoService } from "./movimiento.service";
import {
  ActualizarProductoDTO,
  CrearProductoDTO,
} from "../types/producto.types";

export const productoService = {
  // GET /productos  (incluye el nombre de su categoría)
  async listar() {
    return prisma.producto.findMany({
      orderBy: { nombre: "asc" },
      include: { categoria: { select: { id: true, nombre: true } } },
    });
  },

  async obtenerPorId(id: number) {
    const producto = await prisma.producto.findUnique({
      where: { id },
      include: { categoria: true },
    });
    if (!producto) {
      throw new AppError(`Producto con id ${id} no encontrado`, 404);
    }
    return producto;
  },

  async crear(data: CrearProductoDTO) {
    const categoria = await prisma.categoria.findUnique({
      where: { id: data.categoriaId },
    });
    if (!categoria) {
      throw new AppError(`La categoría ${data.categoriaId} no existe`, 400);
    }

    const [producto] = await prisma.$transaction(async () => {
      const p = await prisma.producto.create({ data });
      if (data.stock && data.stock > 0) {
        await movimientoService.registrarAutomatico(
          p.id,
          "ENTRADA",
          data.stock,
          "Stock inicial al crear producto"
        );
      }
      return [p];
    });

    return producto;
  },

  async actualizar(id: number, data: ActualizarProductoDTO) {
    const productoActual = await this.obtenerPorId(id);

    if (data.categoriaId) {
      const categoria = await prisma.categoria.findUnique({
        where: { id: data.categoriaId },
      });
      if (!categoria) {
        throw new AppError(`La categoría ${data.categoriaId} no existe`, 400);
      }
    }

    const [producto] = await prisma.$transaction(async () => {
      const p = await prisma.producto.update({ where: { id }, data });
      if (data.stock !== undefined && data.stock !== productoActual.stock) {
        const diferencia = data.stock - productoActual.stock;
        const tipo = diferencia > 0 ? "ENTRADA" : "SALIDA";
        await movimientoService.registrarAutomatico(
          id,
          tipo,
          Math.abs(diferencia),
          `Ajuste de stock de ${productoActual.stock} a ${data.stock}`
        );
      }
      return [p];
    });

    return producto;
  },

  async eliminar(id: number) {
    await this.obtenerPorId(id);
    await prisma.producto.delete({ where: { id } });
    return { id };
  },

  // Bonus: productos por debajo del stock mínimo (para el dashboard)
  async listarConStockBajo() {
    return prisma.$queryRaw`
      SELECT id, nombre, stock, "stockMinimo"
      FROM productos
      WHERE stock <= "stockMinimo"
      ORDER BY stock ASC
    `;
  },
};
