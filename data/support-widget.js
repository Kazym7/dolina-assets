(function(){
function build(){
  if(document.getElementById('dolina-support-btn')||!document.body)return;
  var style=document.createElement('style');
  style.id='dolina-support-style';
  style.textContent="#dolina-support-btn{position:fixed;right:20px;bottom:20px;z-index:999998;width:56px;height:56px;border-radius:50%;background:#D7262A;border:0;box-shadow:0 4px 16px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .2s ease,box-shadow .2s ease}#dolina-support-btn:hover{transform:scale(1.08);box-shadow:0 6px 20px rgba(0,0,0,.3)}#dolina-support-btn svg{width:26px;height:26px}@media(max-width:640px){#dolina-support-btn{right:14px;bottom:14px;width:50px;height:50px}}#dolina-support-overlay{position:fixed;inset:0;z-index:999999;display:flex;align-items:flex-end;justify-content:flex-end;background:rgba(16,17,20,0);opacity:0;pointer-events:none;transition:opacity .25s ease,background-color .25s ease}#dolina-support-overlay.on{opacity:1;pointer-events:auto;background:rgba(16,17,20,.4)}#dolina-support-panel{width:100%;max-width:380px;height:min(70vh,640px);margin:0 20px 90px;background:#fff;border-radius:20px;box-shadow:0 24px 60px rgba(0,0,0,.28);display:flex;flex-direction:column;overflow:hidden;transform:translateY(24px) scale(.98);opacity:0;transition:transform .28s cubic-bezier(.2,.9,.3,1),opacity .28s ease}#dolina-support-overlay.on #dolina-support-panel{transform:translateY(0) scale(1);opacity:1}#dolina-support-bar{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:#D7262A;color:#fff;font-weight:700;font-size:15px;flex:none;font-family:-apple-system,BlinkMacSystemFont,\"SF Pro Text\",\"Segoe UI\",Roboto,Arial,sans-serif}#dolina-support-close{background:none;border:0;color:#fff;font-size:20px;line-height:1;cursor:pointer;padding:4px 6px;border-radius:8px}#dolina-support-close:active{background:rgba(255,255,255,.2)}#dolina-support-panel iframe{flex:1;border:0;width:100%;background:#fff}@media(max-width:640px){#dolina-support-panel{max-width:none;width:100%;height:100vh;margin:0;border-radius:0}}";
  document.head.appendChild(style);

  var btn=document.createElement('button');
  btn.id='dolina-support-btn';btn.type='button';btn.setAttribute('aria-label','Поддержка');
  btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 2C6.48 2 2 6.03 2 11c0 2.09.86 4.01 2.3 5.52L3 21l4.62-1.24C8.96 20.56 10.44 21 12 21c5.52 0 10-4.03 10-9s-4.48-10-10-10z" fill="white"/></svg>';

  var overlay=document.createElement('div');
  overlay.id='dolina-support-overlay';overlay.hidden=true;

  var panel=document.createElement('div');
  panel.id='dolina-support-panel';
  panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','Поддержка');

  var bar=document.createElement('div');bar.id='dolina-support-bar';
  var title=document.createElement('span');title.textContent='Поддержка МК Долина';
  var close=document.createElement('button');
  close.id='dolina-support-close';close.type='button';close.setAttribute('aria-label','Закрыть');close.textContent='✕';

  var frame=document.createElement('iframe');
  frame.id='dolina-support-frame';frame.title='Чат с поддержкой';

  bar.appendChild(title);bar.appendChild(close);
  panel.appendChild(bar);panel.appendChild(frame);
  overlay.appendChild(panel);
  document.body.appendChild(btn);document.body.appendChild(overlay);

  function openPanel(){
    if(!frame.src)frame.src='https://support.mkdolina.ru/';
    overlay.hidden=false;
    requestAnimationFrame(function(){overlay.classList.add('on')});
  }
  function closePanel(){
    overlay.classList.remove('on');
    setTimeout(function(){overlay.hidden=true},250);
  }
  btn.addEventListener('click',openPanel);
  close.addEventListener('click',closePanel);
  overlay.addEventListener('click',function(e){if(e.target===overlay)closePanel()});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closePanel()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build,{once:true});else build();
})();
