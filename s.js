/* МК ДОЛИНА — SEO fix 05.09.2026: синхронизация цен Schema.org ItemList + фикс мусорных H2.
   06.09.2026: сам ItemList (140 товаров, ~34.5 КБ) вынесен из инлайна в HEAD-коде
   Tilda (поле было на грани недокументированного лимита ~60133 символов) в отдельный
   itemlist.json тут же, на dolina-assets. Гугл официально не читает JSON-LD через
   <script src>, но читает JSON-LD, добавленный в DOM через JS — поэтому здесь он
   подгружается fetch'ем и вставляется как обычный <script type="application/ld+json">
   ДО вызова syncSchemaOrgPrices(), который его находит по DOM-селектору как раньше.
   Подключается через <script src> из HEAD-кода mkdolina.ru. */
(function () {
  function injectItemList() {
    var existing = false;
    var ldScripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < ldScripts.length; i++) {
      try {
        if (JSON.parse(ldScripts[i].textContent)['@type'] === 'ItemList') { existing = true; break; }
      } catch (e) {}
    }
    if (existing) return Promise.resolve();
    return fetch('https://cdn.jsdelivr.net/gh/Kazym7/dolina-assets@main/itemlist.json')
      .then(function (r) { return r.text(); })
      .then(function (text) {
        var s = document.createElement('script');
        s.type = 'application/ld+json';
        s.textContent = text;
        document.head.appendChild(s);
      })
      .catch(function (e) { console.warn('[MKD] itemlist.json load failed', e); });
  }

  function syncSchemaOrgPrices() {
    if (typeof products === 'undefined' || typeof getPrice !== 'function') return;
    var ldScripts = document.querySelectorAll('script[type="application/ld+json"]');
    var itemListScript = null, itemListData = null;
    for (var i = 0; i < ldScripts.length; i++) {
      try {
        var d = JSON.parse(ldScripts[i].textContent);
        if (d && d['@type'] === 'ItemList') { itemListScript = ldScripts[i]; itemListData = d; break; }
      } catch (e) {}
    }
    if (!itemListScript || !itemListData || !itemListData.itemListElement) return;
    var byId = {};
    for (var j = 0; j < products.length; j++) byId[products[j].id] = products[j];
    var kept = [], pos = 1;
    for (var k = 0; k < itemListData.itemListElement.length; k++) {
      var li = itemListData.itemListElement[k];
      var m = li.item && li.item.sku && li.item.sku.match(/^MKD-(\d+)$/);
      if (!m) continue;
      var p = byId[parseInt(m[1], 10)];
      if (!p) continue;
      li.item.offers.price = String(getPrice(p));
      li.position = pos++;
      kept.push(li);
    }
    itemListData.itemListElement = kept;
    itemListData.numberOfItems = kept.length;
    itemListData.name = 'Каталог МК Долина — ' + kept.length + ' товаров';
    itemListScript.textContent = JSON.stringify(itemListData);
  }

  var BAD_CLASSES = ['mdc-title', 'mdc-h2', 'mdc-stitle', 'mkdcs-title'];
  var BAD_IDS = ['mkd-consent-modal-title'];
  var BAD_TEXTS = ['корзина', 'личный кабинет', 'оформление заказа'];

  function fixSEOHeaders() {
    document.querySelectorAll('h2').forEach(function (h2) {
      var isBadClass = BAD_CLASSES.some(function (c) { return h2.classList.contains(c); });
      var isBadId = BAD_IDS.indexOf(h2.id) !== -1;
      var hasNoClassOrId = !h2.className && !h2.id;
      var text = (h2.textContent || '').trim().toLowerCase();
      var isBadText = hasNoClassOrId && BAD_TEXTS.indexOf(text) !== -1;
      if (isBadClass || isBadId || isBadText) {
        var div = document.createElement('div');
        Array.from(h2.attributes).forEach(function (attr) { div.setAttribute(attr.name, attr.value); });
        div.innerHTML = h2.innerHTML;
        h2.replaceWith(div);
      }
    });
  }

  function boot() {
    injectItemList().then(syncSchemaOrgPrices);
    fixSEOHeaders();
    var observer = new MutationObserver(function (mutations) {
      var shouldRun = mutations.some(function (m) { return m.addedNodes.length > 0; });
      if (shouldRun) {
        clearTimeout(window._h2fixTimer);
        window._h2fixTimer = setTimeout(fixSEOHeaders, 50);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
