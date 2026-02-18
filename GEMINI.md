# HLS Player for Firefox - 開発ガイドライン

Firefox ブラウザで HLS (.m3u8) 形式のビデオをネイティブのように再生可能にするための WebExtension (Manifest V3) プロジェクトです。

## プロジェクトの目的
Firefox は標準で HLS 再生をサポートしていませんが、本拡張機能は [hls.js](https://github.com/video-dev/hls.js/) を各ページに注入することで、標準の `<video>` タグで HLS コンテンツを表示・再生できるようにします。

## 主要技術スタック
- **JavaScript (Vanilla JS)**: 拡張機能のメインロジック。
- **hls.js**: HLS 再生エンジンのコアライブラリ。
- **WebExtension API (Manifest V3)**: ブラウザ拡張機能フレームワーク。

## アーキテクチャと動作原理
1.  **スクリプトの注入**: `manifest.json` により、全ての URL に対して `hls.min.js` と `content.js` を注入します。
2.  **動的要素検知**: `MutationObserver` を使用して、DOM 内の `<video>` 要素および `<source>` 要素を監視します。これにより、SPA 等で後から追加された要素にも対応します。
3.  **HLS 判定ロジック**:
    - `src` 属性に `.m3u8` が含まれている。
    - `type` 属性が `application/vnd.apple.mpegurl` または `application/x-mpegurl` である。
4.  **hls.js の適用**: 
    - Firefox のネイティブ再生エラーを回避するため、検知した要素の `src` および `type` 属性を一度クリアします。
    - `hls.js` インスタンスを作成し、検知したソースをロードしてメディア要素にアタッチします。

## 開発と実行
### デバッグ方法
1.  Firefox で `about:debugging#/runtime/this-firefox` を開きます。
2.  「一時的なアドオンを読み込む (Load Temporary Add-on...)」をクリックします。
3.  本プロジェクトの `manifest.json` を選択します。

## 主要ファイル構成
- `manifest.json`: 拡張機能の設定ファイル。
- `content.js`: HLS 検知と `hls.js` 適用のメインロジック。
- `hls.min.js`: `hls.js` ライブラリ本体。

## 今後の課題 (TODO)
- **設定画面 (Options Page)**: 自動再生の有無やデバッグログの切り替え。
- **ステータス表示**: ツールバーアイコンで現在のページでの HLS 有効化状態を表示。
- **互換性の向上**: 特殊なストリーミング構成を持つサイトへの対応。
