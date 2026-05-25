Project Planning DAP391m – Group 1
Lam Huynh Khang, Nguyen Trong Nhan, and Phan Tuan Dat
FPT University, Ho Chi Minh City, Vietnam

1 Introduction / Aim
This project focuses on measuring the contribution of each marketing channel to

conversion performance in order to support effective budget allocation. By ana-
lyzing real multi-touch customer journey data — comprising 10,000 touchpoint

records across 2,847 unique users and six distinct channels — the study aims to
identify how different channels influence customer conversion at each stage of
the journey.

Using multi-channel attribution models, the project evaluates channel per-
formance through first-touch, last-touch, and linear approaches. The final goal is

to provide data-driven insights that help optimize marketing spend and improve
overall return on investment (ROI).
2 Business Understanding and Analytic Approach
Deadline: 18/5/2026
2.1 Problem Statement
There is a lack of clarity regarding which marketing channels contribute most
to conversions. Without a proper attribution model, marketing spend — spread
across channels such as Social Media, Email, Search Ads, Display Ads, Referral,
and Direct Traffic — is difficult to justify and optimize.
2.2 Objectives & Approach
We will implement Multi-Channel Attribution Modeling to evaluate performance
across three key lenses:
– First-Touch: Identification of the discovery channel.
– Last-Touch: Identification of the conversion driver.
– Linear: Equal credit distribution across the journey.
2.3 Expected Impact
By reallocating the budget based on these insights, research indicates a potential
increase in ROI of 15% to 25%.

2 Group 1
3 Research Questions (RBL)
Deadline: 18/5/2026
3.1 RQ1 – Which social media channel contributes the most to
sales conversions compared to other channels?
Rationale: Social Media is one of six channels in the dataset. Marketers need
to know whether investment in Social Media meaningfully drives conversions
relative to channels such as Email, Display Ads, or Direct Traffic.
Method: Apply First-Touch, Last-Touch, and Linear attribution models on

real user journey paths (ordered by Timestamp per User ID). Compute the at-
tributed conversion share of Social Media under each model and compare against

all other channels.
Metrics:
– Share of attributed conversions (%) per channel under each model.
– Conversion rate by channel (row-level): Social Media achieves 49.3%, versus
Email at 50.2% and Search Ads at 48.0%.
– First-touch share: Social Media accounts for 16.3% of first touches among
converted users, versus Display Ads at 18.0% (highest).
3.2 RQ2 – Which attribution model best reflects the actual
conversion behavior observed in the data?
Rationale: First-Touch, Last-Touch, and Linear models each make different
assumptions about where credit belongs. An objective benchmark is needed to

determine which model’s channel rankings align most closely with observed con-
version outcomes.

Method: Train a Logistic Regression model using channel dummy variables
(one-hot encoded from the Channel column) to predict Conversion. Use the

resulting coefficients as an interpretable proxy for channel influence on conver-
sion probability. Compare channel rankings produced by each heuristic model

against the regression benchmark. Additionally (optional), compute pairwise KL-
divergence between attribution distributions to quantify differences in how each

model distributes credit.
Metrics:
– Pseudo-R2

(McFadden) and AUC of the logistic regression benchmark.
– Rank correlation (Spearman’s ρ) between each heuristic model’s channel
ranking and the logistic regression ranking.
– Pairwise KL-divergence between the three attribution distributions.

Project Planning DAP391m – Group 1 3
3.3 RQ3 – How much does reallocating the marketing budget based
on attribution results improve simulated conversion outcomes?
Rationale: Directly answers the financial question for the business: if budget is
shifted toward higher-attributed channels, how much uplift in conversions (and
thus revenue) can be expected?
Method: Simulate three budget scenarios using conversion rates derived from
the MTA dataset itself:

– S0 – Equal split: Budget distributed equally across all six channels (base-
line).

– S1 – Conversion-rate weighted: Budget proportional to each channel’s
observed conversion rate.
– S2 – Attribution weighted: Budget proportional to each channel’s Linear
attribution share.
Because the dataset does not contain real revenue information, a fixed assumed
revenue per conversion (e.g., $100) is used solely for comparative simulation
purposes, keeping the analysis self-contained within the dataset.
Metrics: ∆ conversions (%) and ∆ revenue (%) relative to the S0 baseline; ROI
per channel under each scenario; sensitivity range (±20% on assumed revenue
per conversion).
4 Data Collection, Understanding, Preparation
Deadline: 20/5/2026
4.1 Data Collection
The project uses the Multi-Touch Attribution dataset as the primary data
source:
https://www.kaggle.com/datasets/vivekparasharr/multi-touch-attribution
The dataset contains 10,000 rows and 5 columns, representing individual
touchpoint events across 2,847 unique users. Each row records one interaction
in a user’s journey. The important fields are:

