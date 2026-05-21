"""Genera DIAGRAMAS_CU_v2.html con un diagrama detallado por cada CU.
Estilo: título arriba-izq, actor(es) izq, CU principal centro, <<include>> arriba-der,
<<extend>> abajo, todo conectado con flechas dashed con estereotipos UML.
Layout pensado para imprimir/recortar uno por página.
"""
from pathlib import Path
import html

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "DIAGRAMAS_CU_v2.html"


# ============================================================
# SVG renderer detallado por CU
# ============================================================
def svg_cu_detailed(num, title, actors, includes, extends):
    """
    num: identificador (string o int)
    title: nombre del CU (multilinea OK)
    actors: lista de strings (uno o varios actores izquierda)
    includes: lista de strings — CUs que el main <<include>>
    extends: lista de strings — CUs que <<extend>> al main
    """
    w, h = 1100, 700

    # Posiciones
    title_x, title_y = 40, 40
    actor_x, actor_first_y = 80, 280
    actor_step_y = 130
    main_cx, main_cy = 540, 360
    main_rx, main_ry = 150, 36
    include_x = 920
    include_first_y = 130
    include_step_y = 130
    extend_first_x = 200
    extend_y = 600
    extend_step_x = 220

    parts = [f'<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg">']
    parts.append('<defs>')
    parts.append('<marker id="arr_open" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="11" markerHeight="11" orient="auto">')
    parts.append('<path d="M0,0 L11,6 L0,12" fill="none" stroke="black" stroke-width="1.4"/></marker>')
    parts.append('<pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">')
    parts.append('<path d="M 20 0 L 0 0 0 20" fill="none" stroke="#dddddd" stroke-width="0.6"/></pattern>')
    parts.append('</defs>')
    # Background grid + frame
    parts.append(f'<rect width="{w}" height="{h}" fill="url(#grid)"/>')
    parts.append(f'<rect x="0" y="0" width="{w}" height="{h}" fill="none" stroke="#777" stroke-width="1.5"/>')

    # Title block (multi-line)
    title_lines = _wrap(title, 18)
    parts.append(f'<text x="{title_x}" y="{title_y}" class="cu-title">')
    parts.append(f'<tspan x="{title_x}" dy="0">{num}.</tspan>')
    for i, line in enumerate(title_lines):
        parts.append(f'<tspan x="{title_x}" dy="{28 if i==0 else 24}">{html.escape(line)}</tspan>')
    parts.append('</text>')

    # Actors stick figures
    actor_anchors = []
    for i, name in enumerate(actors):
        ay = actor_first_y + i * actor_step_y
        parts.extend(_stick_figure(actor_x, ay, name))
        actor_anchors.append((actor_x + 18, ay + 8))  # right-mid of head
    # Lines actor -> main
    for ax, ay in actor_anchors:
        # Endpoint at main ellipse left edge
        ex, ey = _ellipse_point(main_cx, main_cy, main_rx, main_ry, ax, ay)
        parts.append(f'<line x1="{ax + 10}" y1="{ay + 25}" x2="{ex - 4}" y2="{ey}" stroke="black" stroke-width="1.5"/>')

    # Main CU oval
    parts.append(f'<ellipse cx="{main_cx}" cy="{main_cy}" rx="{main_rx}" ry="{main_ry}" fill="white" stroke="black" stroke-width="1.6"/>')
    main_text = _wrap(title, 24)
    if len(main_text) == 1:
        parts.append(f'<text x="{main_cx}" y="{main_cy + 5}" text-anchor="middle" class="cu-main">{html.escape(main_text[0])}</text>')
    else:
        first_dy = -8 if len(main_text) == 2 else -16
        parts.append(f'<text x="{main_cx}" y="{main_cy}" text-anchor="middle" class="cu-main">')
        for i, line in enumerate(main_text):
            parts.append(f'<tspan x="{main_cx}" dy="{first_dy if i==0 else 16}">{html.escape(line)}</tspan>')
        parts.append('</text>')

    # Includes (arriba-derecha)
    for i, txt in enumerate(includes):
        cy = include_first_y + i * include_step_y
        cx = include_x
        rx, ry = _oval_size_for(txt)
        parts.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="white" stroke="black" stroke-width="1.3"/>')
        _draw_oval_text(parts, cx, cy, txt, rx)
        # Arrow main -> include (dashed) with <<include>> label
        sx, sy = _ellipse_point(main_cx, main_cy, main_rx, main_ry, cx, cy)
        ex, ey = _ellipse_point(cx, cy, rx, ry, main_cx, main_cy)
        parts.append(f'<line x1="{sx}" y1="{sy}" x2="{ex}" y2="{ey}" stroke="black" stroke-width="1.2" stroke-dasharray="6 4" marker-end="url(#arr_open)"/>')
        # label estereotipo cerca del medio
        mx, my = (sx + ex) / 2, (sy + ey) / 2 - 8
        parts.append(f'<text x="{mx}" y="{my}" text-anchor="middle" class="stereo">&lt;&lt;include&gt;&gt;</text>')

    # Extends (abajo)
    for i, txt in enumerate(extends):
        cx = extend_first_x + i * extend_step_x
        cy = extend_y
        rx, ry = _oval_size_for(txt)
        parts.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="white" stroke="black" stroke-width="1.3"/>')
        _draw_oval_text(parts, cx, cy, txt, rx)
        # Arrow extend -> main (dashed) with <<extend>>
        sx, sy = _ellipse_point(cx, cy, rx, ry, main_cx, main_cy)
        ex, ey = _ellipse_point(main_cx, main_cy, main_rx, main_ry, cx, cy)
        parts.append(f'<line x1="{sx}" y1="{sy}" x2="{ex}" y2="{ey}" stroke="black" stroke-width="1.2" stroke-dasharray="6 4" marker-end="url(#arr_open)"/>')
        mx, my = (sx + ex) / 2, (sy + ey) / 2 + 12
        parts.append(f'<text x="{mx}" y="{my}" text-anchor="middle" class="stereo">&lt;&lt;extend&gt;&gt;</text>')

    # Inline styles for tspan/text
    parts.append('<style>')
    parts.append('.cu-title { font-family: Arial, sans-serif; font-size: 17px; font-weight: bold; fill: black; }')
    parts.append('.cu-main { font-family: Arial, sans-serif; font-size: 13px; font-weight: bold; fill: black; }')
    parts.append('.cu-sec { font-family: Arial, sans-serif; font-size: 12px; fill: black; }')
    parts.append('.stereo { font-family: Arial, sans-serif; font-size: 11px; font-style: italic; fill: black; }')
    parts.append('.actor-name { font-family: Arial, sans-serif; font-size: 13px; fill: black; }')
    parts.append('</style>')

    parts.append('</svg>')
    return ''.join(parts)


