import getWeekLetters from "../src/getWeekLetters";

const weekMon = [["M"], ["T"], ["W"], ["T"], ["F"], ["S"], ["S"]];
const weekSun = [["S"], ["M"], ["T"], ["W"], ["T"], ["F"], ["S"]];

test("getWeekLetters starting with Monday", () => {
  const week = getWeekLetters("en-US", false);
  expect(week).toStrictEqual(weekMon);
});

test("getWeekLetters starting with Sunday", () => {
  const week = getWeekLetters("en-US", true);
  expect(week).toStrictEqual(weekSun);
});
