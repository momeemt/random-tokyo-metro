// 東京メトロ路線図に基づく隣接関係
// 各路線の駅を順番に定義し、隣接関係を構築

const lines: Record<string, string[]> = {
  // 銀座線
  G: ['渋谷', '表参道', '外苑前', '青山一丁目', '赤坂見附', '溜池山王', '虎ノ門', '新橋', '銀座', '京橋', '日本橋', '三越前', '神田', '末広町', '上野広小路', '上野', '稲荷町', '田原町', '浅草'],
  // 丸ノ内線
  M: ['荻窪', '南阿佐ケ谷', '新高円寺', '東高円寺', '新中野', '中野坂上', '西新宿', '新宿', '新宿三丁目', '新宿御苑前', '四谷三丁目', '四ツ谷', '赤坂見附', '国会議事堂前', '霞ケ関', '銀座', '東京', '大手町', '淡路町', '御茶ノ水', '本郷三丁目', '後楽園', '茗荷谷', '新大塚', '池袋'],
  // 丸ノ内線 方南町支線
  Mb: ['中野坂上', '中野新橋', '中野富士見町', '方南町'],
  // 日比谷線
  H: ['中目黒', '恵比寿', '広尾', '六本木', '神谷町', '虎ノ門ヒルズ', '霞ケ関', '日比谷', '銀座', '東銀座', '築地', '八丁堀', '茅場町', '人形町', '小伝馬町', '秋葉原', '仲御徒町', '上野', '入谷', '三ノ輪', '南千住', '北千住'],
  // 東西線
  T: ['中野', '落合', '高田馬場', '早稲田', '神楽坂', '飯田橋', '九段下', '竹橋', '大手町', '日本橋', '茅場町', '門前仲町', '木場', '東陽町', '南砂町', '西葛西', '葛西', '浦安', '南行徳', '行徳', '妙典', '原木中山', '西船橋'],
  // 千代田線
  C: ['代々木上原', '代々木公園', '明治神宮前', '表参道', '乃木坂', '赤坂', '国会議事堂前', '霞ケ関', '日比谷', '二重橋前', '大手町', '新御茶ノ水', '湯島', '根津', '千駄木', '西日暮里', '町屋', '北千住', '綾瀬', '北綾瀬'],
  // 有楽町線
  Y: ['和光市', '地下鉄成増', '地下鉄赤塚', '平和台', '氷川台', '小竹向原', '千川', '要町', '池袋', '東池袋', '護国寺', '江戸川橋', '飯田橋', '市ケ谷', '麹町', '永田町', '桜田門', '有楽町', '銀座一丁目', '新富町', '月島', '豊洲', '辰巳', '新木場'],
  // 半蔵門線
  Z: ['渋谷', '表参道', '青山一丁目', '永田町', '半蔵門', '九段下', '神保町', '大手町', '三越前', '水天宮前', '清澄白河', '住吉', '錦糸町', '押上'],
  // 南北線
  N: ['目黒', '白金台', '白金高輪', '麻布十番', '六本木一丁目', '溜池山王', '永田町', '四ツ谷', '市ケ谷', '飯田橋', '後楽園', '東大前', '本駒込', '駒込', '西ケ原', '王子', '王子神谷', '志茂', '赤羽岩淵'],
  // 副都心線
  F: ['和光市', '地下鉄成増', '地下鉄赤塚', '平和台', '氷川台', '小竹向原', '千川', '要町', '池袋', '雑司が谷', '西早稲田', '東新宿', '新宿三丁目', '北参道', '明治神宮前', '渋谷'],
}

