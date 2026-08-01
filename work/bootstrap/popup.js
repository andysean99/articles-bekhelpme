// 燈塔文摘 popup 系統 — 公開站版本
//
// 移植自 fu-chin/digest.html（japan-art-digest 原型）。與原型有兩處**故意的**差異，
// 兩處都不可以「修回原樣」：
//
//  1. 原型的連結是 <a class="ent" data-url="…">，刻意不放 href，因為它的目標宿主是
//     claude.ai Artifact 檢視器（會攔截 href 彈出「Open external link」）。
//     本頁是公開、被索引的網頁，**href 就是 GEO 引用圖譜本身**。因此連結一律寫成
//         <a class="ent" href="URL" data-url="URL">
//     href 與 data-url 字串必須完全相同。下面用 preventDefault 攔下導航改開 popup。
//
//  2. 原型手動處理 Enter 鍵並手動設 tabindex / role="link"，因為沒有 href 的 <a>
//     不可聚焦、也沒有隱含的 link role。真的 <a href> 兩者都由瀏覽器免費提供，
//     而且瀏覽器會把 Enter 自己轉成 click 事件。**保留原型的 Enter handler 會讓
//     openModal 觸發兩次、frame.src 被設兩次。**所以那段已移除，不是漏抄。
(function(){
  var backdrop = document.getElementById('modalBackdrop');
  var urlInput = document.getElementById('modalUrl');
  var btnCopy  = document.getElementById('btnCopy');
  var btnOpen  = document.getElementById('btnOpen');
  var btnClose = document.getElementById('btnClose');
  var frame    = document.getElementById('modalFrame');
  var copyTimer = null;
  var frameBlocked = false;
  var linkCard = document.getElementById('linkCard');
  var lcHost = document.getElementById('lcHost');
  var lcTitle = document.getElementById('lcTitle');
  var lcDesc = document.getElementById('lcDesc');
  var stageHint = document.querySelector('.stage-hint');
  var stageInner = document.querySelector('.stage-inner');
  var btnCardView = document.getElementById('btnCardView');
  var HINT_IFRAME = '多數網站不允許被內嵌預覽——若下方空白或出現錯誤頁，請改用上方「複製網址」或「開新分頁 ↗」。';
  var HINT_CARD = '嘗試載入原網頁中——若該網站拒絕被內嵌，會停留在導覽卡；「開新分頁 ↗」可直達原文。';
  var HINT_NOEMBED = '此閱讀環境不支援內嵌網頁預覽——「複製網址」可分享，「開新分頁 ↗」直達原文。';
  var HINT_SHOT = '導覽卡＋來源截圖——點「看網頁」看截圖，點截圖或「開新分頁 ↗」直達原文。';
  var HINT_BLOCKED = '該網站不允許被內嵌預覽——導覽卡說明來源重點，「開新分頁 ↗」直達原文。';
  var HINT_UNVERIFIED = '此來源尚未驗證能否內嵌——導覽卡說明重點，「開新分頁 ↗」直達原文。';
  // 憲章 C-09：內嵌預覽只在自家網域或本機測試時嘗試。其他宿主環境對外部網址設 iframe src
  // 會被攔截成「Open external link」確認視窗，所以一律停留在導覽卡。此正規表示式不得放寬。
  var canEmbed = /(^|\.)bekhelpme\.com$|^localhost$|^127\.|^$/.test(location.hostname);
  var cards = {};
  try{ cards = JSON.parse(document.getElementById('linkCards').textContent); }catch(e){}
  var shots = {};
  try{ shots = JSON.parse(document.getElementById('previewShots').textContent); }catch(e){}
  var noframe = [];
  try{ noframe = JSON.parse(document.getElementById('noframeHosts').textContent); }catch(e){}
  var frameOk = [];
  try{ frameOk = JSON.parse(document.getElementById('frameOkHosts').textContent); }catch(e){}
  var lcShot = document.getElementById('lcShot');
  var lcShotImg = document.getElementById('lcShotImg');
  var pdfObject = null;

  function hostOf(url){
    try{ return new URL(url).hostname.replace(/^www\./,''); }catch(e){ return url.split('/')[2] || url; }
  }
  function removePdf(){
    if(pdfObject){ pdfObject.remove(); pdfObject = null; }
  }
  function openModal(url){
    urlInput.value = url;
    btnOpen.href = url;
    frameBlocked = false;
    frame.classList.remove('loaded');
    frame.removeAttribute('src');
    var card = cards[url];
    stageInner.classList.remove('show-frame');
    btnCardView.hidden = true;
    if(card){
      // 有導覽卡：卡片為主畫面；原網頁在背景嘗試載入，載好後出現按鈕由使用者手動切換
      stageInner.classList.add('has-card');
      lcHost.textContent = hostOf(url);
      lcTitle.textContent = card.t;
      lcDesc.textContent = card.d;
      linkCard.classList.add('show');
      stageHint.textContent = HINT_CARD;
    } else {
      // 無卡（來源庫條目）：直接嘗試 iframe
      stageInner.classList.remove('has-card');
      linkCard.classList.remove('show');
      stageHint.textContent = HINT_IFRAME;
    }
    stageInner.classList.remove('has-shot');
    lcShot.hidden = true;
    removePdf();
    var shot = shots[url];
    var isPdf = /\.pdf($|[?#])/i.test(url) || /arxiv\.org\/pdf\//i.test(url);
    if(shot){
      // 截圖預覽取代活頁內嵌：永遠顯示得出來，不會被對方網站拒絕
      stageInner.classList.add('has-shot');
      lcShot.hidden = false;
      lcShot.href = url;
      lcShotImg.src = shot;
      btnCardView.hidden = false;
      setCardBtn();
      stageHint.textContent = HINT_SHOT;
    } else if(!canEmbed){
      stageHint.textContent = HINT_NOEMBED;
    } else if(noframe.indexOf(hostOf(url)) !== -1){
      // 已知拒絕內嵌（X-Frame-Options／CSP）：不嘗試，避免露出瀏覽器錯誤頁
      stageHint.textContent = HINT_BLOCKED;
    } else if(isPdf){
      // PDF 不能用 sandboxed iframe（Chrome 內建檢視器拒跑）——改用 <object>
      pdfObject = document.createElement('object');
      pdfObject.type = 'application/pdf';
      pdfObject.className = 'pdf-object';
      pdfObject.data = url;
      pdfObject.addEventListener('load', function(){
        if(pdfObject && backdrop.classList.contains('open')){
          pdfObject.classList.add('loaded');
          if(stageInner.classList.contains('has-card')){ btnCardView.hidden = false; setCardBtn(); }
        }
      });
      stageInner.appendChild(pdfObject);
    } else if(frameOk.indexOf(hostOf(url)) !== -1){
      // 白名單制：只有 header 探測驗證過允許內嵌的網站才嘗試即時預覽
      frame.src = url;
    } else {
      // 未驗證來源一律停在導覽卡——寧可少一個活預覽，不露一次錯誤頁
      stageHint.textContent = HINT_UNVERIFIED;
    }
    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    btnClose.focus();
  }
  function closeModal(){
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden','true');
    frame.classList.remove('loaded');
    frame.removeAttribute('src');
    stageInner.classList.remove('show-frame');
    stageInner.classList.remove('has-card');
    btnCardView.hidden = true;
    stageInner.classList.remove('has-shot');
    lcShot.hidden = true;
    lcShotImg.removeAttribute('src');
    removePdf();
    document.body.style.overflow = '';
    resetCopy();
  }
  function resetCopy(){
    if(copyTimer){ clearTimeout(copyTimer); copyTimer = null; }
    btnCopy.textContent = '複製網址';
    btnCopy.classList.remove('copied');
  }
  function copyUrl(){
    var url = urlInput.value;
    function ok(){
      btnCopy.textContent = '已複製 ✓';
      btnCopy.classList.add('copied');
      copyTimer = setTimeout(resetCopy, 1800);
    }
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(url).then(ok).catch(function(){ fallbackCopy(url, ok); });
    } else {
      fallbackCopy(url, ok);
    }
  }
  function fallbackCopy(text, done){
    urlInput.focus();
    urlInput.select();
    try{ document.execCommand('copy'); done(); }catch(e){}
    urlInput.setSelectionRange(0,0);
    urlInput.blur();
  }

  // iframe 僅在真正載入成功後顯示；被 CSP／X-Frame-Options 擋下時維持隱藏，露出底層提示。
  // 已知限制（照原型保留）：大型媒體用 X-Frame-Options 拒絕內嵌 → 停在導覽卡（設計行為）；
  // 少數網站會「假成功」——load 事件有觸發但頁面偵測到被 iframe 就自行清空 → 空白，
  // 唯一路徑是開新分頁，提示文案已寫明。
  function setCardBtn(){
    btnCardView.textContent = stageInner.classList.contains('show-frame') ? '看導覽卡' : '看網頁';
  }
  btnCardView.addEventListener('click', function(){
    stageInner.classList.toggle('show-frame');
    setCardBtn();
    stageHint.textContent = stageInner.classList.contains('show-frame')
      ? '原網頁預覽中。若畫面空白，代表該網站阻擋被內嵌顯示——點「看導覽卡」返回，或「開新分頁 ↗」看原文。'
      : '原網頁已就緒——點上方「看網頁」可切換預覽；若顯示異常，「開新分頁 ↗」直達原文。';
  });
  frame.addEventListener('load', function(){
    if(frame.getAttribute('src') && backdrop.classList.contains('open') && !frameBlocked){
      frame.classList.add('loaded');
      if(stageInner.classList.contains('has-card')){
        btnCardView.hidden = false;
        setCardBtn();
        stageHint.textContent = '原網頁已就緒——點上方「看網頁」可切換預覽；若顯示異常，「開新分頁 ↗」直達原文。';
      }
    }
  });
  document.addEventListener('securitypolicyviolation', function(){
    frameBlocked = true;
    frame.classList.remove('loaded');
  });

  // event delegation：所有 .ent 連結一律開 popup，不離開視窗。
  // 選擇器同時要求 href 與 data-url，這樣少寫任一個屬性的連結會「安靜地不開 popup」，
  // 在 Playwright 驗證時立刻看得出來，而不是默默退化成一般外連。
  document.addEventListener('click', function(ev){
    var a = ev.target && ev.target.closest ? ev.target.closest('a.ent[href][data-url]') : null;
    if(a){
      ev.preventDefault();
      ev.stopPropagation();
      openModal(a.getAttribute('data-url'));
    }
  });
  // 注意：這裡沒有 Enter 鍵 handler，這是刻意的。見檔頭第 2 點。

  btnCopy.addEventListener('click', copyUrl);
  btnClose.addEventListener('click', closeModal);
  backdrop.addEventListener('click', function(ev){
    if(ev.target === backdrop) closeModal();
  });
  document.addEventListener('keydown', function(ev){
    if(ev.key === 'Escape' && backdrop.classList.contains('open')) closeModal();
  });
})();
