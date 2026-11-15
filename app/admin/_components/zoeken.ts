// Zoeken zonder op hoofdletters of accenten te letten: "rene" vindt ook "René".
export const gewoon = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
