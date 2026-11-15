// Een naam zonder hoofdletters, accenten, punten en dubbele spaties, om te vergelijken:
// "Sabine v.d. Broek" en "sabine vd broek" zijn dan dezelfde, "José" vind je met "jose".
export const gewoon = (naam: string) =>
  naam.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();
