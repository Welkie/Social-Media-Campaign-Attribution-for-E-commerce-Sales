# Nhan Workspace — DAP391m Group 1

Personal workspace của Nguyen Trong Nhan cho project *Multi-Channel Attribution Modeling*.

## Cấu trúc

```
Nhan_workspace/
├── README.md                       ← bạn đang đọc
├── DAP391_Analysis_Report.html     ← báo cáo phân tích đầy đủ (đã cập nhật theo plan mới)
├── gemini_fix_prompt.md            ← prompt cho Gemini nếu cần edit lại HTML
├── notebook_header.py              ← helper load 3 file CSV của Khang (cast bool đúng)
├── notebooks/                      ← 4 notebook phân tích (sẽ viết)
└── paper/                          ← draft paper + figures (sẽ viết)
```

## Data source — KHÔNG đụng

Toàn bộ data đến từ project root sau khi clone repo:

```
Social-Media-Campaign-Attribution-for-E-commerce-Sales\
├── multi_touch_attribution_data.csv   ← source (10k touch, có giây)
├── data_cleaning.py                   ← script clean của Khang
├── data_touchpoints.csv               ← 10k rows + Linear_Weight (dùng cho 01, 04)
├── data_journeys.csv                  ← 2,847 rows user-level (dùng cho Sankey)
└── data_encoded.csv                   ← 10k rows + one-hot Channel (dùng cho 02 logistic)
```

**Quy ước:** không sửa file trong folder Khang. Nếu cần data khác → request Khang update script, hoặc derive trong notebook.

## Load data — cách dùng `notebook_header.py`

Đầu mỗi notebook:

```python
import sys
from pathlib import Path

for candidate in [Path.cwd().resolve(), Path.cwd().resolve().parent, Path.cwd().resolve() / "Nhan_workspace"]:
    if (candidate / "notebook_header.py").exists():
        sys.path.insert(0, str(candidate))
        break
else:
    raise FileNotFoundError("Could not find notebook_header.py")

from notebook_header import load_touchpoints, load_journeys, load_encoded, RANDOM_SEED

df_tp = load_touchpoints()   # 10,000 rows
df_jr = load_journeys()      # 2,847 rows
df_en = load_encoded()       # 10,000 rows + 6 Channel_* dummies
```

Helper đã tự cast bool đúng cách (`User_Converted`, `Converted`, `Is_First_Touch`, `Is_Last_Touch`). Nếu skip helper → bug ngầm vì pandas đọc `"True"` thành string truthy.

## Workflow

### Tuần này (25/05 – 28/05) — Analysis + viz

| # | Notebook | RQ | Input | Output |
|---|---|---|---|---|
| 01 | `01_attribution_basic.ipynb` | RQ1 | `data_touchpoints.csv` | bảng First/Last/Linear share + side-by-side bar |
| 02 | `02_logistic_benchmark.ipynb` | RQ2 | `data_encoded.csv` | Pseudo-R², AUC, odds ratio, Spearman ρ vs heuristic |
| 03 | `03_attribution_markov.ipynb` (stretch) | RQ2 | `data_journeys.csv` | transition matrix + removal-effect |
| 04 | `04_simulation.ipynb` | RQ3 | output của 01 | waterfall 3 scenario + sensitivity ±20% |

**Sanity check ở mọi notebook:** tổng attribution = 100%, tổng converted users = 2,381, `random_state=42`.

### 29–31/05 — Dashboard + application
- Streamlit dashboard 4 panel (xem section 9 plan PDF).
- CLI wrapper: `python run_attribution.py --input data_touchpoints.csv --out report/`.

### 01–06/06 — Paper writing
Plan deadline. Sections + người viết → xem `DAP391_Analysis_Report.html` Phase 9.

## Phân công

| Người | Task chính |
|---|---|
| **Nhân (mình)** | Notebook 02 (logistic) · Methodology · Results RQ2 · review tổng |
| Khang | Data pipeline (xong) · Notebook 01 · Data section · Results RQ1 |
| Đạt | Notebook 04 (simulation) · RQ3 · Discussion · Limitations |

## Limitations cần khai báo trong paper

1. **Signal yếu**: Channel × Conversion gần như độc lập (χ² = 1.92, p > 0.85). Đây là *finding*, không phải failure — motivate việc dùng logistic + Markov.
2. **Time range chỉ 2 ngày** (10–11/02/2025) → không phân tích được seasonal/weekly pattern.
3. **Revenue uniform $100/conversion** là giả định comparative, không phải actual forecast.
4. **Conversion mức touch (49.4%)** bất thường cao → trong paper, định nghĩa rõ: "Yes touch" = "tương tác conversion-positive tại touch đó", "user converted" = "≥1 touch Yes trong journey".

## Reference

- Plan mới: `Social-Media-Campaign-Attribution-for-E-commerce-Sales-main/ProjectPlanning_DAP_new.pdf`
- Báo cáo phân tích chi tiết: `DAP391_Analysis_Report.html` trong folder này
- Reference paper: `../dbm.2012.17.pdf` (ngoài root, level cao hơn)
