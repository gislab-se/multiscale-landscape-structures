# Bornholm Landscape Structure Analysis

Integrated report · v10 interpretation · Updated 9 October 2026

## Purpose and scope

This report connects landscape metrics, factor scores, statistical clusters and interpreted landscape types for Bornholm, Denmark. It presents the existing v10 analysis together with a multiscale map and the supporting model tables.

The analysis describes the spatial structure of the landscape: coastal and sandy environments, fracture-valley relief, forest and protected nature, settlement, and open agricultural land. It provides a basis for comparing landscape contexts and discussing regional patterns.

v10 is an interpreted synthesis of the v9 eight-cluster solution. It translates analytical clusters and factor scores into five landscape types. The classification is a cartographic and methodological interpretation; it has not been field-verified. This publication updates the English explanation and presentation of the existing results. It does not introduce a new analytical run.

## Method and development

The work developed through several analytical versions. Early versions showed that finer H3 resolution and an eight-cluster solution made the fracture-valley structure clearer. Later versions tested theme balancing, helped interpret factor signals and cluster sizes, and improved the presentation of factor layers. The v9 cluster solution provides the analytical foundation of v10.

The method has four connected stages:

1. Summarize GIS layers and landscape metrics on a hexagonal grid. The metrics describe relief, elevation differences, coast and sand, forest and protected nature, settlement, and open lowland and agricultural environments.
2. Represent the surrounding context with multiscale landscape measures. The exported analytical variable identifiers distinguish contextual means and standard deviations and retain their neighbourhood-scale suffixes.
3. Reduce the landscape measures to five factors. Factor loadings describe the relationship between each input variable and a factor. Factor scores describe how strongly each hexagon expresses that factor. The v9 analysis groups cells with similar factor profiles into eight clusters.
4. Interpret the clusters as five landscape types through an explicit crosswalk. The crosswalk makes direct transfers, the split of the mixed cluster and the treatment of settlement cores visible.

Two meanings of scale must be distinguished. **Neighbourhood scale** belongs to the contextual measures used in the analysis. **H3 display resolution** belongs to the map's visual aggregation. Selecting R8 rather than R10 changes the displayed summary; it does not recompute neighbourhood measures or fit a new factor or cluster model.

## Factors

- **F1 — Fracture valleys and steep relief.** Strong loadings on slope, relief and terrain variation support the interpretation of fracture-valley structure.
- **F2 — Aeolian sand and sandy coast.** Sand, dunes and coastal environments characterize this factor.
- **F3 — Forest and protected nature.** Forest and protected habitats characterize this factor.
- **F4 — Settlement and built structure.** Settlement, buildings and resident population characterize this factor.
- **F5 — Low-lying open land.** Low elevation and open landscape characterize this factor.

The complete factor-loading table is provided alongside the map. Original variable identifiers are retained to make the exported numeric results traceable. A positive or negative factor score expresses a relative model pattern, not an independent measure of landscape quality.

## The eight v9 structures

- **Cluster 1: Settlement and activity cores.** Strongly associated with F4.
- **Cluster 2: Fracture-valley influenced transition landscape.** Associated with F1.
- **Cluster 3: Mixed everyday landscape with a low factor profile.** No single strongly dominant factor.
- **Cluster 4: Aeolian sand and sandy coast — core zone.** Very strong F2.
- **Cluster 5: Fracture valley and steep relief — core zone with sand/coast.** Strong F1 and a secondary F2 signal.
- **Cluster 6: Open and low-lying mixed landscape.** Associated with F5.
- **Cluster 7: Forest and protected nature — core zone.** Strong F3.
- **Cluster 8: Sandy and coastal landscape.** Associated with F2, with a more mixed character than cluster 4.

The map's Structures view retains these analytical cluster identities. The Landscape types view presents the interpreted v10 synthesis of the same source cells.

## From clusters to landscape types

v10 transfers the clear v9 clusters directly to interpreted landscape types. The large mixed cluster 3 is split using F1, which identifies relief and fracture-valley influence within the agricultural landscape. The documented threshold is **F1 ≥ −0.45** for LT03 and **F1 < −0.45** for LT05 within cluster 3.

Settlement and activity cores are not a separate v10 landscape type. Cluster 1 cells are assigned to the nearest interpreted surrounding landscape type. The published crosswalk describes this as a medium-confidence interpretation. It is a classification rule, not a statement that settlement is absent from those areas.

{{table:landscape-types}}

