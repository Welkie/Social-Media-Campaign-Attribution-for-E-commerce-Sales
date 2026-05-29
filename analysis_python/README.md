# Python Analysis

Main contents of this folder:

```text
analysis_python/
+-- notebooks/      # 4 Python notebooks
+-- outputs/        # CSV tables exported from the notebooks
+-- README.md       # this quick explanation file
```

## Input Data

The notebooks read 3 cleaned data files from the project root:

```text
data_touchpoints.csv
data_journeys.csv
data_encoded.csv
```

The notebooks only load the cleaned data, calculate attribution/model/simulation results, and export the results to CSV.

The shared helper file is:

```text
notebooks/notebook_header.py
```

This file helps the notebooks find the correct input data and save outputs to the correct folder: `analysis_python/outputs/`.

## How to Run

Run the notebooks in the correct order:

| Order | Notebook                                | Description                                                |
| ----: | --------------------------------------- | ---------------------------------------------------------- |
|    01 | `notebooks/01_attribution_basic.ipynb`  | Basic attribution for RQ1: First-Touch, Last-Touch, Linear |
|    02 | `notebooks/02_logistic_benchmark.ipynb` | Logistic regression benchmark for RQ2                      |
|    03 | `notebooks/03_attribution_markov.ipynb` | Markov chain removal effect for RQ2                        |
|    04 | `notebooks/04_simulation.ipynb`         | Budget reallocation simulation for RQ3                     |

You can open Jupyter from the project root, from `analysis_python/`, or from `analysis_python/notebooks/`. The paths in the notebooks have been set up to work in all of these cases.

## Outputs

All output CSV files are located in:

```text
analysis_python/outputs/
```

Current output structure:

```text
outputs/
+-- rq1_basic/
+-- rq2_logit/
+-- rq2_markov/
+-- rq3_simulation/
```

## Main Output Files

RQ1:

- `outputs/rq1_basic/01_attribution_share.csv`
- `outputs/rq1_basic/01_channel_conversion_rate.csv`
- `outputs/rq1_basic/01_social_media_summary.csv`

RQ2 logistic:

- `outputs/rq2_logit/02_model_metrics.csv`
- `outputs/rq2_logit/02_adjusted_coefficients.csv`
- `outputs/rq2_logit/02_adjusted_channel_share.csv`
- `outputs/rq2_logit/02_spearman_vs_logit.csv`
- `outputs/rq2_logit/02_kl_divergence.csv`
- `outputs/rq2_logit/02_channel_conversion_chi_square.csv`
- `outputs/rq2_logit/02_interpretation_notes.csv`

RQ2 Markov:

- `outputs/rq2_markov/03_transition_counts.csv`
- `outputs/rq2_markov/03_transition_matrix.csv`
- `outputs/rq2_markov/03_removal_effect.csv`
- `outputs/rq2_markov/03_attribution_share.csv`
- `outputs/rq2_markov/03_model_comparison.csv`

RQ3 simulation:

- `outputs/rq3_simulation/04_results.csv`
- `outputs/rq3_simulation/04_budget_weights.csv`
- `outputs/rq3_simulation/04_roi_by_channel.csv`
- `outputs/rq3_simulation/04_sensitivity.csv`
- `outputs/rq3_simulation/04_assumptions.csv`
- `outputs/rq3_simulation/04_per_channel_S0_equal.csv`
- `outputs/rq3_simulation/04_per_channel_S1_conversion_rate.csv`
- `outputs/rq3_simulation/04_per_channel_S2_linear_attribution.csv`

## How to Use for the Report

For RQ1, use the files in `rq1_basic/` to write the attribution share table and discuss Social Media.

For RQ2, use `rq2_logit/` as the main benchmark, then use `rq2_markov/` as an additional check using the Markov model.

For RQ3, use `rq3_simulation/04_results.csv` for the scenario summary table. The budget, ROI, sensitivity, and assumptions files can be used to further explain the simulation.

## Notes

- The current notebooks export CSV tables and do not focus on charts yet.
- If the cleaned data is updated, rerun the notebooks in this order: `01 -> 02 -> 03 -> 04`.
- The simulation results are only comparisons based on budget/revenue assumptions and should not be written as actual forecasts.
