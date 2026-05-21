"""Genera PROYECTO_INVESTCO_v2.html ensamblando secciones + SVG.
Estilo académico monocromático, similar al PDF original.
"""
from pathlib import Path
import html

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "PROYECTO_INVESTCO_v2.html"

# ============================================================
# SVG HELPERS — diagramas estilo UML/Larman
# ============================================================

def svg_use_case_diagram(title, actors, use_cases, links):
    """Diagrama de casos de uso. actors=[(name,side)], use_cases=[(id,text)], links=[(actor_idx,uc_id)]."""
    w, h = 720, max(320, 80 + 60 * len(use_cases))
    sys_x, sys_y, sys_w, sys_h = 200, 40, 320, h - 80
    parts = [f'<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg">']
    parts.append(f'<rect x="{sys_x}" y="{sys_y}" width="{sys_w}" height="{sys_h}" class="box"/>')
    parts.append(f'<text x="{sys_x + sys_w/2}" y="{sys_y + 18}" text-anchor="middle" class="label-big">Sistema Investco</text>')
    # use cases inside system
    uc_positions = {}
    uc_y_start = sys_y + 50
    spacing = (sys_h - 60) / max(1, len(use_cases))
    for i, (uc_id, text) in enumerate(use_cases):
        cy = uc_y_start + spacing * i + spacing / 2
        cx = sys_x + sys_w / 2
        uc_positions[uc_id] = (cx, cy)
        parts.append(f'<ellipse cx="{cx}" cy="{cy}" rx="120" ry="20" class="box"/>')
        parts.append(f'<text x="{cx}" y="{cy + 4}" text-anchor="middle" class="label">{html.escape(text)}</text>')
    # actors
    left_actors = [a for a in actors if a[1] == 'L']
    right_actors = [a for a in actors if a[1] == 'R']
    actor_positions = {}
    def draw_actor(idx, name, side):
        if side == 'L':
            ax = 60
            ay = 70 + idx * 90
        else:
            ax = w - 60
            ay = 70 + idx * 90
        # stick figure
        parts.append(f'<circle cx="{ax}" cy="{ay}" r="8" class="actor"/>')
        parts.append(f'<line x1="{ax}" y1="{ay+8}" x2="{ax}" y2="{ay+30}" stroke="black" stroke-width="1.5"/>')
        parts.append(f'<line x1="{ax-12}" y1="{ay+18}" x2="{ax+12}" y2="{ay+18}" stroke="black" stroke-width="1.5"/>')
        parts.append(f'<line x1="{ax}" y1="{ay+30}" x2="{ax-10}" y2="{ay+48}" stroke="black" stroke-width="1.5"/>')
        parts.append(f'<line x1="{ax}" y1="{ay+30}" x2="{ax+10}" y2="{ay+48}" stroke="black" stroke-width="1.5"/>')
        parts.append(f'<text x="{ax}" y="{ay+62}" text-anchor="middle" class="label">{html.escape(name)}</text>')
        return ax, ay + 25
    for i, (name, side) in enumerate(left_actors):
        actor_positions[(name, 'L')] = draw_actor(i, name, 'L')
    for i, (name, side) in enumerate(right_actors):
        actor_positions[(name, 'R')] = draw_actor(i, name, 'R')
    # links
    for actor_name, actor_side, uc_id in links:
        if (actor_name, actor_side) in actor_positions and uc_id in uc_positions:
            ax, ay = actor_positions[(actor_name, actor_side)]
            cx, cy = uc_positions[uc_id]
            if actor_side == 'L':
                x1, x2 = ax + 10, cx - 120
            else:
                x1, x2 = ax - 10, cx + 120
            parts.append(f'<line x1="{x1}" y1="{ay}" x2="{x2}" y2="{cy}" stroke="black" stroke-width="1"/>')
    parts.append('</svg>')
    return ''.join(parts)


def svg_sequence_diagram(participants, messages, title=""):
    """Diagrama de secuencia.
    participants: lista de strings (lifelines)
    messages: lista de tuplas (from_idx, to_idx, label, kind) — kind: 'sync'|'return'|'self'
    """
    n = len(participants)
    col_w = 140
    margin = 40
    w = margin * 2 + col_w * n
    h = 100 + 50 * len(messages) + 60
    parts = [f'<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg">']
    # participants boxes + lifelines
    box_y = 30
    box_h = 32
    for i, p in enumerate(participants):
        cx = margin + col_w * i + col_w / 2
        bx = cx - 60
        parts.append(f'<rect x="{bx}" y="{box_y}" width="120" height="{box_h}" class="box"/>')
        parts.append(f'<text x="{cx}" y="{box_y + 20}" text-anchor="middle" class="label-big">{html.escape(p)}</text>')
        parts.append(f'<line x1="{cx}" y1="{box_y + box_h}" x2="{cx}" y2="{h - 20}" class="lifeline"/>')
    # messages
    y = box_y + box_h + 30
    for from_idx, to_idx, label, kind in messages:
        fx = margin + col_w * from_idx + col_w / 2
        tx = margin + col_w * to_idx + col_w / 2
        if from_idx == to_idx:
            # self message: loop
            parts.append(f'<path d="M{fx},{y} L{fx+30},{y} L{fx+30},{y+18} L{fx+4},{y+18}" class="arrow" marker-end="url(#arr)"/>')
            parts.append(f'<text x="{fx + 6}" y="{y - 4}" class="label-small">{html.escape(label)}</text>')
            y += 28
        else:
            stroke = ""
            dashed = ' stroke-dasharray="4 3"' if kind == 'return' else ''
            x1, x2 = fx, tx
            if from_idx < to_idx:
                x1, x2 = fx + 2, tx - 2
            else:
                x1, x2 = fx - 2, tx + 2
            parts.append(f'<line x1="{x1}" y1="{y}" x2="{x2}" y2="{y}" stroke="black" stroke-width="1.2"{dashed} marker-end="url(#arr)"/>')
            midx = (x1 + x2) / 2
            parts.append(f'<text x="{midx}" y="{y - 4}" text-anchor="middle" class="label-small">{html.escape(label)}</text>')
            y += 26
    # arrow marker def
    parts.append('<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="black"/></marker></defs>')
    parts.append('</svg>')
    return ''.join(parts)


def svg_collaboration_diagram(participants, messages):
    """Diagrama de colaboración.
    participants: lista de strings (objetos)
    messages: [(from_idx, to_idx, seq_num, label)]
    Layout circular o reticular simple.
    """
    import math
    n = len(participants)
    w, h = 700, 460
    cx, cy = w/2, h/2
    radius = min(w, h) / 2 - 90
    positions = []
    parts = [f'<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg">']
    if n == 1:
        positions = [(cx, cy)]
    elif n == 2:
        positions = [(cx - 180, cy), (cx + 180, cy)]
    else:
        for i in range(n):
            angle = -math.pi / 2 + 2 * math.pi * i / n
            positions.append((cx + radius * math.cos(angle), cy + radius * math.sin(angle)))
    # boxes
    for i, (px, py) in enumerate(positions):
        bx, by = px - 65, py - 18
        parts.append(f'<rect x="{bx}" y="{by}" width="130" height="36" class="box"/>')
        parts.append(f'<text x="{px}" y="{py + 4}" text-anchor="middle" class="label-big">{html.escape(participants[i])}</text>')
    # messages
    drawn_pairs = {}
    for from_idx, to_idx, seq, label in messages:
        fx, fy = positions[from_idx]
        tx, ty = positions[to_idx]
        dx, dy = tx - fx, ty - fy
        dist = (dx**2 + dy**2) ** 0.5
        if dist == 0:
            continue
        # offset endpoints so arrow doesn't enter boxes
        ux, uy = dx / dist, dy / dist
        sx, sy = fx + ux * 70, fy + uy * 22
        ex, ey = tx - ux * 70, ty - uy * 22
        # multiple arrows between same pair → offset perpendicular
        key = tuple(sorted([from_idx, to_idx]))
        idx = drawn_pairs.get(key, 0)
        drawn_pairs[key] = idx + 1
        offset = (idx - 0.5) * 12 if idx > 0 else 0
        # perpendicular
        px_off, py_off = -uy * offset, ux * offset
        sx += px_off; sy += py_off; ex += px_off; ey += py_off
        parts.append(f'<line x1="{sx}" y1="{sy}" x2="{ex}" y2="{ey}" stroke="black" stroke-width="1.2" marker-end="url(#arr)"/>')
        midx, midy = (sx + ex) / 2, (sy + ey) / 2
        parts.append(f'<text x="{midx}" y="{midy - 4}" text-anchor="middle" class="label-small">{html.escape(seq + ": " + label)}</text>')
    parts.append('<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="black"/></marker></defs>')
    parts.append('</svg>')
    return ''.join(parts)


def svg_state_machine(states, transitions, initial=None, final=None, title=""):
    """Diagrama de estado.
    states: lista nombres
    transitions: [(from, to, label)]
    initial: índice estado inicial (opcional)
    final: lista índices estados finales
    Layout vertical centrado.
    """
    n = len(states)
    w = 600
    state_w = 160
    state_h = 50
    spacing_y = 90
    h = 60 + spacing_y * n + 40
    parts = [f'<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg">']
    cx = w / 2
    positions = []
    y0 = 50
    for i, s in enumerate(states):
        py = y0 + spacing_y * i
        positions.append((cx, py))
        parts.append(f'<rect x="{cx - state_w/2}" y="{py - state_h/2}" width="{state_w}" height="{state_h}" rx="14" ry="14" class="box"/>')
        parts.append(f'<text x="{cx}" y="{py + 5}" text-anchor="middle" class="label-big">{html.escape(s)}</text>')
    # initial marker
    if initial is not None:
        ix, iy = positions[initial]
        parts.append(f'<circle cx="{cx - state_w/2 - 30}" cy="{iy}" r="6" fill="black"/>')
        parts.append(f'<line x1="{cx - state_w/2 - 24}" y1="{iy}" x2="{cx - state_w/2}" y2="{iy}" stroke="black" stroke-width="1.5" marker-end="url(#arr)"/>')
    # final markers
    if final:
        for f_idx in final:
            fx, fy = positions[f_idx]
            parts.append(f'<circle cx="{cx + state_w/2 + 25}" cy="{fy}" r="9" fill="white" stroke="black" stroke-width="1.5"/>')
            parts.append(f'<circle cx="{cx + state_w/2 + 25}" cy="{fy}" r="5" fill="black"/>')
            parts.append(f'<line x1="{cx + state_w/2}" y1="{fy}" x2="{cx + state_w/2 + 16}" y2="{fy}" stroke="black" stroke-width="1.5" marker-end="url(#arr)"/>')
    # transitions
    side_count = {}
    for f, t, label in transitions:
        fx, fy = positions[f]
        tx, ty = positions[t]
        if f == t:
            # self loop right side
            parts.append(f'<path d="M{fx + state_w/2 - 5},{fy - 5} C{fx + state_w/2 + 60},{fy - 30} {fx + state_w/2 + 60},{fy + 30} {fx + state_w/2 - 5},{fy + 5}" class="arrow" marker-end="url(#arr)"/>')
            parts.append(f'<text x="{fx + state_w/2 + 35}" y="{fy + 4}" text-anchor="start" class="label-small">{html.escape(label)}</text>')
        else:
            # vertical direct or curved
            if abs(f - t) == 1:
                # direct vertical
                if t > f:
                    x1, y1 = fx, fy + state_h/2
                    x2, y2 = tx, ty - state_h/2
                else:
                    x1, y1 = fx, fy - state_h/2
                    x2, y2 = tx, ty + state_h/2
                parts.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="black" stroke-width="1.5" marker-end="url(#arr)"/>')
                parts.append(f'<text x="{(x1+x2)/2 + 8}" y="{(y1+y2)/2 + 4}" text-anchor="start" class="label-small">{html.escape(label)}</text>')
            else:
                # curved on side, alternate left/right based on direction
                side = 'L' if t < f else 'R'
                side_count[side] = side_count.get(side, 0) + 1
                offset = state_w/2 + 30 + side_count[side] * 25
                ex = fx + (offset if side == 'R' else -offset)
                y1 = fy + (state_h/2 if t > f else -state_h/2)
                y2 = ty + (-state_h/2 if t > f else state_h/2)
                xs = fx + (state_w/2 if side == 'R' else -state_w/2)
                xt = tx + (state_w/2 if side == 'R' else -state_w/2)
                parts.append(f'<path d="M{xs},{y1} Q{ex},{(y1+y2)/2} {xt},{y2}" class="arrow" marker-end="url(#arr)"/>')
                tx_label = ex + (8 if side == 'R' else -8)
                anchor = 'start' if side == 'R' else 'end'
                parts.append(f'<text x="{tx_label}" y="{(y1+y2)/2 + 4}" text-anchor="{anchor}" class="label-small">{html.escape(label)}</text>')
    parts.append('<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="black"/></marker></defs>')
    parts.append('</svg>')
    return ''.join(parts)


def svg_class_diagram(classes, associations, w=900, h=600):
    """Diagrama de clases simple. classes=[(name, x, y, attrs, methods)], associations=[(from_idx, to_idx, label, mult_from, mult_to)]"""
    parts = [f'<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg">']
    box_w = 180
    rects = []
    for name, x, y, attrs, methods in classes:
        attrs_h = max(1, len(attrs)) * 14 + 6
        methods_h = max(1, len(methods)) * 14 + 6
        title_h = 22
        total_h = title_h + attrs_h + methods_h
        rects.append((x, y, x + box_w, y + total_h))
        parts.append(f'<rect x="{x}" y="{y}" width="{box_w}" height="{total_h}" class="box"/>')
        parts.append(f'<line x1="{x}" y1="{y + title_h}" x2="{x + box_w}" y2="{y + title_h}" stroke="black"/>')
        parts.append(f'<line x1="{x}" y1="{y + title_h + attrs_h}" x2="{x + box_w}" y2="{y + title_h + attrs_h}" stroke="black"/>')
        parts.append(f'<text x="{x + box_w/2}" y="{y + 16}" text-anchor="middle" class="label-big">{html.escape(name)}</text>')
        for i, a in enumerate(attrs):
            parts.append(f'<text x="{x + 6}" y="{y + title_h + 12 + i*14}" class="label-small">{html.escape(a)}</text>')
        for i, m in enumerate(methods):
            parts.append(f'<text x="{x + 6}" y="{y + title_h + attrs_h + 12 + i*14}" class="label-small">{html.escape(m)}</text>')
    # associations: simple line from center to center, clipped at box edges
    def box_edge(r1, x2, y2):
        x1, y1, ex1, ey1 = r1
        cx1, cy1 = (x1 + ex1) / 2, (y1 + ey1) / 2
        dx, dy = x2 - cx1, y2 - cy1
        if dx == 0 and dy == 0:
            return cx1, cy1
        # find intersection with rect bounds
        bx = (ex1 - x1) / 2
        by = (ey1 - y1) / 2
        if dx == 0:
            return cx1, cy1 + (by if dy > 0 else -by)
        if dy == 0:
            return cx1 + (bx if dx > 0 else -bx), cy1
        slope = dy / dx
        if abs(slope) < by / bx:
            ex = cx1 + (bx if dx > 0 else -bx)
            ey = cy1 + slope * (bx if dx > 0 else -bx)
        else:
            ey = cy1 + (by if dy > 0 else -by)
            ex = cx1 + (by if dy > 0 else -by) / slope
        return ex, ey
    for fi, ti, label, mf, mt in associations:
        r1 = rects[fi]
        r2 = rects[ti]
        cx1, cy1 = (r1[0] + r1[2]) / 2, (r1[1] + r1[3]) / 2
        cx2, cy2 = (r2[0] + r2[2]) / 2, (r2[1] + r2[3]) / 2
        ex1, ey1 = box_edge(r1, cx2, cy2)
        ex2, ey2 = box_edge(r2, cx1, cy1)
        parts.append(f'<line x1="{ex1}" y1="{ey1}" x2="{ex2}" y2="{ey2}" stroke="black" stroke-width="1"/>')
        if label:
            mx, my = (ex1 + ex2) / 2, (ey1 + ey2) / 2
            parts.append(f'<text x="{mx}" y="{my - 4}" text-anchor="middle" class="label-small">{html.escape(label)}</text>')
        if mf:
            parts.append(f'<text x="{ex1 + 6}" y="{ey1 + 12}" class="label-small">{html.escape(mf)}</text>')
        if mt:
            parts.append(f'<text x="{ex2 - 6}" y="{ey2 + 12}" text-anchor="end" class="label-small">{html.escape(mt)}</text>')
    parts.append('</svg>')
    return ''.join(parts)


# ============================================================
# CONTENIDO — secciones documento
# ============================================================

COVER = """<div class="cover">
<div class="institution">
<strong>UTEPSA — Universidad Tecnológica Privada de Santa Cruz</strong><br>
Facultad de Ingeniería · SI414 Sistemas de Información<br>
Docente: Ing. Nancy Velasquez Suarez · Grupo A
</div>
<h1>Gestión y Control de Avance de Obra para Investco</h1>
<div class="subtitle">Documento de Análisis y Diseño — versión 2.0</div>
<div class="meta">
<strong>Presentado por:</strong><br>
Bruno Paz Aguilera — 2020114321<br>
Rony Javier Rivero Paniagua — 2022110749<br>
Rodrigo Camacho Cedeño — 2022212096<br><br>
Santa Cruz, Bolivia — 2026
</div>
</div>"""


CAP_1 = """<h2 id="cap1">1. Introducción</h2>
<p>El presente documento describe el análisis y diseño del sistema de Gestión y Control de Avance de Obra para la constructora Investco, una empresa boliviana dedicada a la edificación y comercialización de inmuebles (lotes, casas, departamentos y dúplex). El objetivo del proyecto es proveer a Investco de un sistema de información integral (ERP) que cubra el ciclo completo del negocio: desde la administración de propiedades y la captación comercial del cliente, hasta la ejecución de obra, el control de calidad y la entrega final del inmueble.</p>
<p>Esta segunda versión del documento mantiene los capítulos descriptivos del problema (capítulos 1 a 3) idénticos a la versión original, ya que el dominio de negocio no ha variado. A partir del capítulo 4 se rediseña toda la documentación técnica aplicando rigurosamente los métodos del libro <em>UML y Patrones</em> de Craig Larman: modelo del dominio, casos de uso completamente vestidos (<em>fully dressed</em>), diagramas de secuencia del sistema, contratos de operación, diagramas de interacción con asignación de responsabilidades mediante patrones GRASP, diagramas de clases de diseño y máquinas de estado.</p>
<p>Adicionalmente, esta versión refleja con precisión la solución técnica real construida durante el semestre: backend implementado en NestJS + PostgreSQL + Prisma, con 41 casos de uso identificados (29 originales más 12 detectados como faltantes durante el análisis exhaustivo), arquitectura hexagonal con adaptadores intercambiables para integraciones externas (modo demo con banco mock) y verificaciones automáticas mediante máquinas de estado sobre las entidades críticas del dominio.</p>"""


