# HLS Player for Firefox

Firefox上でHLS (.m3u8) ビデオを直接再生可能にするWebExtensionです。

## 概要

通常、FirefoxではHLS形式の動画を再生するために外部プレイヤーが必要ですが、このアドオンをインストールすることで、ブラウザ上で直接再生できるようになります。

## インストール方法 (開発者モード)

1. `git clone` または ZIPでこのリポジトリをダウンロードします。
2. Firefoxを開き、アドレスバーに `about:debugging` と入力します。
3. 「このFirefox」を選択します。
4. 「一時的なアドオンを読み込む...」ボタンをクリックします。
5. 本ディレクトリ内の `manifest.json` を選択します。

## 特徴

- **幅広いサイトに対応**: 標準的な `.m3u8` ファイルだけでなく、Nitterなどの特殊なエンコード済みURLにも対応しています。
- **動的な読み込みに対応**: `MutationObserver` を使用し、ページ遷移なしで追加された動画要素も自動的に検出します。
- **Firefox最適化**: FirefoxがHLSを解釈できずに発生する `DOMException` を回避する初期化プロセスを実装しています。

## 更新履歴

- **v1.1**: 
    - ブラウザによるメディア取得中断エラー (`DOMException`) の解消。
    - `<source>` タグを使用しているビデオ要素への対応。
    - ソースURLが動的に変更された際の検知ロジックを改善。

## 使用しているライブラリ

- [hls.js](https://github.com/video-dev/hls.js/) - Apache License 2.0

## ライセンス

MIT License