// 乗り換え可能駅（同一駅名）
const transfers: string[][] = [
  ['渋谷'],      // G, Z, F
  ['表参道'],    // G, C, Z
  ['青山一丁目'], // G, Z
  ['赤坂見附', '永田町'], // 赤坂見附(G,M)と永田町(Y,Z,N)は乗り換え可能
  ['溜池山王'],  // G, N
  ['銀座'],      // G, M, H
  ['日本橋'],    // G, T
  ['三越前'],    // G, Z
  ['上野'],      // G, H
  ['池袋'],      // M, Y, F
  ['新宿三丁目'], // M, F
  ['四ツ谷'],    // M, N
  ['国会議事堂前'], // M, C
  ['霞ケ関'],    // M, H, C
  ['大手町'],    // M, T, C, Z
  ['後楽園'],    // M, N
  ['中野坂上'],  // M, Mb (方南町支線の分岐)
  ['北千住'],    // H, C
  ['茅場町'],    // H, T
  ['日比谷', '有楽町'], // 日比谷(H,C)と有楽町(Y)は乗り換え可能
  ['飯田橋'],    // T, Y, N
  ['九段下'],    // T, Z
  ['明治神宮前'], // C, F
  ['永田町'],    // Y, Z, N
  ['市ケ谷'],    // Y, N
  ['小竹向原'],  // Y, F
  ['千川'],      // Y, F
  ['要町'],      // Y, F
  ['和光市'],    // Y, F
  ['地下鉄成増'], // Y, F
  ['地下鉄赤塚'], // Y, F
  ['平和台'],    // Y, F
  ['氷川台'],    // Y, F
]

// コスト設定（分単位）
const TRAVEL_TIME_PER_STATION = 2  // 駅間の所要時間
const TRANSFER_PENALTY = 5          // 乗り換えペナルティ

// 駅がどの路線に属しているかを取得
function getLinesForStation(station: string): string[] {
  const result: string[] = []
  for (const [lineCode, stations] of Object.entries(lines)) {
    if (stations.includes(station)) {
      result.push(lineCode)
    }
  }
  return result
}

// 乗り換え可能な駅のグループを取得
function getTransferGroup(station: string): string[] {
  for (const group of transfers) {
    if (group.includes(station)) {
      return group
    }
  }
  return [station]
}

// 全駅のセットを取得
function getAllStations(): Set<string> {
  const stations = new Set<string>()
  for (const stationList of Object.values(lines)) {
    for (const station of stationList) {
      stations.add(station)
    }
  }
  return stations
}

const allStations = getAllStations()

// ダイクストラ法で乗り換えペナルティを考慮した最短経路を探索
// 状態: (駅名, 現在の路線) のペア
export function findShortestRoute(from: string, to: string): string[] {
  if (from === to) return [from]

  if (!allStations.has(from) || !allStations.has(to)) {
    return []
  }

  // 優先度付きキュー（簡易実装）
  // 状態: { cost, station, line, path }
  interface State {
    cost: number
    station: string
    line: string | null  // 現在乗っている路線（null = まだ乗っていない）
    path: string[]
  }

  const queue: State[] = []
  // visited: "駅名:路線" の形式で記録
  const visited = new Map<string, number>()

  // 出発駅から開始（まだどの路線にも乗っていない状態）
  queue.push({ cost: 0, station: from, line: null, path: [from] })

  while (queue.length > 0) {
    // 最小コストの状態を取得
    queue.sort((a, b) => a.cost - b.cost)
    const current = queue.shift()!

    // 目的地に到達
    if (current.station === to) {
      return current.path
    }

    const stateKey = `${current.station}:${current.line}`
    if (visited.has(stateKey) && visited.get(stateKey)! <= current.cost) {
      continue
    }
    visited.set(stateKey, current.cost)

    // 現在の駅で利用可能な路線
    const availableLines = getLinesForStation(current.station)

    // 各路線について、隣接駅への移動を検討
    for (const lineCode of availableLines) {
      const stationsOnLine = lines[lineCode]
      const currentIndex = stationsOnLine.indexOf(current.station)

      if (currentIndex === -1) continue

      // 前後の駅への移動を検討
      const neighbors: number[] = []
      if (currentIndex > 0) neighbors.push(currentIndex - 1)
      if (currentIndex < stationsOnLine.length - 1) neighbors.push(currentIndex + 1)

      for (const neighborIndex of neighbors) {
        const nextStation = stationsOnLine[neighborIndex]
        let moveCost = TRAVEL_TIME_PER_STATION

        // 乗り換えが必要な場合はペナルティを追加
        if (current.line !== null && current.line !== lineCode) {
          moveCost += TRANSFER_PENALTY
        }

        const newCost = current.cost + moveCost
        const newStateKey = `${nextStation}:${lineCode}`

        if (!visited.has(newStateKey) || visited.get(newStateKey)! > newCost) {
          queue.push({
            cost: newCost,
            station: nextStation,
            line: lineCode,
            path: [...current.path, nextStation],
          })
        }
      }
    }

    // 乗り換え可能駅への移動（赤坂見附⇔永田町、日比谷⇔有楽町など）
    const transferGroup = getTransferGroup(current.station)
    for (const transferStation of transferGroup) {
      if (transferStation !== current.station) {
        // 別の駅への乗り換え（徒歩連絡）
        const newCost = current.cost + TRANSFER_PENALTY
        const newStateKey = `${transferStation}:${null}`

        if (!visited.has(newStateKey) || visited.get(newStateKey)! > newCost) {
          queue.push({
            cost: newCost,
            station: transferStation,
            line: null,  // 路線をリセット
            path: [...current.path, transferStation],
          })
        }
      }
    }
  }

  return [] // 経路が見つからない場合
}

