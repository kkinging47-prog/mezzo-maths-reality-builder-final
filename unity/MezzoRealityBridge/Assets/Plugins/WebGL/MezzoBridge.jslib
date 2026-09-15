mergeInto(LibraryManager.library, {
  MezzoSendEvent: function (jsonPtr) {
    var json = UTF8ToString(jsonPtr);

    try {
      var payload = JSON.parse(json);
      window.dispatchEvent(new CustomEvent('mezzo-unity-event', { detail: payload }));

      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ source: 'mezzo-unity', payload: payload }, '*');
      }
    } catch (error) {
      console.error('[Mezzo Unity Bridge] Invalid payload', error, json);
    }
  }
});
