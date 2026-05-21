# Documentación técnica Investco v2.0

Esta carpeta contiene la documentación formal del proyecto siguiendo la metodología de Craig Larman (*UML y Patrones*).

## Archivos

- **`PROYECTO_INVESTCO_v2.html`** — Documento principal. Abre en navegador. Incluye:
  - Caps 1-3 preservados del proyecto original (Introducción, Descripción del problema, Organigrama)
  - Cap 4 Parámetros del sistema
  - Cap 5 Actores + 41 casos de uso de alto nivel
  - Cap 6 Modelo del dominio (Larman cap 9)
  - Cap 7 41 casos de uso detallados (*fully dressed*) con diagrama de CU + secuencia + colaboración cada uno
  - Cap 8 Contratos de operación (Larman cap 11)
  - Cap 9 Diagrama de clases de diseño (Larman cap 16)
  - Cap 10 Patrones GRASP aplicados (Larman cap 17)
  - Cap 11 Máquinas de estado — 7 SM (Larman cap 29)
  - Cap 12 Arquitectura por capas
  - Cap 13 Modelo de datos físico (schema Prisma)
  - Cap 14 Conclusiones
- **`build_doc.py`** — Script Python que ensambla el HTML. Para regenerar: `python build_doc.py`
- **`assets/styles.css`** — Estilos monocromáticos académicos (similar al PDF original).

## Cómo regenerar

```bash
cd docs
python build_doc.py
```

Genera `PROYECTO_INVESTCO_v2.html` (~425 KB) con todos los diagramas SVG embebidos. No requiere dependencias externas (todo inline).

## Visualización

Abrir `PROYECTO_INVESTCO_v2.html` en cualquier navegador moderno. Diseñado para impresión: el CSS incluye reglas `@media print` que respetan saltos de página entre secciones.

## Resumen de contenido técnico

- **41 casos de uso** (29 originales + 12 detectados como faltantes durante análisis)
- **15 actores** correspondientes a roles RBAC del backend
- **16 conceptos** en el modelo del dominio
- **7 máquinas de estado** críticas (Property, Client, Reservation, Contract, Project, PurchaseOrder, QualityFinding)
- **8 contratos de operación** con pre/postcondiciones precisas
- **9 patrones GRASP** justificados con su aplicación concreta
- **134 diagramas SVG** generados programáticamente (estilo UML monocromático)

## Diferencias respecto al documento original

| Aspecto | Doc original | Doc v2 |
|---------|--------------|--------|
| Caps 1-3 (intro, problema, organigrama) | Preservados | Idénticos al original |
| Cap 4 Parámetros | Tablas IPO/Relaciones/Ambiente | Preservado + referencias a implementación |
| Actores | 14 actores funcionales | 15 roles RBAC (códigos exactos del sistema) |
| Casos de uso | 29 enumerados | 41 (corrigiendo inconsistencias detectadas) |
| CU detallados | 29 con curso básico + diagramas | 41 con formato *fully dressed* Larman |
| Modelo del dominio | No incluido | Diagrama conceptual con 16 entidades + asociaciones |
| Contratos de operación | No incluidos | 8 contratos pre/post para operaciones críticas |
| Clases de diseño | Solo "clases de interfaz" por CU | Diagrama de clases de diseño completo (capas) |
| GRASP | No mencionado | 9 patrones aplicados con justificación |
| Máquinas de estado | No incluidas | 7 SM diagramadas |
| Arquitectura | No formalizada | Arquitectura por capas + hexagonal explícita |
| Modelo de datos | Implícito | Schema Prisma documentado con decisiones físicas |
