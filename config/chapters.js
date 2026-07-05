(function (root) {
  'use strict';

  function makeChapter(title, collection, badge) {
    return {
      title: title,
      collection: collection,
      badge: badge
    };
  }

  root.chaptersConfig = {

    // ===========================
    // CLASS 10
    // ===========================
    class10: {
      "physical-education": {
        chapter1: makeChapter("Health and Physical Education", "class10_chapter1", "Chapter 1"),
        chapter2: makeChapter("Physical Fitness and Wellness", "class10_chapter2", "Chapter 2"),
        chapter3: makeChapter("Yoga", "class10_chapter3", "Chapter 3"),
        chapter4: makeChapter("Sports and Games", "class10_chapter4", "Chapter 4"),
        chapter5: makeChapter("Athletics", "class10_chapter5", "Chapter 5")
      }
    },

    // ===========================
    // CLASS 11
    // ===========================
    class11: {
      "physical-education": {
        chapter1: makeChapter("Changing Trends & Career in Physical Education", "class11_chapter1", "Chapter 1"),
        chapter2: makeChapter("Olympism", "class11_chapter2", "Chapter 2"),
        chapter3: makeChapter("Yoga", "class11_chapter3", "Chapter 3"),
        chapter4: makeChapter("Physical Education & Sports for CWSN", "class11_chapter4", "Chapter 4"),
        chapter5: makeChapter("Physical Fitness, Wellness & Lifestyle", "class11_chapter5", "Chapter 5"),
        chapter6: makeChapter("Test, Measurement & Evaluation", "class11_chapter6", "Chapter 6"),
        chapter7: makeChapter("Fundamentals of Anatomy, Physiology & Kinesiology", "class11_chapter7", "Chapter 7"),
        chapter8: makeChapter("Psychology & Sports", "class11_chapter8", "Chapter 8"),
        chapter9: makeChapter("Training & Doping in Sports", "class11_chapter9", "Chapter 9"),
        chapter10: makeChapter("Khelo India & Traditional Games", "class11_chapter10", "Chapter 10")
      }
    },

    // ===========================
    // CLASS 12
    // ===========================
    class12: {
      "physical-education": {
        chapter1: makeChapter("Management of Sporting Events", "class12_chapter1", "Chapter 1"),
        chapter2: makeChapter("Children & Women in Sports", "class12_chapter2", "Chapter 2"),
        chapter3: makeChapter("Yoga as Preventive Measure", "class12_chapter3", "Chapter 3"),
        chapter4: makeChapter("Physical Education & Sports for CWSN", "class12_chapter4", "Chapter 4"),
        chapter5: makeChapter("Sports & Nutrition", "class12_chapter5", "Chapter 5"),
        chapter6: makeChapter("Test & Measurement in Sports", "class12_chapter6", "Chapter 6"),
        chapter7: makeChapter("Physiology & Sports", "class12_chapter7", "Chapter 7"),
        chapter8: makeChapter("Biomechanics & Sports", "class12_chapter8", "Chapter 8"),
        chapter9: makeChapter("Psychology & Sports", "class12_chapter9", "Chapter 9"),
        chapter10: makeChapter("Training in Sports", "class12_chapter10", "Chapter 10")
      }
    }

  };

})(window);
