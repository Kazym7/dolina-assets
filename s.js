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

  /* 22.09.2026: чекаут (api.mkdolina.ru/orders-api/v1/orders) умеет принимать
     meta.{source_channel,city,landing_path,ym_client_id,yclid,...} — бэкенд
     готов давно (app/tracking.py), но фронтенд никогда их не отправлял, из-за
     чего 51 из 51 реальных заказов в orders_prod имели source_channel="unknown".
     Здесь — только СБОР данных первого касания в sessionStorage; сама отправка
     в теле заказа — в отдельном блоке чекаута (rec2363008951), который читает
     sessionStorage.getItem('mkd_first_touch'). Если это не выполнится (старый
     браузер, заблокированный sessionStorage) — чекаут ничего не заметит, там
     свои safe-defaults на тот же случай, что и раньше. */
  function captureFirstTouch() {
    try {
      if (sessionStorage.getItem('mkd_first_touch')) return;
      var params = new URLSearchParams(location.search);
      var yclid = params.get('yclid') || '';
      var utmSource = (params.get('utm_source') || '').toLowerCase();
      var utmCampaign = params.get('utm_campaign') || '';
      var utmContent = params.get('utm_content') || '';
      var ref = document.referrer || '';
      var refHost = '';
      try { refHost = ref ? new URL(ref).hostname.toLowerCase() : ''; } catch (e) {}

      var channel = 'unknown';
      if (yclid || utmSource === 'yandex_ads' || utmSource === 'direct') channel = 'yandex_ads';
      else if (utmSource === 'avito') channel = 'avito';
      else if (utmSource === 'telegram' || refHost.indexOf('t.me') >= 0) channel = 'telegram';
      else if (utmSource === 'email') channel = 'email';
      else if (utmSource === 'qr') channel = 'qr';
      else if (refHost.indexOf('vk.com') >= 0 || refHost.indexOf('vk.ru') >= 0 || refHost.indexOf('ok.ru') >= 0) channel = 'social';
      else if (/(^|\.)(yandex\.|google\.|bing\.com)/.test(refHost)) channel = 'organic';
      else if (!ref) channel = 'direct';
      else if (refHost && refHost.indexOf('mkdolina.ru') < 0) channel = 'referral';

      sessionStorage.setItem('mkd_first_touch', JSON.stringify({
        source_channel: channel,
        source_campaign: utmCampaign || null,
        source_content: utmContent || null,
        landing_path: location.pathname,
        yclid: yclid || null
      }));
    } catch (e) {}
  }

  function boot() {
    captureFirstTouch();
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
