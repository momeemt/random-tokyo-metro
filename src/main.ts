import { getRandomStation, Station, getStationsByLine, getActiveLines } from './stations'
import {
  createGame,
  addHistory,
  getAllGames,
  getHistoryByGame,
  updateHistory,
  updateGameName,
  deleteGame,
  clearAllData,
  GameRecord,
  HistoryRecord,
} from './db'
import { findShortestRoute, getRouteWithLines, RouteNode } from './route'
import './style.css'

const DEPARTURE_KEY = 'departureStation'
const GAME_ID_KEY = 'currentGameId'

function getDeparture(): string {
  return localStorage.getItem(DEPARTURE_KEY) || ''
}

function setDeparture(value: string): void {
  localStorage.setItem(DEPARTURE_KEY, value)
}

function getCurrentGameId(): number | null {
  const id = localStorage.getItem(GAME_ID_KEY)
  return id ? parseInt(id, 10) : null
}

function setCurrentGameId(id: number | null): void {
  if (id === null) {
    localStorage.removeItem(GAME_ID_KEY)
  } else {
    localStorage.setItem(GAME_ID_KEY, String(id))
  }
}

const EXCLUDED_STATIONS_KEY = 'excludedStations'

function getExcludedStations(): Set<string> {
  const data = localStorage.getItem(EXCLUDED_STATIONS_KEY)
  if (!data) return new Set()
  try {
    return new Set(JSON.parse(data) as string[])
  } catch {
    return new Set()
  }
}

function setExcludedStations(excluded: Set<string>): void {
  localStorage.setItem(EXCLUDED_STATIONS_KEY, JSON.stringify([...excluded]))
}

const TOEI_ENABLED_KEY = 'toeiEnabled'

function isToeiEnabled(): boolean {
  return localStorage.getItem(TOEI_ENABLED_KEY) === 'true'
}

function setToeiEnabled(enabled: boolean): void {
  localStorage.setItem(TOEI_ENABLED_KEY, String(enabled))
}

const STAY_TIME_KEY = 'stayTimeConfig'

interface StayTimeConfig {
  min: number
  max: number
  interval: number
}

function getStayTimeConfig(): StayTimeConfig {
  const data = localStorage.getItem(STAY_TIME_KEY)
  if (data) {
    try {
      return JSON.parse(data) as StayTimeConfig
    } catch { /* fall through */ }
  }
  return { min: 5, max: 60, interval: 5 }
}

function setStayTimeConfig(config: StayTimeConfig): void {
  localStorage.setItem(STAY_TIME_KEY, JSON.stringify(config))
}

function getRandomStayDisplay(): string {
  const { min, max, interval } = getStayTimeConfig()
  const steps = Math.floor((max - min) / interval) + 1

  // ランダムに2つの値を選んでソート
  const a = Math.floor(Math.random() * steps)
  const b = Math.floor(Math.random() * steps)
  const lo = min + Math.min(a, b) * interval
  const hi = min + Math.max(a, b) * interval

  // 3パターンからランダムに選択
  const patterns: (() => string)[] = []

  // 「○分以下」: hi が max 未満の場合のみ意味がある
  if (hi < max) {
    patterns.push(() => `${hi}分以下`)
  }
  // 「○分以上」: lo が min より大きい場合のみ意味がある
  if (lo > min) {
    patterns.push(() => `${lo}分以上`)
  }
  // 「○分〜××分」: lo と hi が異なる場合
  if (lo !== hi) {
    patterns.push(() => `${lo}分〜${hi}分`)
  }

  // パターンがなければ（lo === hi かつ端の値）ちょうどの値を返す
  if (patterns.length === 0) {
    return `${lo}分`
  }

  return patterns[Math.floor(Math.random() * patterns.length)]()
}

function isGameActive(): boolean {
  return getCurrentGameId() !== null
}

// 運賃計算
const METRO_PASS_PRICE = 700
const COMMON_PASS_PRICE = 1200
const TOEI_CODES = new Set(['A', 'I', 'S', 'E'])

// メトロ運賃（駅数で近似、1駅≈1.2km）
function getMetroFare(hops: number): number {
  if (hops <= 0) return 0
  if (hops <= 5) return 180   // 1-6km
  if (hops <= 9) return 210   // 7-11km
  if (hops <= 15) return 260  // 12-19km
  if (hops <= 22) return 300  // 20-27km
  return 340                   // 28km+
}

