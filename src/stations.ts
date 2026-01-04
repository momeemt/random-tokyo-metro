export interface Station {
  name: string
  line: string
  lineCode: string
  lineColor: string
}

export interface Line {
  name: string
  code: string
  color: string
}

export const lines: Line[] = [
  { name: '銀座線', code: 'G', color: '#FF9500' },
  { name: '丸ノ内線', code: 'M', color: '#F62E36' },
  { name: '日比谷線', code: 'H', color: '#B5B5AC' },
  { name: '東西線', code: 'T', color: '#009BBF' },
  { name: '千代田線', code: 'C', color: '#00BB85' },
  { name: '有楽町線', code: 'Y', color: '#C1A470' },
  { name: '半蔵門線', code: 'Z', color: '#8F76D6' },
  { name: '南北線', code: 'N', color: '#00AC9B' },
  { name: '副都心線', code: 'F', color: '#9C5E31' },
]

export const stations: Station[] = [
  // 銀座線 (G) - オレンジ
  { name: '渋谷', line: '銀座線', lineCode: 'G', lineColor: '#FF9500' },
  { name: '表参道', line: '銀座線', lineCode: 'G', lineColor: '#FF9500' },
  { name: '外苑前', line: '銀座線', lineCode: 'G', lineColor: '#FF9500' },
  { name: '青山一丁目', line: '銀座線', lineCode: 'G', lineColor: '#FF9500' },
  { name: '赤坂見附', line: '銀座線', lineCode: 'G', lineColor: '#FF9500' },
  { name: '溜池山王', line: '銀座線', lineCode: 'G', lineColor: '#FF9500' },
  { name: '虎ノ門', line: '銀座線', lineCode: 'G', lineColor: '#FF9500' },
  { name: '新橋', line: '銀座線', lineCode: 'G', lineColor: '#FF9500' },
  { name: '銀座', line: '銀座線', lineCode: 'G', lineColor: '#FF9500' },
  { name: '京橋', line: '銀座線', lineCode: 'G', lineColor: '#FF9500' },
  { name: '日本橋', line: '銀座線', lineCode: 'G', lineColor: '#FF9500' },
  { name: '三越前', line: '銀座線', lineCode: 'G', lineColor: '#FF9500' },
  { name: '神田', line: '銀座線', lineCode: 'G', lineColor: '#FF9500' },
  { name: '末広町', line: '銀座線', lineCode: 'G', lineColor: '#FF9500' },
  { name: '上野広小路', line: '銀座線', lineCode: 'G', lineColor: '#FF9500' },
  { name: '上野', line: '銀座線', lineCode: 'G', lineColor: '#FF9500' },
  { name: '稲荷町', line: '銀座線', lineCode: 'G', lineColor: '#FF9500' },
  { name: '田原町', line: '銀座線', lineCode: 'G', lineColor: '#FF9500' },
  { name: '浅草', line: '銀座線', lineCode: 'G', lineColor: '#FF9500' },

  // 丸ノ内線 (M) - 赤
  { name: '荻窪', line: '丸ノ内線', lineCode: 'M', lineColor: '#F62E36' },
  { name: '南阿佐ケ谷', line: '丸ノ内線', lineCode: 'M', lineColor: '#F62E36' },
  { name: '新高円寺', line: '丸ノ内線', lineCode: 'M', lineColor: '#F62E36' },
  { name: '東高円寺', line: '丸ノ内線', lineCode: 'M', lineColor: '#F62E36' },
  { name: '新中野', line: '丸ノ内線', lineCode: 'M', lineColor: '#F62E36' },
  { name: '中野坂上', line: '丸ノ内線', lineCode: 'M', lineColor: '#F62E36' },
  { name: '西新宿', line: '丸ノ内線', lineCode: 'M', lineColor: '#F62E36' },
  { name: '新宿', line: '丸ノ内線', lineCode: 'M', lineColor: '#F62E36' },
  { name: '新宿三丁目', line: '丸ノ内線', lineCode: 'M', lineColor: '#F62E36' },
  { name: '新宿御苑前', line: '丸ノ内線', lineCode: 'M', lineColor: '#F62E36' },
  { name: '四谷三丁目', line: '丸ノ内線', lineCode: 'M', lineColor: '#F62E36' },
  { name: '四ツ谷', line: '丸ノ内線', lineCode: 'M', lineColor: '#F62E36' },
  { name: '赤坂見附', line: '丸ノ内線', lineCode: 'M', lineColor: '#F62E36' },
  { name: '国会議事堂前', line: '丸ノ内線', lineCode: 'M', lineColor: '#F62E36' },
  { name: '霞ケ関', line: '丸ノ内線', lineCode: 'M', lineColor: '#F62E36' },
  { name: '銀座', line: '丸ノ内線', lineCode: 'M', lineColor: '#F62E36' },
  { name: '東京', line: '丸ノ内線', lineCode: 'M', lineColor: '#F62E36' },
  { name: '大手町', line: '丸ノ内線', lineCode: 'M', lineColor: '#F62E36' },
  { name: '淡路町', line: '丸ノ内線', lineCode: 'M', lineColor: '#F62E36' },
  { name: '御茶ノ水', line: '丸ノ内線', lineCode: 'M', lineColor: '#F62E36' },
  { name: '本郷三丁目', line: '丸ノ内線', lineCode: 'M', lineColor: '#F62E36' },
  { name: '後楽園', line: '丸ノ内線', lineCode: 'M', lineColor: '#F62E36' },
  { name: '茗荷谷', line: '丸ノ内線', lineCode: 'M', lineColor: '#F62E36' },
  { name: '新大塚', line: '丸ノ内線', lineCode: 'M', lineColor: '#F62E36' },
  { name: '池袋', line: '丸ノ内線', lineCode: 'M', lineColor: '#F62E36' },
  // 丸ノ内線 方南町支線
  { name: '方南町', line: '丸ノ内線', lineCode: 'Mb', lineColor: '#F62E36' },
  { name: '中野富士見町', line: '丸ノ内線', lineCode: 'Mb', lineColor: '#F62E36' },
  { name: '中野新橋', line: '丸ノ内線', lineCode: 'Mb', lineColor: '#F62E36' },

  // 日比谷線 (H) - シルバー
  { name: '中目黒', line: '日比谷線', lineCode: 'H', lineColor: '#B5B5AC' },
  { name: '恵比寿', line: '日比谷線', lineCode: 'H', lineColor: '#B5B5AC' },
  { name: '広尾', line: '日比谷線', lineCode: 'H', lineColor: '#B5B5AC' },
  { name: '六本木', line: '日比谷線', lineCode: 'H', lineColor: '#B5B5AC' },
  { name: '神谷町', line: '日比谷線', lineCode: 'H', lineColor: '#B5B5AC' },
  { name: '虎ノ門ヒルズ', line: '日比谷線', lineCode: 'H', lineColor: '#B5B5AC' },
  { name: '霞ケ関', line: '日比谷線', lineCode: 'H', lineColor: '#B5B5AC' },
  { name: '日比谷', line: '日比谷線', lineCode: 'H', lineColor: '#B5B5AC' },
  { name: '銀座', line: '日比谷線', lineCode: 'H', lineColor: '#B5B5AC' },
  { name: '東銀座', line: '日比谷線', lineCode: 'H', lineColor: '#B5B5AC' },
  { name: '築地', line: '日比谷線', lineCode: 'H', lineColor: '#B5B5AC' },
  { name: '八丁堀', line: '日比谷線', lineCode: 'H', lineColor: '#B5B5AC' },
  { name: '茅場町', line: '日比谷線', lineCode: 'H', lineColor: '#B5B5AC' },
  { name: '人形町', line: '日比谷線', lineCode: 'H', lineColor: '#B5B5AC' },
  { name: '小伝馬町', line: '日比谷線', lineCode: 'H', lineColor: '#B5B5AC' },
  { name: '秋葉原', line: '日比谷線', lineCode: 'H', lineColor: '#B5B5AC' },
  { name: '仲御徒町', line: '日比谷線', lineCode: 'H', lineColor: '#B5B5AC' },
  { name: '上野', line: '日比谷線', lineCode: 'H', lineColor: '#B5B5AC' },
  { name: '入谷', line: '日比谷線', lineCode: 'H', lineColor: '#B5B5AC' },
  { name: '三ノ輪', line: '日比谷線', lineCode: 'H', lineColor: '#B5B5AC' },
  { name: '南千住', line: '日比谷線', lineCode: 'H', lineColor: '#B5B5AC' },
  { name: '北千住', line: '日比谷線', lineCode: 'H', lineColor: '#B5B5AC' },

  // 東西線 (T) - スカイブルー
  { name: '中野', line: '東西線', lineCode: 'T', lineColor: '#009BBF' },
  { name: '落合', line: '東西線', lineCode: 'T', lineColor: '#009BBF' },
  { name: '高田馬場', line: '東西線', lineCode: 'T', lineColor: '#009BBF' },
  { name: '早稲田', line: '東西線', lineCode: 'T', lineColor: '#009BBF' },
  { name: '神楽坂', line: '東西線', lineCode: 'T', lineColor: '#009BBF' },
  { name: '飯田橋', line: '東西線', lineCode: 'T', lineColor: '#009BBF' },
  { name: '九段下', line: '東西線', lineCode: 'T', lineColor: '#009BBF' },
  { name: '竹橋', line: '東西線', lineCode: 'T', lineColor: '#009BBF' },
  { name: '大手町', line: '東西線', lineCode: 'T', lineColor: '#009BBF' },
  { name: '日本橋', line: '東西線', lineCode: 'T', lineColor: '#009BBF' },
  { name: '茅場町', line: '東西線', lineCode: 'T', lineColor: '#009BBF' },
  { name: '門前仲町', line: '東西線', lineCode: 'T', lineColor: '#009BBF' },
  { name: '木場', line: '東西線', lineCode: 'T', lineColor: '#009BBF' },
  { name: '東陽町', line: '東西線', lineCode: 'T', lineColor: '#009BBF' },
  { name: '南砂町', line: '東西線', lineCode: 'T', lineColor: '#009BBF' },
  { name: '西葛西', line: '東西線', lineCode: 'T', lineColor: '#009BBF' },
  { name: '葛西', line: '東西線', lineCode: 'T', lineColor: '#009BBF' },
  { name: '浦安', line: '東西線', lineCode: 'T', lineColor: '#009BBF' },
  { name: '南行徳', line: '東西線', lineCode: 'T', lineColor: '#009BBF' },
  { name: '行徳', line: '東西線', lineCode: 'T', lineColor: '#009BBF' },
  { name: '妙典', line: '東西線', lineCode: 'T', lineColor: '#009BBF' },
  { name: '原木中山', line: '東西線', lineCode: 'T', lineColor: '#009BBF' },
  { name: '西船橋', line: '東西線', lineCode: 'T', lineColor: '#009BBF' },

  // 千代田線 (C) - グリーン
  { name: '代々木上原', line: '千代田線', lineCode: 'C', lineColor: '#00BB85' },
  { name: '代々木公園', line: '千代田線', lineCode: 'C', lineColor: '#00BB85' },
  { name: '明治神宮前', line: '千代田線', lineCode: 'C', lineColor: '#00BB85' },
  { name: '表参道', line: '千代田線', lineCode: 'C', lineColor: '#00BB85' },
  { name: '乃木坂', line: '千代田線', lineCode: 'C', lineColor: '#00BB85' },
  { name: '赤坂', line: '千代田線', lineCode: 'C', lineColor: '#00BB85' },
  { name: '国会議事堂前', line: '千代田線', lineCode: 'C', lineColor: '#00BB85' },
  { name: '霞ケ関', line: '千代田線', lineCode: 'C', lineColor: '#00BB85' },
  { name: '日比谷', line: '千代田線', lineCode: 'C', lineColor: '#00BB85' },
  { name: '二重橋前', line: '千代田線', lineCode: 'C', lineColor: '#00BB85' },
  { name: '大手町', line: '千代田線', lineCode: 'C', lineColor: '#00BB85' },
  { name: '新御茶ノ水', line: '千代田線', lineCode: 'C', lineColor: '#00BB85' },
  { name: '湯島', line: '千代田線', lineCode: 'C', lineColor: '#00BB85' },
  { name: '根津', line: '千代田線', lineCode: 'C', lineColor: '#00BB85' },
  { name: '千駄木', line: '千代田線', lineCode: 'C', lineColor: '#00BB85' },
  { name: '西日暮里', line: '千代田線', lineCode: 'C', lineColor: '#00BB85' },
  { name: '町屋', line: '千代田線', lineCode: 'C', lineColor: '#00BB85' },
  { name: '北千住', line: '千代田線', lineCode: 'C', lineColor: '#00BB85' },
  { name: '綾瀬', line: '千代田線', lineCode: 'C', lineColor: '#00BB85' },
  { name: '北綾瀬', line: '千代田線', lineCode: 'C', lineColor: '#00BB85' },

  // 有楽町線 (Y) - ゴールド
  { name: '和光市', line: '有楽町線', lineCode: 'Y', lineColor: '#C1A470' },
  { name: '地下鉄成増', line: '有楽町線', lineCode: 'Y', lineColor: '#C1A470' },
  { name: '地下鉄赤塚', line: '有楽町線', lineCode: 'Y', lineColor: '#C1A470' },
  { name: '平和台', line: '有楽町線', lineCode: 'Y', lineColor: '#C1A470' },
  { name: '氷川台', line: '有楽町線', lineCode: 'Y', lineColor: '#C1A470' },
  { name: '小竹向原', line: '有楽町線', lineCode: 'Y', lineColor: '#C1A470' },
  { name: '千川', line: '有楽町線', lineCode: 'Y', lineColor: '#C1A470' },
  { name: '要町', line: '有楽町線', lineCode: 'Y', lineColor: '#C1A470' },
  { name: '池袋', line: '有楽町線', lineCode: 'Y', lineColor: '#C1A470' },
  { name: '東池袋', line: '有楽町線', lineCode: 'Y', lineColor: '#C1A470' },
  { name: '護国寺', line: '有楽町線', lineCode: 'Y', lineColor: '#C1A470' },
  { name: '江戸川橋', line: '有楽町線', lineCode: 'Y', lineColor: '#C1A470' },
  { name: '飯田橋', line: '有楽町線', lineCode: 'Y', lineColor: '#C1A470' },
  { name: '市ケ谷', line: '有楽町線', lineCode: 'Y', lineColor: '#C1A470' },
  { name: '麹町', line: '有楽町線', lineCode: 'Y', lineColor: '#C1A470' },
  { name: '永田町', line: '有楽町線', lineCode: 'Y', lineColor: '#C1A470' },
  { name: '桜田門', line: '有楽町線', lineCode: 'Y', lineColor: '#C1A470' },
  { name: '有楽町', line: '有楽町線', lineCode: 'Y', lineColor: '#C1A470' },
  { name: '銀座一丁目', line: '有楽町線', lineCode: 'Y', lineColor: '#C1A470' },
  { name: '新富町', line: '有楽町線', lineCode: 'Y', lineColor: '#C1A470' },
  { name: '月島', line: '有楽町線', lineCode: 'Y', lineColor: '#C1A470' },
  { name: '豊洲', line: '有楽町線', lineCode: 'Y', lineColor: '#C1A470' },
  { name: '辰巳', line: '有楽町線', lineCode: 'Y', lineColor: '#C1A470' },
  { name: '新木場', line: '有楽町線', lineCode: 'Y', lineColor: '#C1A470' },

  // 半蔵門線 (Z) - パープル
  { name: '渋谷', line: '半蔵門線', lineCode: 'Z', lineColor: '#8F76D6' },
  { name: '表参道', line: '半蔵門線', lineCode: 'Z', lineColor: '#8F76D6' },
  { name: '青山一丁目', line: '半蔵門線', lineCode: 'Z', lineColor: '#8F76D6' },
  { name: '永田町', line: '半蔵門線', lineCode: 'Z', lineColor: '#8F76D6' },
  { name: '半蔵門', line: '半蔵門線', lineCode: 'Z', lineColor: '#8F76D6' },
  { name: '九段下', line: '半蔵門線', lineCode: 'Z', lineColor: '#8F76D6' },
  { name: '神保町', line: '半蔵門線', lineCode: 'Z', lineColor: '#8F76D6' },
  { name: '大手町', line: '半蔵門線', lineCode: 'Z', lineColor: '#8F76D6' },
  { name: '三越前', line: '半蔵門線', lineCode: 'Z', lineColor: '#8F76D6' },
  { name: '水天宮前', line: '半蔵門線', lineCode: 'Z', lineColor: '#8F76D6' },
  { name: '清澄白河', line: '半蔵門線', lineCode: 'Z', lineColor: '#8F76D6' },
  { name: '住吉', line: '半蔵門線', lineCode: 'Z', lineColor: '#8F76D6' },
  { name: '錦糸町', line: '半蔵門線', lineCode: 'Z', lineColor: '#8F76D6' },
  { name: '押上', line: '半蔵門線', lineCode: 'Z', lineColor: '#8F76D6' },

  // 南北線 (N) - エメラルド
  { name: '目黒', line: '南北線', lineCode: 'N', lineColor: '#00AC9B' },
  { name: '白金台', line: '南北線', lineCode: 'N', lineColor: '#00AC9B' },
  { name: '白金高輪', line: '南北線', lineCode: 'N', lineColor: '#00AC9B' },
  { name: '麻布十番', line: '南北線', lineCode: 'N', lineColor: '#00AC9B' },
  { name: '六本木一丁目', line: '南北線', lineCode: 'N', lineColor: '#00AC9B' },
  { name: '溜池山王', line: '南北線', lineCode: 'N', lineColor: '#00AC9B' },
  { name: '永田町', line: '南北線', lineCode: 'N', lineColor: '#00AC9B' },
  { name: '四ツ谷', line: '南北線', lineCode: 'N', lineColor: '#00AC9B' },
  { name: '市ケ谷', line: '南北線', lineCode: 'N', lineColor: '#00AC9B' },
  { name: '飯田橋', line: '南北線', lineCode: 'N', lineColor: '#00AC9B' },
  { name: '後楽園', line: '南北線', lineCode: 'N', lineColor: '#00AC9B' },
  { name: '東大前', line: '南北線', lineCode: 'N', lineColor: '#00AC9B' },
  { name: '本駒込', line: '南北線', lineCode: 'N', lineColor: '#00AC9B' },
  { name: '駒込', line: '南北線', lineCode: 'N', lineColor: '#00AC9B' },
  { name: '西ケ原', line: '南北線', lineCode: 'N', lineColor: '#00AC9B' },
  { name: '王子', line: '南北線', lineCode: 'N', lineColor: '#00AC9B' },
  { name: '王子神谷', line: '南北線', lineCode: 'N', lineColor: '#00AC9B' },
  { name: '志茂', line: '南北線', lineCode: 'N', lineColor: '#00AC9B' },
  { name: '赤羽岩淵', line: '南北線', lineCode: 'N', lineColor: '#00AC9B' },

  // 副都心線 (F) - ブラウン
  { name: '和光市', line: '副都心線', lineCode: 'F', lineColor: '#9C5E31' },
  { name: '地下鉄成増', line: '副都心線', lineCode: 'F', lineColor: '#9C5E31' },
  { name: '地下鉄赤塚', line: '副都心線', lineCode: 'F', lineColor: '#9C5E31' },
  { name: '平和台', line: '副都心線', lineCode: 'F', lineColor: '#9C5E31' },
  { name: '氷川台', line: '副都心線', lineCode: 'F', lineColor: '#9C5E31' },
  { name: '小竹向原', line: '副都心線', lineCode: 'F', lineColor: '#9C5E31' },
  { name: '千川', line: '副都心線', lineCode: 'F', lineColor: '#9C5E31' },
  { name: '要町', line: '副都心線', lineCode: 'F', lineColor: '#9C5E31' },
  { name: '池袋', line: '副都心線', lineCode: 'F', lineColor: '#9C5E31' },
  { name: '雑司が谷', line: '副都心線', lineCode: 'F', lineColor: '#9C5E31' },
  { name: '西早稲田', line: '副都心線', lineCode: 'F', lineColor: '#9C5E31' },
  { name: '東新宿', line: '副都心線', lineCode: 'F', lineColor: '#9C5E31' },
  { name: '新宿三丁目', line: '副都心線', lineCode: 'F', lineColor: '#9C5E31' },
  { name: '北参道', line: '副都心線', lineCode: 'F', lineColor: '#9C5E31' },
  { name: '明治神宮前', line: '副都心線', lineCode: 'F', lineColor: '#9C5E31' },
  { name: '渋谷', line: '副都心線', lineCode: 'F', lineColor: '#9C5E31' },
]

export function getRandomStation(): Station {
  const index = Math.floor(Math.random() * stations.length)
  return stations[index]
}

export function getStationsByLine(lineName: string): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const station of stations) {
    if (station.line === lineName && !seen.has(station.name)) {
      seen.add(station.name)
      result.push(station.name)
    }
  }
  return result
}
