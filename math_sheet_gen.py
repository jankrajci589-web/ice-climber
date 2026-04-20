from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT

# ── Game constants ────────────────────────────────────────
STARTING_DANGER = 0.10
HOUSE_EDGE = 0.04
MAX_LEDGES = 20
MAX_MULT = 999999
LOSS_ZONE = [0.20, 0.25, 0.50, 0.75]   # fixed multipliers for levels 1-4
BREAK_EVEN_LEVEL = len(LOSS_ZONE) + 1  # level 5

DIFFICULTIES = {
    'EASY':    {'increment': 0.09},
    'NORMAL':  {'increment': 0.20},
    'HARD':    {'increment': 0.30},
    'EXTREME': {'increment': 0.45},
}

def crack_prob(level, increment):
    return min(STARTING_DANGER + (level - 1) * increment, 0.95)

def build_table(increment):
    # Pre-calculate survival at break-even level
    surv_be = 1.0
    for i in range(1, BREAK_EVEN_LEVEL):
        surv_be *= (1 - crack_prob(i, increment))

    survival = 1.0
    rows = []
    for i in range(1, MAX_LEDGES + 1):
        danger = crack_prob(i, increment)
        survival *= (1 - danger)
        if i < BREAK_EVEN_LEVEL:
            mult = LOSS_ZONE[i - 1]
        elif survival < 1e-10:
            mult = MAX_MULT
        else:
            mult = min(surv_be / survival, MAX_MULT)
        rows.append((i, round(danger * 100, 1), round(survival * 100, 4), round(mult, 2)))
    return rows

def hit_frequency(increment):
    # P(survive at least 1 ledge) = P(survive level 1)
    return round((1 - crack_prob(1, increment)) * 100, 1)

def max_reachable_level(increment):
    for i in range(1, MAX_LEDGES + 1):
        if crack_prob(i, increment) >= 0.95:
            return i
    return MAX_LEDGES

# ── Styles ────────────────────────────────────────────────
BG = colors.HexColor('#050d1a')
ACCENT = colors.HexColor('#4aa3df')
GREEN = colors.HexColor('#44ee88')
RED = colors.HexColor('#ee4444')
YELLOW = colors.HexColor('#ffdd44')
WHITE = colors.white
LIGHT = colors.HexColor('#7ec8e3')
DARK_BG = colors.HexColor('#08131e')
BORDER = colors.HexColor('#1a3a5a')

def make_styles():
    styles = getSampleStyleSheet()
    s = {}
    s['title'] = ParagraphStyle('title', fontSize=22, textColor=WHITE,
        fontName='Courier-Bold', alignment=TA_CENTER, spaceAfter=14, leading=28)
    s['subtitle'] = ParagraphStyle('subtitle', fontSize=11, textColor=LIGHT,
        fontName='Courier', alignment=TA_CENTER, spaceAfter=6, spaceBefore=4)
    s['version'] = ParagraphStyle('version', fontSize=9, textColor=ACCENT,
        fontName='Courier', alignment=TA_CENTER, spaceAfter=16, spaceBefore=4)
    s['section'] = ParagraphStyle('section', fontSize=13, textColor=ACCENT,
        fontName='Courier-Bold', spaceBefore=14, spaceAfter=6)
    s['body'] = ParagraphStyle('body', fontSize=9, textColor=LIGHT,
        fontName='Courier', spaceAfter=4, leading=14)
    s['formula'] = ParagraphStyle('formula', fontSize=9, textColor=YELLOW,
        fontName='Courier', spaceAfter=6, leftIndent=12,
        backColor=DARK_BG, borderPad=6)
    s['note'] = ParagraphStyle('note', fontSize=8, textColor=colors.HexColor('#4a7a9a'),
        fontName='Courier', spaceAfter=4, leading=12)
    return s

