# HLS Player for Firefox

Firefox ブラウザ上で HLS (.m3u8) 形式のビデオを直接再生可能にするための拡張機能です。

## 概要

Firefox は標準では HLS (.m3u8) 形式のネイティブ再生をサポートしていませんが、このアドオンは [hls.js](https://github.com/video-dev/hls.js/) ライブラリを使用して、ブラウザ標準の `<video>` タグで HLS コンテンツを再生できるようにします。

## インストール方法 (一時的な読み込み)

現在は開発者向けの配布形式となっています。以下の手順で Firefox に読み込むことができます。

1. このリポジトリをダウンロードまたはクローンします。
2. Firefox のアドレスバーに `about:debugging#/runtime/this-firefox` を入力します。
3. 「一時的なアドオンを読み込む (Load Temporary Add-on...)」ボタンをクリックします。
4. プロジェクトディレクトリ内の `manifest.json` を選択してロードします。

## 主な機能

- **自動 HLS 検知**: ページ内の `<video>` および `<source>` タグをスキャンし、`.m3u8` 拡張子や HLS の MIME タイプを自動的に判別します。
- **動的コンテンツへの対応**: `MutationObserver` を利用し、SPA（Single Page Application）などで後から追加された動画要素にも即座に対応します。
- **Firefox への最適化**: Firefox が非サポート形式に対して出すエラーを回避し、`hls.js` によるスムーズな再生への切り替えを行います。

## 技術仕様

- **フレームワーク**: WebExtension Manifest V3
- **再生エンジン**: [hls.js](https://github.com/video-dev/hls.js/)
- **対応判定**:
  - URL に `.m3u8` を含む場合
  - `type` 属性が `application/vnd.apple.mpegurl` または `application/x-mpegurl` の場合

## ライセンス

- このプロジェクト自体は MIT License です。
- 使用しているライブラリ [hls.js](https://github.com/video-dev/hls.js/) は Apache License 2.0 で提供されています。
