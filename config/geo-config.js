export default [
  {
    key: "uk",
    label: "United Kingdom",
    years: [2022],
    detail: "buc",
    nolookup: true
  },
  {
    key: "ctry",
    label: "country",
    years: [2022],
    detail: "buc",
    nolookup: true,
    list: ["ap"]
  },
  {
    key: "rgn",
    label: "region",
    years: [2022],
    list: ["ap"]
  },
  {
    key: "cty",
    label: "county",
    years: [2022, 2023],
    list: ["ap", "cp"]
  },
  {
    key: "ltla",
    cmkey: "LAD",
    cmfilter: ["E", "W"],
    label: "local authority district",
    years: [2022, 2023],
    list: ["ap", "cp"]
  },
  {
    key: "cauth",
    label: "combined authority",
    years: [2022],
    list: ["ap", "cp"]
  },
  {
    key: "wpc",
    label: "parliamentary constituency",
    years: [
      2022,
      // 2025
    ],
    list: ["ap", "cp"]
  },
  {
    key: "wd",
    label: "electoral ward",
    years: [2022, 2023],
    filter: ["E", "W"],
    list: ["ap", "cp"],
    listparents: true
  },
  {
    key: "par",
    label: "civil parish",
    years: [2022],
    filter: ["E", "W"],
    list: ["ap", "cp"],
    listparents: true
  },
  {
    key: "sener",
    label: "Senedd electoral region",
    years: [2022],
    list: ["ap", "cp"]
  },
  {
    key: "senc",
    label: "Senedd constituency",
    years: [2022],
    list: ["ap", "cp"]
  },
  {
    key: "ttwa",
    label: "travel to work area",
    years: [2011],
    filter: ["E", "W"],
    notree: true,
    list: ["cp"]
  },
  {
    key: "bua",
    label: "built up area",
    years: [2022],
    detail: "bfc",
    notree: true,
    list: ["cp"]
  },
  {
    key: "msoa",
    cmkey: "MSOA",
    label: "middle layer super output area",
    years: [2021]
  },
  {
    key: "lsoa",
    label: "lower layer super output area",
    years: [2021],
    detail: "bfc"
  },
  {
    key: "oa",
    cmkey: "OA",
    label: "output area",
    years: [2021],
    detail: "bfc"
  },
];