/*!
 * config/chapters.js
 * Global chapter configuration for the MCQ engine.
 * Exposes window.chaptersConfig so pages like tests/mcq-engine.html
 * (loaded via ../config/chapters.js) can look up question banks by
 * class -> subject -> chapter.
 *
 * Structure:
 *   window.chaptersConfig[class][subject][chapter] = {
 *     title, description, questionsFile, totalQuestions, timeLimit
 *   }
 */
(function (root) {
  'use strict';

  var chaptersConfig = {
    class10: {
      'physical-education': {
        chapter1: {
          title: 'Chapter 1 - Health and Physical Education',
          description: 'Introduction to Health and Physical Education',
          questionsFile: '../data/class10/physical-education/chapter1.json',
          totalQuestions: 10,
          timeLimit: 600
        },
        chapter2: {
          title: 'Chapter 2 - Physical Fitness and Wellness',
          description: 'Concepts of physical fitness and wellness',
          questionsFile: '../data/class10/physical-education/chapter2.json',
          totalQuestions: 10,
          timeLimit: 600
        },
        chapter3: {
          title: 'Chapter 3 - Yoga',
          description: 'Yoga: meaning, importance and asanas',
          questionsFile: '../data/class10/physical-education/chapter3.json',
          totalQuestions: 10,
          timeLimit: 600
        },
        chapter4: {
          title: 'Chapter 4 - Sports and Games',
          description: 'Fundamentals of sports and games',
          questionsFile: '../data/class10/physical-education/chapter4.json',
          totalQuestions: 10,
          timeLimit: 600
        },
        chapter5: {
          title: 'Chapter 5 - Athletics',
          description: 'Track and field events',
          questionsFile: '../data/class10/physical-education/chapter5.json',
          totalQuestions: 10,
          timeLimit: 600
        }
      }
    }
  };

  // Expose globally on window (browsers) and globalThis (module scripts).
  root.chaptersConfig = chaptersConfig;
  if (typeof globalThis !== 'undefined') {
    globalThis.chaptersConfig = chaptersConfig;
  }

  // Debug helper: list all configured chapters in the console.
  root.__listChapters = function () {
    var out = [];
    Object.keys(chaptersConfig).forEach(function (cls) {
      Object.keys(chaptersConfig[cls]).forEach(function (sub) {
        Object.keys(chaptersConfig[cls][sub]).forEach(function (ch) {
          out.push(cls + ' / ' + sub + ' / ' + ch);
        });
      });
    });
    return out;
  };

  try {
    console.info(
      '[chaptersConfig] loaded \u2014 classes: ' +
        Object.keys(chaptersConfig).join(', ')
    );
  } catch (e) {}
})(typeof window !== 'undefined' ? window : this);
