// ────────────────────────────────────────────────────────────
// Gera ilustrações SVG dinâmicas para os produtos da lista,
// usando a cor sugerida e a categoria como tema visual.
// ────────────────────────────────────────────────────────────

const colorThemes = {
  Preto:         { background: '#393632', accent: '#111111', text: '#f8f4ee' },
  Bambu:         { background: '#d7b06b', accent: '#8f6428', text: '#fffaf2' },
  Inox:          { background: '#b7bcc3', accent: '#737b85', text: '#ffffff' },
  Bege:          { background: '#e7d8be', accent: '#b9955d', text: '#5e4b31' },
  Cinza:         { background: '#c6c3bf', accent: '#7c7670', text: '#fffdf8' },
  Marrom:        { background: '#8f6a4e', accent: '#583a24', text: '#fff7f0' },
  Branco:        { background: '#fbfaf7', accent: '#cbc5b9', text: '#53483b' },
  'Verde oliva': { background: '#96a482', accent: '#5f6f4c', text: '#f4f7ef' },
}

function pickShape(name) {
  const n = name.toLowerCase()
  if (n.includes('talher')) return 'cutlery'
  if (n.includes('prato') || n.includes('copo') || n.includes('jarra')) return 'dish'
  if (n.includes('pote') || n.includes('caixa') || n.includes('balde')) return 'box'
  if (n.includes('tábua') || n.includes('tabua')) return 'board'
  if (n.includes('pano') || n.includes('toalha') || n.includes('lenç') || n.includes('lenc')) return 'fabric'
  if (n.includes('panela')) return 'pan'
  if (n.includes('lixeira')) return 'bin'
  if (n.includes('rodo')) return 'rod'
  if (n.includes('escova') || n.includes('dispenser')) return 'bottle'
  if (n.includes('travesseiro') || n.includes('tapete')) return 'cushion'
  if (n.includes('ventilador')) return 'fan'
  return 'card'
}

function buildShape(shape, accent, text) {
  const stroke = `stroke='${text}' stroke-width='10' stroke-linecap='round' stroke-linejoin='round' fill='none' opacity='0.92'`
  const fill = `fill='${accent}' fill-opacity='0.32'`

  switch (shape) {
    case 'cutlery':
      return `<path d='M205 92 L205 215' ${stroke}/><path d='M180 92 L180 145' ${stroke}/><path d='M230 92 L230 145' ${stroke}/><path d='M180 145 L230 145' ${stroke}/><path d='M315 92 L315 215' ${stroke}/><path d='M315 92 Q375 112 335 165' ${stroke}/>`
    case 'dish':
      return `<ellipse cx='255' cy='176' rx='112' ry='58' ${fill}/><ellipse cx='255' cy='176' rx='132' ry='78' ${stroke}/><ellipse cx='255' cy='176' rx='72' ry='30' ${stroke}/>`
    case 'box':
      return `<rect x='150' y='102' width='210' height='150' rx='24' ${fill}/><rect x='150' y='102' width='210' height='150' rx='24' ${stroke}/><path d='M150 142 H360' ${stroke}/><path d='M255 102 V252' ${stroke}/>`
    case 'board':
      return `<rect x='150' y='94' width='210' height='168' rx='28' ${fill}/><rect x='150' y='94' width='210' height='168' rx='28' ${stroke}/><circle cx='325' cy='126' r='14' ${stroke}/>`
    case 'fabric':
      return `<path d='M148 120 Q195 95 235 122 T318 121 T360 138 V250 H148 Z' ${fill}/><path d='M148 120 Q195 95 235 122 T318 121 T360 138 V250 H148 Z' ${stroke}/>`
    case 'pan':
      return `<rect x='162' y='132' width='182' height='96' rx='38' ${fill}/><rect x='162' y='132' width='182' height='96' rx='38' ${stroke}/><path d='M344 170 H402' ${stroke}/>`
    case 'bin':
      return `<rect x='180' y='102' width='152' height='162' rx='18' ${fill}/><rect x='180' y='102' width='152' height='162' rx='18' ${stroke}/><path d='M165 102 H347' ${stroke}/>`
    case 'rod':
      return `<path d='M174 110 H332' ${stroke}/><path d='M272 110 V226' ${stroke}/><path d='M210 226 H334' ${stroke}/>`
    case 'bottle':
      return `<path d='M228 86 H282 V116 Q320 142 320 190 V248 H190 V190 Q190 142 228 116 Z' ${fill}/><path d='M228 86 H282 V116 Q320 142 320 190 V248 H190 V190 Q190 142 228 116 Z' ${stroke}/>`
    case 'cushion':
      return `<rect x='156' y='116' width='198' height='128' rx='40' ${fill}/><rect x='156' y='116' width='198' height='128' rx='40' ${stroke}/>`
    case 'fan':
      return `<circle cx='255' cy='168' r='28' ${fill}/><circle cx='255' cy='168' r='28' ${stroke}/><path d='M255 196 V252' ${stroke}/>`
    default:
      return `<rect x='155' y='98' width='200' height='160' rx='34' ${fill}/><rect x='155' y='98' width='200' height='160' rx='34' ${stroke}/>`
  }
}

export function buildProductImage(name, color, category) {
  const theme = colorThemes[color] ?? colorThemes.Bege
  const title = encodeURIComponent(name)
  const label = encodeURIComponent(color)
  const categoryLabel = encodeURIComponent(category)
  const bg = encodeURIComponent(theme.background)
  const accent = encodeURIComponent(theme.accent)
  const text = encodeURIComponent(theme.text)
  const shape = pickShape(name)
  const shapeMarkup = buildShape(shape, theme.accent, theme.text)

  // Cor é opcional: só mostra a linha "Cor: ..." quando há cor definida.
  const colorLine = color
    ? `<text x='78' y='366' font-size='21' font-family='Manrope,Arial' fill='${text}'>Cor: ${label}</text>`
    : ''

  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 420'><rect width='600' height='420' rx='40' fill='${bg}'/><circle cx='478' cy='94' r='92' fill='${accent}' fill-opacity='0.12'/><circle cx='104' cy='338' r='120' fill='${accent}' fill-opacity='0.14'/><rect x='38' y='36' width='524' height='348' rx='34' fill='white' fill-opacity='0.18'/><rect x='72' y='66' width='152' height='34' rx='17' fill='${accent}' fill-opacity='0.9'/><text x='92' y='89' font-size='18' font-family='Manrope,Arial' fill='white'>${categoryLabel}</text><rect x='84' y='120' width='344' height='176' rx='28' fill='white' fill-opacity='0.2'/>${shapeMarkup}<text x='78' y='332' font-size='30' font-weight='700' font-family='Cormorant Garamond,serif' fill='${text}'>${title}</text>${colorLine}</svg>`
}