CAP_2 = """<h2 id="cap2">2. Descripción del problema</h2>

<h3 id="cap2-1">2.1. Requisitos</h3>
<p>Investco es una empresa boliviana dedicada a la construcción y comercialización de inmuebles. La operación cubre desde la captación del cliente y la formalización de la venta hasta la ejecución de la obra y la entrega final. A continuación se describe el flujo de negocio que el sistema debe soportar.</p>

<p>El proceso comercial inicia cuando el cliente toma contacto con Investco a través de redes sociales o referidos. La secretaria registra los datos del cliente y se programan reuniones para definir los detalles de la vivienda. Estas reuniones permiten discutir y ajustar las especificaciones del proyecto para alinearse con las necesidades y deseos del cliente. Durante este proceso, el cliente también puede realizar visitas a las viviendas modelo que ya están construidas y disponibles para visitas.</p>

<p>Una vez seleccionada la vivienda modelo y el lote donde se construirá, se realiza un análisis a los requerimientos del cliente para definir los cambios necesarios en los planos de la vivienda modelo y el presupuesto que será necesario para la realización del inmueble.</p>

<p>Luego, se procede a formalizar la reserva:</p>
<ul>
<li><strong>Documentación:</strong> El cliente completa un formulario de reserva con detalles personales y del inmueble seleccionado.</li>
<li><strong>Depósito de Reserva:</strong> Se requiere un depósito inicial para asegurar el inmueble. Este depósito puede variar según el tipo y el valor del inmueble.</li>
<li><strong>Recibo de Reserva:</strong> Se emite un recibo de reserva que especifica las condiciones de la reserva, incluyendo: el período de validez de la reserva, el monto del depósito, las condiciones de reembolso en caso de cancelación.</li>
</ul>

<p>Una vez formalizada la reserva, Investco procede a gestionar y firmar el contrato con el cliente. La empresa se encarga de redactar el contrato, revisarlo con el cliente y asegurarse de que todos los aspectos estén claros y aceptados por ambas partes antes de proceder con la construcción. Esto incluye detalles como el alcance del proyecto, los plazos de entrega, el presupuesto acordado y cualquier cláusula especial que sea relevante para el proyecto en cuestión. Una vez que el contrato ha sido firmado por todas las partes involucradas, Investco está lista para iniciar la preparación del terreno y la ejecución de la obra bruta.</p>

<p>El encargado del proyecto es responsable de seleccionar al personal necesario para llevar a cabo las diferentes actividades de construcción. Esto incluye contratistas y subcontratistas especializados en áreas como albañilería, vidriería, carpintería, electricidad, plomería y ferretería. Investco supervisa la gestión de estos recursos humanos para garantizar que el equipo cuente con las habilidades y experiencia adecuadas para completar el proyecto de manera eficiente.</p>

<p>Investco se encarga de gestionar el inventario y la adquisición de materiales necesarios para cada proyecto de construcción. Esto implica monitorear el uso de materiales, prever necesidades futuras y coordinar con proveedores para garantizar el suministro oportuno y de calidad.</p>

<p>Investco lleva a cabo una serie de preparativos para asegurar que el terreno esté listo y adecuado para la obra. Esto incluye la realización de estudios de suelo para evaluar la estabilidad y características del terreno. Además, se instalan las faenas necesarias en el sitio, como oficinas móviles y áreas de almacenamiento de materiales. Se solicitan también los servicios básicos requeridos para la construcción, como agua, electricidad y conexión a redes de alcantarillado.</p>

<p>Una vez que el terreno está preparado, se inicia la fase de obra bruta. En esta etapa, se llevan a cabo actividades fundamentales para la estructura y cimientos de la vivienda. Investco coordina las diferentes tareas, incluyendo albañilería, instalaciones eléctricas, plomería y carpintería. Se garantiza que cada aspecto de la obra bruta se realice de acuerdo con los estándares de calidad establecidos y dentro del cronograma previsto.</p>

<p>Una vez completada la fase de obra bruta, se procede con la obra fina, que incluye todos los trabajos detallados y acabados de la vivienda. Investco coordina actividades como la instalación de vidriería, trabajos de herrería, montaje de muebles y jardinería. Cada detalle se realiza con precisión y cuidado para garantizar un resultado final que cumpla con las expectativas del cliente y los estándares de calidad de la empresa.</p>

<p>Toda esta operación, históricamente gestionada mediante hojas de cálculo Excel dispersas y procesos manuales, requiere un sistema integrado que centralice la información, automatice los controles de estado y permita el seguimiento en tiempo real del avance de obra.</p>

<h3 id="cap2-2">2.2. Objetivos</h3>

<h4 id="cap2-2-1">2.2.1. Objetivo General</h4>
<p>Desarrollar un sistema de control de avance de obra integral y eficiente para Investco, que aborde de manera efectiva sus necesidades y requerimientos específicos. Este sistema deberá estar respaldado por un análisis exhaustivo, un diseño sólido y escalable, y un prototipo funcional que permita su evaluación y refinamiento antes de su implementación final.</p>

<h4 id="cap2-2-2">2.2.2. Objetivos específicos</h4>
<ul>
<li><strong>Analizar:</strong> Llevar a cabo un análisis exhaustivo de los requerimientos y necesidades de Investco para el sistema de control de avance de obra. Esto incluye identificar las funcionalidades necesarias, las problemáticas actuales y las áreas de mejora.</li>
<li><strong>Diseñar:</strong> Crear un diseño detallado del sistema propuesto, abarcando la arquitectura del sistema, los componentes clave y la interfaz de usuario. Este diseño debe asegurar que el sistema sea intuitivo, eficiente y capaz de satisfacer las necesidades identificadas en el análisis.</li>
<li><strong>Desarrollar un prototipo:</strong> Implementar un prototipo funcional del sistema de control de avance de obra. Este prototipo debe permitir a los usuarios clave probar y evaluar las funcionalidades principales, proporcionando una base para la retroalimentación y las mejoras antes de su implementación completa.</li>
</ul>"""


CAP_3 = """<h2 id="cap3">3. Organigrama</h2>
<p>La estructura organizacional de Investco se representa a continuación. Los actores que interactúan con el sistema están alineados con esta jerarquía:</p>"""

def _build_cap3_svg():
    w, h = 900, 460
    parts = [f'<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg">']
    def box(x, y, txt, w_=140, h_=42):
        parts.append(f'<rect x="{x}" y="{y}" width="{w_}" height="{h_}" class="box"/>')
        parts.append(f'<text x="{x + w_/2}" y="{y + h_/2 + 4}" text-anchor="middle" class="label-big">{html.escape(txt)}</text>')
    def link(x1, y1, x2, y2):
        parts.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="black" stroke-width="1.2"/>')
    box(380, 20, "Gerente General")
    second = ["Administración", "Encargado de Proyecto", "Encargado de Calidad", "Encargado de Presupuesto"]
    sec_w = len(second) * 170
    start = (w - sec_w) / 2 + 10
    for i, n in enumerate(second):
        x = start + i * 170
        box(x, 140, n)
        link(450, 62, x + 70, 140)
    third = ["Secretaria", "Vendedor", "Ingeniero", "Arquitecto", "Enc. Compras", "Supervisor"]
    sec_w = len(third) * 138
    start = (w - sec_w) / 2 + 8
    for i, n in enumerate(third):
        x = start + i * 138
        box(x, 260, n, 130)
        link(450, 182, x + 65, 260)
    fourth = ["Contratistas", "Obreros", "Proveedores"]
    sec_w = len(fourth) * 200
    start = (w - sec_w) / 2 + 30
    for i, n in enumerate(fourth):
        x = start + i * 200
        box(x, 380, n)
        link(450, 302, x + 70, 380)
    parts.append('</svg>')
    return ''.join(parts)

CAP_3_SVG = _build_cap3_svg()


CAP_4 = """<h2 id="cap4">4. Parámetros del sistema</h2>

<h3 id="cap4-1">4.1. Entradas, Procesos, Salidas</h3>
<p>El sistema opera como un ERP modular que recibe entradas desde múltiples actores, procesa la información mediante reglas de negocio centralizadas y produce salidas en forma de reportes, documentos y notificaciones. El siguiente esquema resume el modelo Entradas-Procesos-Salidas:</p>
<table>
<thead><tr><th>Entradas</th><th>Procesos</th><th>Salidas</th></tr></thead>
<tbody>
<tr>
<td>Datos del cliente (CI, nombre, teléfono, email)<br>Datos del inmueble (código, tipo, ubicación, m²)<br>Información de planos (diseño arquitectónico, cálculos estructurales)<br>Reservas y depósitos<br>Contratos firmados<br>Reportes de avance de actividades<br>Recepciones de materiales<br>Asistencias de personal<br>Hallazgos de calidad<br>Pagos (banco, cliente, proveedor, contratista)</td>
<td>Verificación de crédito bancario<br>Validación de transiciones de estado<br>Cálculo de avance ponderado por actividad y stage<br>Análisis consumo vs avance esperado<br>Cálculo de variación presupuestaria<br>Cómputo de mano de obra acumulada<br>Auto-detección de recepción parcial/total<br>Generación atómica de eventos en cascada (firma contrato → cambio Property + Client)<br>Notificaciones y alertas (calidad crítica, OC pendientes)</td>
<td>Inmueble registrado<br>Plano versionado<br>Cliente con historial<br>Reserva con expiración<br>Contrato firmado con cláusulas<br>Orden de compra emitida<br>Acta de entrega firmada<br>Reportes de avance, calidad, presupuesto, MO y pagos<br>Dashboards en tiempo real<br>Logs de auditoría</td>
</tr>
</tbody>
</table>

<h3 id="cap4-2">4.2. Relaciones</h3>
<p>Las relaciones funcionales entre los procesos del sistema se preservan respecto del análisis original, ya que reflejan la cadena de negocio inherente a la operación de Investco:</p>
<ul>
<li><strong>Gestionar Cliente → Verificar capacidad de crédito bancario:</strong> Datos del cliente; costo de la vivienda.</li>
<li><strong>Gestionar Cliente → Definir inicialmente tipo de vivienda y presupuesto:</strong> Requerimiento del cliente.</li>
<li><strong>Verificar capacidad de crédito bancario → Definir definitivamente tipo de vivienda, detalles arquitectónicos y presupuesto:</strong> capacidad de crédito.</li>
<li><strong>Definir definitivamente tipo de vivienda, detalles arquitectónicos y presupuesto → Definición de planos e instalaciones:</strong> especificaciones de la vivienda.</li>
<li><strong>Definición de planos e instalaciones → Presentar documentos al banco:</strong> documentos.</li>
<li><strong>Presentar documentos al banco → Firma de contratos con banco y constructora:</strong> crédito aprobado.</li>
<li><strong>Firma de contratos con banco y constructora → Gestionar proyecto:</strong> contratos firmados.</li>
<li><strong>Firma de contratos con banco y constructora → Recibir primer desembolso del banco:</strong> contratos firmados.</li>
<li><strong>Recibir primer desembolso del banco → Inicio de obra:</strong> primer desembolso; proyecto.</li>
<li><strong>Inicio de obra → Realización de obra bruta:</strong> obra.</li>
<li><strong>Realización de obra bruta → Realización de obra fina:</strong> obra bruta realizada.</li>
<li><strong>Realización de obra fina → Entrega de vivienda:</strong> obra fina finalizada.</li>
<li><strong>Gestionar proyecto → Asignar encargado del proyecto:</strong> asignación de control de calidad, proyecto.</li>
<li><strong>Asignar encargado de control de calidad → Elaborar reporte de calidad:</strong> calidad del proyecto.</li>
<li><strong>Gestionar personal → Asignar contratistas (plomería, electricidad, albañilería, carpintería, vidriería); asignar ingeniero y arquitecto:</strong> personal.</li>
<li><strong>Asignar encargado de proyecto → Gestionar materiales, elaborar reporte de costos:</strong> requisitos del proyecto, costo del proyecto.</li>
<li><strong>Asignar ingeniero y arquitecto → Elaborar reporte de avance de obra:</strong> avance.</li>
</ul>

<h3 id="cap4-3">4.3. Ambiente</h3>
<p>Dado el alcance y la complejidad de las operaciones descritas, el sistema opera en un ambiente de red robusto y seguro. Los puntos clave del ambiente son:</p>
<ul>
<li><strong>Infraestructura de Red:</strong> Soporte para múltiples usuarios accediendo simultáneamente desde oficinas centrales, sitios de construcción y dispositivos móviles. La implementación real usa NestJS sobre Node.js, escuchando en HTTP y consumiendo PostgreSQL via Prisma ORM.</li>
<li><strong>Seguridad de la Información:</strong> Autenticación JWT con expiración de 12 horas, contraseñas hasheadas con bcrypt (cost 10), RBAC con 15 roles definidos en base de datos y verificados en cada request mediante guards globales (<code>JwtAuthGuard</code> + <code>RolesGuard</code>). Soft delete en entidades críticas para preservar trazabilidad.</li>
<li><strong>Escalabilidad y Flexibilidad:</strong> Arquitectura modular NestJS (15 módulos independientes), Prisma como capa de persistencia desacoplable y patrón hexagonal para integraciones externas (banco, firma digital), lo que permite escalar componentes o reemplazarlos sin tocar el dominio.</li>
<li><strong>Integración de Aplicaciones:</strong> Interfaz REST documentada con Swagger/OpenAPI para integración con cualquier cliente HTTP (frontend web/móvil, herramientas de diseño arquitectónico, software de gestión financiera). Adaptadores intercambiables para banco (real o mock).</li>
</ul>

<h3 id="cap4-4">4.4. Retroalimentación</h3>
<p>Para asegurar la eficiencia y satisfacción del usuario, el sistema permite:</p>
<ul>
<li><strong>Retroalimentación en Tiempo Real:</strong> Endpoints de consulta de avance (<code>GET /projects/:id/progress</code>), de análisis de consumo (<code>/material-analysis</code>), de costos (<code>/labor-cost</code>) y de calidad (<code>/quality-summary</code>) que devuelven métricas calculadas al momento, sin pasos batch intermedios.</li>
<li><strong>Interfaz Intuitiva:</strong> Documentación interactiva Swagger UI disponible en <code>/api/docs</code>, validación estricta de entrada con mensajes de error específicos en español y respuestas HTTP semánticas (200/201 OK; 400 validación; 401 sin auth; 403 sin rol; 404 no existe; 409 conflicto).</li>
<li><strong>Capacidades Analíticas:</strong> Cálculos automáticos de avance ponderado, desviación presupuestaria, consumo vs avance esperado con detección de sobreconsumo/desviación, balance financiero por proyecto y resumen de calidad con conteos por severidad. Estos análisis informan la toma de decisiones a lo largo del ciclo de vida del proyecto.</li>
</ul>

<h3 id="cap4-5">4.5. Tipo de Sistema</h3>
<p><strong>ERP (Planificación de Recursos Empresariales):</strong> El sistema integra diversas funciones y procesos clave de negocio en un solo entorno centralizado. Su rol es coordinar y gestionar eficientemente todas las actividades relacionadas con la administración de propiedades, el diseño de inmuebles, el proceso de venta y la ejecución de proyectos de construcción.</p>
<p>Funcionalidades clave implementadas:</p>
<ul>
<li><strong>Gestión de Proyectos:</strong> Desde la planificación inicial hasta la entrega final, incluyendo recursos humanos, materiales y financieros (módulos <code>Projects</code>, <code>Workers</code>, <code>Materials</code>, <code>Payments</code>).</li>
<li><strong>Gestión Financiera:</strong> Control de presupuestos, costos y pagos (módulos <code>Budget</code>, <code>Payments</code>), con cálculo de variación planificado vs real y saldo pendiente vs contrato.</li>
<li><strong>Gestión de Ventas y CRM:</strong> Manejo del ciclo de ventas desde captura de leads hasta formalización de contratos y firma de actas de entrega (módulos <code>Clients</code>, <code>Reservations</code>, <code>Contracts</code>, <code>Delivery</code>).</li>
<li><strong>Gestión de Recursos Humanos:</strong> Selección, asignación y control de asistencia del personal (módulo <code>Workers</code>: <code>Worker</code>, <code>StaffAssignment</code>, <code>Attendance</code>).</li>
<li><strong>Gestión de Inventarios y Logística:</strong> Control de materiales, compras a proveedores y recepciones parciales/totales (módulos <code>Materials</code>, <code>Suppliers</code>, <code>PurchaseOrders</code>).</li>
</ul>"""


# ============================================================
# CAP 5: actores + CU alto nivel
# ============================================================

ACTORS = [
    ("ADMIN", "Administrador", "Acceso total. Configuración global, gestión de usuarios y roles."),
    ("GERENTE", "Gerente General", "Aprobaciones, reportes ejecutivos, decisiones estratégicas."),
    ("SECRETARIA", "Secretaria", "Gestión de citas, registro de clientes, atención inicial."),
    ("VENDEDOR", "Vendedor", "Atención comercial, reservas, verificación de crédito."),
    ("INGENIERO", "Ingeniero Civil", "Cálculos estructurales, supervisión técnica, planos."),
    ("ARQUITECTO", "Arquitecto", "Diseño arquitectónico, versiones de planos."),
    ("ENCARG_PROYECTO", "Encargado de Proyecto", "Coordinación de obra, gestión de personal y materiales."),
    ("ENCARG_CALIDAD", "Encargado de Calidad", "Inspecciones, registro y seguimiento de hallazgos."),
    ("ENCARG_PRESUPUESTO", "Encargado de Presupuesto", "Control presupuestario, líneas de gasto, pagos."),
    ("ENCARG_COMPRAS", "Encargado de Compras", "Catálogo, órdenes de compra, recepciones."),
    ("CONTRATISTA", "Contratista", "Ejecución de actividades subcontratadas."),
    ("OBRERO", "Obrero", "Ejecución de actividades en obra; consulta asistencia personal."),
    ("PROVEEDOR", "Proveedor", "Suministro de materiales (gestionado, sin login en demo)."),
    ("CLIENTE", "Cliente", "Comprador del inmueble; firma de delivery, consulta de avance."),
    ("SUPERVISOR", "Supervisor", "Supervisión cruzada de obras, inspecciones, attendance."),
]

USE_CASES = [
    # (id, nombre, actores_principales, modulo, status)
    (1, "Gestionar inmuebles (lote, casa, depto, dúplex)", "ADMIN, GERENTE", "Properties", "Original"),
    (2, "Dividir inmuebles", "ADMIN, GERENTE", "Properties", "Original"),
    (3, "Fusionar inmuebles", "ADMIN, GERENTE", "Properties", "Original — implementado vía edición padre"),
    (4, "Gestionar planos de vivienda modelo (colaborativo arquitecto+ingeniero)", "ARQUITECTO, INGENIERO", "Blueprints", "Original"),
    (5, "Actualizar planos de vivienda modelo (con optimistic lock)", "ARQUITECTO, INGENIERO", "Blueprints", "Original"),
    (6, "Gestionar clientes", "SECRETARIA, VENDEDOR", "Clients", "Original"),
    (7, "Gestionar reunión con cliente", "SECRETARIA, VENDEDOR", "Clients/Meetings", "Original"),
    (8, "Gestionar reserva", "VENDEDOR", "Reservations", "Original"),
    (9, "Elaborar contrato de venta del inmueble", "GERENTE, VENDEDOR", "Contracts", "Original"),
    (10, "Actualizar contrato de venta (amend versionado)", "GERENTE", "Contracts", "Original"),
    (11, "Gestionar personal del proyecto", "ENCARG_PROYECTO", "Workers/StaffAssignment", "Original"),
    (12, "Gestionar materiales del proyecto", "ENCARG_PRESUPUESTO, ENCARG_COMPRAS", "Materials/Requirements", "Original"),
    (13, "Gestionar pedido y compra de materiales", "ENCARG_COMPRAS", "PurchaseOrders", "Original"),
    (14, "Gestionar preliminares de obra bruta", "ENCARG_PROYECTO, INGENIERO", "Projects/Preliminaries", "Original"),
    (15, "Controlar avance de obra bruta", "ENCARG_PROYECTO, SUPERVISOR", "Projects/Activities/Progress", "Original"),
    (16, "Gestionar actividades de obra bruta", "ENCARG_PROYECTO, INGENIERO", "Projects/Activities", "Original"),
    (17, "Controlar avance de obra fina", "ENCARG_PROYECTO, SUPERVISOR", "Projects/Activities/Progress", "Original"),
    (18, "Gestionar actividades de obra fina", "ENCARG_PROYECTO, INGENIERO", "Projects/Activities", "Original"),
    (19, "Controlar trabajadores en base al avance de obra", "ENCARG_PROYECTO, SUPERVISOR", "Workers/Attendance", "Original"),
    (20, "Controlar calidad de obra", "ENCARG_CALIDAD, INGENIERO, SUPERVISOR", "Quality", "Original"),
    (21, "Controlar uso del material (consumo vs avance)", "ENCARG_PROYECTO, ENCARG_COMPRAS", "Materials/Usages", "Original"),
    (22, "Controlar cronograma de avance de obra", "ENCARG_PROYECTO, INGENIERO", "Schedule", "Original"),
    (23, "Controlar presupuesto de avance de obra", "ENCARG_PRESUPUESTO", "Budget", "Original"),
    (24, "Generar reporte de control de calidad", "ENCARG_CALIDAD, GERENTE", "Quality/Summary", "Original"),
    (25, "Generar reporte de avance de obra", "ENCARG_PROYECTO, GERENTE", "Projects/Progress", "Original"),
    (26, "Generar reporte de material según avance de obra", "ENCARG_COMPRAS, ENCARG_PRESUPUESTO", "Materials/Analysis", "Original"),
    (27, "Generar reporte de mano de obra (costo MO)", "ENCARG_PROYECTO, GERENTE", "Workers/LaborCost", "Original"),
    (28, "Generar reporte de cronograma", "ENCARG_PROYECTO, GERENTE", "Schedule", "Original"),
    (29, "Generar reporte de presupuesto", "ENCARG_PRESUPUESTO, GERENTE", "Budget/Summary", "Original"),
    # 12 detectados
    (30, "Autenticarse en el sistema (login con JWT)", "Todos", "Auth", "Detectado"),
    (31, "Gestionar roles y asignación RBAC", "ADMIN", "Auth/Roles", "Detectado"),
    (32, "Verificar capacidad de crédito del cliente con banco (CU implícito)", "VENDEDOR", "Clients/CreditChecks (mock banco)", "Detectado"),
    (33, "Recibir desembolsos bancarios y pagos del cliente", "ENCARG_PRESUPUESTO, SECRETARIA", "Payments", "Detectado"),
    (34, "Registrar pagos a proveedores y contratistas", "ENCARG_PRESUPUESTO, ENCARG_COMPRAS", "Payments", "Detectado"),
    (35, "Registrar recepción de materiales (parcial/total)", "ENCARG_COMPRAS, ENCARG_PROYECTO", "PurchaseOrders/Receptions", "Detectado"),
    (36, "Gestionar catálogo de proveedores", "ENCARG_COMPRAS", "Suppliers", "Detectado"),
    (37, "Registrar asistencia diaria del personal", "ENCARG_PROYECTO, SUPERVISOR", "Workers/Attendance", "Detectado"),
    (38, "Formalizar entrega del inmueble (acta firmada por ambas partes)", "ENCARG_PROYECTO, CLIENTE", "Delivery", "Detectado"),
    (39, "Versionar planos con bloqueo optimista", "ARQUITECTO, INGENIERO", "Blueprints/Versions", "Detectado"),
    (40, "Auditar cambios sobre entidades críticas", "ADMIN, GERENTE", "AuditLog", "Detectado"),
    (41, "Notificar eventos relevantes a usuarios (alertas)", "Sistema → Todos", "Notifications", "Detectado"),
]