// 都営運賃（駅数で近似、1駅≈1.2km）
function getToeiFare(hops: number): number {
  if (hops <= 0) return 0
  if (hops <= 3) return 180   // 1-4km
  if (hops <= 7) return 220   // 5-9km
  if (hops <= 12) return 280  // 10-15km
  if (hops <= 17) return 330  // 16-21km
  if (hops <= 22) return 380  // 22-27km
  return 430                   // 28km+
}

function calculateTripFare(route: string[]): number {
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

function calculateGameFare(history: HistoryRecord[]): number {
  let total = 0
  for (const record of history) {
    total += calculateTripFare(record.route)
  }
  return total
}

function getPassPrice(): number {
  return isToeiEnabled() ? COMMON_PASS_PRICE : METRO_PASS_PRICE
}

function createTransitUrl(from: string, to: string): string {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  params.set('to', to)
  return `https://transit.yahoo.co.jp/search/result?${params.toString()}`
}

function populateLineButtons(): void {
  const lineButtons = document.getElementById('line-buttons')!
  lineButtons.innerHTML = ''

  const activeLines = getActiveLines(isToeiEnabled())
  for (const line of activeLines) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'line-btn'
    btn.dataset.line = line.name
    btn.dataset.color = line.color
    btn.dataset.code = line.code
    btn.innerHTML = `
      <span class="line-btn-circle" style="background-color: ${line.color}">${line.code}</span>
      <span class="line-btn-name">${line.name}</span>
    `
    btn.addEventListener('click', () => selectLine(line.name, line.color, line.code))
    lineButtons.appendChild(btn)
  }
}

function selectLine(lineName: string, lineColor: string, lineCode: string): void {
  // 路線の選択状態を更新
  document.querySelectorAll('.line-btn').forEach((btn) => {
    btn.classList.remove('selected')
  })
  const selectedBtn = document.querySelector(`.line-btn[data-line="${lineName}"]`)
  if (selectedBtn) {
    selectedBtn.classList.add('selected')
  }

  // hidden inputに値を設定
  const lineInput = document.getElementById('selected-line') as HTMLInputElement
  lineInput.value = lineName

  // 駅選択をリセット
  const stationInput = document.getElementById('selected-station') as HTMLInputElement
  stationInput.value = ''
  document.querySelectorAll('.station-btn').forEach((btn) => {
    btn.classList.remove('selected')
  })

  // 駅ボタンを表示
  const stationLabel = document.getElementById('station-label')!
  const stationButtons = document.getElementById('station-buttons')!
  stationButtons.innerHTML = ''

  const stations = getStationsByLine(lineName)

  stationLabel.classList.remove('hidden')
  stationButtons.classList.remove('hidden')

  for (const stationName of stations) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'station-btn'
    btn.dataset.station = stationName
    btn.innerHTML = `
      <span class="station-btn-circle" style="background-color: ${lineColor}">${lineCode}</span>
      <span class="station-btn-name">${stationName}</span>
    `
    btn.addEventListener('click', () => selectStation(stationName))
    stationButtons.appendChild(btn)
  }
}

function selectStation(stationName: string): void {
  // 選択状態を更新
  document.querySelectorAll('.station-btn').forEach((btn) => {
    btn.classList.remove('selected')
  })
  const selectedBtn = document.querySelector(`.station-btn[data-station="${stationName}"]`)
  if (selectedBtn) {
    selectedBtn.classList.add('selected')
  }

  // hidden inputに値を設定
  const stationInput = document.getElementById('selected-station') as HTMLInputElement
  stationInput.value = stationName

  // ボタンを有効化
  updateRandomButtonState()
}

function updateRandomButtonState(): void {
  const randomButton = document.getElementById('random-button') as HTMLButtonElement
  const stationInput = document.getElementById('selected-station') as HTMLInputElement

  if (isGameActive()) {
    // ゲーム中は常に有効
    randomButton.disabled = false
  } else {
    // ゲーム開始前は駅が選択されているか確認
    randomButton.disabled = !stationInput.value
  }
}

