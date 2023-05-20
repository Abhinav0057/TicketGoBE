export const getMilliseconds = (date: Date) =>
  date.getHours() * 3.6e6 + date.getMinutes() * 60000 + date.getSeconds() * 1000 + date.getMilliseconds();

export const getXMonthsBack = (x: number) => {
  const today = new Date();
  today.setMonth(today.getMonth() - 1);
  today.setHours(0, 0, 0, 0);
  return today;
};