def _build_cap5():
    parts = ['<h2 id="cap5">5. Actores y casos de uso de alto nivel</h2>']
    parts.append('<h3 id="cap5-1">5.1. Actores del sistema</h3>')
    parts.append('<p>El sistema reconoce 15 actores que corresponden a roles concretos en la organización de Investco. Cada actor está vinculado a un código de rol (<code>RoleCode</code>) que se verifica en cada operación protegida mediante los <em>guards</em> globales del backend (<code>JwtAuthGuard</code> + <code>RolesGuard</code>).</p>')
    parts.append('<table><thead><tr><th>#</th><th>Código de rol</th><th>Nombre</th><th>Responsabilidades</th></tr></thead><tbody>')
    for i, (code, name, desc) in enumerate(ACTORS, 1):
        parts.append(f'<tr><td>{i}</td><td><code>{code}</code></td><td>{html.escape(name)}</td><td>{html.escape(desc)}</td></tr>')
    parts.append('</tbody></table>')

    parts.append('<h3 id="cap5-2">5.2. Casos de uso de alto nivel</h3>')
    parts.append('<p>Tras el análisis exhaustivo del documento original y la implementación efectiva del sistema, se identificaron 41 casos de uso: los 29 originalmente listados más 12 adicionales detectados como faltantes durante el diseño técnico. La columna <em>Estado</em> distingue entre ambos grupos. Los 12 detectados eran imprescindibles para una solución funcional completa (autenticación, integración bancaria, pagos polimórficos, recepciones, asistencias, acta de entrega, etc.).</p>')
    parts.append('<table><thead><tr><th>#</th><th>Caso de uso</th><th>Actor(es) principal(es)</th><th>Módulo</th><th>Estado</th></tr></thead><tbody>')
    for cu in USE_CASES:
        num, name, actor, mod, status = cu
        parts.append(f'<tr><td>{num}</td><td>{html.escape(name)}</td><td>{html.escape(actor)}</td><td>{html.escape(mod)}</td><td>{html.escape(status)}</td></tr>')
    parts.append('</tbody></table>')
    parts.append('<p>El detalle de cada caso de uso, incluyendo precondiciones, postcondiciones, escenario principal y alternativos, así como los diagramas correspondientes (caso de uso, secuencia, colaboración y clases de interfaz), se desarrolla en el capítulo 7.</p>')
    return ''.join(parts)

CAP_5 = _build_cap5()


# ============================================================
# CAP 6: Modelo de dominio (Larman cap 9)
# ============================================================
def _build_domain_svg():
    # 15 clases centrales en grid 5x3
    classes = [
        # (name, x, y, attrs, methods=empty since dominio conceptual no tiene métodos)
        ("Usuario", 30, 30, ["email", "fullName", "passwordHash", "isActive"], []),
        ("Rol", 250, 30, ["code", "name", "description"], []),
        ("Cliente", 470, 30, ["ci", "firstName", "lastName", "phone", "status"], []),
        ("Reunión", 690, 30, ["scheduledAt", "durationMin", "status"], []),

        ("Inmueble", 30, 180, ["code", "type", "address", "zone", "m2", "status"], []),
        ("Reserva", 250, 180, ["depositAmount", "validityDays", "expiresAt", "status"], []),
        ("Contrato", 470, 180, ["totalAmount", "deliveryDeadline", "signedDate", "status", "version"], []),
        ("VerifCrédito", 690, 180, ["bankName", "approvedAmount", "status", "checkDate"], []),

        ("Proyecto", 30, 350, ["code", "startDate", "endDate", "currentStage", "status"], []),
        ("Actividad", 250, 350, ["stage", "category", "name", "plannedStart", "plannedEnd", "weight", "status"], []),
        ("Material", 470, 350, ["code", "name", "unit", "referencePrice", "category"], []),
        ("OrdenCompra", 690, 350, ["orderDate", "totalAmount", "status"], []),

        ("Worker", 30, 540, ["type", "speciality", "dailyRate", "hourlyRate"], []),
        ("Inspección", 250, 540, ["inspectionDate", "stage", "scope"], []),
        ("Pago", 470, 540, ["type", "amount", "currency", "paymentDate"], []),
        ("Entrega", 690, 540, ["deliveryDate", "warrantyMonths", "signedByClient", "signedByCompany"], []),
    ]
    # asociaciones: (from_idx, to_idx, label, mult_from, mult_to)
    associations = [
        (0, 1, "tiene", "*", "*"),
        (2, 0, "puede ser", "0..1", "0..1"),
        (2, 3, "agenda", "1", "*"),
        (2, 7, "solicita", "1", "*"),
        (4, 5, "se reserva", "1", "0..1"),
        (2, 5, "realiza", "1", "*"),
        (5, 6, "origina", "1", "0..1"),
        (4, 6, "se contrata", "1", "*"),
        (2, 6, "firma", "1", "*"),
        (6, 8, "inicia", "1", "0..1"),
        (4, 8, "pertenece", "1", "0..1"),
        (8, 9, "compone", "1", "*"),
        (8, 10, "requiere", "*", "*"),
        (8, 11, "emite", "1", "*"),
        (11, 10, "incluye", "*", "*"),
        (8, 12, "asigna", "*", "*"),
        (8, 13, "se inspecciona", "1", "*"),
        (8, 14, "registra pagos", "1", "*"),
        (8, 15, "concluye con", "1", "0..1"),
    ]
    return svg_class_diagram(classes, associations, w=900, h=700)

DOMAIN_SVG = _build_domain_svg()

CAP_6 = """<h2 id="cap6">6. Modelo del dominio</h2>
<p>Siguiendo la metodología de Larman (capítulo 9 — <em>Modelo del Dominio</em>), se identificaron los <strong>conceptos del dominio</strong> que representan a los objetos del mundo real con los que trabaja Investco: inmuebles, clientes, reservas, contratos, proyectos, actividades, materiales, órdenes de compra, trabajadores, inspecciones de calidad, pagos y entregas. El modelo del dominio es una representación visual estática que muestra estos conceptos junto con sus atributos esenciales y las asociaciones que los vinculan. No incluye operaciones ni decisiones de diseño: solo el vocabulario del problema.</p>

<p>El siguiente diagrama presenta los 16 conceptos centrales del dominio Investco. Las asociaciones muestran las relaciones de negocio y la multiplicidad indica las cardinalidades (uno, muchos, opcional). Se omiten atributos secundarios y entidades transversales (auditoría, notificaciones, documentos genéricos) por claridad visual.</p>"""

CAP_6_FIG = f'<div class="figure">{DOMAIN_SVG}<div class="caption">Figura 6.1 — Modelo de Dominio del sistema Investco.</div></div>'

CAP_6_NOTES_HEAD = """<h4>Observaciones sobre el modelo</h4>
<ul>
<li><strong>Usuario y Rol</strong> son entidades fundamentales que habilitan el control RBAC sobre todas las operaciones. Un usuario puede tener múltiples roles.</li>
<li><strong>Inmueble</strong> es la entidad central comercial: puede ser lote, casa, departamento o dúplex; admite jerarquía padre-hijo (un lote se divide en N inmuebles). Tiene una máquina de estado que progresa desde <em>DISPONIBLE</em> hasta <em>ENTREGADO</em>.</li>
<li><strong>Cliente</strong> evoluciona por estados (<em>LEAD → PROSPECTO → RESERVADO → FIRMADO → ENTREGADO</em>) que reflejan la madurez de la relación comercial.</li>
<li><strong>Reserva</strong> es el puente comercial: vincula a un cliente con un inmueble por un período acotado. Si vence sin convertirse, libera el inmueble.</li>
<li><strong>Contrato</strong> formaliza la venta; soporta versionado (un contrato puede modificarse, generando una nueva versión vinculada a la anterior).</li>
<li><strong>Proyecto</strong> es la unidad de ejecución de obra; tiene un único contrato y un único inmueble asociados (relación 1:1:1).</li>
<li><strong>Actividad</strong> compone el proyecto en tareas con peso ponderado para calcular avance global.</li>
<li><strong>Material</strong> y <strong>OrdenCompra</strong> son la cadena de suministro; las recepciones (no mostradas por brevedad) registran qué se recibió efectivamente vs lo pedido.</li>
<li><strong>Worker</strong> representa al personal (interno o externo) asignable a uno o más proyectos.</li>
<li><strong>Pago</strong> es polimórfico: el mismo concepto soporta desembolsos bancarios, pagos del cliente, a proveedores y a contratistas, cada uno con la FK obligatoria que corresponde a su tipo.</li>
<li><strong>Entrega</strong> formaliza el cierre del ciclo con doble firma (cliente y empresa).</li>
</ul>
<p>En el capítulo 13 (Modelo de datos físico) se presenta el modelo expandido en forma de schema Prisma, con las 41 entidades del sistema completo, incluyendo las auxiliares y transversales.</p>"""


# ============================================================
# CAP 7: 41 CUs detallados (Larman fully dressed)
# ============================================================

# Cada CU es un dict con campos completos.
# Para secuencia: participants=[actor, controller, service, repo, db], messages=[(from_idx, to_idx, label, kind)]

DETAILED_CUS = []

def add_cu(cu_id, name, actor, tipo, proposito, resumen, precondicion, curso, alt, postcond, seq=None):
    DETAILED_CUS.append({
        "id": cu_id,
        "name": name,
        "actor": actor,
        "tipo": tipo,
        "proposito": proposito,
        "resumen": resumen,
        "precondicion": precondicion,
        "curso": curso,  # list of (actor_step, sys_step) or (None, sys_step)
        "alt": alt,  # list of strings
        "postcond": postcond,
        "seq": seq or {"participants": [], "messages": []},
    })


# CU 1: Gestionar inmuebles
add_cu(
    1, "Gestionar inmuebles (lote, casa, depto, dúplex)",
    "Gerente General, Administrador",
    "Principal",
    "Administrar de manera integral los inmuebles de Investco, incluyendo lotes, casas, departamentos y dúplex.",
    "El usuario con rol ADMIN o GERENTE registra y mantiene el catálogo de inmuebles con sus atributos (código, tipo, dirección, zona, m², plano modelo) y estado inicial (DISPONIBLE).",
    "El usuario está autenticado con JWT vigente y posee rol ADMIN o GERENTE.",
    [
        ("Ingresa nuevo inmueble", "Solicita datos: código, tipo, dirección, zona, m²"),
        ("Introduce código, dirección, zona, m², tipo de inmueble", "Valida unicidad del código"),
        (None, "Verifica que el código no esté en uso"),
        ("Si es vivienda, selecciona modelo de plano (opcional)", "Valida existencia del BlueprintModel"),
        ("Confirma registro", "Crea Inmueble con status DISPONIBLE y persiste con createdAt automático"),
        (None, "Devuelve el inmueble registrado con su UUID"),
    ],
    [
        "Paso 2: si el código ya existe, el sistema responde HTTP 409 Conflict con el mensaje 'Código ya en uso: {código}'. El actor puede editar el existente o cambiar el código.",
        "Paso 4: si el BlueprintModel referido no existe, responde HTTP 404 Not Found.",
        "Paso 5: si los datos son inválidos (m² ≤ 0, dirección vacía), responde HTTP 400 Bad Request con mensajes de validación.",
    ],
    "El Inmueble queda registrado en el sistema con su status inicial DISPONIBLE, listo para ser reservado, dividido o asociado a un modelo de plano.",
    {
        "participants": [":Gerente", ":PropertyCtrl", ":PropertyService", ":Prisma"],
        "messages": [
            (0, 1, "POST /properties(dto)", "sync"),
            (1, 2, "create(dto)", "sync"),
            (2, 3, "findUnique(code)", "sync"),
            (3, 2, "null (no dup)", "return"),
            (2, 3, "property.create(data)", "sync"),
            (3, 2, "newProperty", "return"),
            (2, 1, "newProperty", "return"),
            (1, 0, "201 Created", "return"),
        ],
    },
)

# CU 2: Dividir inmuebles
add_cu(
    2, "Dividir inmuebles",
    "Gerente General, Arquitecto, Ingeniero",
    "Principal",
    "Realizar la división de un lote grande en unidades más pequeñas según los requisitos del proyecto.",
    "El usuario divide un inmueble DISPONIBLE en N sub-inmuebles cuya suma de m² no excede el padre. Se mantiene la jerarquía mediante parentPropertyId.",
    "El inmueble padre está registrado, en estado DISPONIBLE y no es ya una subdivisión.",
    [
        ("Busca el inmueble a dividir por código o id", "Devuelve detalles del inmueble"),
        ("Introduce las nuevas subdivisiones (mínimo 2): código, tipo, dirección, zona, m²", "Valida que parent esté DISPONIBLE y no sea subdivisión"),
        (None, "Verifica suma de m² hijos ≤ m² padre"),
        (None, "Verifica que los códigos de hijos sean únicos en el request y en BD"),
        (None, "En una transacción atómica, crea cada hijo con parentPropertyId = padre.id"),
        ("Confirma división", "Devuelve el padre con la lista de hijos creados"),
    ],
    [
        "Paso 3: si el padre no está DISPONIBLE, responde HTTP 400 con 'Solo se puede dividir inmuebles DISPONIBLE'.",
        "Paso 3: si el padre ya es subdivisión (tiene parentPropertyId), responde HTTP 400 con 'No se puede dividir un inmueble que ya es subdivisión'.",
        "Paso 4: si Σm² hijos > m² padre, responde HTTP 400 con 'Suma m² excede m² padre'.",
        "Paso 5: si algún código duplicado, responde HTTP 409 Conflict.",
    ],
    "El inmueble padre permanece registrado y aparecen N hijos con parentPropertyId apuntando al padre. La operación es atómica.",
    {
        "participants": [":Arquitecto", ":PropertyCtrl", ":PropertyService", ":Prisma"],
        "messages": [
            (0, 1, "POST /properties/:id/divide(dto)", "sync"),
            (1, 2, "divide(parentId, dto)", "sync"),
            (2, 3, "findById(parentId)", "sync"),
            (3, 2, "parent (DISPONIBLE)", "return"),
            (2, 2, "verifica Σm² ≤ padre", "self"),
            (2, 3, "$transaction begin", "sync"),
            (2, 3, "create N children", "sync"),
            (3, 2, "children[]", "return"),
            (2, 1, "{parent, children}", "return"),
            (1, 0, "201 Created", "return"),
        ],
    },
)

# CU 3: Fusionar inmuebles
add_cu(
    3, "Fusionar inmuebles",
    "Gerente General",
    "Principal",
    "Combinar varias subdivisiones de un mismo padre en una nueva unidad, revirtiendo una división previa.",
    "El gerente elimina (soft-delete) las subdivisiones de un padre y restaura el inmueble agrupado. La operación se ejecuta vía actualización de status y borrado lógico de hijos.",
    "Los inmuebles a fusionar comparten parentPropertyId, están DISPONIBLE y el padre sigue existiendo.",
    [
        ("Busca el padre y selecciona los hijos a fusionar", "Devuelve listado de hijos del padre"),
        ("Confirma fusión", "Valida que todos los hijos estén DISPONIBLE"),
        (None, "En transacción atómica, marca cada hijo con deletedAt"),
        (None, "Restaura el padre a DISPONIBLE si estaba marcado"),
        (None, "Devuelve el padre fusionado"),
    ],
    [
        "Paso 2: si algún hijo no está DISPONIBLE (reservado/vendido), responde HTTP 400 'Hijo {código} no está disponible'.",
        "Paso 2: si los hijos no comparten el mismo padre, responde HTTP 400.",
    ],
    "Los hijos quedan marcados como deletedAt y el padre vuelve a estar disponible para uso completo.",
    {
        "participants": [":Gerente", ":PropertyCtrl", ":PropertyService", ":Prisma"],
        "messages": [
            (0, 1, "POST /properties/:id/merge(dto)", "sync"),
            (1, 2, "merge(parentId, childrenIds)", "sync"),
            (2, 3, "findMany(childrenIds)", "sync"),
            (3, 2, "children[]", "return"),
            (2, 2, "verifica DISPONIBLE", "self"),
            (2, 3, "$transaction: softDelete children + update parent", "sync"),
            (3, 2, "OK", "return"),
            (2, 1, "{parent}", "return"),
            (1, 0, "200 OK", "return"),
        ],
    },
)

# CU 4: Gestionar planos vivienda modelo
add_cu(
    4, "Gestionar planos de vivienda modelo (colaborativo)",
    "Arquitecto, Ingeniero Civil",
    "Principal",
    "Permitir al arquitecto y al ingeniero colaborar en la creación de los planos detallados de la vivienda modelo, incluyendo instalaciones (eléctrica, plomería, carpintería, vidriería).",
    "El arquitecto crea el modelo y la primera versión con el diseño arquitectónico; el ingeniero complementa con cálculos estructurales y especificaciones de instalaciones. La versión queda marcada como isCurrent.",
    "Ambos usuarios autenticados con roles ARQUITECTO e INGENIERO respectivamente.",
    [
        ("Arquitecto crea BlueprintModel (name, description)", "Persiste el modelo"),
        ("Solicita crear primera versión con arquitectId, engineerId, architecturalDesign, structuralCalcs, estimatedBudget", "Valida que arquitectId tenga rol ARQUITECTO y engineerId tenga rol INGENIERO"),
        (None, "En transacción: incrementa versionNumber, desmarca isCurrent de versiones anteriores, crea nueva versión con isCurrent=true y optimisticVersion=1"),
        ("Ingeniero agrega instalaciones (ELECTRICA, PLOMERIA, CARPINTERIA, VIDRIERIA, HERRERIA)", "Persiste cada BlueprintInstallation con su spec JSON"),
        (None, "Devuelve la versión con sus instalaciones"),
    ],
    [
        "Paso 2: si arquitectId no tiene rol ARQUITECTO o engineerId no tiene INGENIERO, responde HTTP 400.",
    ],
    "BlueprintModel registrado con su versión 1 marcada como current; instalaciones asociadas a la versión.",
    {
        "participants": [":Arq", ":BlueprintCtrl", ":BlueprintService", ":Prisma"],
        "messages": [
            (0, 1, "POST /blueprint-models/:id/versions(dto)", "sync"),
            (1, 2, "createVersion(modelId, dto)", "sync"),
            (2, 3, "assertRole ARQUITECTO+INGENIERO", "sync"),
            (3, 2, "OK", "return"),
            (2, 3, "$transaction: unset isCurrent + create v", "sync"),
            (3, 2, "newVersion", "return"),
            (2, 1, "newVersion", "return"),
            (1, 0, "201 Created", "return"),
        ],
    },
)