– User ID – anonymized user identifier; used to group touchpoints into jour-
neys.

– Timestamp – date and time of the interaction; used to order touchpoints
chronologically.
– Channel – the marketing channel of the touchpoint (Email, Search Ads,
Social Media, Direct Traffic, Referral, Display Ads).
– Campaign – the campaign name associated with the interaction (Brand
Awareness, Discount Offer, Retargeting, Winter Sale, New Product Launch,
or none).

– Conversion – binary outcome (Yes/No) indicating whether the user con-
verted at that touchpoint.

4 Group 1
4.2 Data Understanding
The dataset captures real multi-touch customer journeys. Users have between 1
and 12 touchpoints (mean: 3.51), making it suitable for multi-touch attribution
without synthetic path generation. Key exploratory steps include:
– Analyzing conversion rates across channels: Email (50.2%), Referral (49.9%),
Display Ads (49.6%), Direct Traffic (49.6%), Social Media (49.3%), Search
Ads (48.0%).
– Reconstructing user-level conversion status: a user is considered converted if
any of their touchpoint rows contains Conversion = Yes.
– Identifying the most common channel sequences leading to conversion.
– Exploring co-occurrence patterns between channels within journeys.
Processing steps:
– Sorting all rows by User ID and Timestamp to reconstruct chronological
journeys.
– Deriving user-level conversion labels from row-level Conversion flags.
– Checking for duplicate rows and missing values.
Constructed features: ordered channel sequences per user, first-touch channel,
last-touch channel, number of touchpoints, conversion flag (user-level).
4.3 Data Preparation
1. Cleaning missing and duplicate rows.
2. Casting Timestamp to datetime; sorting by User ID, Timestamp.
3. One-hot encoding Channel for logistic regression.
4. Grouping rows by User ID to produce journey-level records (path, first
touch, last touch, conversion label).
5. Transforming data into the appropriate format for each attribution model.
5 Data Analysis with SQL
Deadline: 20/5–24/5/2026
– First-Touch Conversion Rate: For each user, identify the first touchpoint

(MIN Timestamp per User ID) and aggregate by Channel to compute first-
touch conversion rates.

– Last-Touch Sales Attribution: For each converted user, identify the final

touchpoint (MAX Timestamp) and aggregate by Channel to quantify last-
touch attribution share.

– Linear Attribution Analysis: Assign equal credit (1/pathlength) to each
touchpoint and sum credits per Channel to evaluate average contribution
across the funnel.
– Path Pattern Identification: Concatenate Channel values in timestamp

order per user, then rank the most frequent sequences that result in conver-
sion.

Project Planning DAP391m – Group 1 5

6 Data Analysis with Python
Deadline: 20/5–24/5/2026
6.1 Tools Used
– Pandas, NumPy – data processing, journey reconstruction, attribution
credit computation.
– scikit-learn – logistic regression, train/test split, AUC evaluation.
– statsmodels – logistic regression with coefficient confidence intervals and
odds ratios.
– NetworkX – path analysis for Markov chain attribution (stretch goal).
– matplotlib, seaborn – visualization.
6.2 6-Step Workflow

1. Load & clean – Load the MTA CSV (10,000 rows, 5 columns), drop dupli-
cate rows, parse Timestamp to datetime, verify no missing values.

2. Reconstruct journeys – Sort by User ID + Timestamp; group into per-
user ordered channel sequences; derive user-level conversion labels.

3. Implement attribution models – Compute First-Touch, Last-Touch, and
Linear attribution on real paths. Stretch goal: Markov chain (removal-effect
on the transition matrix using NetworkX).

4. Logistic regression benchmark – One-hot encode Channel; train logis-
tic regression to predict Conversion; extract coefficients as a data-driven

attribution weight; evaluate with AUC and Pseudo-R2
.

5. Compare models – Compute attribution distribution per (channel × model);

draw side-by-side bar charts; compute Spearman rank correlation and pair-
wise KL-divergence between models.

6. Simulate budget reallocation – Apply 3 scenarios (S0 / S1 / S2); compute

∆ conversion (%) and simulated ∆ revenue (%) using a uniform revenue-per-
conversion assumption; present sensitivity range (±20%).

6.3 Expected Outputs

– 01_attribution_basic.ipynb – First-Touch, Last-Touch, Linear + side-
by-side bar chart.