The complete crosswalk records the interpretation and its qualitative confidence. These confidence labels are not calibrated probabilities.

{{table:crosswalk}}

## Distribution of landscape types

The source map contains **47,117 H3 R10 cells**. Plain and agricultural landscape is the largest class, followed by agricultural fracture-valley landscape. Together they account for approximately 77.5% of the source cells.

{{table:type-counts}}

These percentages are **shares of source-cell counts**, not a newly computed area-weighted survey of Bornholm. They use the source report's values rounded to one decimal place; the displayed shares sum to 99.9% because of rounding. They should not be read as parcel boundaries or exact administrative area statistics.

## Reading the multiscale map

The map provides five display resolutions from detail to the whole island:

{{table:resolutions}}

R10 preserves the source classification and factor scores. R9–R6 are existing summaries of those source cells: categorical attributes use modal values and factor scores use arithmetic means. These exports are retained without a new aggregation run. Rollups emphasize broad patterns and can hide small or mixed landscape features. The confidence and rule text carried by a coarser cell is descriptive source metadata, not a new statistical confidence assessment of its aggregated geometry.

**Auto** changes the displayed resolution with zoom: R10 from zoom 12, R9 from zoom 11, R8 from zoom 9, R7 from zoom 7, and R6 below zoom 7. A manual resolution selection remains active until Auto is selected again.

- **Landscape types** displays the five v10 interpretations with a consistent palette at every resolution.
- **Structures** displays the eight original v9 cluster categories, summarized at coarser resolutions.
- **Factors** displays continuous F1–F5 scores. The colour ramp is clipped at −4.5 and +4.5 for display; the underlying exported values are unchanged.
- **Opacity** adjusts the transparency of the thematic layer. Select a cell to inspect its identifier, type, structure, interpretation confidence and factor scores.

The web map and GeoJSON use longitude and latitude in EPSG:4326. The analysis has Bornholm's native metric CRS, EPSG:25833. This publication performs no new distance, area or buffer calculations.

## Factor loadings and model record

The following table reproduces the source report's ten strongest listed loadings for each factor. The full loading matrix is available from the Factor loadings page and as a CSV download. The source's full numeric matrix is preserved verbatim.

{{table:top-factor-loadings}}

{{table:run-summary}}

## Interpretation and further use

The landscape types provide structural context for landscape research, regional comparison, landscape planning and discussion of spatial variation. They help distinguish coastal, sandy, fracture-valley, forest/nature and low-lying agricultural settings.

The five types simplify a continuous and heterogeneous landscape. A class name should be read together with the factor scores, the original cluster and the surrounding geography. A sharp line between cells reflects the classified grid; it does not demonstrate a sharp ecological or visual boundary on the ground.

Local decisions need additional evidence, including field review and relevant environmental, cultural and planning information. The landscape classification does not itself determine suitability for a particular intervention.

## References and attribution

- **Kawalerowicz, Juta and Malmberg, Bo (2021).** *Multiscalar Typology of Residential Areas in Sweden*. Department of Human Geography, Stockholm University. The multiscalar contextualization, factor-score and interpreted-clustering workflow provides methodological inspiration; this Bornholm application uses landscape data. [Dataset and supporting material](https://su.figshare.com/articles/dataset/Multiscalar_typology_of_residential_areas_in_Sweden/14753826) · [Publication record](https://www.diva-portal.org/smash/record.jsf?pid=diva2:1624901).
- **Pontus Hennerdal — geocontext.** The geocontext concept and early implementation are acknowledged as methodological origins. [Original geocontext project](https://github.com/PonHen/geocontext). This publication distributes the resulting Bornholm display data; it does not copy that project's analysis code.
- **Bornholm landscape types (2025).** Local reference PDF used to support interpretation in the source analysis. The PDF is not included in this publication.
- **GISLab — Bornholm v9/v10 analysis.** The supplied source report, crosswalk, factor-loading matrix and R10–R6 map exports provide the factual basis of this publication. A file manifest records source checksums and publication adaptations.

## Supporting files

- [Interactive map](../map/)
- [Complete factor-loading table](../factor-loadings/)
- [Factor-loading matrix (CSV)](../data/factor-loadings.csv)
- [Cluster-to-type crosswalk (CSV)](../data/crosswalk.csv)
- [Landscape-type counts (CSV)](../data/type-counts.csv)
- [Source and adaptation manifest (JSON)](../data/source-manifest.json)