// 路線コードと色のマッピング
const lineColors: Record<string, { name: string; color: string }> = {
  G: { name: '銀座線', color: '#FF9500' },
  M: { name: '丸ノ内線', color: '#F62E36' },
  Mb: { name: '丸ノ内線', color: '#F62E36' },
  H: { name: '日比谷線', color: '#B5B5AC' },
  T: { name: '東西線', color: '#009BBF' },
  C: { name: '千代田線', color: '#00BB85' },
  Y: { name: '有楽町線', color: '#C1A470' },
  Z: { name: '半蔵門線', color: '#8F76D6' },
  N: { name: '南北線', color: '#00AC9B' },
  F: { name: '副都心線', color: '#9C5E31' },
}

// 2駅間でどの路線を使っているかを判定
function getLineBetween(from: string, to: string): string | null {
  for (const [lineCode, stations] of Object.entries(lines)) {
    for (let i = 0; i < stations.length - 1; i++) {
      if (
        (stations[i] === from && stations[i + 1] === to) ||
        (stations[i] === to && stations[i + 1] === from)
      ) {
        return lineCode
      }
    }
  }
  return null
}

// 駅が属する路線を取得（最初に見つかったもの）
function getStationLine(station: string): string | null {
  for (const [lineCode, stations] of Object.entries(lines)) {
    if (stations.includes(station)) {
      return lineCode
    }
  }
  return null
}

export interface RouteNode {
  station: string
  lineCode: string | null  // 次の駅へ向かう路線コード
  lineName: string | null
  lineColor: string | null
  isTransfer: boolean      // 乗り換え駅かどうか
}

// 経路を路線情報付きで取得
export function getRouteWithLines(route: string[]): RouteNode[] {
  if (route.length === 0) return []

  const result: RouteNode[] = []
  let prevLineCode: string | null = null

  for (let i = 0; i < route.length; i++) {
    const station = route[i]
    let lineCode: string | null = null
    let lineName: string | null = null
    let lineColor: string | null = null

    if (i < route.length - 1) {
      lineCode = getLineBetween(station, route[i + 1])

      // 乗り換え連絡（赤坂見附↔永田町など）の場合、次の駅の路線を使用
      if (lineCode === null) {
        lineCode = getStationLine(route[i + 1])
      }

      if (lineCode && lineColors[lineCode]) {
        lineName = lineColors[lineCode].name
        lineColor = lineColors[lineCode].color
      }
    } else {
      // 最後の駅は前の駅の路線情報を引き継ぐ、なければ自身の路線
      lineCode = prevLineCode ?? getStationLine(station)
      if (lineCode && lineColors[lineCode]) {
        lineName = lineColors[lineCode].name
        lineColor = lineColors[lineCode].color
      }
    }

    const isTransfer = prevLineCode !== null && lineCode !== null && prevLineCode !== lineCode

    result.push({
      station,
      lineCode,
      lineName,
      lineColor,
      isTransfer,
    })

    prevLineCode = lineCode
  }

  return result
}
