import { findShortestRoute, getRouteWithLines } from './route'

export interface ShareData {
  s: string  // start station
  t: boolean // toei enabled
  d: { n: string; st?: string }[] // destinations
}

export function encodeShareData(data: ShareData): string {
  const json = JSON.stringify(data)
  return encodeURIComponent(json)
}

export function decodeShareData(encoded: string): ShareData | null {
  try {
    const json = decodeURIComponent(encoded)
    return JSON.parse(json) as ShareData
  } catch {
    // フォールバック: 旧形式（Base64）
    try {
      const binary = atob(encoded)
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
      const json = new TextDecoder().decode(bytes)
      return JSON.parse(json) as ShareData
    } catch {
      return null
    }
  }
}

const METRO_PASS_PRICE = 700
const COMMON_PASS_PRICE = 1200
const TOEI_CODES = new Set(['A', 'I', 'S', 'E'])

function getMetroFare(hops: number): number {
  if (hops <= 0) return 0
  if (hops <= 5) return 180
  if (hops <= 9) return 210
  if (hops <= 15) return 260
  if (hops <= 22) return 300
  return 340
}

function getToeiFare(hops: number): number {
  if (hops <= 0) return 0
  if (hops <= 3) return 180
  if (hops <= 7) return 220
  if (hops <= 12) return 280
  if (hops <= 17) return 330
  if (hops <= 22) return 380
  return 430
}

export function calculateTripFare(route: string[]): number {
  const nodes = getRouteWithLines(route)
  if (nodes.length < 2) return 0

  let totalFare = 0
  let currentOperator: 'metro' | 'toei' | null = null
  let hops = 0

  for (let i = 0; i < nodes.length - 1; i++) {
    const lineCode = nodes[i].lineCode
    if (lineCode === null) continue

    const operator: 'metro' | 'toei' = TOEI_CODES.has(lineCode) ? 'toei' : 'metro'

    if (operator !== currentOperator && currentOperator !== null && hops > 0) {
      totalFare += currentOperator === 'metro' ? getMetroFare(hops) : getToeiFare(hops)
      hops = 0
    }

    currentOperator = operator
    hops++
  }

  if (hops > 0 && currentOperator !== null) {
    totalFare += currentOperator === 'metro' ? getMetroFare(hops) : getToeiFare(hops)
  }

  return totalFare
}

function getDestinationLabel(destinationNumber: number | null): string {
  if (destinationNumber === null) return ''
  if (destinationNumber === 0) return '<span class="route-badge route-badge-start">開始</span>'
  return `<span class="route-badge route-badge-destination">${destinationNumber}回目</span>`
}

export function renderSharedGame(data: ShareData): string {
  const stations: string[] = [data.s]
  for (const d of data.d) stations.push(d.n)

  const allStations: string[] = []
  const destinationInfo = new Map<number, { number: number; stayLabel: string | null }>()
  destinationInfo.set(0, { number: 0, stayLabel: null })

  for (let i = 0; i < data.d.length; i++) {
    const from = i === 0 ? data.s : data.d[i - 1].n
    const to = data.d[i].n
    const route = findShortestRoute(from, to, data.t)

    for (let j = 0; j < route.length; j++) {
      if (i > 0 && j === 0) continue
      allStations.push(route[j])
    }

    const destIndex = allStations.length - 1
    destinationInfo.set(destIndex, {
      number: i + 1,
      stayLabel: data.d[i].st ?? null,
    })
  }

  const nodes = getRouteWithLines(allStations)
  const extendedNodes = nodes.map((node, index) => ({
    ...node,
    destinationNumber: destinationInfo.get(index)?.number ?? null,
    stayLabel: destinationInfo.get(index)?.stayLabel ?? null,
  }))

  // 運賃計算
  let totalFare = 0
  let totalStations = 0
  {
    let from = data.s
    for (const d of data.d) {
      const route = findShortestRoute(from, d.n, data.t)
      totalFare += calculateTripFare(route)
      totalStations += Math.max(0, route.length - 1)
      from = d.n
    }
  }

  const passPrice = data.t ? COMMON_PASS_PRICE : METRO_PASS_PRICE
  const savings = totalFare - passPrice
  const passLabel = data.t ? 'メトロ・都営共通一日券' : 'メトロ24時間券'

  // 逆順表示
  const reversed = [...extendedNodes].reverse()
  let routeHtml = '<div class="route-visual">'
  for (let i = 0; i < reversed.length; i++) {
    const node = reversed[i]
    const isFirst = i === 0
    const isLast = i === reversed.length - 1
    const nextNode = i > 0 ? reversed[i - 1] : null
    const lineColor = nextNode?.lineColor || node.lineColor || '#ddd'
    const destinationLabel = getDestinationLabel(node.destinationNumber)
    const transferLabel = node.isTransfer ? '<span class="route-badge route-badge-transfer">乗換</span>' : ''
    const stayBadge = node.stayLabel != null ? `<span class="route-badge route-badge-stay">${node.stayLabel}</span>` : ''

    routeHtml += `
      <div class="route-node">
        <div class="route-line-container">
          ${!isFirst ? `<div class="route-line route-line-top" style="background-color: ${lineColor}"></div>` : ''}
          <div class="route-circle" style="border-color: ${node.lineColor || '#999'}">
            ${node.lineCode || ''}
          </div>
          ${!isLast ? `<div class="route-line route-line-bottom" style="background-color: ${node.lineColor || '#ddd'}"></div>` : ''}
        </div>
        <div class="route-info">
          <span class="route-station">${node.station}</span>
          ${destinationLabel}
          ${stayBadge}
          ${transferLabel}
        </div>
      </div>
    `
  }
  routeHtml += '</div>'

  let fareHtml = ''
  if (data.d.length > 0) {
    if (savings > 0) {
      fareHtml = `
        <div class="game-fare game-fare-profit">
          <span class="fare-total">合計${totalStations}駅 / 運賃 ¥${totalFare}</span>
          <span class="fare-pass">${passLabel} ¥${passPrice}</span>
          <span class="fare-savings">¥${savings} お得!</span>
        </div>
      `
    } else {
      fareHtml = `
        <div class="game-fare game-fare-loss">
          <span class="fare-total">合計${totalStations}駅 / 運賃 ¥${totalFare}</span>
          <span class="fare-pass">${passLabel} ¥${passPrice}</span>
          <span class="fare-savings">あと ¥${-savings} で元が取れる</span>
        </div>
      `
    }
  }

  return `
    <div class="game-card">
      <div class="game-header">
        <div class="game-name">シェアされた記録</div>
      </div>
      ${fareHtml}
      ${routeHtml}
    </div>
  `
}
