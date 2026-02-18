# HLS Player for Firefox - プロジェクト概要

Firefox ブラウザ上で HLS (.m3u8) 形式のビデオを直接再生可能にするための WebExtension (Manifest V3) プロジェクトです。

## プロジェクトの目的
通常、Firefox は HLS 形式のネイティブ再生をサポートしていませんが、このアドオンは [hls.js](https://github.com/video-dev/hls.js/) ライブラリを各ページに注入することで、ブラウザ標準の `<video>` タグで HLS コンテンツを表示できるようにします。

## 主要技術スタック
- **JavaScript (Vanilla JS)**: 拡張機能のロジック実装。
- **hls.js**: HLS 再生エンジンのコアライブラリ。
- **WebExtension API (Manifest V3)**: ブラウザ拡張機能のフレームワーク。

## アーキテクチャと動作原理
1.  **コンテンツスクリプトの注入**: `manifest.json` の設定により、すべての URL (`<all_urls>`) に対して `hls.min.js` と `content.js` が読み込まれます。
2.  **ビデオ要素の検知**: `content.js` 内で `MutationObserver` を使用し、DOM 内に存在する既存の、あるいは動的に追加された `<video>` 要素およびその子要素の `<source>` タグを監視します。
3.  **HLS 判定**: 以下の条件のいずれかに一致する場合、HLS コンテンツとして判定します。
    - `video` または `source` 要素の `src` 属性に `.m3u8` 文字列が含まれている。
    - `src` が特定のエンコードパターン（Nitter 等で使用される形式）に一致する。
    - `video` または `source` 要素の `type` 属性が `application/vnd.apple.mpegurl` である。
4.  **hls.js の適用**: 検知された `video` 要素に対して `hls.js` インスタンスを生成し、最適なソースをロードしてメディアをアタッチします。

## 開発と実行
### インストール・デバッグ方法
このプロジェクトにはビルドステップは必要ありません。
1.  Firefox のアドレスバーに `about:debugging` を入力します。
2.  「この Firefox (This Firefox)」を選択します。
3.  「一時的なアドオンを読み込む (Load Temporary Add-on...)」をクリックします。
4.  プロジェクトディレクトリ内の `manifest.json` を選択してロードします。

### 主要なファイル
- `manifest.json`: 拡張機能のメタデータ、権限、およびスクリプト注入設定。
- `content.js`: ページの DOM を監視し、HLS 再生を初期化するメインロジック。
- `hls.min.js`: `hls.js` ライブラリの最小化済みソース。
- `README.md`: ユーザー向けの基本的な説明とインストール手順。

## 開発上の規約と注意点
- **依存関係**: 外部ライブラリを追加する場合は、原則として `manifest.json` に含めてローカルファイルとして読み込むようにしてください。
- **DOM 監視**: 多くのモダンなウェブサイトは SPA であるため、`MutationObserver` による動的な要素検知が不可欠です。`content.js` の監視ロジックを修正する際は、パフォーマンスへの影響に注意してください。
- **エラーハンドリング**: ネットワークエラーやメディアエラーが発生した場合のリカバリ処理は `content.js` 内の `hls.on(Hls.Events.ERROR, ...)` で定義されています。

## 今後の課題（TODO）
- 設定画面（Options Page）の追加（自動再生のオン/オフなど）。
- 特定のサイトでの互換性向上（Nitter 以外の特殊な URL パターンへの対応など）。
- ツールバーアイコンによるステータス表示機能。