# CU 5: Actualizar planos
add_cu(
    5, "Actualizar planos de vivienda modelo (optimistic lock)",
    "Arquitecto, Ingeniero Civil",
    "Principal",
    "Mantener actualizados los planos de viviendas modelo con concurrencia segura mediante bloqueo optimista.",
    "El usuario envía la versión esperada (expectedOptimisticVersion). Si coincide con la del servidor, se aplica el cambio y se incrementa el contador; si difiere, se rechaza con HTTP 409 indicando que otro editor modificó la versión.",
    "El BlueprintVersion existe y el usuario conoce su optimisticVersion actual.",
    [
        ("Solicita modificación con expectedOptimisticVersion y campos a cambiar (architecturalDesign, structuralCalcs, estimatedBudget)", "Lee versión actual"),
        (None, "Compara optimisticVersion vs expected"),
        (None, "Si coinciden: aplica cambios y incrementa optimisticVersion"),
        (None, "Devuelve la versión actualizada"),
    ],
    [
        "Paso 2: si optimisticVersion del servidor difiere de expectedOptimisticVersion, responde HTTP 409 'Versión obsoleta. Actual: X, enviada: Y'. El cliente debe recargar y reintentar.",
        "Paso 1: si versionId no existe, responde HTTP 404.",
    ],
    "Cambios aplicados con optimisticVersion incrementada; cualquier otra sesión que tuviera la versión vieja recibirá 409 al intentar guardar.",
    {
        "participants": [":Ing", ":BlueprintCtrl", ":BlueprintService", ":Prisma"],
        "messages": [
            (0, 1, "PATCH /blueprint-versions/:vid", "sync"),
            (1, 2, "updateVersion(vid, dto)", "sync"),
            (2, 3, "findUnique(vid)", "sync"),
            (3, 2, "version", "return"),
            (2, 2, "compare optimisticVersion", "self"),
            (2, 3, "update + bump version", "sync"),
            (3, 2, "newVersion", "return"),
            (2, 1, "newVersion", "return"),
            (1, 0, "200 OK", "return"),
        ],
    },
)

# CU 6: Gestionar clientes
add_cu(
    6, "Gestionar clientes",
    "Secretaria, Vendedor",
    "Principal",
    "Registrar y mantener el catálogo de clientes (leads + prospectos + activos).",
    "La secretaria o vendedor crea un cliente con CI (único), datos personales y fuente de contacto. El cliente inicia en estado LEAD.",
    "Usuario autenticado con rol SECRETARIA o VENDEDOR.",
    [
        ("Captura el CI del cliente", "Verifica que no exista cliente con ese CI"),
        ("Captura nombre, apellido, teléfono, email (opcional), fuente", "Valida formato de los campos"),
        ("Confirma registro", "Crea Cliente con status=LEAD y persiste createdAt"),
        (None, "Devuelve el cliente registrado"),
    ],
    [
        "Paso 1: si CI ya existe, responde HTTP 409 'CI ya registrado: {ci}'. Permite editar el existente.",
        "Paso 2: si firstName/lastName muy cortos o email inválido, HTTP 400 con detalle.",
    ],
    "Cliente registrado con status LEAD, listo para agendar reuniones o avanzar a PROSPECTO/RESERVADO.",
    {
        "participants": [":Vendedor", ":ClientCtrl", ":ClientService", ":Prisma"],
        "messages": [
            (0, 1, "POST /clients(dto)", "sync"),
            (1, 2, "create(dto)", "sync"),
            (2, 3, "create(client)", "sync"),
            (3, 2, "newClient", "return"),
            (2, 1, "newClient", "return"),
            (1, 0, "201 Created", "return"),
        ],
    },
)

# CU 7: Gestionar reunión
add_cu(
    7, "Gestionar reunión con cliente",
    "Secretaria, Vendedor",
    "Principal",
    "Agendar, reprogramar o cancelar reuniones con un cliente para discutir requisitos.",
    "El usuario crea una reunión asociada a un cliente con fecha futura, duración en minutos y notas. El sistema impide fechas pasadas. El status inicial es PROGRAMADA; tras la reunión se actualiza a REALIZADA/CANCELADA/REPROGRAMADA.",
    "El cliente está registrado y no eliminado.",
    [
        ("Selecciona cliente y solicita agendar reunión", "Verifica existencia del cliente"),
        ("Indica scheduledAt (fecha+hora), durationMin, notas opcionales", "Valida que scheduledAt sea futura"),
        ("Confirma", "Crea Meeting con status=PROGRAMADA"),
        (None, "Devuelve la reunión registrada"),
    ],
    [
        "Paso 2: si scheduledAt está en el pasado, HTTP 400.",
        "Paso 1: si cliente no existe, HTTP 404.",
    ],
    "Reunión registrada en el calendario del cliente con status PROGRAMADA.",
    {
        "participants": [":Sec", ":MeetingsCtrl", ":MeetingsService", ":Prisma"],
        "messages": [
            (0, 1, "POST /clients/:id/meetings(dto)", "sync"),
            (1, 2, "create(clientId, dto)", "sync"),
            (2, 3, "client exists?", "sync"),
            (3, 2, "yes", "return"),
            (2, 2, "verifica futura", "self"),
            (2, 3, "meeting.create", "sync"),
            (3, 2, "newMeeting", "return"),
            (2, 1, "newMeeting", "return"),
            (1, 0, "201 Created", "return"),
        ],
    },
)

# CU 8: Gestionar reserva
add_cu(
    8, "Gestionar reserva",
    "Vendedor",
    "Principal",
    "Formalizar la reserva de un inmueble por parte de un cliente, bloqueando el inmueble y avanzando ambos estados.",
    "El vendedor crea una Reservation atómica que cambia Property a RESERVADO y Client a RESERVADO. La reserva tiene una expiresAt calculada a partir de validityDays.",
    "Property en estado DISPONIBLE; Client no CERRADO.",
    [
        ("Selecciona inmueble disponible y cliente", "Verifica que Property esté DISPONIBLE"),
        ("Captura depositAmount, validityDays, refundConditions", "Verifica que Client no esté CERRADO"),
        ("Confirma", "En transacción atómica: crea Reservation; actualiza Property→RESERVADO; actualiza Client→RESERVADO; calcula expiresAt = ahora + validityDays"),
        (None, "Devuelve la reserva creada"),
    ],
    [
        "Paso 1: si Property no DISPONIBLE, HTTP 400 'Inmueble no disponible. Estado: {status}'.",
        "Paso 2: si Client CERRADO, HTTP 400.",
    ],
    "Reserva creada con status ACTIVA; Property y Client quedan RESERVADOS. La cascada es atómica (todo o nada).",
    {
        "participants": [":Vendedor", ":ResCtrl", ":ResService", ":Prisma"],
        "messages": [
            (0, 1, "POST /reservations(dto)", "sync"),
            (1, 2, "create(dto)", "sync"),
            (2, 3, "$transaction begin", "sync"),
            (2, 3, "findFirst(property DISPONIBLE)", "sync"),
            (3, 2, "property", "return"),
            (2, 3, "reservation.create", "sync"),
            (2, 3, "property.update RESERVADO", "sync"),
            (2, 3, "client.update RESERVADO", "sync"),
            (3, 2, "commit", "return"),
            (2, 1, "reservation", "return"),
            (1, 0, "201 Created", "return"),
        ],
    },
)

# CU 9: Elaborar contrato
add_cu(
    9, "Elaborar contrato de venta del inmueble",
    "Gerente General, Vendedor",
    "Principal",
    "Generar el contrato de compraventa a partir de una reserva activa, especificando monto total, plazo de entrega y cláusulas.",
    "Se crea un Contract en status BORRADOR vinculado a la propiedad y cliente de la reserva. El contrato avanza por estados: BORRADOR → REVISION → FIRMADO. La firma dispara una cascada que cambia Property→VENDIDO, Client→FIRMADO y Reserva→CONVERTIDA.",
    "Existe una Reservation en status ACTIVA.",
    [
        ("Indica reservationId, totalAmount, currency, deliveryDeadline, specialClauses (JSON)", "Verifica que la reserva esté ACTIVA"),
        (None, "Verifica que no exista contrato activo previo para (property, client)"),
        ("Confirma creación", "Crea Contract con status=BORRADOR y optimisticVersion=1"),
        ("Solicita submit-review", "Transiciona contrato a REVISION"),
        ("Solicita sign", "En transacción atómica: contrato FIRMADO; signedDate=now; Property→VENDIDO; Client→FIRMADO; Reserva→CONVERTIDA"),
        (None, "Devuelve el contrato firmado"),
    ],
    [
        "Paso 1: si reserva no ACTIVA, HTTP 400.",
        "Paso 2: si ya existe contrato activo, HTTP 409.",
        "Paso 5: si Property no está en RESERVADO, la cascada falla con HTTP 400 indicando transición inválida.",
    ],
    "Contract FIRMADO; cascada de estados aplicada atómicamente.",
    {
        "participants": [":Gerente", ":ContractCtrl", ":ContractService", ":Prisma"],
        "messages": [
            (0, 1, "PATCH /contracts/:id/sign", "sync"),
            (1, 2, "sign(id)", "sync"),
            (2, 3, "$transaction begin", "sync"),
            (2, 3, "contract.update FIRMADO", "sync"),
            (2, 3, "property.update VENDIDO", "sync"),
            (2, 3, "client.update FIRMADO", "sync"),
            (2, 3, "reservation.update CONVERTIDA", "sync"),
            (3, 2, "commit", "return"),
            (2, 1, "signedContract", "return"),
            (1, 0, "200 OK", "return"),
        ],
    },
)

# CU 10: Actualizar contrato (amend)
add_cu(
    10, "Actualizar contrato de venta (amend versionado)",
    "Gerente General",
    "Principal",
    "Modificar un contrato ya firmado generando una nueva versión vinculada al anterior con bloqueo optimista.",
    "El usuario provee expectedOptimisticVersion del contrato actual. Si coincide, el sistema marca el contrato como MODIFICADO y crea un nuevo Contract con version+1, previousContractId apuntando al anterior y status=FIRMADO directo.",
    "Contrato en estado FIRMADO.",
    [
        ("Envía expectedOptimisticVersion + cambios (totalAmount, deliveryDeadline, specialClauses)", "Lee contrato actual"),
        (None, "Compara optimisticVersion vs expected"),
        (None, "En transacción: marca anterior como MODIFICADO; crea nuevo con version+1 y previousContractId"),
        (None, "Devuelve el nuevo contrato vigente"),
    ],
    [
        "Paso 2: si optimisticVersion difiere, HTTP 409 'Versión obsoleta. Actual: X, enviada: Y'.",
        "Paso 1: si contrato no está FIRMADO, HTTP 400.",
    ],
    "Contrato anterior queda MODIFICADO (inmutable); nuevo contrato FIRMADO en su lugar con linage navegable vía previousContractId.",
    {
        "participants": [":Gerente", ":ContractCtrl", ":ContractService", ":Prisma"],
        "messages": [
            (0, 1, "POST /contracts/:id/amend(dto)", "sync"),
            (1, 2, "amend(id, dto)", "sync"),
            (2, 3, "$transaction begin", "sync"),
            (2, 3, "old.update MODIFICADO", "sync"),
            (2, 3, "contract.create v+1", "sync"),
            (3, 2, "newContract", "return"),
            (2, 1, "newContract", "return"),
            (1, 0, "201 Created", "return"),
        ],
    },
)

# CU 11: Gestionar personal proyecto
add_cu(
    11, "Gestionar personal del proyecto",
    "Encargado de Proyecto",
    "Principal",
    "Asignar y dar de baja trabajadores (internos o externos) en un proyecto activo.",
    "El encargado asigna un Worker al proyecto con un rol específico y fechas. El sistema rechaza overlap (un worker ya con asignación activa en el mismo proyecto). Al dar de baja se setea endDate y isActive=false.",
    "Proyecto en estado PLANIFICADO o EN_EJECUCION; Worker activo.",
    [
        ("Selecciona proyecto y worker", "Verifica que ambos existan y estén activos"),
        ("Indica role descriptivo, startDate, endDate (opcional)", "Verifica que no haya overlap activo del mismo worker en el mismo proyecto"),
        ("Confirma", "Crea StaffAssignment con isActive=true"),
        (None, "Devuelve la asignación"),
    ],
    [
        "Paso 2: si overlap activo, HTTP 400 'Worker ya tiene asignación activa'.",
        "Paso 1: si Worker inactivo, HTTP 400.",
    ],
    "Asignación creada; el worker queda vinculado al proyecto con el rol y fechas indicadas.",
    {
        "participants": [":EncProy", ":AssignCtrl", ":AssignService", ":Prisma"],
        "messages": [
            (0, 1, "POST /projects/:id/staff-assignments(dto)", "sync"),
            (1, 2, "create(projectId, dto)", "sync"),
            (2, 3, "find overlapping", "sync"),
            (3, 2, "null", "return"),
            (2, 3, "assignment.create", "sync"),
            (3, 2, "newAssign", "return"),
            (2, 1, "newAssign", "return"),
            (1, 0, "201 Created", "return"),
        ],
    },
)

# CU 12: Gestionar materiales del proyecto
add_cu(
    12, "Gestionar materiales del proyecto (requirements)",
    "Encargado de Presupuesto, Encargado de Compras",
    "Principal",
    "Definir el listado planificado de materiales necesarios para el proyecto con cantidad y precio unitario referencia.",
    "Se hace un upsert por (projectId, materialId). Si ya existía el requirement, se actualiza; si no, se crea. plannedTotal = qty × unitPrice.",
    "Proyecto y Material existen.",
    [
        ("Selecciona proyecto y material", "Verifica existencia"),
        ("Indica plannedQuantity, plannedUnitPrice", "Calcula plannedTotal"),
        ("Confirma", "Upsert MaterialRequirement"),
        (None, "Devuelve el requirement actualizado"),
    ],
    [
        "Paso 1: si proyecto o material no existen, HTTP 404.",
    ],
    "Requirement de material persistido para el proyecto.",
    {
        "participants": [":EncPres", ":ReqCtrl", ":ReqService", ":Prisma"],
        "messages": [
            (0, 1, "POST /projects/:id/requirements(dto)", "sync"),
            (1, 2, "upsert(projectId, dto)", "sync"),
            (2, 3, "upsert(projId+matId)", "sync"),
            (3, 2, "requirement", "return"),
            (2, 1, "requirement", "return"),
            (1, 0, "201 Created", "return"),
        ],
    },
)

# CU 13: Gestionar pedido y compra
add_cu(
    13, "Gestionar pedido y compra de materiales",
    "Encargado de Compras",
    "Principal",
    "Crear órdenes de compra con líneas por material, enviarlas a aprobación, aprobarlas, enviarlas al proveedor y registrar recepciones.",
    "PO progresa por estados: BORRADOR → EN_APROBACION → APROBADA → ENVIADA → RECIBIDA_PARCIAL/TOTAL. Cada recepción suma a la línea; cuando todas las líneas están completas, status pasa automáticamente a RECIBIDA_TOTAL.",
    "Proyecto activo; Supplier activo; Materiales activos.",
    [
        ("Crea OC en BORRADOR con líneas [(materialId, qty, unitPrice)]", "Calcula totalAmount = Σ qty × unitPrice"),
        ("Envía a aprobación", "Transiciona a EN_APROBACION"),
        ("Aprueba (GERENTE/ADMIN)", "Registra approvedBy + approvedAt; transiciona a APROBADA"),
        ("Envía al proveedor", "Registra sentAt; transiciona a ENVIADA"),
        ("Registra recepción línea por línea", "Suma a quantityReceived de la línea; si llega al total pedido, auto-transición a RECIBIDA_TOTAL"),
    ],
    [
        "Paso 1: si líneas con material duplicado, HTTP 400.",
        "Paso 5: si recepción excede pendiente de la línea, HTTP 400.",
        "Saltar pasos sin pasar por estados intermedios, HTTP 400 con transición inválida.",
    ],
    "PO recorre el ciclo completo desde BORRADOR hasta RECIBIDA_TOTAL con trazabilidad atómica de aprobaciones y recepciones.",
    {
        "participants": [":EncCompras", ":POCtrl", ":POService", ":Prisma"],
        "messages": [
            (0, 1, "POST /purchase-orders(dto)", "sync"),
            (1, 2, "create(dto)", "sync"),
            (2, 2, "verifica supplier+materials", "self"),
            (2, 2, "compute total", "self"),
            (2, 3, "PO.create with lines", "sync"),
            (3, 2, "newPO", "return"),
            (2, 1, "newPO", "return"),
            (1, 0, "201 Created BORRADOR", "return"),
        ],
    },
)

# CU 14: Gestionar preliminares
add_cu(
    14, "Gestionar preliminares de obra bruta",
    "Encargado de Proyecto, Ingeniero",
    "Principal",
    "Registrar y completar las actividades preliminares (estudio de suelo, topografía, instalación de faenas, servicios básicos).",
    "Cada Preliminary se crea sin completedAt; al marcarse como completado se setea completedAt = now.",
    "Proyecto registrado.",
    [
        ("Crea Preliminary con type, description, notes", "Persiste con completedAt=null"),
        ("Marca como completado", "Setea completedAt y notas finales"),
        ("Lista preliminares del proyecto", "Devuelve listado ordenado"),
    ],
    [
        "Paso 1: si proyecto no existe, HTTP 404.",
    ],
    "Preliminares registrados y marcados como completados según avance real.",
    {
        "participants": [":Ing", ":PrelimCtrl", ":PrelimService", ":Prisma"],
        "messages": [
            (0, 1, "POST /projects/:id/preliminaries(dto)", "sync"),
            (1, 2, "create(projectId, dto)", "sync"),
            (2, 3, "preliminary.create", "sync"),
            (3, 2, "newPrelim", "return"),
            (2, 1, "newPrelim", "return"),
            (1, 0, "201 Created", "return"),
        ],
    },
)

# CU 15: Controlar avance obra bruta
add_cu(
    15, "Controlar avance de obra bruta",
    "Encargado de Proyecto, Supervisor",
    "Principal",
    "Reportar el avance porcentual de las actividades de obra bruta y consultar el % ponderado total del proyecto.",
    "Cada ActivityProgress reporta percentComplete (0-100), opcionalmente quantityCompleted. El sistema auto-transiciona: 0% (PENDIENTE), >0% (EN_CURSO, setea actualStart), 100% (TERMINADA, setea actualEnd). El reporte es monotónico (no se admite regresión).",
    "Activity existe, status ≠ TERMINADA, ≠ BLOQUEADA.",
    [
        ("Reporta progress con percentComplete, quantityCompleted, notes", "Verifica monotonía (≥ último reporte)"),
        (None, "Crea ActivityProgress"),
        (None, "Auto-transición de status según % y setea actualStart/End cuando corresponde"),
        ("Consulta avance ponderado del proyecto", "Calcula Σ(weight × percent) / Σ(weight) total y por stage"),
        (None, "Devuelve summary"),
    ],
    [
        "Paso 1: si percentComplete < último reportado, HTTP 400 'percentComplete debe ser >= último'.",
        "Paso 1: si activity TERMINADA o BLOQUEADA, HTTP 400.",
    ],
    "Progress registrado; avance ponderado disponible en tiempo real.",
    {
        "participants": [":EncProy", ":ProgCtrl", ":ProgService", ":Prisma"],
        "messages": [
            (0, 1, "POST /projects/:id/activities/:aid/progress(dto)", "sync"),
            (1, 2, "report(projectId, activityId, dto, user)", "sync"),
            (2, 3, "findFirst activity", "sync"),
            (3, 2, "activity", "return"),
            (2, 2, "verifica monotonía", "self"),
            (2, 3, "progress.create", "sync"),
            (2, 3, "activity.update (status+actualStart/End)", "sync"),
            (3, 2, "newProgress", "return"),
            (2, 1, "newProgress", "return"),
            (1, 0, "201 Created", "return"),
        ],
    },
)

# CU 16: Gestionar actividades obra bruta
add_cu(
    16, "Gestionar actividades de obra bruta",
    "Encargado de Proyecto, Ingeniero",
    "Principal",
    "Crear y administrar las actividades de la fase BRUTA (albañilería, electricidad, plomería, carpintería) con cantidad planeada, peso y fechas.",
    "Cada Activity tiene stage=BRUTA y una category de ActivityCategory. El weight determina su peso en el cálculo ponderado de avance.",
    "Proyecto activo.",
    [
        ("Crea Activity con stage=BRUTA, category, name, plannedStart, plannedEnd, weight, unit, plannedQuantity, unitPrice", "Valida fechas y persiste"),
        ("Actualiza Activity (status, contratista, etc.)", "Aplica state machine de status PENDIENTE→EN_CURSO→TERMINADA"),
        ("Elimina actividad", "Solo si PENDIENTE (sin progress reportado)"),
    ],
    [
        "Paso 3: si activity no PENDIENTE, HTTP 400.",
        "Paso 1: si plannedEnd < plannedStart, HTTP 400.",
    ],
    "Actividades de la fase bruta registradas y mantenidas durante el ciclo de vida del proyecto.",
    {
        "participants": [":Ing", ":ActCtrl", ":ActService", ":Prisma"],
        "messages": [
            (0, 1, "POST /projects/:id/activities(dto)", "sync"),
            (1, 2, "create(projectId, dto)", "sync"),
            (2, 3, "activity.create", "sync"),
            (3, 2, "newAct", "return"),
            (2, 1, "newAct", "return"),
            (1, 0, "201 Created", "return"),
        ],
    },
)

