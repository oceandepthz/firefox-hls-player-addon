(function() {
  // HLS (hls.js) がブラウザで動作可能か確認
  if (!Hls.isSupported()) {
    return;
  }

  /**
   * 与えられた URL と MIME タイプが HLS コンテンツであるか判定する
   * @param {string} url - 動画のソース URL
   * @param {string} type - video 要素や source 要素の type 属性
   * @returns {boolean} - HLS と判定された場合は true
   */
  function isHls(url, type) {
    if (!url) return false;
    
    // Blob URL は hls.js で処理済みの可能性があるため除外
    if (url.startsWith('blob:')) return false;

    const lowerUrl = url.toLowerCase();
    const isM3u8 = lowerUrl.includes('.m3u8') || lowerUrl.includes('m3u8');
    const isHlsMimeType = type === 'application/vnd.apple.mpegurl' || type === 'application/x-mpegurl';
    
    // Nitter 等で使用されるエンコードされたパスのパターン
    const isEncodedHls = lowerUrl.includes('/video/enc/') && url.length > 50;

    return isM3u8 || isHlsMimeType || isEncodedHls;
  }

  /**
   * ビデオ要素から HLS ソース URL を探し出す
   * @param {HTMLVideoElement} video 
   * @returns {string|null} - 見つかったソース URL
   */
  function findHlsSource(video) {
    // 1. video 要素自体の src 属性を確認
    if (isHls(video.src, video.getAttribute('type'))) {
      return video.src;
    }

    // 2. 子要素の <source> タグを確認
    const sources = video.querySelectorAll('source');
    for (const source of sources) {
      if (isHls(source.src, source.getAttribute('type'))) {
        return source.src;
      }
    }

    return null;
  }

  /**
   * ビデオ要素に対して hls.js を適用し、再生の初期化を行う
   * @param {HTMLVideoElement} video 
   */
  function initializeHls(video) {
    // 既に適用済みの場合はスキップ
    if (video.dataset.hlsApplied === 'true') {
      return;
    }

    const hlsSource = findHlsSource(video);
    if (!hlsSource) {
      return;
    }

    console.log('[HLS Player] HLS コンテンツを検知しました:', hlsSource);

    // Firefox のネイティブ再生エラーを防止するため、現在の読み込みを停止してソースをクリア
    video.pause();
    
    // 全ての source 要素と video 要素の src/type を一時的に無効化
    const clearSources = (el) => {
      el.removeAttribute('src');
      el.removeAttribute('type');
    };
    
    clearSources(video);
    video.querySelectorAll('source').forEach(clearSources);
    
    // 再読み込みを強制してバッファをクリア
    video.load();

    // hls.js インスタンスの作成
    const hls = new Hls({
      debug: false,
      enableWorker: true
    });

    hls.loadSource(hlsSource);
    hls.attachMedia(video);

    // 適用済みフラグをセット
    video.dataset.hlsApplied = 'true';

    // エラーハンドリング
    hls.on(Hls.Events.ERROR, function(event, data) {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.error('[HLS Player] 致命的なネットワークエラーが発生しました。リカバリを試みます。');
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.error('[HLS Player] 致命的なメディアエラーが発生しました。リカバリを試みます。');
            hls.recoverMediaError();
            break;
          default:
            console.error('[HLS Player] 回復不能なエラーが発生しました。');
            hls.destroy();
            break;
        }
      }
    });

    // メモリリーク防止のため、要素が破棄されたら hls インスタンスも破棄
    // (簡易的な対応。複雑な SPA では MutationObserver での監視が必要)
  }

  /**
   * ページ内の全てのビデオ要素をスキャンして初期化
   */
  function scanAndInit() {
    const videos = document.querySelectorAll('video');
    videos.forEach(initializeHls);
  }

  // 1. ページロード時の初期スキャン
  scanAndInit();

  // 2. DOM の変化を監視し、後から追加されたビデオ要素に対応 (MutationObserver)
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      // 要素の追加を監視
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'VIDEO') {
            initializeHls(node);
          } else if (node.querySelectorAll) {
            const videos = node.querySelectorAll('video');
            videos.forEach(initializeHls);
          }
        });
      }
      // 属性の変化を監視 (src や type が後から書き換わるケースに対応)
      else if (mutation.type === 'attributes') {
        const target = mutation.target;
        if (target.nodeName === 'VIDEO') {
          initializeHls(target);
        } else if (target.nodeName === 'SOURCE' && target.parentElement?.nodeName === 'VIDEO') {
          initializeHls(target.parentElement);
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src', 'type']
  });

})();
