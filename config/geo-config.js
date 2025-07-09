// IMPORTANT:
// The administrative geographies need to be entered in the order of their hierarchy
// This is to ensure that English geographies find their all their parents
// eg. E07 -> E10 -> E47 -> E12 -> E92
export default [
  {
    key: "uk",
		codes: ["K02"],
    label: "United Kingdom",
		parents: [],
    years: [2022],
    detail: "buc",
    nolookup: true
  },
  {
    key: "ctry",
		codes: ["E92", "N92", "S92", "W92"],
		parents: ["K02"],
    label: "country",
    years: [2022],
    detail: "buc",
    nolookup: true,
    list: ["ap", "cp"]
  },
  {
    key: "rgn",
		codes: ["E12"],
		parents: ["E92"],
    label: "region",
    years: [2022],
    list: ["ap", "cp"]
  },
  {
    key: "cauth",
		codes: ["E47"],
		parents: ["E12"],
    label: "combined authority",
    years: [2022, 2024, 2025],
    list: ["ap", "cp"]
  },
  {
    key: "cty",
		codes: ["E10"],
		parents: ["E47", "E12"],
    label: "county",
    years: [2022, 2023],
    list: ["ap", "cp"]
  },
  {
    key: "ltla",
    cmkey: "LAD",
    cmfilter: ["E", "W"],
		codes: ["E06", "E07", "E08", "E09", "N09", "S12", "W06"],
		parents: ["E10", "E47", "E12", "N92", "S92", "W92"],
    label: "local authority district",
    years: [2022, 2023, 2025],
    list: ["ap", "cp"]
  },
  {
    key: "wpc",
		codes: ["E14", "N05", "N06", "S14", "W07"],
		parents: ["E12", "N92", "S92", "W92"],
    label: "parliamentary constituency",
    years: [2022, 2024],
    list: ["ap", "cp"]
  },
  {
    key: "wd",
		codes: ["E05", "W05"],
		parents: ["E06", "E07", "E08", "E09", "W06"],
    label: "electoral ward",
    years: [2022, 2023, 2024, 2025],
    list: ["ap", "cp"],
    listparents: true
  },
  {
    key: "par",
		codes: ["E04", "W04"],
		parents: ["E06", "E07", "E08", "E09", "W06"],
    label: "civil parish",
    years: [2022],
    list: ["ap", "cp"],
    listparents: true
  },
  {
    key: "sener",
		codes: ["W10"],
		parents: ["W92"],
    label: "Senedd electoral region",
    years: [2022],
    list: ["ap", "cp"]
  },
  {
    key: "senc",
		codes: ["W09"],
		parents: ["W10"],
    label: "Senedd constituency",
    years: [2022],
    list: ["ap", "cp"]
  },
  {
    key: "ttwa",
		codes: ["E30", "K01", "W22"],
		parents: ["E92", "W92"],
    label: "travel to work area",
    years: [2011],
    notree: true,
    list: ["cp"]
  },
  {
    key: "bua",
		codes: ["E63", "K08", "W45"],
		parents: ["E12", "W92"],
    label: "built up area",
    years: [2022],
    detail: "bfc",
    notree: true,
    list: ["cp"]
  },
  {
    key: "msoa",
		codes: ["E02", "W02"],
		parents: ["E06", "E07", "E08", "E09", "W06"],
    cmkey: "MSOA",
    label: "middle layer super output area",
    years: [2021]
  },
  {
    key: "lsoa",
		codes: ["E01", "W01"],
		parents: ["E02", "W02"],
    label: "lower layer super output area",
    years: [2021],
    detail: "bfc"
  },
  {
    key: "oa",
		codes: ["E00", "W00"],
		parents: ["E01", "W01"],
    cmkey: "OA",
    label: "output area",
    years: [2021],
    detail: "bfc"
  },
];