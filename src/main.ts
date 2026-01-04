import { getRandomStation, Station, lines, getStationsByLine } from './stations'
import {
  createGame,
  addHistory,
  getAllGames,
  getHistoryByGame,
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

function isGameActive(): boolean {
  return getCurrentGameId() !== null
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

  for (const line of lines) {
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

function renderResult(station: Station, departure: string, route: string[]): void {
  const resultSection = document.getElementById('result-section')!
  const lineBadge = document.getElementById('line-badge')!
  const stationName = document.getElementById('station-name')!
  const transitLink = document.getElementById('transit-link') as HTMLAnchorElement
  const routeDisplay = document.getElementById('route-display')!

  lineBadge.textContent = `${station.lineCode} ${station.line}`
  lineBadge.style.backgroundColor = station.lineColor
  stationName.textContent = station.name
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

  // 編集・削除のイベントリスナー
  document.querySelectorAll('.game-name-edit').forEach((btn) => {
    btn.addEventListener('click', handleEditGameName)
  })
  document.querySelectorAll('.game-delete').forEach((btn) => {
    btn.addEventListener('click', handleDeleteGame)
  })
}

interface ExtendedRouteNode extends RouteNode {
  destinationNumber: number | null  // null=通過駅、0=開始駅、1=1回目の目的地...
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
    }]
  }

  // 全てのrouteを統合し、目的地のインデックスを追跡
  const allStations: string[] = []
  // 目的地のインデックス（結合後の配列でのインデックス）→ 目的地番号
  const destinationIndices = new Map<number, number>()
  destinationIndices.set(0, 0)  // 開始駅はインデックス0

  for (let i = 0; i < history.length; i++) {
    const record = history[i]

    for (let j = 0; j < record.route.length; j++) {
      // 最初のレコード以外は、最初の駅（前の到着駅）をスキップ
      if (i > 0 && j === 0) continue
      allStations.push(record.route[j])
    }

    // このレコードの目的地は、現在のallStationsの最後のインデックス
    const destinationIndex = allStations.length - 1
    destinationIndices.set(destinationIndex, i + 1)  // 1回目、2回目...
  }

  const baseNodes = getRouteWithLines(allStations)

  // インデックスベースで目的地番号を付与
  return baseNodes.map((node, index) => ({
    ...node,
    destinationNumber: destinationIndices.get(index) ?? null,
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
          ${transferLabel}
          ${currentLabel}
        </div>
      </div>
    `
  }

  routeHtml += '</div>'

  return `
    <div class="game-card" data-game-id="${game.id}">
      <div class="game-header">
        <div class="game-name" data-game-id="${game.id}">${escapeHtml(game.name)}</div>
        <div class="game-actions">
          <button class="game-name-edit" data-game-id="${game.id}" title="名前を変更">✏️</button>
          <button class="game-delete" data-game-id="${game.id}" title="削除">🗑️</button>
        </div>
      </div>
      ${routeHtml}
    </div>
  `
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
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

  const station = getRandomStation()
  const route = findShortestRoute(departure, station.name)

  await addHistory({
    gameId: gameId!,
    timestamp: Date.now(),
    fromStation: departure,
    toStation: station.name,
    lineName: station.line,
    lineCode: station.lineCode,
    route,
  })

  renderResult(station, departure, route)

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

async function init(): Promise<void> {
  // 路線ボタンを初期化
  populateLineButtons()

  const randomButton = document.getElementById('random-button')!
  randomButton.addEventListener('click', handleRandomClick)

  const endGameButton = document.getElementById('end-game-button')!
  endGameButton.addEventListener('click', handleEndGame)

  const clearAllButton = document.getElementById('clear-all-button')!
  clearAllButton.addEventListener('click', handleClearAll)

  updateUI()
  await renderGames()
}

init()
