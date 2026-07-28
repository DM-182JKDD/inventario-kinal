import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ── Categorías ────────────────────────────────────────────────
  const categorias = await Promise.all([
    prisma.categoria.upsert({
      where: { nombre: "Tecnología" },
      update: {},
      create: { nombre: "Tecnología", descripcion: "Equipo de cómputo y accesorios" },
    }),
    prisma.categoria.upsert({
      where: { nombre: "Alimentos" },
      update: {},
      create: { nombre: "Alimentos", descripcion: "Productos perecederos y no perecederos" },
    }),
    prisma.categoria.upsert({
      where: { nombre: "Ferretería" },
      update: {},
      create: { nombre: "Ferretería", descripcion: "Herramientas y materiales de construcción" },
    }),
  ]);

  // ── Productos ─────────────────────────────────────────────────
  const productosData = [
    { nombre: "Teclado USB inalámbrico", descripcion: "Teclado compacto 2.4GHz", precio: 89.99, stock: 30, stockMinimo: 5, catIdx: 0 },
    { nombre: "Mouse óptico ergonómico", descripcion: "Mouse con cable USB, 3 botones", precio: 35.50, stock: 45, stockMinimo: 10, catIdx: 0 },
    { nombre: "Hub USB 4 puertos", descripcion: "USB 3.0 con alimentación externa", precio: 25.00, stock: 60, stockMinimo: 15, catIdx: 0 },
    { nombre: "Arroz 1kg", descripcion: "Arroz blanco grano largo", precio: 12.00, stock: 200, stockMinimo: 50, catIdx: 1 },
    { nombre: "Frijol negro 1kg", descripcion: "Frijol negro seleccionado", precio: 15.00, stock: 150, stockMinimo: 40, catIdx: 1 },
    { nombre: "Aceite vegetal 1L", descripcion: "Aceite de cocina", precio: 22.00, stock: 80, stockMinimo: 20, catIdx: 1 },
    { nombre: "Martillo de acero", descripcion: "Martillo 16 oz con mango ergonómico", precio: 65.00, stock: 20, stockMinimo: 5, catIdx: 2 },
    { nombre: "Cinta métrica 5m", descripcion: "Cinta métrica metálica retráctil", precio: 28.00, stock: 35, stockMinimo: 10, catIdx: 2 },
    { nombre: "Destornillador punta plana", descripcion: "Juego de 3 piezas", precio: 42.00, stock: 25, stockMinimo: 8, catIdx: 2 },
    { nombre: "Caja de clavos 2\"", descripcion: "Clavos de acero galvanizado 1 lb", precio: 18.50, stock: 100, stockMinimo: 30, catIdx: 2 },
    { nombre: "Cargador USB-C 65W", descripcion: "Cargador rápido GaN", precio: 149.00, stock: 12, stockMinimo: 5, catIdx: 0 },
    { nombre: "Galletas surtidas 200g", descripcion: "Paquete de galletas surtidas", precio: 8.50, stock: 90, stockMinimo: 20, catIdx: 1 },
  ];

  for (const p of productosData) {
    await prisma.producto.create({
      data: {
        nombre: p.nombre,
        descripcion: p.descripcion,
        precio: p.precio,
        stock: p.stock,
        stockMinimo: p.stockMinimo,
        categoriaId: categorias[p.catIdx].id,
      },
    });
  }

  // ── Movimientos ───────────────────────────────────────────────
  const productos = await prisma.producto.findMany({ orderBy: { id: "asc" } });

  for (const p of productos) {
    await prisma.movimiento.create({
      data: {
        tipo: "ENTRADA",
        cantidad: p.stock,
        motivo: "Stock inicial al insertar datos de prueba",
        productoId: p.id,
      },
    });
  }

  // Resumen
  const totalCat = await prisma.categoria.count();
  const totalProd = await prisma.producto.count();
  const totalMov = await prisma.movimiento.count();

  console.log("✅ Datos insertados correctamente");
  console.log(`   Categorías: ${totalCat}`);
  console.log(`   Productos:  ${totalProd}`);
  console.log(`   Movimientos: ${totalMov}`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
