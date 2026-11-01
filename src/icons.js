const paths = {
  arrow: "M7 17 17 7M7 7h10v10",
  right: "M4 12h16m-6-6 6 6-6 6",
  chevron: "m9 5 7 7-7 7",
  search: "m21 21-4.4-4.4M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0Z",
  plus: "M12 5v14M5 12h14",
  close: "m6 6 12 12M18 6 6 18",
  check: "m5 12 4 4L19 6",
  play: "m8 5 12 7-12 7V5Z",
  pause: "M8 5v14M16 5v14",
  reset: "M3 10a9 9 0 1 1 1 7M3 4v6h6",
  home: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z",
  calendar: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z",
  list: "M9 6h12M9 12h12M9 18h12M3 6h.01M3 12h.01M3 18h.01",
  spark: "m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z",
  clock: "M12 6v6l4 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
  settings:
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-6 2 3 4-.5.5 4L22 12l-3.5 3.5-.5 4-4-.5-2 3-2-3-4 .5-.5-4L2 12l3.5-3.5.5-4 4 .5 2-3Z",
  heart:
    "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
  upload: "M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5",
  download: "M12 3v13m-5-5 5 5 5-5M4 16v5h16v-5",
  edit: "m16 3 5 5L9 20l-6 1 1-6L16 3Z",
  trash: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7",
  menu: "M4 6h16M4 12h16M4 18h16",
  logout: "M10 3H3v18h7M8 12h13m-5-5 5 5-5 5",
  volume: "m11 4-6 5H2v6h3l6 5V4Zm5 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14",
  globe:
    "M2 12h20M12 2c6 6 6 14 0 20-6-6-6-14 0-20ZM22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
};
export const icon = (name, cls = "") =>
  `<svg class="icon ${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.spark}"/></svg>`;
export const mark = () =>
  `<span class="brand-mark" aria-hidden="true">${icon("check")}</span>`;