# CU 17-18: Obra fina (mismo patrón que 15-16, con stage=FINA)
add_cu(
    17, "Controlar avance de obra fina",
    "Encargado de Proyecto, Supervisor",
    "Principal",
    "Reportar avance de las actividades de la fase FINA y consultar % ponderado por stage.",
    "Idéntico al CU#15 pero filtrado a actividades stage=FINA. El cálculo agregado del proyecto considera ambas fases con sus pesos.",
    "Activity stage=FINA, status ≠ TERMINADA, ≠ BLOQUEADA.",
    [
        ("Reporta progress en actividad de fase FINA", "Mismo flujo CU#15"),
        ("Consulta progress summary by stage", "Calcula ponderado total y por BRUTA/FINA"),
    ],
    ["Mismos alternativos que CU#15."],
    "Progress de FINA registrado; summary distingue avance bruto vs fino.",
    {
        "participants": [":Sup", ":ProgCtrl", ":ProgService", ":Prisma"],
        "messages": [
            (0, 1, "GET /projects/:id/progress", "sync"),
            (1, 2, "summary(projectId)", "sync"),
            (2, 3, "find activities + last progress", "sync"),
            (3, 2, "list", "return"),
            (2, 2, "compute weighted by stage", "self"),
            (2, 1, "summary", "return"),
            (1, 0, "200 OK", "return"),
        ],
    },
)

add_cu(
    18, "Gestionar actividades de obra fina",
    "Encargado de Proyecto, Ingeniero",
    "Principal",
    "Crear y administrar actividades de fase FINA (vidriería, herrería, muebles, jardinería, pintura, acabados).",
    "Idéntico al CU#16 pero con stage=FINA. Estas actividades suelen tener menor weight y se ejecutan tras obra bruta.",
    "Proyecto activo.",
    [
        ("Crea Activity stage=FINA, category∈{VIDRIERIA,HERRERIA,MUEBLES,JARDINERIA,PINTURA,ACABADOS}", "Persiste con state inicial PENDIENTE"),
        ("Actualiza/elimina según corresponda", "Aplica reglas de estado"),
    ],
    ["Mismos del CU#16."],
    "Actividades de FINA registradas.",
    {
        "participants": [":Ing", ":ActCtrl", ":ActService", ":Prisma"],
        "messages": [
            (0, 1, "POST /projects/:id/activities(dto FINA)", "sync"),
            (1, 2, "create(projectId, dto)", "sync"),
            (2, 3, "activity.create", "sync"),
            (3, 2, "newAct", "return"),
            (2, 1, "newAct", "return"),
            (1, 0, "201 Created", "return"),
        ],
    },
)

# CU 19: Controlar trabajadores en base al avance
add_cu(
    19, "Controlar trabajadores en base al avance de obra",
    "Encargado de Proyecto, Supervisor",
    "Principal",
    "Registrar asistencia diaria del personal asignado y consultar el costo de mano de obra acumulado por proyecto.",
    "Cada Attendance registra workerId, projectId, date, hoursWorked y status (PRESENTE/FALTA/PERMISO/VACACION). Unique constraint en (workerId, projectId, date). El cálculo de labor cost suma hourlyRate × hours o dailyRate × días.",
    "El worker tiene asignación activa en el proyecto.",
    [
        ("Reporta asistencia (workerId, date, hoursWorked, status)", "Valida asignación activa y date ≥ startDate"),
        (None, "Crea Attendance"),
        ("Consulta labor cost del proyecto (con filtros workerId/from/to)", "Computa cost por worker y total"),
    ],
    [
        "Paso 1: si duplicada misma fecha+worker+proyecto, HTTP 409.",
        "Paso 1: si date < assignment.startDate, HTTP 400.",
    ],
    "Asistencia registrada; reporte de costo MO disponible.",
    {
        "participants": [":Sup", ":AttCtrl", ":AttService", ":Prisma"],
        "messages": [
            (0, 1, "POST /projects/:id/attendances(dto)", "sync"),
            (1, 2, "create(projectId, dto)", "sync"),
            (2, 3, "find assignment active", "sync"),
            (3, 2, "assignment", "return"),
            (2, 3, "attendance.create", "sync"),
            (3, 2, "newAtt", "return"),
            (2, 1, "newAtt", "return"),
            (1, 0, "201 Created", "return"),
        ],
    },
)

# CU 20: Controlar calidad de obra
add_cu(
    20, "Controlar calidad de obra",
    "Encargado de Calidad, Ingeniero, Supervisor",
    "Principal",
    "Registrar inspecciones de calidad y los hallazgos asociados, con severidad, acción correctiva y plazo.",
    "El inspector (con rol válido) crea QualityInspection asociada al proyecto y stage. Luego agrega QualityFinding por cada problema observado. Cada finding tiene state machine: ABIERTA → EN_CORRECCION → RESUELTA/RECHAZADA.",
    "Proyecto activo; usuario con rol ENCARG_CALIDAD/INGENIERO/SUPERVISOR.",
    [
        ("Crea Inspection con inspectorId, stage, scope", "Verifica que inspectorId tenga rol válido"),
        ("Agrega Findings con severity, description, correctiveAction, targetDate", "Crea Finding con status=ABIERTA"),
        ("Actualiza Finding: EN_CORRECCION/RESUELTA/RECHAZADA", "Valida transición y setea closedDate al cerrar"),
    ],
    [
        "Paso 1: si inspectorId no tiene rol válido, HTTP 400.",
        "Paso 3: si transición inválida, HTTP 400.",
    ],
    "Inspecciones y hallazgos persistidos; trazabilidad de correcciones disponible.",
    {
        "participants": [":EncCal", ":QualCtrl", ":QualService", ":Prisma"],
        "messages": [
            (0, 1, "POST /projects/:id/quality-inspections(dto)", "sync"),
            (1, 2, "createInspection(projectId, dto)", "sync"),
            (2, 3, "assert inspector role", "sync"),
            (3, 2, "OK", "return"),
            (2, 3, "inspection.create", "sync"),
            (3, 2, "newInsp", "return"),
            (2, 1, "newInsp", "return"),
            (1, 0, "201 Created", "return"),
        ],
    },
)

# CU 21: Controlar uso del material
add_cu(
    21, "Controlar uso del material (consumo vs avance)",
    "Encargado de Proyecto, Encargado de Compras",
    "Principal",
    "Registrar el consumo real de materiales en obra y analizar la relación entre consumo y avance ponderado, detectando sobreconsumo y desviaciones.",
    "Cada MaterialUsage registra qty consumida, fecha y opcionalmente actividad asociada. El análisis compara usedQty con plannedQuantity y consumedPercent vs weightedProgressPercent, emitiendo warnings si consumedPercent > 100 (SOBRECONSUMO) o si excede avance+15% (DESVIACION).",
    "Material registrado en Requirements del proyecto.",
    [
        ("Registra consumo (materialId, quantityUsed, activityId opcional)", "Verifica material y actividad"),
        (None, "Crea MaterialUsage con reportedBy=user"),
        ("Consulta /material-analysis", "Agrupa usos por material, compara con requirements y con avance ponderado"),
        (None, "Devuelve análisis + warnings"),
    ],
    [
        "Paso 1: si activity BLOQUEADA, HTTP 400.",
    ],
    "Consumo registrado; análisis disponible con detección automática de anomalías.",
    {
        "participants": [":EncProy", ":UsageCtrl", ":UsageService", ":Prisma"],
        "messages": [
            (0, 1, "GET /projects/:id/material-analysis", "sync"),
            (1, 2, "analyze(projectId)", "sync"),
            (2, 3, "find requirements + usages + activities", "sync"),
            (3, 2, "data", "return"),
            (2, 2, "compute rows + warnings", "self"),
            (2, 1, "summary", "return"),
            (1, 0, "200 OK", "return"),
        ],
    },
)

# CU 22: Controlar cronograma
add_cu(
    22, "Controlar cronograma de avance de obra",
    "Encargado de Proyecto, Ingeniero",
    "Principal",
    "Definir items de cronograma y dependencias entre ellos (FS/SS/FF/SF + lagDays), formando un grafo dirigido sin ciclos.",
    "ScheduleItem representa un hito o paquete de trabajo. ScheduleDependency vincula predecessor → successor con tipo y desfase. El sistema valida y rechaza ciclos y self-deps.",
    "Proyecto registrado.",
    [
        ("Crea ScheduleItem con name, plannedStart, plannedEnd, activityId opcional", "Persiste item"),
        ("Crea dependency (predecessorId, successorId, type, lagDays)", "Valida no self-dep ni ciclo"),
        (None, "Si valida, crea ScheduleDependency"),
        ("Lista cronograma con preds/succs", "Devuelve grafo completo"),
    ],
    [
        "Paso 2: si predecessorId == successorId, HTTP 400 'self-dep'.",
        "Paso 2: si crea ciclo, HTTP 400 'Dependencia crearía ciclo'.",
        "Paso 2: si dependency duplicada, HTTP 409.",
    ],
    "Cronograma con grafo de dependencias FS/SS/FF/SF persistido y consultable.",
    {
        "participants": [":Ing", ":SchedCtrl", ":SchedService", ":Prisma"],
        "messages": [
            (0, 1, "POST /projects/:id/schedule-dependencies(dto)", "sync"),
            (1, 2, "addDependency(projectId, dto)", "sync"),
            (2, 3, "find pred+succ", "sync"),
            (3, 2, "items", "return"),
            (2, 2, "DFS detect cycle", "self"),
            (2, 3, "dependency.create", "sync"),
            (3, 2, "dep", "return"),
            (2, 1, "dep", "return"),
            (1, 0, "201 Created", "return"),
        ],
    },
)

# CU 23: Controlar presupuesto
add_cu(
    23, "Controlar presupuesto de avance de obra",
    "Encargado de Presupuesto",
    "Principal",
    "Definir líneas de presupuesto por categoría (MATERIAL/MANO_OBRA/EQUIPO/SUBCONTRATO/GENERAL) y consultar la desviación planificado vs real.",
    "Cada BudgetLine tiene plannedAmount y actualAmount. El summary agrega por categoría calculando variance, variancePercent y status (OK/OVERBUDGET/UNDERBUDGET).",
    "Proyecto registrado.",
    [
        ("Crea BudgetLine con category, description, plannedAmount, actualAmount", "Persiste"),
        ("Actualiza actualAmount conforme avanza", "PATCH la línea"),
        ("Consulta budget-summary", "Computa byCategory + totales + variance"),
    ],
    [
        "Paso 1: si proyecto no existe, HTTP 404.",
    ],
    "Líneas de presupuesto controladas; summary con desviaciones disponible.",
    {
        "participants": [":EncPres", ":BudCtrl", ":BudService", ":Prisma"],
        "messages": [
            (0, 1, "GET /projects/:id/budget-summary", "sync"),
            (1, 2, "summary(projectId)", "sync"),
            (2, 3, "findMany lines", "sync"),
            (3, 2, "lines", "return"),
            (2, 2, "compute by category", "self"),
            (2, 1, "summary", "return"),
            (1, 0, "200 OK", "return"),
        ],
    },
)

# CU 24: Reporte de calidad
add_cu(
    24, "Generar reporte de control de calidad",
    "Encargado de Calidad, Gerente",
    "Secundario (reporte)",
    "Producir el resumen de inspecciones y hallazgos del proyecto, con conteos por severidad/status y alertas críticas.",
    "Endpoint /quality-summary devuelve stats: número de inspecciones, findings por severidad (LEVE/MEDIA/GRAVE/CRITICA) y por status, openCritical (críticos abiertos), overdue (vencidos sin cerrar).",
    "Proyecto registrado.",
    [
        ("Solicita reporte", "Cuenta inspections + agrupa findings"),
        (None, "Devuelve summary"),
    ],
    ["—"],
    "Reporte JSON con métricas de calidad listo para visualizar.",
    {
        "participants": [":Gerente", ":QualCtrl", ":QualService", ":Prisma"],
        "messages": [
            (0, 1, "GET /projects/:id/quality-summary", "sync"),
            (1, 2, "summary(projectId)", "sync"),
            (2, 3, "count + find findings", "sync"),
            (3, 2, "data", "return"),
            (2, 2, "aggregate by severity/status", "self"),
            (2, 1, "summary", "return"),
            (1, 0, "200 OK", "return"),
        ],
    },
)

# CU 25: Reporte avance
add_cu(
    25, "Generar reporte de avance de obra",
    "Encargado de Proyecto, Gerente",
    "Secundario (reporte)",
    "Producir el % avance ponderado del proyecto, desglosado por stage y con detalle por actividad.",
    "Endpoint /progress devuelve weightedPercent total, byStage (BRUTA, FINA con activities count), y array detallado de actividades con su % y status.",
    "Proyecto registrado.",
    [
        ("Solicita reporte", "Lee activities + último progress de cada una"),
        (None, "Computa weighted total y por stage"),
        (None, "Devuelve summary"),
    ],
    ["—"],
    "Reporte de avance con cálculo ponderado y desglose.",
    {
        "participants": [":Gerente", ":ProgCtrl", ":ProgService", ":Prisma"],
        "messages": [
            (0, 1, "GET /projects/:id/progress", "sync"),
            (1, 2, "summary(projectId)", "sync"),
            (2, 3, "find activities + progresses", "sync"),
            (3, 2, "data", "return"),
            (2, 2, "weighted = Σ(w·%)/Σw", "self"),
            (2, 1, "summary", "return"),
            (1, 0, "200 OK", "return"),
        ],
    },
)

# CU 26: Reporte material
add_cu(
    26, "Generar reporte de material según avance",
    "Encargado de Compras, Encargado de Presupuesto",
    "Secundario (reporte)",
    "Producir el análisis material por material de planificado vs consumido vs avance, con warnings.",
    "Endpoint /material-analysis devuelve rows con plannedQty/usedQty/remainingQty/consumedPercent, weightedProgressPercent y array de warnings (SOBRECONSUMO si >100%, DESVIACION si excede avance+15%).",
    "Proyecto registrado con Requirements.",
    [
        ("Solicita reporte", "Agrupa usages por material; lee requirements"),
        (None, "Calcula consumedPercent y compara con avance"),
        (None, "Emite warnings si corresponde"),
    ],
    ["—"],
    "Reporte material disponible con detección automática de anomalías.",
    {
        "participants": [":EncCompras", ":UsageCtrl", ":UsageService", ":Prisma"],
        "messages": [
            (0, 1, "GET /projects/:id/material-analysis", "sync"),
            (1, 2, "analyze(projectId)", "sync"),
            (2, 3, "find data", "sync"),
            (3, 2, "data", "return"),
            (2, 2, "compute + warnings", "self"),
            (2, 1, "summary", "return"),
            (1, 0, "200 OK", "return"),
        ],
    },
)

# CU 27: Reporte mano de obra
add_cu(
    27, "Generar reporte de mano de obra (costo MO)",
    "Encargado de Proyecto, Gerente",
    "Secundario (reporte)",
    "Calcular el costo de mano de obra acumulado del proyecto a partir de las asistencias registradas.",
    "Endpoint /labor-cost suma por worker: hours × hourlyRate (si tiene), o days × dailyRate. Solo cuenta asistencias status=PRESENTE. Filtros workerId, from, to.",
    "Hay asistencias registradas en el proyecto.",
    [
        ("Solicita reporte (con filtros opcionales)", "Filtra attendances"),
        (None, "Agrupa por worker y suma costos"),
        (None, "Devuelve rows + grandTotal"),
    ],
    ["—"],
    "Reporte de costo MO con desglose por trabajador.",
    {
        "participants": [":Gerente", ":AttCtrl", ":AttService", ":Prisma"],
        "messages": [
            (0, 1, "GET /projects/:id/labor-cost", "sync"),
            (1, 2, "laborCost(projectId, q)", "sync"),
            (2, 3, "find attendances PRESENTE", "sync"),
            (3, 2, "rows", "return"),
            (2, 2, "group by worker, sum cost", "self"),
            (2, 1, "summary", "return"),
            (1, 0, "200 OK", "return"),
        ],
    },
)

# CU 28: Reporte cronograma
add_cu(
    28, "Generar reporte de cronograma",
    "Encargado de Proyecto, Gerente",
    "Secundario (reporte)",
    "Listar todos los ScheduleItems del proyecto con sus dependencias preds/succs, ordenados por plannedStart.",
    "Devuelve grafo completo del cronograma para visualización tipo Gantt.",
    "Proyecto registrado con ScheduleItems.",
    [
        ("Solicita reporte", "findMany ScheduleItem include predecessors+successors"),
        (None, "Devuelve listado ordenado"),
    ],
    ["—"],
    "Cronograma completo disponible con grafo serializable.",
    {
        "participants": [":Gerente", ":SchedCtrl", ":SchedService", ":Prisma"],
        "messages": [
            (0, 1, "GET /projects/:id/schedule-items", "sync"),
            (1, 2, "listItems(projectId)", "sync"),
            (2, 3, "findMany + include deps", "sync"),
            (3, 2, "items+deps", "return"),
            (2, 1, "list", "return"),
            (1, 0, "200 OK", "return"),
        ],
    },
)

# CU 29: Reporte presupuesto
add_cu(
    29, "Generar reporte de presupuesto",
    "Encargado de Presupuesto, Gerente",
    "Secundario (reporte)",
    "Resumir el presupuesto del proyecto por categoría con desviación planificado vs real.",
    "Endpoint /budget-summary agrupa BudgetLines por categoría, calcula variance y devuelve status visual (OK/OVERBUDGET/UNDERBUDGET).",
    "Proyecto con BudgetLines registradas.",
    [
        ("Solicita reporte", "findMany budget lines"),
        (None, "Agrupa por categoría y computa variance"),
        (None, "Devuelve summary con totales"),
    ],
    ["—"],
    "Reporte presupuesto disponible para revisión gerencial.",
    {
        "participants": [":Gerente", ":BudCtrl", ":BudService", ":Prisma"],
        "messages": [
            (0, 1, "GET /projects/:id/budget-summary", "sync"),
            (1, 2, "summary(projectId)", "sync"),
            (2, 3, "find budget lines", "sync"),
            (3, 2, "lines", "return"),
            (2, 2, "group + variance", "self"),
            (2, 1, "summary", "return"),
            (1, 0, "200 OK", "return"),
        ],
    },
)

# ===== CUs detectados (30-41) =====

add_cu(
    30, "Autenticarse en el sistema (login con JWT)",
    "Todos los actores",
    "Principal",
    "Permitir a un usuario registrado iniciar sesión recibiendo un JWT con su userId y roles.",
    "El usuario envía email+password al endpoint /auth/login; el sistema valida con bcrypt y emite un JWT firmado con expiración de 12h.",
    "El usuario tiene cuenta activa (isActive=true, deletedAt=null).",
    [
        ("Envía POST /auth/login con email+password", "Busca user por email"),
        (None, "bcrypt.compare(password, passwordHash)"),
        (None, "Si OK: firma JWT con payload {sub, email, roles[]} y devuelve accessToken + user"),
    ],
    [
        "Si email no existe o password incorrecto, HTTP 401 'Credenciales inválidas'.",
        "Si user inactivo, HTTP 401.",
    ],
    "JWT entregado al cliente; el frontend lo guarda y lo envía en Authorization header.",
    {
        "participants": [":Usuario", ":AuthCtrl", ":AuthService", ":UsersService"],
        "messages": [
            (0, 1, "POST /auth/login", "sync"),
            (1, 2, "login(dto)", "sync"),
            (2, 3, "findByEmail(email)", "sync"),
            (3, 2, "user+roles", "return"),
            (2, 2, "bcrypt.compare", "self"),
            (2, 2, "jwt.sign(payload)", "self"),
            (2, 1, "{accessToken, user}", "return"),
            (1, 0, "200 OK", "return"),
        ],
    },
)