function updateUI(): void {
  const departureSection = document.getElementById('departure-section')!
  const endGameButton = document.getElementById('end-game-button')!
  const randomButton = document.getElementById('random-button')!
  const currentDeparture = document.getElementById('current-departure')!

  if (isGameActive()) {
    departureSection.classList.add('hidden')
    endGameButton.classList.remove('hidden')
    randomButton.textContent = '次の駅を選ぶ'
    currentDeparture.classList.remove('hidden')
    currentDeparture.textContent = `現在地: ${getDeparture()}`
  } else {
    departureSection.classList.remove('hidden')
    endGameButton.classList.add('hidden')
    randomButton.textContent = 'ゲームを開始'
    currentDeparture.classList.add('hidden')
  }

  updateRandomButtonState()
}

function renderRouteVisual(route: string[]): string {
  const nodes = getRouteWithLines(route)
  if (nodes.length === 0) return '<div class="empty-history">経路なし</div>'

  // 逆順にして新しい駅が上に来るようにする
  const reversedNodes = [...nodes].reverse()

  let html = '<div class="route-visual">'

  for (let i = 0; i < reversedNodes.length; i++) {
    const node = reversedNodes[i]
    const isFirst = i === 0
    const isLast = i === reversedNodes.length - 1

    // 次の駅への線の色（逆順なので、前のノードの色を使う）
    const nextNode = i > 0 ? reversedNodes[i - 1] : null
    const lineColor = nextNode?.lineColor || node.lineColor || '#ddd'

    html += `
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
          ${node.isTransfer ? '<span class="route-badge route-badge-transfer">乗換</span>' : ''}
          ${isFirst ? '<span class="route-badge route-badge-current">目的地</span>' : ''}
          ${isLast ? '<span class="route-badge route-badge-start">出発</span>' : ''}
        </div>
      </div>
    `
  }

  html += '</div>'
  return html
}

function renderResult(station: Station, departure: string, route: string[], stayDisplay: string): void {
  const resultSection = document.getElementById('result-section')!
  const lineBadge = document.getElementById('line-badge')!
  const stationName = document.getElementById('station-name')!
  const stayTimeEl = document.getElementById('stay-time')!
  const transitLink = document.getElementById('transit-link') as HTMLAnchorElement
  const routeDisplay = document.getElementById('route-display')!

  const tripFareEl = document.getElementById('trip-fare')!

  lineBadge.textContent = `${station.lineCode} ${station.line}`
  lineBadge.style.backgroundColor = station.lineColor
  stationName.textContent = station.name
  stayTimeEl.textContent = `滞在時間: ${stayDisplay}`

  const tripFare = calculateTripFare(route)
  tripFareEl.textContent = `この区間の運賃: ¥${tripFare}`

  transitLink.href = createTransitUrl(departure, station.name)

  if (route.length > 0) {
    routeDisplay.innerHTML = `
      <div class="route-label">経路 (${route.length - 1}駅)</div>
      ${renderRouteVisual(route)}
    `
  } else {
    routeDisplay.innerHTML = '<div class="route-label">経路が見つかりません</div>'
  }

  resultSection.classList.add('show')
}

let selectedGameId: number | null = null

async function renderGames(): Promise<void> {
  const gameTabs = document.getElementById('game-tabs')!
  const gameContent = document.getElementById('game-content')!
  const games = await getAllGames()

  if (games.length === 0) {
    gameTabs.innerHTML = ''
    gameContent.innerHTML = '<div class="empty-history">まだゲームがありません</div>'
    selectedGameId = null
    return
  }

  // 選択中のゲームがなければ最新のゲームを選択
  if (selectedGameId === null || !games.find(g => g.id === selectedGameId)) {
    selectedGameId = games[0].id!
  }

  // タブを描画
  let tabsHtml = ''
  for (const game of games) {
    const isActive = game.id === selectedGameId
    tabsHtml += `
      <button class="game-tab ${isActive ? 'active' : ''}" data-game-id="${game.id}">
        <span class="game-tab-name">${escapeHtml(game.name)}</span>
      </button>
    `
  }
  gameTabs.innerHTML = tabsHtml

  // 選択中のゲームのコンテンツを描画
  const selectedGame = games.find(g => g.id === selectedGameId)!
  const history = await getHistoryByGame(selectedGame.id!)
  gameContent.innerHTML = renderGameCard(selectedGame, history)

  // タブのイベントリスナー
  document.querySelectorAll('.game-tab').forEach((tab) => {
    tab.addEventListener('click', async (e) => {
      const gameId = parseInt((e.currentTarget as HTMLElement).dataset.gameId!, 10)
      selectedGameId = gameId
      await renderGames()
    })
  })

  // シェア・再計算・編集・削除のイベントリスナー
  document.querySelectorAll('.game-share').forEach((btn) => {
    btn.addEventListener('click', handleShareGame)
  })
  document.querySelectorAll('.game-recalc').forEach((btn) => {
    btn.addEventListener('click', handleRecalcRoutes)
  })
  document.querySelectorAll('.game-name-edit').forEach((btn) => {
    btn.addEventListener('click', handleEditGameName)
  })
  document.querySelectorAll('.game-delete').forEach((btn) => {
    btn.addEventListener('click', handleDeleteGame)
  })
}