def _stick_figure(cx, cy, name):
    out = []
    # head
    out.append(f'<circle cx="{cx}" cy="{cy}" r="10" fill="white" stroke="black" stroke-width="1.5"/>')
    # body
    out.append(f'<line x1="{cx}" y1="{cy+10}" x2="{cx}" y2="{cy+38}" stroke="black" stroke-width="1.5"/>')
    # arms
    out.append(f'<line x1="{cx-14}" y1="{cy+22}" x2="{cx+14}" y2="{cy+22}" stroke="black" stroke-width="1.5"/>')
    # legs
    out.append(f'<line x1="{cx}" y1="{cy+38}" x2="{cx-12}" y2="{cy+58}" stroke="black" stroke-width="1.5"/>')
    out.append(f'<line x1="{cx}" y1="{cy+38}" x2="{cx+12}" y2="{cy+58}" stroke="black" stroke-width="1.5"/>')
    # name
    out.append(f'<text x="{cx}" y="{cy+76}" text-anchor="middle" class="actor-name">{html.escape(name)}</text>')
    return out


def _wrap(text, max_chars):
    """Word-wrap simple: break in words to lines of approx max_chars."""
    words = text.split()
    lines = []
    cur = ""
    for w in words:
        if len(cur) + len(w) + 1 <= max_chars:
            cur = (cur + " " + w).strip()
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines or [text]


def _oval_size_for(txt):
    lines = _wrap(txt, 18)
    width = max(len(line) for line in lines)
    rx = max(75, width * 4 + 24)
    ry = 22 + (len(lines) - 1) * 10
    return rx, ry


