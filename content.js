(function() {
  // HLSがサポートされているか確認
  if (!Hls.isSupported()) {
    return;
  }

  function initHls(video) {
    if (video.dataset.hlsApplied) return;
    
    // 実際のソースURLを取得（video.src または video.currentSrc または 子要素の source）
    let src = video.src || video.currentSrc;
    if (!src || src.startsWith('blob:')) {
      const sourceTag = video.querySelector('source');
      if (sourceTag && sourceTag.src) {
        src = sourceTag.src;
      }
    }
    
    if (!src || src.startsWith('blob:')) return;

    // HLS形式であるかの判定
    const isHls = src.toLowerCase().includes('.m3u8') || 
                  src.includes('m3u8') || 
                  (src.includes('/video/enc/') && src.length > 100);

    if (isHls) {
      console.log('HLS Player: HLS detected, applying hls.js to:', src);
      
      // ブラウザがHLSを解釈できずに投げるエラーを回避するため、要素をリセットする
      video.pause();
      video.removeAttribute('src'); // src属性を削除
      video.load(); // 進行中の読み込みを強制停止
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
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'VIDEO') {
            initHls(node);
          } else if (node.querySelectorAll) {
            const videos = node.querySelectorAll('video');
            videos.forEach(initHls);
          }
        });
      } else if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
        const target = mutation.target;
        if (target.nodeName === 'VIDEO') {
          initHls(target);
        } else if (target.nodeName === 'SOURCE' && target.parentElement?.nodeName === 'VIDEO') {
          initHls(target.parentElement);
        }
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
