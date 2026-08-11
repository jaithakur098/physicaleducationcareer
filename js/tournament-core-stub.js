/* Minimal Firebase mock for offline draw-generator tests */
(function (root) {
  'use strict';
  function noop() { return Promise.resolve(); }
  function doc() {
    return {
      get: function () { return Promise.resolve({ exists: false }); },
      set: noop,
      update: noop,
      delete: noop
    };
  }
  function collection() {
    return {
      doc: doc,
      get: function () { return Promise.resolve({ docs: [], forEach: function () {} }); },
      where: function () { return this; },
      orderBy: function () { return this; },
      onSnapshot: function (cb) { if (cb) cb({ docs: [], forEach: function () {} }); return function () {}; },
      add: noop
    };
  }
  root.firebase = {
    firestore: function () {
      return {
        collection: collection,
        doc: doc,
        runTransaction: function (fn) { return fn({ get: function () { return Promise.resolve({ exists: false }); }, set: noop }); },
        batch: function () { return { set: noop, commit: noop }; }
      };
    },
    auth: function () {
      return {
        onAuthStateChanged: function (cb) { if (cb) cb(null); return function () {}; },
        signInWithPopup: noop,
        signInWithPhoneNumber: noop,
        signOut: noop,
        currentUser: null
      };
    },
    storage: function () {
      return { ref: function () { return { put: noop, getDownloadURL: function () { return Promise.resolve(''); } }; } };
    }
  };
})(window);
