(function() {
  // HLSがサポートされているか確認
  if (!Hls.isSupported()) {
    return;
  }

  function initHls(video) {
    if (video.dataset.hlsApplied) return;

    let src = video.src || video.currentSrc;
    let type = video.getAttribute('type');
    let isHls = false;

    // 子要素の source タグをチェック
    const sourceTags = video.querySelectorAll('source');
    for (const sourceTag of sourceTags) {
      const sSrc = sourceTag.src;
      const sType = sourceTag.getAttribute('type');
      
      if (checkHls(sSrc, sType)) {
        src = sSrc;
        isHls = true;
        break;
      }
    }

    // videoタグ自体の属性をチェック（まだ判定できていない場合）
    if (!isHls && checkHls(src, type)) {
      isHls = true;
    }

    function checkHls(url, mimeType) {
      if (!url) return false;
      if (url.startsWith('blob:')) return false;
      
      return url.toLowerCase().includes('.m3u8') || 
             url.includes('m3u8') || 
             (url.includes('/video/enc/') && url.length > 100) ||
             mimeType === 'application/vnd.apple.mpegurl';
    }

    if (isHls && src) {
      console.log('HLS Player: HLS detected, applying hls.js to:', src);
      
      // ブラウザがHLSを解釈できずに投げるエラーを回避するため、要素をリセットする
      video.pause();
      video.removeAttribute('src'); // src属性を削除
      video.removeAttribute('type'); // type属性を削除
      
      // 子要素の source タグも無効化する
      const sources = video.querySelectorAll('source');
      sources.forEach(s => {
        s.removeAttribute('src');
        s.removeAttribute('type');
      });

      video.load(); // 進行中の読み込みを強制停止
      
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
          } else if (node.nodeName === 'SOURCE' && node.parentElement?.nodeName === 'VIDEO') {
            initHls(node.parentElement);
          } else if (node.querySelectorAll) {
            const videos = node.querySelectorAll('video');
            videos.forEach(initHls);
          }
        });
      } else if (mutation.type === 'attributes') {
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
    attributeFilter: ['src', 'type']
  });

})();
