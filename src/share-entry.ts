import { decodeShareData, renderSharedGame } from './share-utils'
import './style.css'

function init(): void {
  const container = document.getElementById('shared-section')!

  // /share?DATA形式: searchの先頭の?を除いた部分がデータ
  const raw = location.search.slice(1)
  if (!raw) {
    container.innerHTML = '<p class="share-error">シェアデータがありません</p>'
    return
  }

  // data=VALUE形式もサポート
  let encoded = raw
  if (raw.startsWith('data=')) {
    encoded = raw.slice(5)
  }

  const data = decodeShareData(encoded)
  if (!data) {
    container.innerHTML = '<p class="share-error">シェアデータの読み込みに失敗しました</p>'
    return
  }

  container.innerHTML = renderSharedGame(data)
}

init()