– 02_logistic_benchmark.ipynb – Logistic regression attribution weights,
AUC, coefficient table.

– 03_attribution_markov.ipynb (stretch) – Removal-effect table + assump-
tion notes.

– 04_simulation.ipynb – Waterfall chart of 3 scenarios + sensitivity range.
– Summary table of attribution shares per (channel × model).

6 Group 1
6.4 Sanity Checks
– Total attribution percentage in each model must equal 100%.
– Total attributed conversions must match the number of converted users
(2,381 users with at least one Conversion = Yes touchpoint).
– No channel may have a negative credit value; no NaN values.
– Random seed = 42 in every notebook for reproducibility.
7 Data Visualization
Deadline: 28/5/2026
The visualization section illustrates real customer journey patterns and the
contribution of each channel in the conversion process.
7.1 Sankey Diagram
Represents multi-touch paths between channels before conversion. Built directly
from the ordered Channel sequences in the MTA dataset. Helps:
– Visualize actual customer journey flows.
– Identify the most common conversion paths.
– Track channel-to-channel transitions.
7.2 Bar Chart – Attribution Contribution

Displays the attribution percentage of each channel under different models (First-
Touch, Last-Touch, Linear). Helps compare which channel has the highest con-
tribution and how credit distribution differs across methods.

7.3 Waterfall Chart – Budget Impact
Simulates the impact of budget reallocation across S0, S1, and S2 scenarios.
Shows:
– Expected change in simulated conversions and revenue.
– ROI changes across channels.
– Overall effect of attribution-guided budget optimization.
7.4 Heatmap – Channel Co-occurrence
Illustrates how frequently two channels appear together in the same user journey.
Helps identify channel pairs that work together and patterns in paths leading to
conversion.

Project Planning DAP391m – Group 1 7

8 Regression Analysis
Deadline: 28/5/2026
– Conversion Modeling (Logistic Regression): Use logistic regression
with Channel dummy variables to model conversion probability. Coefficients
serve as data-driven attribution weights, answering RQ2.
– Marginal Contribution Identification: Analyze regression coefficients
and odds ratios to quantify the incremental lift in conversion probability
associated with each channel.
– Model Evaluation (Pseudo-R2

): Use McFadden’s Pseudo-R2 and AUC
as goodness-of-fit metrics to assess how well the logistic regression captures
the relationship between channels and conversion.
– Budget Elasticity Analysis: Using S1/S2 simulation results, calculate
the marginal change in simulated revenue per 1% budget shift toward each
channel to identify the optimal reallocation point.
9 Data Analysis with Tool (Dashboard)
Deadline: 28/5/2026
9.1 Purpose
Build an interactive dashboard so that the marketing team can (i) quickly see
which channel is performing, (ii) compare attribution models, and (iii) simulate
budget changes via a slider and see conversion/revenue update in real time.
9.2 Dashboard Structure – 4 Panels
Panel 1 – Channel Performance Overview
– KPI cards: total touchpoints (10,000) · unique users (2,847) · converted users
(2,381) · user-level conversion rate (83.6%).
– Bar chart: touchpoint count & conversion rate by channel.
– Slicers: Channel, Campaign, Conversion status.
Panel 2 – Attribution Comparison
– Stacked bar: attribution share per channel × 3 models (First / Last / Linear).

– Card: top-ranked channel under each model (First-Touch: Display Ads; Last-
Touch: Direct Traffic; Linear: Direct Traffic / Display Ads tied).

– Drill-down: click a channel to see breakdown by Campaign.
Panel 3 – Customer Journey
– Sankey: real channel transitions before conversion.
– Heatmap: channel pairs that co-occur in user journeys.
– Table: top 5 most common paths leading to conversion.

8 Group 1
Panel 4 – Budget Allocation Simulation

– Interactive slider: % budget per channel (default: equal split across 6 chan-
nels).

– Card: forecasted conversions and simulated revenue (updates in real time).
– Waterfall: ∆ revenue relative to the S0 baseline.
– Table: ROI per channel under the selected scenario.
10 Application
Deadline: 29/5–31/5/2026
11 Paper Writing
Deadline: 1/6/2026–6/6/2026

dataset là multi_touch_attribution_data.cvs
Triển khai thực hiện cho tui phần 4 Data Collection, Understanding, Preparation này thôi, đừng làm phần khác 
Triển khai vào file data_cleaning.py
Giải thích bằng tiếng việt những bạn đã làm và giải thích ý nghĩa các cột sau khi cleaned