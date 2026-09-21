/* МК ДОЛИНА — SEO fix 05.09.2026: фикс мусорных H2 (см. fixSEOHeaders).
   06.09.2026: сюда же был вынесен статичный ItemList (itemlist.json, инжектился
   через injectItemList()) — устранял лимит ~60133 символов в HEAD-коде Tilda.
   21.09.2026: статичный инжект УДАЛЁН. Причина: на странице параллельно работает
   ДРУГОЙ, динамический генератор каталожного ItemList — инлайн-скрипт
   "MKDCompliance" (window.MKDProductCompliance), который на каждой загрузке
   строит ItemList из живого var products + getPrice() и пытается удалить
   предыдущие версии по text-match перед вставкой своей. Проблема была в том,
   что static-инжект отсюда (после async fetch itemlist.json) добавлялся
   ПОЗЖЕ, когда чистка MKDCompliance уже отработала — в результате на странице
   одновременно жили два ItemList с расходящимися ценами (пример: SKU MKD-000
   "Полутуша свиная" — 250₽ в устаревшем itemlist.json против 260₽ живых) и
   136 из 140 товаров в статичной версии указывали url на главную страницу
   вместо карточки товара. Дублей и гонки за removeChild не будет, если
   генератор ItemList остаётся только один — MKDCompliance. itemlist.json
   удалён из репо как источник устаревших данных. */
(function () {
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