def make_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=2*cm, rightMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm,
    )

    s = make_styles()
    W = A4[0] - 4*cm
    story = []

    # ── Header ────────────────────────────────────────────
    story.append(Paragraph('ICE CLIMBER', s['title']))
    story.append(Paragraph('Math Sheet &amp; Game Specification', s['subtitle']))
    story.append(Paragraph('Version 1.0  |  April 2026', s['version']))
    story.append(HRFlowable(width='100%', thickness=1, color=ACCENT))
    story.append(Spacer(1, 10))

    # ── Game Overview ─────────────────────────────────────
    story.append(Paragraph('1. GAME OVERVIEW', s['section']))
    overview = [
        ['Game Type', 'Skill-stop ladder / crash-style'],
        ['Provider', 'Peak Studios (v1.0)'],
        ['Platform', 'HTML5 — desktop &amp; mobile browser'],
        ['Min Bet', '1'],
        ['Max Bet', 'Unlimited (operator configurable)'],
        ['Max Win', '999,999x stake'],
        ['House Edge', 'Built into loss-zone (levels 1-2)'],
        ['Break-even Point', 'Level 5 (all difficulties)'],
        ['Loss Zone', 'Lvl 1=0.20x  Lvl 2=0.25x  Lvl 3=0.50x  Lvl 4=0.75x'],
        ['Max Ledges', '20'],
        ['RNG', 'Web Crypto API (CSPRNG) — Provably Fair'],
    ]
    t = Table(overview, colWidths=[5*cm, W - 5*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), DARK_BG),
        ('BACKGROUND', (1,0), (1,-1), BG),
        ('TEXTCOLOR', (0,0), (0,-1), LIGHT),
        ('TEXTCOLOR', (1,0), (1,-1), WHITE),
        ('FONTNAME', (0,0), (-1,-1), 'Courier'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('ROWBACKGROUNDS', (0,0), (-1,-1), [DARK_BG, colors.HexColor('#060e1a')]),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t)

    # ── Math Model ────────────────────────────────────────
    story.append(Paragraph('2. MATHEMATICAL MODEL', s['section']))
    story.append(Paragraph(
        'Each ledge is independently evaluated. The crack probability increases with level '
        'according to the formula:', s['body']))
    story.append(Paragraph(
        'P(crack, level) = min(STARTING_DANGER + (level - 1) x increment, 0.95)', s['formula']))
    story.append(Paragraph(
        'LOSS ZONE — Levels 1 and 2 pay fixed sub-1x multipliers regardless of difficulty. '
        'The house retains the difference. Level 3 is the break-even point:', s['body']))
    story.append(Paragraph(
        'Level 1=0.20x  |  Level 2=0.25x  |  Level 3=0.50x  |  Level 4=0.75x  |  Level 5=1.00x (break-even)', s['formula']))
    story.append(Paragraph(
        'For levels 5 and above, the multiplier grows proportionally to the inverse of '
        'cumulative survival from the break-even point:', s['body']))
    story.append(Paragraph(
        'Multiplier(n) = SurvivalAtLevel5 / CumulativeSurvival(n)   [for n >= 5]', s['formula']))
    story.append(Paragraph(
        'CumulativeSurvival(n) = product of (1 - P(crack, i)) for i = 1 to n', s['formula']))

    # ── Difficulty Summary ────────────────────────────────
    story.append(Paragraph('3. DIFFICULTY LEVELS', s['section']))
    story.append(Paragraph(
        'All difficulties share the same 96% RTP. Difficulty controls volatility — harder '
        'modes have faster-growing danger, higher multipliers per level, and lower survival '
        'probability per run.', s['body']))

    diff_header = ['Difficulty', 'Increment', 'Hit Freq.', 'Max Ledge*', 'Volatility', 'Break-even']
    diff_rows = [diff_header]
    vol_labels = {'EASY': 'Low', 'NORMAL': 'Medium', 'HARD': 'High', 'EXTREME': 'Very High'}
    for name, cfg in DIFFICULTIES.items():
        inc = cfg['increment']
        diff_rows.append([
            name,
            f"{inc:.2f}",
            f"{hit_frequency(inc):.1f}%",
            str(max_reachable_level(inc)),
            vol_labels[name],
            'Level 3',
        ])
    diff_rows.append(['* Level where crack probability reaches 95% cap', '', '', '', '', ''])

    t2 = Table(diff_rows, colWidths=[2.8*cm, 2.2*cm, 2.2*cm, 2.2*cm, 2.5*cm, 2.2*cm])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), ACCENT),
        ('TEXTCOLOR', (0,0), (-1,0), BG),
        ('FONTNAME', (0,0), (-1,0), 'Courier-Bold'),
        ('FONTNAME', (0,1), (-1,-1), 'Courier'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('TEXTCOLOR', (0,1), (-1,-1), WHITE),
        ('ROWBACKGROUNDS', (0,1), (-1,-2), [DARK_BG, colors.HexColor('#060e1a')]),
        ('BACKGROUND', (0,-1), (-1,-1), BG),
        ('TEXTCOLOR', (0,-1), (0,-1), colors.HexColor('#4a7a9a')),
        ('FONTSIZE', (0,-1), (-1,-1), 7),
        ('SPAN', (0,-1), (-1,-1)),
        ('GRID', (0,0), (-1,-2), 0.5, BORDER),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ALIGN', (1,0), (-1,-1), 'CENTER'),
    ]))
    story.append(t2)

    # ── Multiplier Tables ─────────────────────────────────
    story.append(Paragraph('4. MULTIPLIER &amp; SURVIVAL TABLES', s['section']))
    story.append(Paragraph(
        'Key levels shown. Full 20-level tables available on request.', s['body']))

    key_levels = [1, 2, 3, 4, 5, 7, 10, 15, 20]

    for name, cfg in DIFFICULTIES.items():
        story.append(Paragraph(f'{name}  (increment = {cfg["increment"]:.2f})', ParagraphStyle(
            'diff_head', fontSize=10, textColor=YELLOW, fontName='Courier-Bold',
            spaceBefore=8, spaceAfter=4)))

        rows_data = build_table(cfg['increment'])
        header = ['Level', 'Crack %', 'Survival %', 'Multiplier']
        table_rows = [header]
        for lvl, danger_pct, surv_pct, mult in rows_data:
            if lvl in key_levels:
                table_rows.append([
                    str(lvl),
                    f"{danger_pct:.1f}%",
                    f"{surv_pct:.4f}%",
                    f"{mult:.2f}x",
                ])

        col_w = W / 4
        t3 = Table(table_rows, colWidths=[col_w]*4)
        t3.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0a2030')),
            ('TEXTCOLOR', (0,0), (-1,0), LIGHT),
            ('FONTNAME', (0,0), (-1,0), 'Courier-Bold'),
            ('FONTNAME', (0,1), (-1,-1), 'Courier'),
            ('FONTSIZE', (0,0), (-1,-1), 8),
            ('TEXTCOLOR', (0,1), (-1,-1), WHITE),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [DARK_BG, colors.HexColor('#060e1a')]),
            ('GRID', (0,0), (-1,-1), 0.4, BORDER),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(t3)

    # ── RNG & Provably Fair ───────────────────────────────
    story.append(Paragraph('5. RNG &amp; PROVABLY FAIR SYSTEM', s['section']))
    rng_info = [
        ['RNG Method', 'Web Crypto API (window.crypto.getRandomValues)'],
        ['Algorithm', 'CSPRNG — cryptographically secure'],
        ['Server Seed', 'Generated per round, SHA-256 hashed'],
        ['Verification', 'Player can verify: hash matches seed, roll reproduced'],
        ['Roll range', '0.000000 to 0.999999 (6 decimal places)'],
    ]
    t4 = Table(rng_info, colWidths=[4*cm, W - 4*cm])
    t4.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), DARK_BG),
        ('BACKGROUND', (1,0), (1,-1), BG),
        ('TEXTCOLOR', (0,0), (-1,-1), LIGHT),
        ('FONTNAME', (0,0), (-1,-1), 'Courier'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('ROWBACKGROUNDS', (0,0), (-1,-1), [DARK_BG, colors.HexColor('#060e1a')]),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t4)

    # ── Responsible Gambling ──────────────────────────────
    story.append(Paragraph('6. RESPONSIBLE GAMBLING FEATURES', s['section']))
    rg_items = [
        'Session loss limit (player-configurable)',
        'Session time limit (player-configurable)',
        'Demo / Play-for-fun mode with separate balance',
        'Real-money vs demo mode clearly labelled in UI',
    ]
    for item in rg_items:
        story.append(Paragraph(f'  •  {item}', s['body']))

    # ── Integration ───────────────────────────────────────
    story.append(Paragraph('7. OPERATOR INTEGRATION', s['section']))
    story.append(Paragraph(
        'The game is loaded via iframe with session token. The operator provides a wallet '
        'API at their domain. The game calls three endpoints:', s['body']))
    endpoints = [
        ['GET  /balance', '?token=T', '{ "balance": 100.00 }'],
        ['POST /debit',   '{ token, amount, roundId }', '{ "balance": 95.00 }'],
        ['POST /credit',  '{ token, amount, roundId }', '{ "balance": 197.50 }'],
    ]
    t5 = Table(endpoints, colWidths=[3.5*cm, 5.5*cm, W - 9*cm])
    t5.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), DARK_BG),
        ('TEXTCOLOR', (0,0), (-1,-1), GREEN),
        ('FONTNAME', (0,0), (-1,-1), 'Courier'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.4, BORDER),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t5)
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        'Load URL example:  https://ice-climber.vercel.app?walletUrl=https://casino.com/api&amp;token=SESSION_TOKEN',
        s['formula']))

    # ── Footer ────────────────────────────────────────────
    story.append(Spacer(1, 16))
    story.append(HRFlowable(width='100%', thickness=0.5, color=BORDER))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        'Confidential — Peak Studios  |  Ice Climber v1.0  |  April 2026  |  All figures subject to independent certification',
        ParagraphStyle('footer', fontSize=8, textColor=colors.HexColor('#4a7a9a'),
                       fontName='Courier', alignment=TA_CENTER)))

    # ── Build ─────────────────────────────────────────────
    def on_page(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(BG)
        canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
        canvas.restoreState()

    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    print(f"Generated: {output_path}")

make_pdf('/Users/jankrajci/Desktop/app/ice-climber/math_sheet.pdf')