add_cu(
    31, "Gestionar roles y asignación RBAC",
    "Administrador",
    "Secundario (admin)",
    "Crear usuarios con uno o más roles, modificar asignaciones RBAC y validarlas en cada operación.",
    "El sistema mantiene 15 roles (Role) y una tabla RoleAssignment many-to-many. Al registrar un user (POST /auth/register) se asignan los roles indicados. Los guards globales verifican roles del JWT en cada request.",
    "Roles seeded en la base de datos.",
    [
        ("ADMIN registra user con email, password, fullName, roles[]", "Valida roles existen"),
        (None, "Crea User + RoleAssignments en transacción"),
        (None, "Devuelve JWT del nuevo user"),
    ],
    [
        "Si email duplicado, HTTP 409.",
        "Si rol no existe, HTTP 404.",
    ],
    "Usuario creado con sus roles; puede autenticarse y ejercer permisos correspondientes.",
    {
        "participants": [":Admin", ":AuthCtrl", ":UsersService", ":Prisma"],
        "messages": [
            (0, 1, "POST /auth/register(dto)", "sync"),
            (1, 2, "create(dto)", "sync"),
            (2, 3, "findMany roles by code", "sync"),
            (3, 2, "roles", "return"),
            (2, 3, "user.create + roleAssignments", "sync"),
            (3, 2, "newUser", "return"),
            (2, 1, "user+token", "return"),
            (1, 0, "201 Created", "return"),
        ],
    },
)

add_cu(
    32, "Verificar capacidad de crédito del cliente con banco (mock)",
    "Vendedor",
    "Principal",
    "Consultar al banco si un cliente califica para crédito y registrar el resultado.",
    "En modo demo, el adapter MockBankAdapter (port BankPort) devuelve respuesta determinista (hash del CI) entre APROBADO/PENDIENTE/RECHAZADO. La respuesta queda persistida como CreditCheck del cliente.",
    "Cliente registrado; USE_MOCKS=true en demo.",
    [
        ("Solicita /clients/:id/credit-checks con bankName, requestedAmount", "Llama BankPort.checkCredit(req)"),
        (None, "Mock devuelve {status, approvedAmount, notes}"),
        (None, "Crea CreditCheck en BD"),
        (None, "Devuelve el credit check"),
    ],
    [
        "Si cliente no existe, HTTP 404.",
    ],
    "CreditCheck persistido; cliente tiene historial de verificaciones.",
    {
        "participants": [":Vend", ":CreditCtrl", ":CreditService", ":BankPort"],
        "messages": [
            (0, 1, "POST /clients/:id/credit-checks(dto)", "sync"),
            (1, 2, "run(clientId, dto)", "sync"),
            (2, 3, "checkCredit(req)", "sync"),
            (3, 2, "{status, amount}", "return"),
            (2, 2, "persist CreditCheck", "self"),
            (2, 1, "creditCheck", "return"),
            (1, 0, "201 Created", "return"),
        ],
    },
)

add_cu(
    33, "Recibir desembolsos bancarios y pagos del cliente",
    "Encargado de Presupuesto, Secretaria",
    "Principal",
    "Registrar entradas de dinero al proyecto: desembolsos bancarios (asociados al contrato) y pagos directos del cliente.",
    "Payment es polimórfico. Para DESEMBOLSO_BANCO requiere contractId; para PAGO_CLIENTE requiere clientId. La regla se valida en payment.rules.ts antes de persistir.",
    "Contrato firmado (para desembolso); cliente activo (para pago).",
    [
        ("Envía POST /payments con type=DESEMBOLSO_BANCO|PAGO_CLIENTE + FKs", "assertPaymentFKs(type, fks)"),
        (None, "Verifica existencia de cada FK"),
        (None, "Crea Payment"),
    ],
    [
        "Si falta FK requerida según type, HTTP 400 'Pago tipo X requiere Y'.",
        "Si FK no existe, HTTP 404.",
    ],
    "Payment registrado; aparece en /payments-summary del proyecto.",
    {
        "participants": [":Sec", ":PayCtrl", ":PayService", ":Prisma"],
        "messages": [
            (0, 1, "POST /payments(dto)", "sync"),
            (1, 2, "create(dto)", "sync"),
            (2, 2, "assertPaymentFKs(type, fks)", "self"),
            (2, 3, "verify FKs exist", "sync"),
            (3, 2, "OK", "return"),
            (2, 3, "payment.create", "sync"),
            (3, 2, "newPay", "return"),
            (2, 1, "newPay", "return"),
            (1, 0, "201 Created", "return"),
        ],
    },
)

add_cu(
    34, "Registrar pagos a proveedores y contratistas",
    "Encargado de Presupuesto, Encargado de Compras",
    "Principal",
    "Registrar salidas de dinero del proyecto a proveedores (PAGO_PROVEEDOR) y contratistas (PAGO_CONTRATISTA), o reembolsos al cliente (REEMBOLSO).",
    "Mismo modelo Payment polimórfico que CU#33. Aquí los outflows: PAGO_PROVEEDOR requiere supplierId; PAGO_CONTRATISTA requiere contractorWorkerId; REEMBOLSO requiere clientId.",
    "Proveedor/worker activo; OC en estado correspondiente para pagos asociados.",
    [
        ("Envía POST /payments con type=PAGO_PROVEEDOR|PAGO_CONTRATISTA|REEMBOLSO + FK", "assertPaymentFKs(type, fks)"),
        (None, "Crea Payment"),
    ],
    [
        "Si supplier inactivo, HTTP 400.",
    ],
    "Payment registrado en outflows; afecta net del summary.",
    {
        "participants": [":EncPres", ":PayCtrl", ":PayService", ":Prisma"],
        "messages": [
            (0, 1, "POST /payments(dto)", "sync"),
            (1, 2, "create(dto)", "sync"),
            (2, 2, "validate FK", "self"),
            (2, 3, "payment.create", "sync"),
            (3, 2, "newPay", "return"),
            (2, 1, "newPay", "return"),
            (1, 0, "201 Created", "return"),
        ],
    },
)

add_cu(
    35, "Registrar recepción de materiales (parcial/total)",
    "Encargado de Compras, Encargado de Proyecto",
    "Principal",
    "Registrar la cantidad de material efectivamente recibida en obra por cada línea de OC; el sistema actualiza el estado de la OC automáticamente.",
    "Cada MaterialReception suma a la línea. Si Σ recepciones por línea = qty pedida en todas las líneas, OC pasa a RECIBIDA_TOTAL; si solo algunas, RECIBIDA_PARCIAL.",
    "PO en estado ENVIADA o RECIBIDA_PARCIAL.",
    [
        ("Envía POST /purchase-orders/:id/receptions con line+qty", "Lee OC y línea"),
        (None, "Verifica que sum recibida + qty nueva ≤ qty pedida en línea"),
        (None, "Crea MaterialReception"),
        (None, "Recalcula status OC y lo actualiza si cambió"),
    ],
    [
        "Si excede pendiente de línea, HTTP 400.",
        "Si OC no en ENVIADA/PARCIAL, HTTP 400.",
    ],
    "Reception registrada; status OC actualizado atómicamente.",
    {
        "participants": [":EncCompras", ":RecepCtrl", ":RecepService", ":Prisma"],
        "messages": [
            (0, 1, "POST /purchase-orders/:id/receptions(dto)", "sync"),
            (1, 2, "create(poId, dto, user)", "sync"),
            (2, 3, "$tx: find PO + line + receptions", "sync"),
            (3, 2, "data", "return"),
            (2, 2, "verifica límite", "self"),
            (2, 3, "reception.create", "sync"),
            (2, 3, "PO.update status", "sync"),
            (3, 2, "commit", "return"),
            (2, 1, "reception", "return"),
            (1, 0, "201 Created", "return"),
        ],
    },
)

add_cu(
    36, "Gestionar catálogo de proveedores",
    "Encargado de Compras",
    "Secundario",
    "Mantener el catálogo de proveedores con datos de contacto y rating.",
    "CRUD sobre Supplier. Al desactivar, se setea isActive=false (no se borra para preservar OCs históricas).",
    "Usuario con rol ENCARG_COMPRAS o superior.",
    [
        ("CRUD básico sobre /suppliers", "Persistencia directa"),
    ],
    ["—"],
    "Catálogo actualizado, disponible para crear OCs.",
    {
        "participants": [":EncCompras", ":SupCtrl", ":SupService", ":Prisma"],
        "messages": [
            (0, 1, "POST /suppliers(dto)", "sync"),
            (1, 2, "create(dto)", "sync"),
            (2, 3, "supplier.create", "sync"),
            (3, 2, "newSup", "return"),
            (2, 1, "newSup", "return"),
            (1, 0, "201 Created", "return"),
        ],
    },
)

add_cu(
    37, "Registrar asistencia diaria del personal",
    "Encargado de Proyecto, Supervisor",
    "Principal",
    "Crear el registro diario de asistencia de cada trabajador asignado al proyecto.",
    "Attendance único por (workerId, projectId, date). Status PRESENTE/FALTA/PERMISO/VACACION. Hoursworked entre 0 y 24.",
    "Worker con assignment activa en el proyecto.",
    [
        ("Envía POST /projects/:id/attendances(dto)", "Verifica assignment activa"),
        (None, "Verifica date ≥ assignment.startDate"),
        (None, "Crea Attendance"),
    ],
    [
        "Si dup, HTTP 409.",
        "Si sin assignment activa, HTTP 400.",
    ],
    "Asistencia registrada; alimenta cálculo de costo MO.",
    {
        "participants": [":Sup", ":AttCtrl", ":AttService", ":Prisma"],
        "messages": [
            (0, 1, "POST /projects/:id/attendances(dto)", "sync"),
            (1, 2, "create(projectId, dto)", "sync"),
            (2, 3, "find active assignment", "sync"),
            (3, 2, "OK", "return"),
            (2, 3, "attendance.create", "sync"),
            (3, 2, "newAtt", "return"),
            (2, 1, "newAtt", "return"),
            (1, 0, "201 Created", "return"),
        ],
    },
)

add_cu(
    38, "Formalizar entrega del inmueble (doble firma)",
    "Encargado de Proyecto, Cliente",
    "Principal",
    "Crear el acta de entrega del proyecto finalizado, registrar la firma de cliente y empresa, y aplicar la cascada final de estados.",
    "Delivery 1:1 con Project. Cuando ambas firmas están true, en transacción atómica: Property→ENTREGADO, Client→ENTREGADO, Project.currentStage→ENTREGA.",
    "Project en status FINALIZADO.",
    [
        ("ENCARG_PROYECTO crea Delivery con deliveryDate, warrantyMonths, notes", "Verifica project FINALIZADO"),
        (None, "Crea Delivery con firmas en false"),
        ("Firma empresa (sign-company)", "Setea signedByCompany=true"),
        ("Firma cliente (sign-client)", "Setea signedByClient=true"),
        (None, "Si ambas: cascada Property→ENTREGADO, Client→ENTREGADO, currentStage→ENTREGA"),
    ],
    [
        "Si project no FINALIZADO al crear, HTTP 400.",
        "Si delivery dup, HTTP 409.",
        "Si firma duplicada del mismo lado, HTTP 400.",
    ],
    "Acta firmada por ambas partes; cascada final aplicada; ciclo de proyecto cerrado.",
    {
        "participants": [":Cliente", ":DelivCtrl", ":DelivService", ":Prisma"],
        "messages": [
            (0, 1, "PATCH /projects/:id/delivery/sign-client", "sync"),
            (1, 2, "signClient(projectId)", "sync"),
            (2, 3, "$tx: delivery.update signedByClient=true", "sync"),
            (2, 3, "if both signed: cascade", "sync"),
            (2, 3, "property→ENTREGADO, client→ENTREGADO", "sync"),
            (3, 2, "commit", "return"),
            (2, 1, "delivery", "return"),
            (1, 0, "200 OK", "return"),
        ],
    },
)

add_cu(
    39, "Versionar planos con bloqueo optimista",
    "Arquitecto, Ingeniero",
    "Principal",
    "Mantener un historial inmutable de versiones de planos con control de concurrencia mediante optimistic lock.",
    "BlueprintVersion incluye optimisticVersion. Update requiere expectedOptimisticVersion y aborta con 409 si difiere. setCurrent permite designar una versión histórica como vigente.",
    "BlueprintModel existe con al menos una versión.",
    [
        ("Crea nueva versión", "Mismo CU#4 pero versionNumber se autoincrementa"),
        ("Modifica versión existente con expectedOptimisticVersion", "Verifica y bumpea"),
        ("Marca otra versión como current", "Desmarca anterior y marca nueva"),
    ],
    [
        "Si optimisticVersion difiere, HTTP 409 (ya descrito en CU#5).",
    ],
    "Historial versionado; concurrencia segura.",
    {
        "participants": [":Arq", ":BPCtrl", ":BPService", ":Prisma"],
        "messages": [
            (0, 1, "PATCH /blueprint-models/:id/versions/:vid/set-current", "sync"),
            (1, 2, "setCurrent(modelId, vid)", "sync"),
            (2, 3, "$tx: updateMany unset + update set", "sync"),
            (3, 2, "version", "return"),
            (2, 1, "version", "return"),
            (1, 0, "200 OK", "return"),
        ],
    },
)

add_cu(
    40, "Auditar cambios sobre entidades críticas",
    "Administrador, Gerente",
    "Secundario (NFR)",
    "Registrar quién, cuándo y qué cambió sobre entidades sensibles (contratos, pagos, deliveries) para trazabilidad legal.",
    "Modelo AuditLog persiste (userId, action, entityType, entityId, beforeJson, afterJson, ip, userAgent, timestamp). Se planea inyectar como interceptor global; en la versión actual los hooks de Prisma podrían levantarlo (extension planificada).",
    "Operación protegida que cambia estado relevante.",
    [
        ("Operación crítica ocurre (sign contract, payment create, etc.)", "Service principal completa la op"),
        (None, "Interceptor de auditoría registra AuditLog con before/after"),
    ],
    [
        "—",
    ],
    "Auditoría disponible para consultas vía /admin/audit-log (endpoint pendiente).",
    {
        "participants": [":Service", ":AuditInterceptor", ":Prisma"],
        "messages": [
            (0, 1, "after op success", "sync"),
            (1, 1, "build audit entry", "self"),
            (1, 2, "auditLog.create", "sync"),
            (2, 1, "OK", "return"),
        ],
    },
)

def render_cu(cu):
    parts = [f'<div class="cu-section" id="cu{cu["id"]}">']
    parts.append(f'<h3>7.{cu["id"]} Caso de uso #{cu["id"]} — {html.escape(cu["name"])}</h3>')
    parts.append('<table class="cu-table">')
    parts.append(f'<tr><td class="label">Caso de uso</td><td>{html.escape(cu["name"])}</td></tr>')
    parts.append(f'<tr><td class="label">Actor</td><td>{html.escape(cu["actor"])}</td></tr>')
    parts.append(f'<tr><td class="label">Tipo</td><td>{html.escape(cu["tipo"])}</td></tr>')
    parts.append(f'<tr><td class="label">Propósito</td><td>{html.escape(cu["proposito"])}</td></tr>')
    parts.append(f'<tr><td class="label">Resumen</td><td>{html.escape(cu["resumen"])}</td></tr>')
    parts.append(f'<tr><td class="label">Precondición</td><td>{html.escape(cu["precondicion"])}</td></tr>')
    parts.append('</table>')
    parts.append('<h4>Curso básico</h4>')
    parts.append('<table class="curso-basico"><thead><tr><th>Acciones del actor</th><th>Acciones del sistema</th></tr></thead><tbody>')
    step_num = 1
    for actor_step, sys_step in cu["curso"]:
        a_html = f"{step_num}. {html.escape(actor_step)}" if actor_step else ""
        if actor_step:
            step_num += 1
        s_html = f"{step_num}. {html.escape(sys_step)}" if sys_step else ""
        if sys_step:
            step_num += 1
        parts.append(f'<tr><td>{a_html}</td><td>{s_html}</td></tr>')
    parts.append('</tbody></table>')
    parts.append('<div class="alt"><span class="alt-label">Camino alternativo</span><ul>')
    for a in cu["alt"]:
        parts.append(f'<li>{html.escape(a)}</li>')
    parts.append('</ul></div>')
    parts.append(f'<div class="postcond"><span class="postcond-label">Postcondición</span>{html.escape(cu["postcond"])}</div>')
    actors_split = [a.strip() for a in cu["actor"].split(",") if a.strip()]
    actors_list = [(a[:18], 'L') for a in actors_split[:2]]
    uc_label = cu["name"][:50] + ("…" if len(cu["name"]) > 50 else "")
    uc_svg = svg_use_case_diagram(cu["name"], actors_list, [("uc", uc_label)], [(a[0], 'L', "uc") for a in actors_list])
    parts.append(f'<h4>Diagrama de caso de uso</h4><div class="figure">{uc_svg}<div class="caption">Figura 7.{cu["id"]}.1 — CU #{cu["id"]}.</div></div>')
    if cu["seq"]["participants"]:
        seq_svg = svg_sequence_diagram(cu["seq"]["participants"], cu["seq"]["messages"])
        parts.append(f'<h4>Diagrama de secuencia</h4><div class="figure">{seq_svg}<div class="caption">Figura 7.{cu["id"]}.2 — Secuencia del CU #{cu["id"]}.</div></div>')
        col_messages = [(m[0], m[1], str(i+1), m[2]) for i, m in enumerate(cu["seq"]["messages"]) if m[3] != "return"]
        if col_messages:
            col_svg = svg_collaboration_diagram(cu["seq"]["participants"], col_messages)
            parts.append(f'<h4>Diagrama de colaboración</h4><div class="figure">{col_svg}<div class="caption">Figura 7.{cu["id"]}.3 — Colaboración del CU #{cu["id"]}.</div></div>')
    parts.append('</div>')
    return ''.join(parts)


def _build_cap7():
    parts = ['<h2 id="cap7">7. Casos de uso detallados</h2>']
    parts.append('<p>Esta sección presenta los 41 casos de uso del sistema en formato <em>fully dressed</em> según Larman. Cada CU incluye su cabecera (actor, tipo, propósito, resumen, precondición), curso básico en dos columnas (actor / sistema), caminos alternativos, postcondición, diagrama de caso de uso y diagramas de secuencia y colaboración aplicando responsabilidades GRASP (controller delgado, services con la lógica, repositorio Prisma). Por convención los identificadores con dos puntos iniciales (<code>:Controller</code>) denotan instancias.</p>')
    for cu in DETAILED_CUS:
        parts.append(render_cu(cu))
    return ''.join(parts)


add_cu(
    41, "Notificar eventos relevantes a usuarios",
    "Sistema → Todos",
    "Secundario (NFR)",
    "Emitir notificaciones a usuarios afectados por eventos del sistema (alertas calidad crítica, OC pendientes de aprobación, reservas próximas a vencer).",
    "Modelo Notification ya en schema. La emisión ocurre desde services específicos (e.g. QualityService cuando se crea finding CRITICA emite Notification al ENCARG_PROYECTO).",
    "Eventos definidos.",
    [
        ("Evento ocurre (e.g. crear finding CRITICA)", "Service emite Notification asíncrona"),
        ("Usuario consulta GET /notifications", "Devuelve sus notifications no leídas"),
        ("Marca como leída", "Setea readAt=now"),
    ],
    [
        "—",
    ],
    "Usuarios notificados; trazabilidad en notification.payload.",
    {
        "participants": [":Service", ":NotifService", ":Prisma"],
        "messages": [
            (0, 1, "after critical event", "sync"),
            (1, 2, "notification.create(userId, type, payload)", "sync"),
            (2, 1, "OK", "return"),
        ],
    },
)


CAP_7 = _build_cap7()


# ============================================================
# CAP 8: Contratos de operación (Larman cap 11)
# ============================================================