def _draw_oval_text(parts, cx, cy, txt, rx):
    lines = _wrap(txt, max(8, int((rx - 20) / 4)))
    if len(lines) == 1:
        parts.append(f'<text x="{cx}" y="{cy + 4}" text-anchor="middle" class="cu-sec">{html.escape(lines[0])}</text>')
    else:
        parts.append(f'<text x="{cx}" y="{cy}" text-anchor="middle" class="cu-sec">')
        first_dy = -((len(lines) - 1) * 7)
        for i, line in enumerate(lines):
            parts.append(f'<tspan x="{cx}" dy="{first_dy if i==0 else 14}">{html.escape(line)}</tspan>')
        parts.append('</text>')


# ============================================================
# Data: CU + actores + includes + extends por cada 41 CU
# ============================================================

# Estructura: (num, title, [actors], [includes], [extends])
CU_DIAGRAMS = [
    (1, "Gestionar inmuebles",
     ["Gerente General", "Administrador"],
     ["Validar unicidad del código", "Verificar tipo de inmueble", "Asignar status DISPONIBLE"],
     ["Registrar inmueble", "Editar inmueble existente", "Eliminar inmueble"]),

    (2, "Dividir inmuebles",
     ["Gerente General", "Arquitecto"],
     ["Validar que padre esté DISPONIBLE", "Verificar suma m² ≤ padre", "Verificar códigos únicos"],
     ["Crear N subdivisiones", "Cancelar división", "Mostrar error de dimensiones"]),

    (3, "Fusionar inmuebles",
     ["Gerente General"],
     ["Validar mismo padre", "Verificar todos DISPONIBLE", "Marcar deletedAt en hijos"],
     ["Restaurar padre", "Cancelar fusión", "Mostrar error"]),

    (4, "Gestionar planos de vivienda modelo",
     ["Arquitecto", "Ingeniero"],
     ["Validar roles ARQUITECTO+INGENIERO", "Verificar modelo existe", "Calcular presupuesto según planos"],
     ["Registrar plano", "Guardar plano", "Eliminar plano"]),

    (5, "Actualizar planos de vivienda modelo",
     ["Arquitecto", "Ingeniero"],
     ["Comparar optimisticVersion", "Validar versión existe", "Incrementar optimisticVersion"],
     ["Guardar cambios", "Rechazar por concurrencia", "Cancelar edición"]),

    (6, "Gestionar clientes",
     ["Secretaria", "Vendedor"],
     ["Verificar CI no duplicado", "Validar formato email/teléfono", "Asignar status LEAD"],
     ["Registrar cliente", "Editar cliente", "Eliminar (soft) cliente"]),

    (7, "Gestionar reunión con cliente",
     ["Secretaria", "Vendedor"],
     ["Verificar cliente existe", "Validar fecha futura", "Asignar status PROGRAMADA"],
     ["Agendar reunión", "Reprogramar reunión", "Cancelar reunión"]),

    (8, "Gestionar reserva",
     ["Vendedor"],
     ["Verificar Property DISPONIBLE", "Validar Client no CERRADO", "Calcular expiresAt"],
     ["Crear reserva", "Cancelar reserva", "Vencer reserva"]),

    (9, "Elaborar contrato de venta",
     ["Gerente General", "Vendedor"],
     ["Verificar reserva ACTIVA", "Validar no contrato previo", "Calcular cláusulas y monto"],
     ["Crear BORRADOR", "Enviar a REVISION", "Firmar contrato"]),

    (10, "Actualizar contrato de venta",
     ["Gerente General"],
     ["Validar optimisticVersion", "Verificar contrato FIRMADO", "Crear nueva versión vinculada"],
     ["Modificar contrato", "Rechazar por concurrencia", "Marcar anterior MODIFICADO"]),

    (11, "Gestionar personal del proyecto",
     ["Encargado de Proyecto"],
     ["Verificar worker activo", "Validar no overlap activo", "Registrar startDate"],
     ["Asignar worker", "Dar de baja asignación", "Reasignar worker"]),

    (12, "Gestionar materiales del proyecto",
     ["Encargado de Presupuesto", "Encargado de Compras"],
     ["Verificar material existe", "Calcular plannedTotal", "Upsert por projectId+materialId"],
     ["Crear requirement", "Actualizar requirement", "Eliminar requirement"]),

    (13, "Gestionar pedido y compra de materiales",
     ["Encargado de Compras"],
     ["Validar supplier activo", "Verificar materiales activos", "Calcular totalAmount"],
     ["Crear OC BORRADOR", "Aprobar OC", "Enviar OC al proveedor"]),

    (14, "Gestionar preliminares de obra bruta",
     ["Encargado de Proyecto", "Ingeniero"],
     ["Verificar proyecto existe", "Validar tipo de preliminar", "Setear completedAt"],
     ["Registrar preliminar", "Marcar completado", "Eliminar preliminar"]),

    (15, "Controlar avance de obra bruta",
     ["Encargado de Proyecto", "Supervisor"],
     ["Verificar monotonía del %", "Validar activity no TERMINADA", "Calcular avance ponderado"],
     ["Reportar avance", "Marcar TERMINADA", "Bloquear activity"]),

    (16, "Gestionar actividades de obra bruta",
     ["Encargado de Proyecto", "Ingeniero"],
     ["Validar fechas plannedStart<plannedEnd", "Asignar weight ponderado", "Verificar contratista válido"],
     ["Crear activity BRUTA", "Actualizar activity", "Eliminar activity PENDIENTE"]),

    (17, "Controlar avance de obra fina",
     ["Encargado de Proyecto", "Supervisor"],
     ["Verificar monotonía del %", "Validar activity stage=FINA", "Calcular ponderado por stage"],
     ["Reportar avance FINA", "Marcar TERMINADA", "Consultar summary by stage"]),

    (18, "Gestionar actividades de obra fina",
     ["Encargado de Proyecto", "Ingeniero"],
     ["Validar category de obra FINA", "Asignar weight ponderado", "Verificar fechas válidas"],
     ["Crear activity FINA", "Actualizar activity", "Eliminar activity PENDIENTE"]),

    (19, "Controlar trabajadores en base al avance",
     ["Encargado de Proyecto", "Supervisor"],
     ["Validar assignment activa", "Verificar date ≥ startDate", "Calcular costo MO"],
     ["Registrar asistencia", "Consultar labor-cost", "Filtrar por trabajador/fecha"]),

    (20, "Controlar calidad de obra",
     ["Encargado de Calidad", "Ingeniero"],
     ["Validar inspector con rol válido", "Verificar transición de finding", "Setear closedDate al cerrar"],
     ["Crear inspección", "Agregar finding", "Cambiar status finding"]),

    (21, "Controlar uso del material",
     ["Encargado de Proyecto", "Encargado de Compras"],
     ["Comparar consumo vs planificado", "Calcular avance ponderado", "Detectar sobreconsumo/desviación"],
     ["Registrar consumo", "Generar análisis", "Emitir warnings"]),

    (22, "Controlar cronograma de avance",
     ["Encargado de Proyecto", "Ingeniero"],
     ["Validar fechas plannedStart<End", "Verificar no self-dep", "Detectar ciclos en grafo"],
     ["Crear ScheduleItem", "Agregar dependency FS/SS/FF/SF", "Eliminar dependency"]),

    (23, "Controlar presupuesto de avance",
     ["Encargado de Presupuesto"],
     ["Validar categoría válida", "Calcular variance planned vs actual", "Clasificar OK/OVERBUDGET/UNDER"],
     ["Crear BudgetLine", "Actualizar actualAmount", "Generar summary"]),

    (24, "Generar reporte de control de calidad",
     ["Encargado de Calidad", "Gerente"],
     ["Contar inspecciones", "Agrupar por severidad y status", "Detectar críticos abiertos + overdue"],
     ["Exportar reporte", "Filtrar por proyecto", "Imprimir resumen"]),

    (25, "Generar reporte de avance de obra",
     ["Encargado de Proyecto", "Gerente"],
     ["Leer activities y progresses", "Calcular ponderado total", "Separar por stage BRUTA/FINA"],
     ["Generar reporte", "Filtrar por activity", "Exportar a PDF"]),

    (26, "Generar reporte de material según avance",
     ["Encargado de Compras", "Encargado de Presupuesto"],
     ["Agrupar usages por material", "Comparar con requirements", "Emitir warnings sobreconsumo"],
     ["Generar análisis", "Filtrar por material", "Exportar reporte"]),

    (27, "Generar reporte de mano de obra",
     ["Encargado de Proyecto", "Gerente"],
     ["Filtrar attendances PRESENTE", "Aplicar tarifa hourly/daily", "Sumar por trabajador"],
     ["Generar reporte", "Filtrar rango fechas", "Exportar a CSV"]),

    (28, "Generar reporte de cronograma",
     ["Encargado de Proyecto", "Gerente"],
     ["Leer ScheduleItems con preds/succs", "Validar coherencia del grafo", "Ordenar por plannedStart"],
     ["Generar Gantt", "Filtrar por fechas", "Exportar reporte"]),

    (29, "Generar reporte de presupuesto",
     ["Encargado de Presupuesto", "Gerente"],
     ["Agrupar lines por categoría", "Calcular variance %", "Sumar totales"],
     ["Generar reporte", "Filtrar por categoría", "Exportar a Excel"]),

    (30, "Autenticarse en el sistema (login)",
     ["Usuario"],
     ["Validar email registrado", "Verificar password con bcrypt", "Firmar JWT con roles"],
     ["Iniciar sesión", "Rechazar credenciales inválidas", "Bloquear usuario inactivo"]),

    (31, "Gestionar roles y asignación RBAC",
     ["Administrador"],
     ["Validar roles existen", "Verificar email único", "Crear RoleAssignment por cada rol"],
     ["Registrar usuario", "Actualizar roles", "Desactivar usuario"]),

    (32, "Verificar capacidad de crédito (mock banco)",
     ["Vendedor"],
     ["Validar cliente existe", "Invocar BankPort.checkCredit", "Persistir CreditCheck"],
     ["Aprobar crédito", "Rechazar crédito", "Marcar PENDIENTE"]),

    (33, "Recibir desembolsos y pagos del cliente",
     ["Encargado de Presupuesto", "Secretaria"],
     ["Validar FKs según type", "Verificar existencia de FK", "Sumar a inflows del proyecto"],
     ["Registrar PAGO_CLIENTE", "Registrar DESEMBOLSO_BANCO", "Rechazar FK inválida"]),

    (34, "Registrar pagos a proveedores y contratistas",
     ["Encargado de Presupuesto", "Encargado de Compras"],
     ["Validar supplier/worker activo", "Sumar a outflows", "Verificar FKs por type"],
     ["Pagar a proveedor", "Pagar a contratista", "Reembolsar a cliente"]),

    (35, "Registrar recepción de materiales",
     ["Encargado de Compras", "Encargado de Proyecto"],
     ["Verificar PO ENVIADA/PARCIAL", "Validar qty ≤ pendiente línea", "Recalcular status OC"],
     ["Registrar recepción parcial", "Completar recepción total", "Marcar RECIBIDA_TOTAL"]),

    (36, "Gestionar catálogo de proveedores",
     ["Encargado de Compras"],
     ["Validar datos contacto", "Asignar rating 1-5", "Verificar taxId único"],
     ["Registrar proveedor", "Editar proveedor", "Desactivar proveedor"]),

    (37, "Registrar asistencia diaria del personal",
     ["Encargado de Proyecto", "Supervisor"],
     ["Verificar assignment activa", "Validar date ≥ startDate", "Aplicar unique (worker, proyecto, date)"],
     ["Registrar PRESENTE", "Registrar FALTA/PERMISO", "Rechazar duplicado"]),

    (38, "Formalizar entrega del inmueble (doble firma)",
     ["Encargado de Proyecto", "Cliente"],
     ["Verificar proyecto FINALIZADO", "Validar firmas únicas", "Aplicar cascada de estados"],
     ["Firmar empresa", "Firmar cliente", "Cerrar ciclo Property/Client→ENTREGADO"]),

    (39, "Versionar planos con bloqueo optimista",
     ["Arquitecto", "Ingeniero"],
     ["Comparar optimisticVersion", "Incrementar versionNumber", "Desmarcar isCurrent anterior"],
     ["Crear nueva versión", "Marcar como current", "Rechazar versión obsoleta"]),

    (40, "Auditar cambios sobre entidades críticas",
     ["Administrador", "Gerente"],
     ["Capturar before/after JSON", "Registrar userId+timestamp", "Persistir AuditLog"],
     ["Consultar log por entidad", "Filtrar por usuario", "Exportar auditoría"]),

    (41, "Notificar eventos relevantes a usuarios",
     ["Sistema"],
     ["Evaluar regla de evento", "Determinar destinatarios", "Persistir Notification"],
     ["Emitir notificación", "Marcar como leída", "Eliminar notificación"]),
]


