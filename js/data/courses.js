/* The six courses, their exam dates, and small shared constants.
   Change a date here and every countdown in the app follows. */
window.AP = window.AP || {};

AP.COURSES = [
  { k: "bio",   name: "AP Biology",          short: "Biology",      exam: "2027-05-03", when: "Mon May 3"  },
  { k: "chem",  name: "AP Chemistry",        short: "Chemistry",    exam: "2027-05-06", when: "Thu May 6"  },
  { k: "apush", name: "AP U.S. History",     short: "U.S. History", exam: "2027-05-07", when: "Fri May 7"  },
  { k: "calc",  name: "AP Calculus AB",      short: "Calculus AB",  exam: "2027-05-10", when: "Mon May 10" },
  { k: "lang",  name: "AP English Language", short: "English Lang", exam: "2027-05-12", when: "Wed May 12" },
  { k: "psych", name: "AP Psychology",       short: "Psychology",   exam: "2027-05-14", when: "Fri May 14" }
];

/* Lookup by key, so views can do AP.CMAP.chem.name instead of searching the array. */
AP.CMAP = {};
AP.COURSES.forEach(function (c) { AP.CMAP[c.k] = c; });

AP.LET = ["A", "B", "C", "D"];
