# Social Media Campaign Attribution for E-commerce Sales
## 🚀 Personal Project Analysis - "dat" Branch

This repository contains my personal contributions and analysis for the E-commerce Sales Attribution project. The goal is to determine the effectiveness of various marketing channels and optimize budget allocation using advanced data science models.

---

## 📂 Project Structure (Restructured)

I have reorganized the project to follow professional data science workflows:

- **`analysis_python/`**: Core analytical scripts and results.
  - `notebooks/`: Step-by-step analysis (Basic, Logistic Regression, Markov Chain).
  - `outputs/`: CSV results categorized by Research Questions (RQ1-RQ3).
- **`analysis_sql/`**: SQL scripts for data preparation and basic attribution metrics.
- **`data_preparation/`**: 
  - `raw/`: Original dataset (immutable).
  - `processed/`: Cleaned and encoded data ready for modeling.
- **`scripts/`**: Python utility scripts for data cleaning.

---

## 📊 Analytical Approach

### 1. Heuristic Models
I implemented standard attribution models to set a baseline:
- **First-Touch:** Credits the first channel a user interacted with.
- **Last-Touch:** Credits the final conversion point.
- **Linear:** Distributes credit equally across all touchpoints.

### 2. Algorithmic Models
To handle complex multi-touch journeys, I utilized:
- **Logistic Regression:** Used to calculate the conversion probability and channel influence coefficients.
- **Markov Chain:** Developed a transition matrix to identify the "Removal Effect," determining how much conversion would drop if a specific channel were removed.

### 3. Budget Simulation
Performed a "What-If" analysis to simulate ROI if the marketing budget was redistributed based on the Markov Chain results.

---

## 🛠️ How to Run

1. **Environment Setup:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Data Preparation:**
   Run `scripts/data_cleaning.py` to generate the files in `data/processed/`.

3. **Analysis:**
   Open the notebooks in `analysis_python/notebooks/` in chronological order (01 to 04).

---

## 📈 Key Findings (Personal Insights)
- **Display Ads** showed the highest conversion rate when acting as a "closer" (Last-Touch).
- **Email** marketing remains a highly stable channel for consistent engagement.
- The **Markov Chain** model suggested a 12% potential increase in efficiency if budget is shifted from lower-performing social ads to high-influence referral links.

---

**Author:** [Your Name/Dat]  
**Branch:** `dat`  
**Status:** In Progress / Refactored
