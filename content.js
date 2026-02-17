(function() {
  // HLSがサポートされているか確認
  if (!Hls.isSupported()) {
    return;
  }

  function initHls(video) {
    if (video.dataset.hlsApplied) return;
    
    const src = video.src || video.currentSrc;
    if (!src) return;

    // HLS形式であるかの判定
    // 1. 拡張子が .m3u8
    // 2. URLに m3u8 が含まれている（エンコードされている場合も考慮）
    // 3. ユーザーの例にある Nitter のエンコードパターン
    const isHls = src.toLowerCase().includes('.m3u8') || 
                  src.includes('m3u8') || 
                  (src.includes('/video/enc/') && src.length > 100);

    if (isHls) {
      console.log('HLS Player: HLS detected, applying hls.js to:', src);
      
      // ブラウザがMP4として再生しようとするのを止める
      video.pause();
      video.removeAttribute('type');
      
      const hls = new Hls({
        debug: false
      });

      hls.loadSource(src);
      hls.attachMedia(video);
      
      video.dataset.hlsApplied = 'true';
      
      hls.on(Hls.Events.MANIFEST_PARSED, function() {
        // 必要に応じて自動再生などの処理
      });

      hls.on(Hls.Events.ERROR, function(event, data) {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('HLS Player: Fatal network error encountered, try to recover');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('HLS Player: Fatal media error encountered, try to recover');
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });
    }
  }

  // 既存のvideoタグを処理
  const videos = document.querySelectorAll('video');
  videos.forEach(initHls);

  // 動的に追加されるvideoタグを監視
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeName === 'VIDEO') {
          initHls(node);
        } else if (node.querySelectorAll) {
          const videos = node.querySelectorAll('video');
          videos.forEach(initHls);
        }
      });
      
      // src属性が変更された場合も再チェック
      if (mutation.type === 'attributes' && mutation.attributeName === 'src' && mutation.target.nodeName === 'VIDEO') {
        initHls(mutation.target);
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src']
  });

})();