CAP_8 = """<h2 id="cap8">8. Contratos de operación</h2>
<p>Según Larman (capítulo 11 — <em>Contratos de operación</em>), un contrato describe el cambio de estado que una operación del sistema produce en el modelo del dominio, expresado en términos de pre y postcondiciones precisas. A continuación se documentan los contratos de las 8 operaciones críticas del sistema Investco.</p>

<h3>8.1 Contrato: <code>crearReserva</code></h3>
<table class="cu-table">
<tr><td class="label">Operación</td><td><code>crearReserva(propertyId, clientId, depositAmount, validityDays, refundConditions?)</code></td></tr>
<tr><td class="label">Referencias cruzadas</td><td>CU#8 Gestionar reserva</td></tr>
<tr><td class="label">Precondiciones</td><td>Property con id=propertyId existe, status=DISPONIBLE.<br>Client con id=clientId existe, no eliminado, status ≠ CERRADO.<br>depositAmount > 0; 1 ≤ validityDays ≤ 365.</td></tr>
<tr><td class="label">Postcondiciones</td><td>Se creó una instancia Reservation r con r.status=ACTIVA, r.expiresAt = now + validityDays·24h.<br>r asociada a la Property y al Client indicados.<br>Property.status pasó de DISPONIBLE a RESERVADO.<br>Client.status pasó a RESERVADO (desde LEAD, PROSPECTO o el estado previo permitido).<br>Los tres cambios son atómicos (una transacción ACID).</td></tr>
</table>

<h3>8.2 Contrato: <code>firmarContrato</code></h3>
<table class="cu-table">
<tr><td class="label">Operación</td><td><code>firmarContrato(contractId)</code></td></tr>
<tr><td class="label">Referencias cruzadas</td><td>CU#9 Elaborar contrato</td></tr>
<tr><td class="label">Precondiciones</td><td>Contract con id=contractId existe y no eliminado, status=REVISION.</td></tr>
<tr><td class="label">Postcondiciones</td><td>Contract.status pasó a FIRMADO; Contract.signedDate = now.<br>La Property asociada pasó de RESERVADO a VENDIDO.<br>El Client asociado pasó a FIRMADO (si no lo estaba ya).<br>La Reservation ACTIVA asociada pasó a CONVERTIDA.<br>Los cuatro cambios son atómicos.</td></tr>
</table>

<h3>8.3 Contrato: <code>modificarContrato</code> (amend)</h3>
<table class="cu-table">
<tr><td class="label">Operación</td><td><code>modificarContrato(contractId, expectedOptimisticVersion, totalAmount?, deliveryDeadline?, specialClauses?)</code></td></tr>
<tr><td class="label">Referencias cruzadas</td><td>CU#10 Actualizar contrato</td></tr>
<tr><td class="label">Precondiciones</td><td>Contract existe, status=FIRMADO.<br>Contract.optimisticVersion == expectedOptimisticVersion.</td></tr>
<tr><td class="label">Postcondiciones</td><td>El contrato original pasó a status=MODIFICADO (inmutable).<br>Se creó un nuevo Contract c' con version = original.version + 1, c'.status=FIRMADO, c'.signedDate=now, c'.previousContractId=original.id, c'.optimisticVersion=1.<br>Cambios atómicos.</td></tr>
</table>

<h3>8.4 Contrato: <code>iniciarProyecto</code></h3>
<table class="cu-table">
<tr><td class="label">Operación</td><td><code>iniciarProyecto(contractId, code, startDate, projectManagerId, qualityManagerId?, budgetManagerId?)</code></td></tr>
<tr><td class="label">Referencias cruzadas</td><td>CU#14 Gestionar preliminares, CU#15-18 Controlar avance</td></tr>
<tr><td class="label">Precondiciones</td><td>Contract existe, status=FIRMADO.<br>No existe otro Project con ese contractId o con la misma propertyId.<br>projectManagerId pertenece a un usuario activo con rol ENCARG_PROYECTO.</td></tr>
<tr><td class="label">Postcondiciones</td><td>Se creó Project p con status=PLANIFICADO, currentStage=PRELIMINARES.<br>La Property del contrato pasó a EN_CONSTRUCCION.<br>Cambios atómicos.</td></tr>
</table>

<h3>8.5 Contrato: <code>reportarAvance</code></h3>
<table class="cu-table">
<tr><td class="label">Operación</td><td><code>reportarAvance(projectId, activityId, percentComplete, quantityCompleted?, notes?)</code></td></tr>
<tr><td class="label">Referencias cruzadas</td><td>CU#15, CU#17</td></tr>
<tr><td class="label">Precondiciones</td><td>Activity existe en projectId; activity.status ∈ {PENDIENTE, EN_CURSO}.<br>percentComplete ∈ [0,100].<br>percentComplete ≥ último reporte (monotonía).</td></tr>
<tr><td class="label">Postcondiciones</td><td>Se creó ActivityProgress p con p.reportedBy=user actual, p.reportDate=now.<br>Si percentComplete > 0 y activity.status=PENDIENTE, activity.status pasó a EN_CURSO; actualStart se setea si era null.<br>Si percentComplete = 100, activity.status pasó a TERMINADA; actualEnd=now.<br>Si quantityCompleted presente, activity.actualQuantity se actualizó.</td></tr>
</table>

<h3>8.6 Contrato: <code>registrarRecepcion</code></h3>
<table class="cu-table">
<tr><td class="label">Operación</td><td><code>registrarRecepcion(purchaseOrderId, purchaseOrderLineId, quantityReceived, qualityNotes?)</code></td></tr>
<tr><td class="label">Referencias cruzadas</td><td>CU#13, CU#35</td></tr>
<tr><td class="label">Precondiciones</td><td>PO existe, status ∈ {ENVIADA, RECIBIDA_PARCIAL}.<br>POLine pertenece a esa OC.<br>quantityReceived + Σ recepciones previas de la línea ≤ POLine.quantity.</td></tr>
<tr><td class="label">Postcondiciones</td><td>Se creó MaterialReception r con r.receivedBy=user, r.receivedDate=now.<br>Si todas las líneas tienen Σ = quantity → PO.status pasó a RECIBIDA_TOTAL.<br>Si alguna línea tiene recepciones > 0 pero no todas completas → PO.status pasó a RECIBIDA_PARCIAL (si no lo era ya).</td></tr>
</table>

<h3>8.7 Contrato: <code>registrarPago</code></h3>
<table class="cu-table">
<tr><td class="label">Operación</td><td><code>registrarPago(type, amount, paymentDate, projectId?, contractId?, clientId?, supplierId?, contractorWorkerId?, reference?)</code></td></tr>
<tr><td class="label">Referencias cruzadas</td><td>CU#33, CU#34</td></tr>
<tr><td class="label">Precondiciones</td><td>amount &gt; 0.<br>Según type:<br>· DESEMBOLSO_BANCO requiere contractId existente.<br>· PAGO_CLIENTE requiere clientId existente.<br>· PAGO_PROVEEDOR requiere supplierId activo.<br>· PAGO_CONTRATISTA requiere contractorWorkerId existente.<br>· REEMBOLSO requiere clientId existente.</td></tr>
<tr><td class="label">Postcondiciones</td><td>Se creó Payment p con p.type, p.amount, p.currency (default BOB) y las FKs correspondientes.<br>El summary del projectId (si presente) refleja el nuevo p en inflows u outflows según type.</td></tr>
</table>

<h3>8.8 Contrato: <code>firmarEntrega</code></h3>
<table class="cu-table">
<tr><td class="label">Operación</td><td><code>firmarEntrega(projectId, lado=cliente|empresa)</code></td></tr>
<tr><td class="label">Referencias cruzadas</td><td>CU#38 Formalizar entrega</td></tr>
<tr><td class="label">Precondiciones</td><td>Delivery existe para projectId; signedBy[lado] = false.</td></tr>
<tr><td class="label">Postcondiciones</td><td>Delivery.signedBy[lado] = true.<br>Si signedByClient = signedByCompany = true:<br>· Property.status pasó de EN_CONSTRUCCION a ENTREGADO.<br>· Client.status pasó a ENTREGADO.<br>· Project.currentStage pasó a ENTREGA.<br>Cambios atómicos.</td></tr>
</table>"""


# ============================================================
# CAP 9: Diagrama de clases de diseño (Larman cap 16)
# ============================================================

def _build_design_class_svg():
    # Capa Controllers
    classes = [
        # Controllers (top)
        ("AuthController", 20, 20, [], ["+ login(dto): Token", "+ register(dto): User"]),
        ("PropertyController", 230, 20, [], ["+ list(q)", "+ create(dto)", "+ update(id, dto)", "+ divide(id, dto)"]),
        ("ContractController", 480, 20, [], ["+ create(dto)", "+ sign(id)", "+ amend(id, dto)"]),
        ("ProjectController", 730, 20, [], ["+ create(dto)", "+ update(id, dto)"]),
        # Services (middle)
        ("AuthService", 20, 200, ["- jwt: JwtService", "- users: UsersService"], ["+ login(dto): Token", "+ register(dto): Token"]),
        ("PropertyService", 230, 200, ["- prisma"], ["+ create(dto): Property", "+ update(id, dto): Property", "+ divide(id, dto): {parent, children}", "+ softDelete(id)"]),
        ("ContractService", 480, 200, ["- prisma"], ["+ createFromReservation(dto)", "+ sign(id): Contract", "+ amend(id, dto): Contract", "+ rescind(id)"]),
        ("ProjectService", 730, 200, ["- prisma"], ["+ createFromContract(dto)", "+ update(id, dto)", "+ assertExists(id)"]),
        # State machines (right)
        ("StateMachines", 730, 410, ["+ Property", "+ Client", "+ Contract", "+ Reservation", "+ Project", "+ Activity", "+ POStatus", "+ FindingStatus"], ["+ assert*Transition(from, to)"]),
        # Persistence layer
        ("PrismaService", 230, 410, ["+ user, property, contract,…"], ["+ $transaction()", "+ $connect()", "+ $disconnect()"]),
        # Bank port
        ("BankPort interface", 20, 410, ["", ""], ["+ checkCredit(req): Result"]),
        ("MockBankAdapter", 20, 540, ["", ""], ["+ checkCredit(req): Result"]),
    ]
    # asociaciones: controllers -> services; services -> prisma + state machines
    associations = [
        (0, 4, "", "", ""),  # AuthCtrl -> AuthService
        (1, 5, "", "", ""),  # PropCtrl -> PropService
        (2, 6, "", "", ""),  # ContractCtrl -> ContractService
        (3, 7, "", "", ""),  # ProjectCtrl -> ProjectService
        (5, 9, "uses", "", ""),  # PropService -> Prisma
        (6, 9, "uses", "", ""),
        (7, 9, "uses", "", ""),
        (5, 8, "valida", "", ""),  # PropService -> StateMachines
        (6, 8, "valida", "", ""),
        (7, 8, "valida", "", ""),
        (11, 10, "implements", "", ""),  # Mock -> Port
    ]
    return svg_class_diagram(classes, associations, w=940, h=720)

DESIGN_CLASS_SVG = _build_design_class_svg()

CAP_9 = """<h2 id="cap9">9. Diagrama de clases de diseño</h2>
<p>Siguiendo Larman (capítulo 16 — <em>Diagrama de Clases de Diseño</em>), se presenta la vista estructural del software con clases, métodos visibles (+), atributos privados (-) y dependencias entre ellas. El diagrama refleja la arquitectura en capas: <em>Controllers</em> (HTTP), <em>Services</em> (lógica de negocio), <em>Persistence</em> (Prisma) y <em>Domain helpers</em> (state machines, port adapters). Por claridad se muestran solo 4 controllers y sus services correspondientes; la totalidad del sistema cuenta con 15 módulos, cada uno con su trío Controller/Service/DTOs.</p>"""

CAP_9_FIG = f'<div class="figure">{DESIGN_CLASS_SVG}<div class="caption">Figura 9.1 — Diagrama de clases de diseño (vista resumida).</div></div>'

CAP_9_NOTES = """<h4>Observaciones</h4>
<ul>
<li>Los <strong>Controllers</strong> son delgados: solo validan DTOs (vía <code>ValidationPipe</code> global), aplican guards (<code>JwtAuthGuard</code>, <code>RolesGuard</code>) y delegan al service.</li>
<li>Los <strong>Services</strong> contienen la lógica de negocio: validan invariantes, llaman al state machine, ejecutan transacciones Prisma.</li>
<li>El <strong>PrismaService</strong> es un <em>Pure Fabrication</em>: expone <code>$transaction</code>, <code>$connect</code>, <code>$disconnect</code> y los repositorios autogenerados de cada modelo.</li>
<li>Las <strong>State machines</strong> son funciones puras (<code>assertPropertyTransition</code>, <code>assertContractTransition</code>, etc.) que reciben el estado actual y el destino y lanzan <code>BadRequestException</code> si la transición es inválida.</li>
<li>El <strong>BankPort</strong> es una interface y <strong>MockBankAdapter</strong> su implementación demo. Inyectado vía Nest DI con token <code>BANK_PORT</code>. Permite reemplazar por <code>RealBankAdapter</code> sin tocar el dominio.</li>
</ul>"""


# ============================================================
# CAP 10: Patrones GRASP aplicados (Larman cap 17)
# ============================================================

CAP_10 = """<h2 id="cap10">10. Patrones GRASP aplicados</h2>
<p>Los nueve patrones GRASP (General Responsibility Assignment Software Patterns) descritos por Larman se aplicaron sistemáticamente en el diseño del sistema. A continuación se justifican las asignaciones de responsabilidades más relevantes.</p>

<div class="grasp-card"><h4>10.1 Information Expert (Experto en Información)</h4>
<p><strong>Aplicación:</strong> <code>PropertyService.divide</code>. La responsabilidad de validar que la suma de m² de los hijos no exceda el padre se asigna al servicio que posee la información del padre y sus hijos. Idem <code>ContractService.amend</code> que conoce <code>optimisticVersion</code> y decide si rechazar.</p>
<p><strong>Justificación:</strong> "Asigne una responsabilidad a la clase que tiene la información necesaria para cumplirla." Aquí PropertyService accede directamente al modelo Property con sus subdivisiones.</p>
</div>

<div class="grasp-card"><h4>10.2 Creator (Creador)</h4>
<p><strong>Aplicación:</strong> <code>ReservationsService</code> crea las instancias de <code>Reservation</code>. Es el responsable porque tiene los datos completos para inicializarla (depositAmount, validityDays, fechas calculadas).</p>
<p><strong>Justificación:</strong> Larman recomienda que la clase B cree A si B contiene/agrega/registra A o tiene los datos de inicialización.</p>
</div>

<div class="grasp-card"><h4>10.3 Controller (Controlador)</h4>
<p><strong>Aplicación:</strong> los <em>NestJS Controllers</em> (<code>PropertyController</code>, <code>ContractController</code>, etc.) actúan como controladores de fachada: cada uno representa una agrupación funcional del sistema (un "use case controller") y delega la lógica al service correspondiente. Son delgados y no contienen reglas de negocio.</p>
<p><strong>Justificación:</strong> "Asigne la responsabilidad de manejar eventos del sistema a una clase que represente el sistema general o un escenario de caso de uso." Aquí cada controller es la fachada HTTP para uno o varios casos de uso relacionados.</p>
</div>

<div class="grasp-card"><h4>10.4 Low Coupling (Bajo Acoplamiento)</h4>
<p><strong>Aplicación:</strong> Los services dependen del <code>PrismaService</code> mediante DI, no de implementaciones concretas. La integración con el banco (<code>BankPort</code>) está desacoplada: <code>CreditChecksService</code> no conoce <code>MockBankAdapter</code>, solo el contrato.</p>
<p><strong>Justificación:</strong> Reducir dependencias para facilitar reemplazos y testing. Cambiar a un banco real solo requiere cambiar el provider en <code>BankModule</code>.</p>
</div>

<div class="grasp-card"><h4>10.5 High Cohesion (Alta Cohesión)</h4>
<p><strong>Aplicación:</strong> Cada módulo NestJS (Auth, Properties, Clients, etc.) agrupa solamente las responsabilidades relativas a un bounded context. <code>PropertyService</code> no toca contratos ni clientes directamente; al necesitar coordinar, llama servicios externos o ejecuta transacciones que mantienen la cohesión.</p>
<p><strong>Justificación:</strong> Mantener cada clase enfocada en una sola razón de cambio facilita mantenimiento y comprensión.</p>
</div>

<div class="grasp-card"><h4>10.6 Polymorphism (Polimorfismo)</h4>
<p><strong>Aplicación:</strong> <code>BankPort</code> con su variante <code>MockBankAdapter</code> y un futuro <code>RealBankAdapter</code>. El consumidor (<code>CreditChecksService</code>) llama <code>checkCredit()</code> sin importar la implementación. Idem aplicable para storage de documentos (futuro <code>FileStoragePort</code>).</p>
<p><strong>Justificación:</strong> "Cuando alternativas o comportamientos relacionados varían según el tipo, use polimorfismo en lugar de condicionales tipo-checking."</p>
</div>

<div class="grasp-card"><h4>10.7 Pure Fabrication (Fabricación Pura)</h4>
<p><strong>Aplicación:</strong> <code>PrismaService</code> es una clase artificial (no representa un concepto del dominio) inyectada como <em>repositorio</em>. Lo mismo aplica a <code>JwtStrategy</code> (responsable de validar tokens) y a las <em>state machine functions</em> (<code>assertPropertyTransition</code>) que abstraen la verificación de transiciones.</p>
<p><strong>Justificación:</strong> Crear clases artificiales cuando ninguna del dominio cumple bien la responsabilidad sin violar Low Coupling/High Cohesion.</p>
</div>

<div class="grasp-card"><h4>10.8 Indirection (Indirección)</h4>
<p><strong>Aplicación:</strong> el token <code>BANK_PORT</code> es una <em>indirection</em>: los consumidores no inyectan directamente la clase, sino el token. NestJS DI resuelve qué implementación entregar. Igual con <code>APP_GUARD</code> que vincula guards globales sin que los controllers los importen.</p>
<p><strong>Justificación:</strong> "Asigne responsabilidad a un objeto intermedio para mediar entre otros, eliminando acoplamiento directo."</p>
</div>

<div class="grasp-card"><h4>10.9 Protected Variations (Variaciones Protegidas)</h4>
<p><strong>Aplicación:</strong> el modo demo. Toda la lógica del dominio asume un <code>BankPort</code>; cambiar a un banco real es transparente. Igualmente, el sistema usa interfaces para resultados (<code>CreditCheckResult</code> como union type) que permiten extender estados sin romper consumidores.</p>
<p><strong>Justificación:</strong> "Identifique puntos de variación o inestabilidad previstos; asigne responsabilidades para crear una interfaz estable a su alrededor."</p>
</div>"""


# ============================================================
# CAP 11: State machines (Larman cap 29)
# ============================================================

def _sm_property():
    states = ["DISPONIBLE", "RESERVADO", "VENDIDO", "EN_CONSTRUCCION", "ENTREGADO"]
    transitions = [
        (0, 1, "crear reserva"),
        (1, 0, "cancelar/vencer reserva"),
        (1, 2, "firmar contrato"),
        (2, 3, "iniciar proyecto"),
        (3, 4, "firmar entrega (ambas firmas)"),
    ]
    return svg_state_machine(states, transitions, initial=0, final=[4])

def _sm_client():
    states = ["LEAD", "PROSPECTO", "RESERVADO", "FIRMADO", "ENTREGADO", "CERRADO"]
    transitions = [
        (0, 1, "interacción"),
        (0, 2, "reserva directa"),
        (1, 2, "reserva"),
        (2, 1, "cancelación"),
        (2, 3, "contrato firmado"),
        (3, 4, "entrega completada"),
        (4, 5, "cierre"),
        (0, 5, "abandono"),
    ]
    return svg_state_machine(states, transitions, initial=0, final=[5])

def _sm_reservation():
    states = ["ACTIVA", "CONVERTIDA", "CANCELADA", "VENCIDA"]
    transitions = [
        (0, 1, "contrato firmado"),
        (0, 2, "cancelar"),
        (0, 3, "expiresAt < now"),
    ]
    return svg_state_machine(states, transitions, initial=0, final=[1, 2, 3])

def _sm_contract():
    states = ["BORRADOR", "REVISION", "FIRMADO", "MODIFICADO", "RESCINDIDO"]
    transitions = [
        (0, 1, "submit-review"),
        (1, 0, "rechazar (volver)"),
        (1, 2, "sign"),
        (2, 3, "amend (nueva versión)"),
        (2, 4, "rescind"),
        (0, 4, "rescind"),
    ]
    return svg_state_machine(states, transitions, initial=0, final=[3, 4])

def _sm_project():
    states = ["PLANIFICADO", "EN_EJECUCION", "PAUSADO", "FINALIZADO", "CANCELADO"]
    transitions = [
        (0, 1, "iniciar"),
        (1, 2, "pausar"),
        (2, 1, "reanudar"),
        (1, 3, "finalizar"),
        (0, 4, "cancelar"),
        (1, 4, "cancelar"),
        (2, 4, "cancelar"),
    ]
    return svg_state_machine(states, transitions, initial=0, final=[3, 4])

def _sm_po():
    states = ["BORRADOR", "EN_APROBACION", "APROBADA", "ENVIADA", "RECIBIDA_PARCIAL", "RECIBIDA_TOTAL", "CANCELADA"]
    transitions = [
        (0, 1, "submit-approval"),
        (1, 0, "rechazo"),
        (1, 2, "approve"),
        (2, 3, "send"),
        (3, 4, "recepción parcial"),
        (3, 5, "recepción total"),
        (4, 5, "completar recepción"),
        (0, 6, "cancelar"),
        (1, 6, "cancelar"),
        (2, 6, "cancelar"),
        (3, 6, "cancelar"),
    ]
    return svg_state_machine(states, transitions, initial=0, final=[5, 6])