interface ExtendedRouteNode extends RouteNode {
  destinationNumber: number | null  // null=通過駅、0=開始駅、1=1回目の目的地...
  stayLabel: string | null          // 目的地の滞在時間表示
}

function buildFullRoute(game: GameRecord, history: HistoryRecord[]): ExtendedRouteNode[] {
  if (history.length === 0) {
    return [{
      station: game.startStation,
      lineCode: null,
      lineName: null,
      lineColor: null,
      isTransfer: false,
      destinationNumber: 0,  // 開始駅
      stayLabel: null,
    }]
  }

  // 全てのrouteを統合し、目的地のインデックスを追跡
  const allStations: string[] = []
  // 目的地のインデックス（結合後の配列でのインデックス）→ { 番号, 滞在時間 }
  const destinationInfo = new Map<number, { number: number; stayLabel: string | null }>()
  destinationInfo.set(0, { number: 0, stayLabel: null })  // 開始駅

  for (let i = 0; i < history.length; i++) {
    const record = history[i]

    for (let j = 0; j < record.route.length; j++) {
      // 最初のレコード以外は、最初の駅（前の到着駅）をスキップ
      if (i > 0 && j === 0) continue
      allStations.push(record.route[j])
    }

    // このレコードの目的地は、現在のallStationsの最後のインデックス
    const destinationIndex = allStations.length - 1
    // stayDisplay優先、なければ旧形式のstayMinutesから生成
    const stayLabel = record.stayDisplay
      ?? (record.stayMinutes != null ? `${record.stayMinutes}分` : null)
    destinationInfo.set(destinationIndex, {
      number: i + 1,
      stayLabel,
    })
  }

  const baseNodes = getRouteWithLines(allStations)

  // インデックスベースで目的地番号と滞在時間を付与
  return baseNodes.map((node, index) => ({
    ...node,
    destinationNumber: destinationInfo.get(index)?.number ?? null,
    stayLabel: destinationInfo.get(index)?.stayLabel ?? null,
  }))
}

function getDestinationLabel(destinationNumber: number | null): string {
  if (destinationNumber === null) return ''
  if (destinationNumber === 0) return '<span class="route-badge route-badge-start">開始</span>'
  return `<span class="route-badge route-badge-destination">${destinationNumber}回目</span>`
}

