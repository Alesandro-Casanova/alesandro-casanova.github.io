// Una entrada por proyecto. El orden de esta lista es el orden del portfolio.
window.proyectos = [
  {
    titulo: "Hilos y Coo · ERP de gestión comercial",
    area: "Full stack",
    resumen: "Desarrollé el sistema que conecta la tienda online de una mercería con el mostrador, el inventario y la caja. En la demo podés hacer un pedido, entregarlo y ver el cobro en caja.",
    tecnologias: ["React", "TypeScript", "Prisma", "MariaDB"],
    imagen: "assets/hilos-catalogo.webp",
    demo: "demos/hilos.html",
    accion: "Ver proyecto y demo"
  },
  {
    titulo: "API de ventas",
    area: "Backend",
    resumen: "¿Qué pasa si la caja registra una venta y se corta la conexión antes de responder? Diseñé una API que reconoce el reintento y devuelve el comprobante original. En la consola podés comprobar qué pasó con la venta, el dinero y el stock.",
    tecnologias: ["Node.js", "TypeScript", "Express", "SQLite"],
    muestra: { archivo: "ventas.http", lineas: ["POST /sales", "Idempotency-Key: venta-001", "", "201 Created", "↳ totalCents: 2875"] },
    demo: "demos/api.html",
    accion: "Abrir la consola",
    codigo: "https://github.com/Alesandro-Casanova/demo-api-ventas"
  }
];