def _sm_finding():
    states = ["ABIERTA", "EN_CORRECCION", "RESUELTA", "RECHAZADA"]
    transitions = [
        (0, 1, "iniciar corrección"),
        (1, 0, "reabrir"),
        (1, 2, "verificar OK"),
        (1, 3, "rechazar"),
        (0, 3, "rechazar"),
    ]
    return svg_state_machine(states, transitions, initial=0, final=[2, 3])

SM_PROPERTY = _sm_property()
SM_CLIENT = _sm_client()
SM_RESERVATION = _sm_reservation()
SM_CONTRACT = _sm_contract()
SM_PROJECT = _sm_project()
SM_PO = _sm_po()
SM_FINDING = _sm_finding()

CAP_11 = f"""<h2 id="cap11">11. Máquinas de estado</h2>
<p>Las máquinas de estado (Larman capítulo 29) modelan el ciclo de vida de las entidades cuya progresión sigue reglas estrictas. El sistema implementa siete máquinas de estado críticas, cada una validada en código mediante una función pura del tipo <code>assert{{Entidad}}Transition(from, to)</code>. Si una transición no está permitida, la operación falla con HTTP 400 antes de tocar la base de datos.</p>

<h3>11.1 Inmueble (Property)</h3>
<p>El inmueble progresa desde DISPONIBLE hasta ENTREGADO. Puede volver de RESERVADO a DISPONIBLE si se cancela o vence la reserva.</p>
<div class="figure">{SM_PROPERTY}<div class="caption">Figura 11.1 — Estados de Property.</div></div>

<h3>11.2 Cliente</h3>
<p>El cliente acompaña su progreso comercial. Desde LEAD puede ir a PROSPECTO, RESERVADO o CERRADO. La meta es ENTREGADO; CERRADO es estado terminal alternativo.</p>
<div class="figure">{SM_CLIENT}<div class="caption">Figura 11.2 — Estados de Cliente.</div></div>

<h3>11.3 Reserva</h3>
<p>La reserva tiene tres estados terminales: CONVERTIDA (se firmó contrato), CANCELADA (cliente desistió) o VENCIDA (no se firmó dentro del plazo).</p>
<div class="figure">{SM_RESERVATION}<div class="caption">Figura 11.3 — Estados de Reserva.</div></div>

<h3>11.4 Contrato</h3>
<p>El contrato avanza BORRADOR → REVISION → FIRMADO. Una vez firmado puede modificarse (creando versión vinculada) o rescindirse.</p>
<div class="figure">{SM_CONTRACT}<div class="caption">Figura 11.4 — Estados de Contrato.</div></div>

<h3>11.5 Proyecto</h3>
<p>El proyecto progresa de PLANIFICADO a EN_EJECUCION, puede PAUSAR-se y reanudarse, y termina en FINALIZADO o CANCELADO.</p>
<div class="figure">{SM_PROJECT}<div class="caption">Figura 11.5 — Estados de Proyecto.</div></div>

<h3>11.6 Orden de Compra</h3>
<p>La OC tiene el ciclo más largo: 7 estados, con auto-transición de RECIBIDA_PARCIAL a RECIBIDA_TOTAL al completar todas las líneas.</p>
<div class="figure">{SM_PO}<div class="caption">Figura 11.6 — Estados de OrdenCompra.</div></div>

<h3>11.7 Hallazgo de calidad (Finding)</h3>
<p>Los hallazgos pueden cerrarse como RESUELTOS (con closedDate) o RECHAZADOS (también con closedDate). EN_CORRECCION puede volver a ABIERTA si el contratista no aplica la corrección.</p>
<div class="figure">{SM_FINDING}<div class="caption">Figura 11.7 — Estados de QualityFinding.</div></div>"""


# ============================================================
# CAP 12: Arquitectura por capas (Larman caps 13, 14)
# ============================================================

def _arch_svg():
    w, h = 800, 540
    parts = [f'<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg">']
    layers = [
        (40, "Presentación (Frontend pendiente — Next.js/React)"),
        (140, "API REST / NestJS Controllers (HTTP, DTOs, Guards)"),
        (240, "Aplicación / NestJS Services (lógica de negocio, state machines, transacciones)"),
        (340, "Dominio (modelos Prisma + interfaces, ports BankPort)"),
        (440, "Persistencia / PostgreSQL via Prisma ORM"),
    ]
    for y, txt in layers:
        parts.append(f'<rect x="60" y="{y}" width="680" height="70" class="box"/>')
        parts.append(f'<text x="400" y="{y+40}" text-anchor="middle" class="label-big">{html.escape(txt)}</text>')
    # arrows between
    for i in range(len(layers)-1):
        y1 = layers[i][0] + 70
        y2 = layers[i+1][0]
        parts.append(f'<line x1="400" y1="{y1}" x2="400" y2="{y2}" stroke="black" stroke-width="1.5" marker-end="url(#arr)"/>')
    parts.append('<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="black"/></marker></defs>')
    parts.append('</svg>')
    return ''.join(parts)

ARCH_SVG = _arch_svg()

CAP_12 = f"""<h2 id="cap12">12. Arquitectura por capas</h2>
<p>El sistema sigue el patrón arquitectónico de capas descrito por Larman (caps 13 y 14): cada capa solo conoce a la inmediatamente inferior, lo que minimiza el acoplamiento y facilita el reemplazo de partes (e.g. la capa de presentación es intercambiable: web, móvil, CLI). Adicionalmente, la integración con sistemas externos (banco, firma digital) sigue el patrón <em>Ports & Adapters</em> (arquitectura hexagonal): el dominio define la interface (Port) y se inyectan implementaciones concretas (Adapter) según el entorno.</p>

<div class="figure">{ARCH_SVG}<div class="caption">Figura 12.1 — Arquitectura por capas del sistema Investco.</div></div>

<h3>12.1 Responsabilidades por capa</h3>
<ul>
<li><strong>Presentación</strong>: futura UI Next.js / React. Consume la API REST con bearer JWT. No realizada en esta entrega — el backend expone Swagger UI para pruebas.</li>
<li><strong>API REST (Controllers)</strong>: cada <code>@Controller()</code> de NestJS recibe HTTP, valida DTOs con <code>class-validator</code>, aplica guards (<code>JwtAuthGuard</code> + <code>RolesGuard</code> globales) y delega al service. No contiene lógica de negocio.</li>
<li><strong>Aplicación (Services)</strong>: corazón del sistema. Valida invariantes de negocio, llama a las funciones de state machines, ejecuta transacciones Prisma (<code>$transaction</code>) para coordinar cambios cross-entidad atómicamente.</li>
<li><strong>Dominio</strong>: definido como tipos en TypeScript generados por Prisma a partir del schema (<code>schema.prisma</code>), más interfaces puras como <code>BankPort</code> que el dominio define pero no implementa.</li>
<li><strong>Persistencia</strong>: PostgreSQL 16 accedido vía Prisma ORM. <code>PrismaService</code> expone el cliente y delega transacciones. Soft delete vía <code>deletedAt</code> en entidades críticas.</li>
</ul>

<h3>12.2 Cross-cutting concerns</h3>
<ul>
<li><strong>Autenticación / autorización</strong>: JWT firmado HS256, validado por <code>JwtStrategy</code> (passport-jwt). RBAC verificado por <code>RolesGuard</code> con metadata <code>@Roles(…)</code>.</li>
<li><strong>Validación de entrada</strong>: pipe global <code>ValidationPipe</code> con <code>whitelist: true</code> y <code>forbidNonWhitelisted: true</code>: cualquier campo extra en el body se rechaza con 400.</li>
<li><strong>Documentación API</strong>: Swagger/OpenAPI generado automáticamente desde decorators (<code>@ApiTags</code>, <code>@ApiBearerAuth</code>, <code>@ApiOperation</code>). Disponible en <code>/api/docs</code>.</li>
<li><strong>Migraciones</strong>: Prisma migrate genera migraciones SQL versionadas en <code>prisma/migrations/</code>.</li>
<li><strong>Modo demo</strong>: variable <code>USE_MOCKS=true</code> alterna adaptadores; el banner UI lo indica explícitamente.</li>
</ul>"""


# ============================================================
# CAP 13: Modelo de datos físico (schema Prisma resumen)
# ============================================================

CAP_13 = """<h2 id="cap13">13. Modelo de datos físico</h2>
<p>El modelo físico se materializa en PostgreSQL via Prisma. El schema cuenta con <strong>41 modelos</strong> (incluyendo entidades auxiliares y cross-cutting que no aparecieron en el modelo de dominio conceptual del capítulo 6). El archivo completo está en <code>backend/prisma/schema.prisma</code> del repositorio.</p>

<h3>13.1 Bounded contexts</h3>
<table>
<thead><tr><th>Contexto</th><th>Modelos</th></tr></thead>
<tbody>
<tr><td>Autenticación &amp; RBAC</td><td><code>User</code>, <code>Role</code>, <code>RoleAssignment</code></td></tr>
<tr><td>Inmuebles &amp; Planos</td><td><code>Property</code>, <code>BlueprintModel</code>, <code>BlueprintVersion</code>, <code>BlueprintInstallation</code></td></tr>
<tr><td>Comercial</td><td><code>Client</code>, <code>Meeting</code>, <code>CreditCheck</code>, <code>Reservation</code>, <code>Contract</code></td></tr>
<tr><td>Obra</td><td><code>Project</code>, <code>Activity</code>, <code>ActivityProgress</code>, <code>Preliminary</code></td></tr>
<tr><td>Materiales &amp; Compras</td><td><code>Material</code>, <code>Supplier</code>, <code>MaterialRequirement</code>, <code>MaterialUsage</code>, <code>PurchaseOrder</code>, <code>PurchaseOrderLine</code>, <code>MaterialReception</code></td></tr>
<tr><td>Personal</td><td><code>Worker</code>, <code>StaffAssignment</code>, <code>Attendance</code></td></tr>
<tr><td>Calidad</td><td><code>QualityInspection</code>, <code>QualityFinding</code></td></tr>
<tr><td>Cronograma</td><td><code>ScheduleItem</code>, <code>ScheduleDependency</code></td></tr>
<tr><td>Financiero</td><td><code>BudgetLine</code>, <code>Payment</code></td></tr>
<tr><td>Entrega</td><td><code>Delivery</code></td></tr>
<tr><td>Cross-cutting</td><td><code>Document</code>, <code>Notification</code>, <code>AuditLog</code></td></tr>
</tbody>
</table>

<h3>13.2 Decisiones de diseño físico relevantes</h3>
<ul>
<li><strong>IDs UUID</strong>: todas las claves primarias son <code>String @id @default(uuid())</code> en lugar de autoincrement. Ventaja: pueden generarse en cliente, evitan filtración de información sobre volumen, facilitan sharding.</li>
<li><strong>Enums fuertes</strong>: estados de negocio como <code>PropertyStatus</code>, <code>ClientStatus</code>, <code>ContractStatus</code>, <code>POStatus</code>, <code>FindingStatus</code> se definen como Prisma <code>enum</code>, garantizando tipo seguro tanto en código como en BD.</li>
<li><strong>Decimal para dinero y cantidades</strong>: campos monetarios (<code>amount</code>, <code>plannedAmount</code>, <code>m2</code>) usan tipo <code>Decimal</code> de Prisma para precisión arbitraria; nunca <code>Float</code>.</li>
<li><strong>Soft delete</strong>: <code>deletedAt: DateTime?</code> en entidades críticas (User, Property, Client, Contract, Project, PurchaseOrder). Las consultas listan filtran <code>WHERE deletedAt IS NULL</code>.</li>
<li><strong>Índices compuestos</strong>: <code>@@index([status])</code> en entidades con queries por estado frecuentes; <code>@@unique([projectId, materialId])</code> en MaterialRequirement; <code>@@unique([workerId, projectId, date])</code> en Attendance.</li>
<li><strong>Self-relation para historial</strong>: <code>Contract.previousContractId</code> apunta al contrato anterior cuando se hace amend, formando una cadena navegable.</li>
<li><strong>Self-relation para jerarquía</strong>: <code>Property.parentPropertyId</code> permite que un lote sea padre de N subdivisiones (división).</li>
<li><strong>Optimistic locking</strong>: <code>optimisticVersion: Int @default(1)</code> en Contract y BlueprintVersion. Cada update verifica e incrementa.</li>
<li><strong>Polimorfismo controlado</strong>: <code>Payment</code> tiene FKs opcionales para cada contraparte (clientId, supplierId, contractorWorkerId, contractId); el service valida cuál(es) son obligatorias según <code>type</code>.</li>
<li><strong>Cascada explícita en aplicación</strong>: el ORM no usa <code>ON DELETE CASCADE</code> para entidades de negocio. Las cascadas (firma de contrato propaga a Property+Client+Reservation) se hacen en código TypeScript dentro de transacciones para preservar reglas de state machine.</li>
</ul>

<h3>13.3 Extracto del schema (modelos centrales)</h3>
<pre><code>// Property con jerarquía y máquina de estado
model Property {
  id               String         @id @default(uuid())
  code             String         @unique
  type             PropertyType
  address          String
  zone             String
  m2               Decimal
  status           PropertyStatus @default(DISPONIBLE)
  parentPropertyId String?
  parentProperty   Property?      @relation("PropertyHierarchy", fields: [parentPropertyId], references: [id])
  childProperties  Property[]     @relation("PropertyHierarchy")
  modelBlueprintId String?
  modelBlueprint   BlueprintModel? @relation(fields: [modelBlueprintId], references: [id])
  reservations     Reservation[]
  contracts        Contract[]
  project          Project?
  deletedAt        DateTime?
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
  @@index([status])
  @@index([deletedAt])
}

// Contract con optimistic lock y self-relation
model Contract {
  id                 String         @id @default(uuid())
  propertyId         String
  clientId           String
  version            Int            @default(1)
  totalAmount        Decimal
  currency           String         @default("BOB")
  deliveryDeadline   DateTime
  signedDate         DateTime?
  status             ContractStatus @default(BORRADOR)
  specialClauses     Json?
  previousContractId String?
  previousContract   Contract?      @relation("ContractHistory", fields: [previousContractId], references: [id])
  nextContracts      Contract[]     @relation("ContractHistory")
  optimisticVersion  Int            @default(1)
  property           Property       @relation(fields: [propertyId], references: [id])
  client             Client         @relation(fields: [clientId], references: [id])
  project            Project?
  payments           Payment[]
  deletedAt          DateTime?
  createdAt          DateTime       @default(now())
  updatedAt          DateTime       @updatedAt
  @@index([status])
}

// Payment polimórfico
model Payment {
  id                 String      @id @default(uuid())
  projectId          String?
  contractId         String?
  clientId           String?
  supplierId         String?
  contractorWorkerId String?
  type               PaymentType
  amount             Decimal
  currency           String      @default("BOB")
  paymentDate        DateTime
  reference          String?
  documentId         String?
  // ... relations
}</code></pre>
<p>Para el schema completo consultar <code>backend/prisma/schema.prisma</code> en el repositorio.</p>"""


# ============================================================
# CAP 14: Conclusiones
# ============================================================

CAP_14 = """<h2 id="cap14">14. Conclusiones</h2>

<p>El desarrollo del sistema de Gestión y Control de Avance de Obra para Investco permitió aplicar de manera sistemática la metodología propuesta por Craig Larman en <em>UML y Patrones</em>, desde el análisis de requisitos y la identificación de actores hasta el diseño detallado, la asignación de responsabilidades GRASP, el modelado de máquinas de estado y la arquitectura por capas. La implementación efectiva como prototipo funcional en NestJS + PostgreSQL + Prisma valida que el diseño es realizable y consistente.</p>

<p>Durante el análisis exhaustivo del documento original se identificaron <strong>doce casos de uso adicionales</strong> indispensables para una solución completa: autenticación con JWT, gestión RBAC, verificación bancaria, pagos polimórficos (clientes/proveedores/contratistas/banco), recepciones parciales/totales, registro de asistencia diaria, formalización de entrega con doble firma, versionado de planos con bloqueo optimista, auditoría y notificaciones. Estos CU se documentaron junto con los 29 originales para conformar el conjunto definitivo de <strong>41 casos de uso</strong> que respaldan el ERP.</p>

<p>El uso de patrones GRASP permitió mantener bajo acoplamiento entre los 15 módulos del sistema y alta cohesión dentro de cada uno. La arquitectura hexagonal (Ports &amp; Adapters) usada para integraciones externas (banco mock vs. banco real) ilustra cómo aplicar <em>Protected Variations</em> de forma concreta: el dominio nunca cambia al alternar el adaptador. Las máquinas de estado, expresadas como funciones puras del tipo <code>assertXTransition</code>, garantizan la validez del ciclo de vida de las entidades críticas antes de tocar la base de datos.</p>

<p>El sistema soporta el ciclo de negocio completo: desde el primer contacto comercial con el cliente, la reserva del inmueble, la firma del contrato (con cascada atómica sobre el estado del inmueble, el cliente y la reserva), la ejecución de la obra con avance ponderado y control de calidad, hasta el acta de entrega con doble firma que cierra el ciclo. Los reportes implementados (avance por stage, consumo vs avance, costo de mano de obra, balance de pagos, variación presupuestaria, resumen de calidad) ofrecen visibilidad en tiempo real al equipo gerencial.</p>

<p>Como trabajo futuro queda el desarrollo del frontend (idealmente Next.js + TanStack Query + shadcn/ui) y la integración con sistemas externos reales (banca, firma digital, almacenamiento de archivos), reemplazando los adaptadores mock por implementaciones de producción. La arquitectura está preparada para estos cambios sin necesidad de modificar el dominio.</p>

<p>El sistema demuestra que es posible aplicar rigurosamente la metodología clásica de Larman a un dominio actual con herramientas modernas, sin sacrificar la trazabilidad académica del diseño ni la calidad de la implementación.</p>"""


def build():
    css = (ROOT / "assets" / "styles.css").read_text(encoding="utf-8")
    html_parts = []
    html_parts.append(f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Proyecto Investco — Doc v2</title>
<style>
{css}
</style>
</head>
<body>
""")
    html_parts.append(COVER)
    html_parts.append('<div class="toc"><h2>Índice</h2><ol>')
    html_parts.append('<li><a href="#cap1">Introducción</a></li>')
    html_parts.append('<li><a href="#cap2">Descripción del problema</a><ol><li><a href="#cap2-1">Requisitos</a></li><li><a href="#cap2-2">Objetivos</a></li></ol></li>')
    html_parts.append('<li><a href="#cap3">Organigrama</a></li>')
    html_parts.append('<li><a href="#cap4">Parámetros del sistema</a></li>')
    html_parts.append('<li><a href="#cap5">Actores y casos de uso de alto nivel</a></li>')
    html_parts.append('<li><a href="#cap6">Modelo del dominio</a></li>')
    html_parts.append('<li><a href="#cap7">Casos de uso detallados (41)</a></li>')
    html_parts.append('<li><a href="#cap8">Contratos de operación</a></li>')
    html_parts.append('<li><a href="#cap9">Diagrama de clases de diseño</a></li>')
    html_parts.append('<li><a href="#cap10">Patrones GRASP aplicados</a></li>')
    html_parts.append('<li><a href="#cap11">Máquinas de estado</a></li>')
    html_parts.append('<li><a href="#cap12">Arquitectura por capas</a></li>')
    html_parts.append('<li><a href="#cap13">Modelo de datos físico</a></li>')
    html_parts.append('<li><a href="#cap14">Conclusiones</a></li>')
    html_parts.append('</ol></div>')
    html_parts.append(CAP_1)
    html_parts.append(CAP_2)
    html_parts.append(CAP_3)
    if CAP_3_SVG:
        html_parts.append(f'<div class="figure">{CAP_3_SVG}<div class="caption">Figura 3.1 — Organigrama de Investco.</div></div>')
    html_parts.append(CAP_4)
    html_parts.append(CAP_5)
    html_parts.append(CAP_6)
    html_parts.append(CAP_6_FIG)
    html_parts.append(CAP_6_NOTES_HEAD)
    html_parts.append(CAP_7)
    html_parts.append(CAP_8)
    html_parts.append(CAP_9)
    html_parts.append(CAP_9_FIG)
    html_parts.append(CAP_9_NOTES)
    html_parts.append(CAP_10)
    html_parts.append(CAP_11)
    html_parts.append(CAP_12)
    html_parts.append(CAP_13)
    html_parts.append(CAP_14)

    html_parts.append('<footer>Investco · Documento técnico v2.0 · 2026</footer>')
    html_parts.append('</body></html>')
    OUT.write_text(''.join(html_parts), encoding='utf-8')
    print(f"Wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    build()
