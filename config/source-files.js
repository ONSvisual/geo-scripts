const ctry_map = {E: "E92000001", N: "N92000002", S: "S92000003", W: "W92000004"};
const uk_map = {E: "K02000001", N: "K02000001", S: "K02000001", W: "K02000001", K: ""};

export default {
  oas: [
    {name: "oa21_ctry22.csv", id: "f5d353a7882846ea9fe86f3e224c33ef", fields: ["oa21cd", "ctry22cd"]},
    {name: "oa21_rgn22.csv", id: "efda0d0e14da4badbd8bdf8ae31d2f00", fields: ["oa21cd", "rgn22cd"]},
    {name: "oa21_cauth22.csv", id: "86b7c99d0fe042a2975880ff9ec51c1c_0", ref_id: 4326, fields: ["LAD22CD", "CAUTH22CD"]},
    {name: "oa21_cty23.csv", id: "4393e36fa6184b0fb1b2562d98db1da6", fields: ["oa21cd", "utla22cd"]},
    {name: "oa21_cty22.csv", id: "4393e36fa6184b0fb1b2562d98db1da6", fields: ["oa21cd", "utla22cd"]},
    {name: "oa21_ltla23.csv", id: "83982ff4a8144038be52be65dd2b8fa0_0", ref_id: 4326, fields: ["OA21CD", "LAD23CD"]},
    {name: "oa21_ltla22.csv", id: "b9ca90c10aaa4b8d9791e9859a38ca67_0", ref_id: 4326, fields: ["OA21CD", "LAD22CD"]},
    {name: "oa21_wpc22.csv", id: "e4f8b4b75a1a4d308cdbd5a6fc0ac86b_0", ref_id: 3857, fields: ["OA21CD", "WPC22CD"]},
    {name: "oa21_sener22.csv", id: "c14dca6e321b4b97a33a70a9a48f9fd8_0", ref_id: 4326, fields: ["OA21CD", "SENER22CD"]},
    {name: "oa21_senc22.csv", id: "c14dca6e321b4b97a33a70a9a48f9fd8_0", ref_id: 4326, fields: ["OA21CD", "SENC22CD"]},
    {name: "oa21_par22.csv", id: "1d628c630e9e49c38ea282b131ac36e7_0", ref_id: 3857, fields: ["OA21CD", "PAR22CD"]},
    {name: "oa21_wd22.csv", id: "7207b51700f7472e88460f3a2e1eb5f9_0", ref_id: 4326, fields: ["OA21CD", "WD22CD"]},
    {name: "oa21_ttwa11.csv", id: "03f3617099564e33a9e4390051f10e4a_0", ref_id: 3857, fields: ["OA21CD", "TTWA11CD"]},
    {name: "oa21_bua22.csv", id: "58e34e32a0194f1597d477f5ba93961b_0", ref_id: 4326, fields: ["OA21CD", "BUA22CD"]},
    {name: "oa21_msoa21.csv", id: "b9ca90c10aaa4b8d9791e9859a38ca67_0", ref_id: 4326, fields: ["OA21CD", "MSOA21CD"]},
    {name: "oa21_lsoa21.csv", id: "b9ca90c10aaa4b8d9791e9859a38ca67_0", ref_id: 4326, fields: ["OA21CD", "LSOA21CD"], include_oa_lookup: true},
    {name: "oa21_lsoa21_msoa21_ltla22.csv", id: "b9ca90c10aaa4b8d9791e9859a38ca67_0", ref_id: 4326, fields: ["OA21CD", "LSOA21CD", "MSOA21CD", "LAD22CD"], names: ["oa21cd", "lsoa21cd", "msoa21cd", "ltla22cd"]},
  ],
  parents: [
    {name: "ctry22_uk22.csv", id: "e16c22bd8e6041f0982362e19f753790_0", ref_id: 4326, fields: ["CTRY22CD"], map: uk_map},
    {name: "rgn22_ctry22.csv", id: "645a5783694140e685aa62cab945ce5b_0", ref_id: 4326, fields: ["RGN22CD"], map: ctry_map},
    {name: "ltla22_ctry22.csv", id: "f7cada9ef1fe4e0a879ad2ba867f4a7c_0", ref_id: 4326, fields: ["LAD23CD", "CTRY23CD"], filter: ["N", "S", "W"]},
    {name: "ltla22_rgn22.csv", id: "f1392f9766be400b85613e6a7885bd5b_0", ref_id: 4326, fields: ["LAD22CD", "RGN22CD"], filter: ["E06", "E09"]},
    {name: "ltla23_rgn23.csv", id: "4466088cf22849f3aa030e330fbba0a0_0", ref_id: 4326, fields: ["LAD23CD", "RGN23CD"], filter: ["E06", "E09"]},
    {name: "cty22_rgn22.csv", id: "f1392f9766be400b85613e6a7885bd5b_0", ref_id: 4326, fields: ["CTY22CD", "RGN22CD"], filter: ["E"]},
    {name: "wpc22_ctry22.csv", id: "1891180eaf9544108b41e7429e2d8ed9_0", ref_id: 4326, fields: ["PCON22CD"], filter: ["N", "S"], map: ctry_map},
    {name: "wpc22_rgn22.csv", id: "e4f8b4b75a1a4d308cdbd5a6fc0ac86b_0", ref_id: 3857, fields: ["WPC22CD", "RGN22CD"]},
    {name: "ltla22_cty22.csv", id: "332bba77e8944aee835457214bc2ccf8_0", ref_id: 4326, fields: ["LAD22CD", "CTY22CD"], filter: ["E07"]},
    {name: "ltla23_cty23.csv", id: "561603518d6b42be9362b747e9b16175_0", ref_id: 4326, fields: ["LAD23CD", "CTY23CD"], filter: ["E07"]},
    {name: "ltla22_cauth22.csv", id: "86b7c99d0fe042a2975880ff9ec51c1c_0", ref_id: 4326, fields: ["LAD22CD", "CAUTH22CD"], filter: ["E06", "E08"]},
    {name: "ltla23_cauth23.csv", id: "99dcf228c2524887b53a5e588c604dc5_0", ref_id: 4326, fields: ["LAD23CD", "CAUTH23CD"], filter: ["E06", "E08"]},
    {name: "sener22_ctry22.csv", id: "5c6605fa2c7746f58dac94d4a277d4dc_0", ref_id: 4326, fields: ["SENER22CD"], map: ctry_map},
    {name: "senc22_sener22.csv", id: "c14dca6e321b4b97a33a70a9a48f9fd8_0", ref_id: 4326, fields: ["SENC22CD", "SENER22CD"], filter: ["W"]},
    {name: "par22_ltla22.csv", id: "98f2e0bb6071464d880223e4865db04b_0", ref_id: 4326, fields: ["PAR22CD", "LAD22CD"], filter: ["E", "W"]},
    {name: "wd22_ltla22.csv", id: "f1392f9766be400b85613e6a7885bd5b_0", ref_id: 4326, fields: ["WD22CD", "LAD22CD"], filter: ["E", "W"]},
    {name: "msoa21_ltla22.csv", id: "b9ca90c10aaa4b8d9791e9859a38ca67_0", ref_id: 4326, fields: ["MSOA21CD", "LAD22CD"]},
    {name: "lsoa21_msoa22.csv", id: "b9ca90c10aaa4b8d9791e9859a38ca67_0", ref_id: 4326, fields: ["LSOA21CD", "MSOA21CD"]},
    {name: "oa21_lsoa21.csv", id: "b9ca90c10aaa4b8d9791e9859a38ca67_0", ref_id: 4326, fields: ["OA21CD", "LSOA21CD"]},
  ],
  names: [
    {name: "ctry22.csv", id: "e16c22bd8e6041f0982362e19f753790_0", fields: ["CTRY22CD", "CTRY22NM", "CTRY22NMW"]},
    {name: "rgn22.csv", id: "645a5783694140e685aa62cab945ce5b_0", fields: ["RGN22CD", "RGN22NM", "RGN22NMW"]},
    {name: "ltla22.csv", id: "42af123c4663466496dafb4c8fcb0c82_0", fields: ["LAD22CD", "LAD22NM", "LAD22NMW"]},
    {name: "ltla23.csv", id: "e8b361ba9e98418ba8ff2f892d00c352_0", fields: ["LAD23CD", "LAD23NM", "LAD23NMW"]},
    {name: "sener22.csv", id: "5c6605fa2c7746f58dac94d4a277d4dc_0", fields: ["SENER22CD", "SENER22NM", "SENER22NMW"]},
    {name: "senc22.csv", id: "193aa7c5b8f44662a9040756946a79b4_0", fields: ["SENC22CD", "SENC22NM", "SENC22NMW"]},
    {name: "par22.csv", id: "16fd75f99ad444b0970c45c01df3ee6e_0", fields: ["PAR22CD", "PAR22NM", "PAR22NMW"]},
    {name: "wd22.csv", id: "6d3a1a1cf24d4543965a9fef1dcf9c9d_0", fields: ["WD22CD", "WD22NM", "WD22NMW"]},
    {name: "bua22.csv", id: "87bc125886b1425c9f9a5ebd44d0a0c8_0", fields: ["BUA22CD", "BUA22NM", "BUA22NMW"]},
  ],
  boundaries: [
    {name: "ctry22_bfe.jsonl", id: "Countries_December_2022_UK_BFE", fields: ["CTRY22CD", "CTRY22NM"]},
    {name: "ctry22_bfc.jsonl", id: "Countries_December_2022_UK_BFC", fields: ["CTRY22CD", "CTRY22NM"]},
    {name: "ctry22_bgc.jsonl", id: "Countries_December_2022_UK_BGC", fields: ["CTRY22CD", "CTRY22NM"]},
    {name: "ctry22_buc.jsonl", id: "Countries_December_2022_UK_BUC", fields: ["CTRY22CD", "CTRY22NM"]},
    {name: "rgn22_bfe.jsonl", id: "Regions_December_2022_EN_BFE", fields: ["RGN22CD", "RGN22NM"]},
    {name: "rgn22_bfc.jsonl", id: "Regions_December_2022_EN_BFC", fields: ["RGN22CD", "RGN22NM"]},
    {name: "rgn22_bgc.jsonl", id: "Regions_December_2022_EN_BGC", fields: ["RGN22CD", "RGN22NM"]},
    {name: "rgn22_buc.jsonl", id: "Regions_December_2022_EN_BUC", fields: ["RGN22CD", "RGN22NM"]},
    {name: "cauth22_bfe.jsonl", id: "Combined_Authorities_December_2022_EN_BFE", fields: ["CAUTH22CD", "CAUTH22NM"]},
    {name: "cauth22_bfc.jsonl", id: "Combined_Authorities_December_2022_EN_BFC", fields: ["CAUTH22CD", "CAUTH22NM"]},
    {name: "cauth22_bgc.jsonl", id: "Combined_Authorities_December_2022_EN_BGC", fields: ["CAUTH22CD", "CAUTH22NM"]},
    {name: "cauth22_buc.jsonl", id: "Combined_Authorities_December_2022_EN_BUC", fields: ["CAUTH22CD", "CAUTH22NM"]},
    {name: "cty23_bfe.jsonl", id: "Counties_May_2023_Boundaries_EN_BFE", fields: ["CTY23CD", "CTY23NM"]},
    {name: "cty23_bfc.jsonl", id: "Counties_May_2023_Boundaries_EN_BFC", fields: ["CTY23CD", "CTY23NM"]},
    {name: "cty23_bgc.jsonl", id: "Counties_May_2023_Boundaries_EN_BGC", fields: ["CTY23CD", "CTY23NM"]},
    {name: "cty23_buc.jsonl", id: "Counties_May_2023_Boundaries_EN_BUC", fields: ["CTY23CD", "CTY23NM"]},
    {name: "cty22_bfe.jsonl", id: "Counties_December_2022_EN_BFE", fields: ["CTY22CD", "CTY22NM"]},
    {name: "cty22_bfc.jsonl", id: "Counties_December_2022_EN_BFC", fields: ["CTY22CD", "CTY22NM"]},
    {name: "cty22_bgc.jsonl", id: "Counties_December_2022_EN_BGC", fields: ["CTY22CD", "CTY22NM"]},
    {name: "cty22_buc.jsonl", id: "Counties_December_2022_EN_BUC", fields: ["CTY22CD", "CTY22NM"]},
    {name: "ltla23_bfe.jsonl", id: "Local_Authority_Districts_May_2023_UK_BFE", fields: ["LAD23CD", "LAD23NM"]},
    {name: "ltla23_bfc.jsonl", id: "Local_Authority_Districts_May_2023_UK_BFC", fields: ["LAD23CD", "LAD23NM"]},
    {name: "ltla23_bgc.jsonl", id: "Local_Authority_Districts_May_2023_UK_BGC", fields: ["LAD23CD", "LAD23NM"]},
    {name: "ltla23_buc.jsonl", id: "Local_Authority_Districts_May_2023_UK_BUC", fields: ["LAD23CD", "LAD23NM"]},
    {name: "ltla22_bfe.jsonl", id: "LAD_DEC_2022_UK_BFE_V2", fields: ["LAD22CD", "LAD22NM"]},
    {name: "ltla22_bfc.jsonl", id: "Local_Authority_Districts_December_2022_Boundaries_UK_BFC", fields: ["LAD22CD", "LAD22NM"]},
    {name: "ltla22_bgc.jsonl", id: "Local_Authority_Districts_December_2022_Boundaries_UK_BGC", fields: ["LAD22CD", "LAD22NM"]},
    {name: "ltla22_buc.jsonl", id: "Local_Authority_Districts_December_2022_Boundaries_UK_BUC", fields: ["LAD22CD", "LAD22NM"]},
    {name: "wpc22_bfe.jsonl", id: "PCON_DEC_2022_UK_BFE_V2", fields: ["PCON22CD", "PCON22NM"]},
    {name: "wpc22_bfc.jsonl", id: "Westminster_Parliamentary_Constituencies_Dec_2022_UK_BFC", fields: ["PCON22CD", "PCON22NM"]},
    {name: "wpc22_bgc.jsonl", id: "Westminster_Parliamentary_Constituencies_Dec_2022_UK_BGC", fields: ["PCON22CD", "PCON22NM"]},
    {name: "wpc22_buc.jsonl", id: "Westminster_Parliamentary_Constituencies_Dec_2022_UK_BUC", fields: ["PCON22CD", "PCON22NM"]},
    {name: "sener22_bfe.jsonl", id: "Senedd_Cymru_Electoral_Regions_December_2022_WA_BFE", fields: ["SENER22CD", "SENER22NM"]},
    {name: "sener22_bfc.jsonl", id: "Senedd_Cymru_Electoral_Regions_December_2022_WA_BFC", fields: ["SENER22CD", "SENER22NM"]},
    {name: "sener22_bgc.jsonl", id: "Senedd_Cymru_Electoral_Regions_December_2022_WA_BGC", fields: ["SENER22CD", "SENER22NM"]},
    {name: "sener22_buc.jsonl", id: "Senedd_Cymru_Electoral_Regions_December_2022_WA_BUC", fields: ["SENER22CD", "SENER22NM"]},
    {name: "senc22_bfe.jsonl", id: "Senedd_Cymru_Constituencies_December_2022_Boundaries_WA_BFE", fields: ["SENC22CD", "SENC22NM"]},
    {name: "senc22_bfc.jsonl", id: "Senedd_Cymru_Constituencies_December_2022_Boundaries_WA_BFC", fields: ["SENC22CD", "SENC22NM"]},
    {name: "senc22_bgc.jsonl", id: "Senedd_Cymru_Constituencies_December_2022_Boundaries_WA_BGC", fields: ["SENC22CD", "SENC22NM"]},
    {name: "senc22_buc.jsonl", id: "Senedd_Cymru_Constituencies_December_2022_Boundaries_WA_BUC", fields: ["SENC22CD", "SENC22NM"]},
    {name: "par22_bfe.jsonl", id: "Parishes_Decemeber_2022_EW_BFE", fields: ["PAR22CD", "PAR22NM"]},
    {name: "par22_bfc.jsonl", id: "Parishes_December_2022_EW_BFC", fields: ["PAR22CD", "PAR22NM"]},
    {name: "par22_bgc.jsonl", id: "Parishes_December_2022_EW_BGC", fields: ["PAR22CD", "PAR22NM"]},
    {name: "par22_bsc.jsonl", id: "Parishes_December_2022_EW_BSC", fields: ["PAR22CD", "PAR22NM"]},
    {name: "wd22_bfe.jsonl", id: "Wards_December_2022_Boundaries_GB_BFE", fields: ["WD22CD", "WD22NM"]},
    {name: "wd22_bfc.jsonl", id: "Wards_December_2022_Boundaries_GB_BFC", fields: ["WD22CD", "WD22NM"]},
    {name: "wd22_bgc.jsonl", id: "Wards_December_2022_Boundaries_GB_BGC", fields: ["WD22CD", "WD22NM"]},
    {name: "wd22_bsc.jsonl", id: "Wards_December_2022_Boundaries_GB_BSC", fields: ["WD22CD", "WD22NM"]},
    {name: "ttwa11_bfe.jsonl", id: "Travel_to_Work_Areas_Dec_2011_FEB_in_United_Kingdom_2022", fields: ["TTWA11CD", "TTWA11NM"]},
    {name: "ttwa11_bfc.jsonl", id: "Travel_to_Work_Areas_Dec_2011_FCB_in_United_Kingdom_2022", fields: ["TTWA11CD", "TTWA11NM"]},
    {name: "ttwa11_bgc.jsonl", id: "Travel_to_Work_Areas_Dec_2011_GCB_in_United_Kingdom_2022", fields: ["TTWA11CD", "TTWA11NM"]},
    {name: "ttwa11_buc.jsonl", id: "Travel_to_Work_Areas_Dec_2011_UGCB_in_United_Kingdom_2022", fields: ["TTWA11CD", "TTWA11NM"]},
    {name: "bua22_bfc.jsonl", id: "BUA_2022_GB", fields: ["BUA22CD", "BUA22NM"]},
    {name: "msoa21_bfe.jsonl", id: "Middle_Layer_Super_Output_Areas_2021_EW_BFE_V6", fields: ["MSOA21CD", "MSOA21NM"]},
    {name: "msoa21_bfc.jsonl", id: "Middle_Layer_Super_Output_Areas_Dec_2021_Boundaries_Full_Clipped_EW_BFC_2022", fields: ["MSOA21CD", "MSOA21NM"]},
    {name: "msoa21_bgc.jsonl", id: "MSOA_Dec_2021_Boundaries_Generalised_Clipped_EW_BGC_2022", fields: ["MSOA21CD", "MSOA21NM"]},
    {name: "msoa21_bsc.jsonl", id: "MSOA_2021_EW_BSC", fields: ["MSOA21CD", "MSOA21NM"]},
    {name: "lsoa21_bfe.jsonl", id: "Lower_Layer_Super_Output_Area_2021_EW_BFE_V8", fields: ["LSOA21CD", "LSOA21NM"]},
    {name: "lsoa21_bfc.jsonl", id: "LSOA_Dec_2021_Boundaries_Full_Clipped_EW_BFC_2022", fields: ["LSOA21CD", "LSOA21NM"]},
    {name: "lsoa21_bgc.jsonl", id: "LSOA_Dec_2021_Boundaries_Generalised_Clipped_EW_BGC_V2", fields: ["LSOA21CD", "LSOA21NM"]},
    {name: "lsoa21_bsc.jsonl", id: "LSOA_2021_EW_BSC", fields: ["LSOA21CD", "LSOA21NM"]},
    {name: "oa21_bfe.jsonl", id: "Output_Areas_2021_EW_BFE_V8", fields: ["OA21CD"]},
    {name: "oa21_bfc.jsonl", id: "Output_Areas_Dec_2021_Boundaries_Full_Clipped_EW_BFC_2022", fields: ["OA21CD"]},
    {name: "oa21_bgc.jsonl", id: "Output_Areas_Dec_2021_Boundaries_Generalised_Clipped_EW_BGC_2022", fields: ["OA21CD"]},
  ],
  other: [
    {name: "msoa_names.csv", href: "https://houseofcommonslibrary.github.io/msoanames/MSOA-Names-Latest2.csv"},
    {name: "nomis_codes.csv", href: "https://www.nomisweb.co.uk/api/v01/dataset/NM_2028_1.data.csv?date=latest&geography=TYPE499,TYPE480,TYPE155,TYPE154,TYPE152,TYPE151,TYPE150&c_sex=0&measures=20100&select=geography_code,geography&uid=0x3cfb19ead752b37bb90da0eb3a0fe78baa9fa055"}
  ],
};