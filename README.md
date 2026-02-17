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

## 使用しているライブラリ

- [hls.js](https://github.com/video-dev/hls.js/) - Apache License 2.0

## ライセンス

MIT License