def _ellipse_point(cx, cy, rx, ry, tx, ty):
    """Returns the point on the ellipse boundary in the direction of (tx, ty)."""
    import math
    dx, dy = tx - cx, ty - cy
    if dx == 0 and dy == 0:
        return cx + rx, cy
    # Parametric ellipse: x = cx + rx*cos(t); y = cy + ry*sin(t)
    # We want the boundary point in the direction (dx, dy)
    angle = math.atan2(dy, dx)
    # The boundary point on ellipse along that direction
    denom = math.sqrt((ry * math.cos(angle)) ** 2 + (rx * math.sin(angle)) ** 2)
    if denom == 0:
        return cx + rx, cy
    scale = (rx * ry) / denom
    px = cx + scale * math.cos(angle)
    py = cy + scale * math.sin(angle)
    return px, py


# ============================================================
# Build HTML
# ============================================================
def build():
    css = """
body { font-family: 'Times New Roman', serif; margin: 0; padding: 20px; background: #ffffff; color: #000; }
h1 { font-size: 22pt; border-bottom: 1px solid #000; padding-bottom: 6px; }
h2 { font-size: 14pt; margin-top: 40px; }
.intro { max-width: 900px; margin: 12px 0 30px; text-align: justify; font-size: 11.5pt; }
.diagrama-page {
  page-break-after: always;
  margin: 30px auto;
  max-width: 1140px;
  padding: 20px 24px;
  border: 1px solid #ccc;
  background: white;
}
.diagrama-page svg { display: block; margin: 0 auto; max-width: 100%; height: auto; }
.cu-caption { text-align: center; font-style: italic; font-size: 10.5pt; color: #555; margin-top: 10px; }
.toc { background: #f6f6f6; padding: 14px 22px; border-left: 4px solid #555; margin: 20px 0; }
.toc ol { padding-left: 22px; margin: 0; }
.toc li { margin: 2px 0; font-size: 10.5pt; }
.toc a { color: #000; text-decoration: none; }
.toc a:hover { text-decoration: underline; }
@media print {
  body { padding: 0; }
  .diagrama-page { border: none; box-shadow: none; }
  .toc { page-break-after: always; }
  .intro { page-break-after: always; }
}
"""
    parts = []
    parts.append(f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Investco — Diagramas de Casos de Uso v2</title>
<style>{css}</style>
</head>
<body>
<h1>Diagramas de Casos de Uso — Investco</h1>
<p class="intro">Este documento contiene los 41 diagramas detallados de casos de uso del sistema Investco, generados siguiendo la convención UML estándar usada en el documento original del proyecto. Cada diagrama incluye los actores principales (figuras stick), el caso de uso central (óvalo), las relaciones <em>&lt;&lt;include&gt;&gt;</em> hacia validaciones y cálculos del sistema (arriba-derecha) y las relaciones <em>&lt;&lt;extend&gt;&gt;</em> hacia acciones alternativas o de cierre (abajo). Cada página está pensada para imprimirse y recortarse individualmente para reemplazar los diagramas correspondientes en el documento original.</p>
""")

    # TOC
    parts.append('<div class="toc"><h2>Índice de diagramas</h2><ol>')
    for num, title, *_ in CU_DIAGRAMS:
        parts.append(f'<li><a href="#cu{num}">CU #{num} — {html.escape(title)}</a></li>')
    parts.append('</ol></div>')

    # Pages
    for num, title, actors, includes, extends in CU_DIAGRAMS:
        svg = svg_cu_detailed(num, title, actors, includes, extends)
        parts.append(f'<div class="diagrama-page" id="cu{num}">')
        parts.append(svg)
        parts.append(f'<div class="cu-caption">Diagrama 6.{num}.1 — Caso de uso #{num}: {html.escape(title)}</div>')
        parts.append('</div>')

    parts.append('</body></html>')
    OUT.write_text(''.join(parts), encoding='utf-8')
    print(f"Wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    build()