function renderGameCard(game: GameRecord, history: HistoryRecord[]): string {
  const fullRoute = buildFullRoute(game, history)

  // 逆順にして新しい駅が上に来るようにする
  const reversedRoute = [...fullRoute].reverse()

  let routeHtml = '<div class="route-visual">'

  for (let i = 0; i < reversedRoute.length; i++) {
    const node = reversedRoute[i]
    const isFirst = i === 0
    const isLast = i === reversedRoute.length - 1

    // 線の色を決定
    const nextNode = i > 0 ? reversedRoute[i - 1] : null
    const lineColor = nextNode?.lineColor || node.lineColor || '#ddd'

    // バッジを生成
    const destinationLabel = getDestinationLabel(node.destinationNumber)
    const transferLabel = node.isTransfer ? '<span class="route-badge route-badge-transfer">乗換</span>' : ''
    const currentLabel = isFirst && node.destinationNumber !== null ? '<span class="route-badge route-badge-current">現在地</span>' : ''
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
          ${currentLabel}
        </div>
      </div>
    `
  }

  routeHtml += '</div>'

  const totalFare = calculateGameFare(history)
  const totalStations = history.reduce((sum, r) => sum + Math.max(0, r.route.length - 1), 0)
  const passPrice = getPassPrice()
  const savings = totalFare - passPrice
  const passLabel = isToeiEnabled() ? 'メトロ・都営共通一日券' : 'メトロ24時間券'

  let fareHtml: string
  if (history.length === 0) {
    fareHtml = ''
  } else if (savings > 0) {
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

  return `
    <div class="game-card" data-game-id="${game.id}">
      <div class="game-header">
        <div class="game-name" data-game-id="${game.id}">${escapeHtml(game.name)}</div>
        <div class="game-actions">
          <button class="game-share" data-game-id="${game.id}" title="シェア">📤</button>
          <button class="game-recalc" data-game-id="${game.id}" title="経路を再計算">🔄</button>
          <button class="game-name-edit" data-game-id="${game.id}" title="名前を変更">✏️</button>
          <button class="game-delete" data-game-id="${game.id}" title="削除">🗑️</button>
        </div>
      </div>
      ${fareHtml}
      ${routeHtml}
    </div>
  `
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// シェア機能
interface ShareData {
  s: string  // start station
  t: boolean // toei enabled
  d: { n: string; st?: string }[] // destinations
}

function encodeShareData(data: ShareData): string {
  const json = JSON.stringify(data)
  return encodeURIComponent(json)
}

function decodeShareData(encoded: string): ShareData | null {
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

async function handleShareGame(e: Event): Promise<void> {
  const btn = e.currentTarget as HTMLButtonElement
  const gameId = parseInt(btn.dataset.gameId!, 10)

  const games = await getAllGames()
  const game = games.find((g) => g.id === gameId)
  if (!game) return

  const history = await getHistoryByGame(gameId)

  const data: ShareData = {
    s: game.startStation,
    t: isToeiEnabled(),
    d: history.map((r) => {
      const entry: { n: string; st?: string } = { n: r.toStation }
      if (r.stayDisplay) entry.st = r.stayDisplay
      else if (r.stayMinutes != null) entry.st = `${r.stayMinutes}分`
      return entry
    }),
  }

  const encoded = encodeShareData(data)
  const base = location.origin + location.pathname.replace(/\/$/, '')
  const url = `${base}/share?${encoded}`

  try {
    await navigator.clipboard.writeText(url)
    alert('シェア用URLをコピーしました')
  } catch {
    prompt('シェア用URL:', url)
  }
}


function checkSharedUrl(): boolean {
  // 旧形式 ?share=DATA → /share?DATA にリダイレクト
  const params = new URLSearchParams(location.search)
  const shareParam = params.get('share')
  if (shareParam) {
    const base = location.origin + location.pathname.replace(/\/$/, '')
    const encoded = encodeShareData(decodeShareData(shareParam)!)
    location.replace(`${base}/share?${encoded}`)
    return true
  }
  return false
}

async function handleEditGameName(e: Event): Promise<void> {
  const btn = e.currentTarget as HTMLButtonElement
  const gameId = parseInt(btn.dataset.gameId!, 10)
  const gameNameEl = document.querySelector(`.game-name[data-game-id="${gameId}"]`) as HTMLElement

  const currentName = gameNameEl.textContent || ''
  const newName = prompt('ゲーム名を入力してください', currentName)

  if (newName && newName !== currentName) {
    await updateGameName(gameId, newName)
    await renderGames()
  }
}

async function handleDeleteGame(e: Event): Promise<void> {
  const btn = e.currentTarget as HTMLButtonElement
  const gameId = parseInt(btn.dataset.gameId!, 10)

  if (!confirm('このゲームを削除しますか？')) return

  await deleteGame(gameId)
  await renderGames()
}

async function handleRecalcRoutes(e: Event): Promise<void> {
  const btn = e.currentTarget as HTMLButtonElement
  const gameId = parseInt(btn.dataset.gameId!, 10)
  const toei = isToeiEnabled()

  const history = await getHistoryByGame(gameId)
  let updated = 0
  for (const record of history) {
    const newRoute = findShortestRoute(record.fromStation, record.toStation, toei)
    if (JSON.stringify(newRoute) !== JSON.stringify(record.route)) {
      record.route = newRoute
      await updateHistory(record)
      updated++
    }
  }

  if (updated > 0) {
    await renderGames()
  }
  alert(`${history.length}件中${updated}件の経路を再計算しました。`)
}

async function handleRandomClick(): Promise<void> {
  let departure: string
  let gameId = getCurrentGameId()

  if (!isGameActive()) {
    const stationInput = document.getElementById('selected-station') as HTMLInputElement
    departure = stationInput.value
    if (!departure) {
      alert('出発駅を選択してください')
      return
    }
    setDeparture(departure)
    gameId = await createGame(departure)
    setCurrentGameId(gameId)
    // 新規ゲームのタブを選択
    selectedGameId = gameId
  } else {
    departure = getDeparture()
  }

  const excluded = getExcludedStations()
  excluded.add(departure)
  let station: Station
  try {
    station = getRandomStation(excluded, isToeiEnabled())
  } catch {
    alert('除外駅が多すぎて選べる駅がありません。除外設定を見直してください。')
    return
  }
  const route = findShortestRoute(departure, station.name, isToeiEnabled())

  const stayDisplay = getRandomStayDisplay()

  await addHistory({
    gameId: gameId!,
    timestamp: Date.now(),
    fromStation: departure,
    toStation: station.name,
    lineName: station.line,
    lineCode: station.lineCode,
    route,
    stayDisplay,
  })
  renderResult(station, departure, route, stayDisplay)

  // 次回の出発駅を今回選ばれた駅に更新
  setDeparture(station.name)
  updateUI()

  await renderGames()
}

async function handleEndGame(): Promise<void> {
  setCurrentGameId(null)
  localStorage.removeItem(DEPARTURE_KEY)

  // 選択状態をリセット
  document.querySelectorAll('.line-btn').forEach((btn) => {
    btn.classList.remove('selected')
  })
  const lineInput = document.getElementById('selected-line') as HTMLInputElement
  lineInput.value = ''

  const stationLabel = document.getElementById('station-label')!
  const stationButtons = document.getElementById('station-buttons')!
  const stationInput = document.getElementById('selected-station') as HTMLInputElement

  stationLabel.classList.add('hidden')
  stationButtons.innerHTML = ''
  stationButtons.classList.add('hidden')
  stationInput.value = ''

  const resultSection = document.getElementById('result-section')!
  resultSection.classList.remove('show')
  updateUI()
}

async function handleClearAll(): Promise<void> {
  // ゲーム中の場合は先に終了確認
  if (isGameActive()) {
    if (!confirm('ゲーム中です。ゲームを終了してすべての履歴を削除しますか？')) return
    await handleEndGame()
  } else {
    if (!confirm('すべてのゲームと履歴を削除しますか？')) return
  }
  await clearAllData()
  await renderGames()
}

function renderExcludeSettings(): void {
  const container = document.getElementById('exclude-content')!
  const excluded = getExcludedStations()
  const countEl = document.getElementById('exclude-count')!

  countEl.textContent = excluded.size > 0 ? `(${excluded.size}駅)` : ''

  let html = ''

  const activeLines = getActiveLines(isToeiEnabled())
  for (const line of activeLines) {
    const stationNames = getStationsByLine(line.name)
    const excludedInLine = stationNames.filter((s) => excluded.has(s)).length

    html += `
      <div class="exclude-line">
        <div class="exclude-line-header" data-line="${line.name}">
          <span class="line-btn-circle" style="background-color: ${line.color}">${line.code}</span>
          <span class="exclude-line-name">${line.name}</span>
          ${excludedInLine > 0 ? `<span class="exclude-line-count">${excludedInLine}/${stationNames.length}</span>` : ''}
          <button class="exclude-line-toggle" data-line="${line.name}" title="全選択/全解除">全</button>
        </div>
        <div class="exclude-stations hidden" data-line-stations="${line.name}">
    `
    for (const name of stationNames) {
      const isExcluded = excluded.has(name)
      html += `
        <label class="exclude-station-label">
          <input type="checkbox" class="exclude-checkbox" data-station="${name}" ${isExcluded ? 'checked' : ''} />
          <span class="exclude-station-name">${name}</span>
        </label>
      `
    }
    html += '</div></div>'
  }

  container.innerHTML = html

  // 路線ヘッダークリックで駅リスト開閉
  container.querySelectorAll('.exclude-line-header').forEach((header) => {
    header.addEventListener('click', (e) => {
      // 「全」ボタンクリック時はスキップ
      if ((e.target as HTMLElement).classList.contains('exclude-line-toggle')) return
      const lineName = (header as HTMLElement).dataset.line!
      const stationsDiv = container.querySelector(`[data-line-stations="${lineName}"]`)!
      stationsDiv.classList.toggle('hidden')
    })
  })

  // 「全」ボタンで路線内全選択/全解除
  container.querySelectorAll('.exclude-line-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lineName = (btn as HTMLElement).dataset.line!
      const stationNames = getStationsByLine(lineName)
      const allExcluded = stationNames.every((s) => excluded.has(s))
      for (const name of stationNames) {
        if (allExcluded) {
          excluded.delete(name)
        } else {
          excluded.add(name)
        }
      }
      setExcludedStations(excluded)
      renderExcludeSettings()
    })
  })

  // 個別チェックボックス
  container.querySelectorAll('.exclude-checkbox').forEach((cb) => {
    cb.addEventListener('change', () => {
      const input = cb as HTMLInputElement
      const stationName = input.dataset.station!
      if (input.checked) {
        excluded.add(stationName)
      } else {
        excluded.delete(stationName)
      }
      setExcludedStations(excluded)
      // カウント更新
      countEl.textContent = excluded.size > 0 ? `(${excluded.size}駅)` : ''
      // 路線ごとのカウント更新
      const activeLines = getActiveLines(isToeiEnabled())
      for (const line of activeLines) {
        const names = getStationsByLine(line.name)
        const cnt = names.filter((s) => excluded.has(s)).length
        const countSpan = container.querySelector(`.exclude-line-header[data-line="${line.name}"] .exclude-line-count`) as HTMLElement | null
        if (countSpan) {
          if (cnt > 0) {
            countSpan.textContent = `${cnt}/${names.length}`
          } else {
            countSpan.remove()
          }
        } else if (cnt > 0) {
          const header = container.querySelector(`.exclude-line-header[data-line="${line.name}"]`)!
          const toggleBtn = header.querySelector('.exclude-line-toggle')!
          const span = document.createElement('span')
          span.className = 'exclude-line-count'
          span.textContent = `${cnt}/${names.length}`
          header.insertBefore(span, toggleBtn)
        }
      }
    })
  })
}

function initStayTimeSettings(): void {
  const minInput = document.getElementById('stay-min') as HTMLInputElement
  const maxInput = document.getElementById('stay-max') as HTMLInputElement
  const intervalInput = document.getElementById('stay-interval') as HTMLInputElement

  const config = getStayTimeConfig()
  minInput.value = String(config.min)
  maxInput.value = String(config.max)
  intervalInput.value = String(config.interval)

  function saveConfig(): void {
    const min = parseInt(minInput.value, 10) || 5
    const max = parseInt(maxInput.value, 10) || 60
    const interval = parseInt(intervalInput.value, 10) || 5
    setStayTimeConfig({
      min: Math.max(1, min),
      max: Math.max(min, max),
      interval: Math.max(1, interval),
    })
  }

  minInput.addEventListener('change', saveConfig)
  maxInput.addEventListener('change', saveConfig)
  intervalInput.addEventListener('change', saveConfig)
}

async function init(): Promise<void> {
  // シェアURLチェック
  checkSharedUrl()

  // 都営トグル初期化
  const toeiToggle = document.getElementById('toei-toggle') as HTMLInputElement
  toeiToggle.checked = isToeiEnabled()
  toeiToggle.addEventListener('change', () => {
    setToeiEnabled(toeiToggle.checked)
    populateLineButtons()
    renderExcludeSettings()
  })

  // 路線ボタンを初期化
  populateLineButtons()

  const randomButton = document.getElementById('random-button')!
  randomButton.addEventListener('click', handleRandomClick)

  const endGameButton = document.getElementById('end-game-button')!
  endGameButton.addEventListener('click', handleEndGame)

  const clearAllButton = document.getElementById('clear-all-button')!
  clearAllButton.addEventListener('click', handleClearAll)

  // 滞在時間設定
  const stayToggle = document.getElementById('stay-toggle')!
  const stayContent = document.getElementById('stay-content')!
  stayToggle.addEventListener('click', () => {
    stayContent.classList.toggle('hidden')
    stayToggle.classList.toggle('open')
  })
  initStayTimeSettings()

  // 除外駅設定
  const excludeToggle = document.getElementById('exclude-toggle')!
  const excludeContent = document.getElementById('exclude-content')!
  excludeToggle.addEventListener('click', () => {
    excludeContent.classList.toggle('hidden')
    excludeToggle.classList.toggle('open')
  })
  renderExcludeSettings()

  updateUI()
  await renderGames()
}

init()
