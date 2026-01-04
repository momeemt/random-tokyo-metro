# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # 開発サーバー起動 (http://localhost:5173)
npm run build    # TypeScriptコンパイル + プロダクションビルド
npm run preview  # ビルド結果のプレビュー
```

## Architecture

シンプルなVanilla TypeScript + Viteのwebアプリ。

```
src/
├── main.ts       # エントリーポイント、DOM操作、イベントハンドラ
├── stations.ts   # 東京メトロ9路線の全駅データと getRandomStation()
├── route.ts      # 最短経路計算（BFS）、路線グラフ構築
├── db.ts         # IndexedDB操作 (ゲーム・履歴の保存・取得)
└── style.css     # スタイル
```

### データフロー

1. ゲーム開始時に出発駅を入力、`createGame()` でゲームレコード作成
2. `getRandomStation()` で駅をランダム選択
3. `findShortestRoute()` で最短経路を計算
4. `addHistory()` でIndexedDBに履歴保存（経路含む）
5. 選ばれた駅が次回の出発駅になる
6. ゲーム終了まで繰り返し

### IndexedDBスキーマ

- **games**: `{ id, name, createdAt, startStation }` - ゲーム情報
- **history**: `{ id, gameId, timestamp, fromStation, toStation, lineName, lineCode, route }` - 移動履歴

### デプロイ

- mainブランチへのpushで自動的にGitHub Pagesにデプロイ
- URL: `https://<user>.github.io/random-tokyo-metro/`
