/* ============================================================================
   FIREBASE INIT (compat CDN) — single source of truth for admin + student pages
   Loads before any admin-data.js call.
   Requires: firebase-app-compat.js, firebase-firestore-compat.js
   ============================================================================ */
(function (root) {
  'use strict';

  var FIREBASE_CONFIG = {
    apiKey: "AIzaSyDI7KGUiLBRNGBXQ-k091qerf63NotTHhY",
    authDomain: "pe-exam-hub.firebaseapp.com",
    projectId: "pe-exam-hub",
    storageBucket: "pe-exam-hub.firebasestorage.app",
    messagingSenderId: "14977805637",
    appId: "1:14977805637:web:067f6af55ccd8993a1222c",
    measurementId: "G-S8FJHM2BQ8"
  };

  if (typeof firebase === 'undefined') {
    console.error('[firebase-init] firebase SDK not loaded. Include compat scripts before this file.');
    return;
  }

  if (!firebase.apps || !firebase.apps.length) {
    firebase.initializeApp(FIREBASE_CONFIG);
  }

  root.FIREBASE_CONFIG = FIREBASE_CONFIG;
  root.db = firebase.firestore();
})(window);
