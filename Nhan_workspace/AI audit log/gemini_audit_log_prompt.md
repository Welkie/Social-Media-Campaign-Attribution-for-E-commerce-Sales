# Prompt cho Gemini — Tạo AI Audit Log DAP391m (Nhân)

> Copy toàn bộ prompt bên dưới (trong block ```) paste vào Gemini. Đính kèm 3 file:
> 1. `AI_AuditLog_Student_Guideline_DAP391m.pdf`
> 2. `AI_AuditLog_Lecturer_Guideline_DAP391m.pdf`
> 3. `AI_AuditLog_Template_DAP391m.xlsx`
>
> (Optional, để Gemini ground tốt hơn — đính thêm 3 notebook `01_attribution_basic.ipynb`, `02_logistic_benchmark.ipynb`, `04_simulation.ipynb` và `notebook_header.py`)

---

```
# VAI TRÒ
Bạn là trợ lý học thuật giúp tôi (Nguyễn Trọng Nhân, sinh viên FPT University, môn DAP391m) soạn thảo AI Audit Log đạt chuẩn theo guideline đã đính kèm. Đây là cấu phần BẮT BUỘC chiếm 30% tổng điểm môn học — nếu fail ≥2 tiêu chí thì mất toàn bộ 30%.

# MỤC TIÊU
Soạn thảo nội dung điền vào file `AI_AuditLog_Template_DAP391m.xlsx` (4 sheets) sao cho:
- Đạt rubric "Prompt Selection Quality" 10% (toàn Core Prompts, phân bố đều theo 5 components)
- Đạt rubric "Reflection Depth" 10% (Human Delta đầy đủ 4 câu hỏi cho MỖI entry, evidence cụ thể)
- Chuẩn bị tôi answer được Oral Vivas (giảng viên sẽ hỏi vấn đáp 3-5 entries ngẫu nhiên)

# CONTEXT DỰ ÁN CỦA TÔI (NGUỒN ĐỂ GROUND, KHÔNG ĐƯỢC BỊA)

## Tổng quan
- **Môn:** DAP391m (FPT University, Sem 4, 2026)
- **Nhóm:** Group 1 (tôi là project lead, phụ trách Python analysis + paper writing)
- **Đề tài:** Multi-Channel Attribution Modeling for E-commerce Sales — Social Media Campaign Attribution
- **Dataset:** 10,000 touchpoints · 2,847 unique users · 2,381 converted users · 6 channels (Social Media, Email, Search Ads, Display Ads, Referral, Direct Traffic)
- **Đặc điểm dataset:** Signal yếu — Chi-square test Channel × Conversion cho χ² = 1.92, p > 0.85 → near-independent. Đây là **finding quan trọng**, không phải bug.

## 3 Research Questions
1. **RQ1** — Social Media đóng góp bao nhiêu vào conversion so với 5 kênh còn lại? → First-Touch / Last-Touch / Linear attribution
2. **RQ2** — Heuristic attribution model nào (FT/LT/Linear) phản ánh đúng nhất hành vi conversion thực tế? → Logistic Regression benchmark + Spearman ρ + KL-divergence
3. **RQ3** — Re-allocate budget theo attribution share cải thiện simulated revenue/conversion bao nhiêu? → 3 scenarios (S0 equal split, S1 conversion-rate weighted, S2 linear attribution weighted), sensitivity ±20%

## Tool stack đã dùng
- Python 3.10+ trong Jupyter notebook (VSCode)
- pandas, numpy, scikit-learn, statsmodels, scipy, matplotlib, seaborn
- Khang (teammate) viết script `data_cleaning.py` cho ra 3 CSV: data_touchpoints.csv (10k rows + cột pre-computed Linear_Weight), data_journeys.csv (user-level, có First/Last_Touch_Channel), data_encoded.csv (10k rows + 6 cột Channel_* one-hot)

## CÁC QUYẾT ĐỊNH QUAN TRỌNG TÔI ĐÃ THỰC HIỆN (DÙNG LÀM MATERIAL CHO ENTRIES)

### Business & Problem Understanding
1. Quyết định KHÔNG dùng Markov Chain attribution làm core deliverable — coi là stretch goal sau deadline 28/05 vì rủi ro timeline. (3 RQ chính dùng First/Last/Linear là đủ để trả lời nghiên cứu.)
2. Quyết định focus paper vào "comparative methodology giữa các attribution models" thay vì "actual revenue forecasting" — bởi vì signal Channel × Conversion quá yếu (χ²=1.92), forecasting cụ thể không defensible.
3. Map 3 RQ → 3 notebook tách biệt (01/02/04) thay vì 1 notebook tổng — tradeoff giữa reproducibility (mỗi RQ chạy riêng được) và overhead (phải share output qua file CSV).

### Data Understanding & Preparation
4. Quyết định dùng 3 CSV "internal" của Khang (đã pre-compute Linear_Weight, First/Last_Touch_Channel, Channel_* one-hot) thay vì file external `multi_touch_attribution_data_cleaned.csv` ở root project. Lý do: file internal có sẵn pre-computed features → không phải recompute lại trong notebook tôi.
5. Phát hiện bug: file source CSV mà Khang dùng đã bị Excel strip mất phần giây của timestamp (e.g., "2025-02-10 07:58" thay vì "2025-02-10 07:58:51") → sort theo timestamp non-deterministic → First_Touch_Channel / Last_Touch_Channel assignment có thể sai. Fix bằng cách copy lại file source gốc (có seconds) và re-run script của Khang.
6. Phát hiện Khang's CSVs lưu boolean dưới dạng string Python ("True"/"False") chứ không phải True/False thực sự → pandas đọc CSV không tự cast → quyết định viết module `notebook_header.py` xử lý tập trung load + bool cast cho 3 notebook, tránh duplicate logic.
7. Cân nhắc xem có nên thêm time features (hour, day-of-week) và campaign dummies vào data_cleaning.py không — quyết định SKIP cả 2 fix này. Lý do: time features tính 1 dòng khi cần; campaign dummies không required bởi research plan.

### Exploratory Data Analysis (EDA)
8. Quyết định dùng sanity check assertions (`assert len(df_tp) == 10_000`, `assert df_jr['Converted'].sum() == 2_381`) ở đầu mỗi notebook thay vì chỉ print → catch sớm nếu Khang re-clean và đổi dataset shape.
9. Phát hiện 3 phân phối attribution (First/Last/Linear) gần như identical (KL-divergence ~0) → cảnh báo signal yếu sẽ làm RQ2 không có "winner model" rõ ràng → quyết định bổ sung discussion về "no clear winner" vào paper Limitations.

### Modeling & Regression Analysis
10. Quyết định chọn `statsmodels.Logit` thay vì `sklearn.LogisticRegression` cho RQ2. Lý do: cần p-value và confidence interval cho từng coefficient để discussion về significance — sklearn không cho trực tiếp.
11. Quyết định dùng user-level aggregation (`.any()` trên 6 channel dummies, merge với Converted label) thay vì touchpoint-level. Lý do: target Converted là thuộc tính của user, không phải touchpoint — tránh data leakage.
12. Quyết định dùng train/test split 70/30 với stratify=y, random_state=42. Lý do: tỷ lệ converted (~83.6%) imbalance nhẹ — stratify giữ tỷ lệ đồng nhất 2 phân vùng.
13. Quyết định metric goodness-of-fit: McFadden Pseudo-R² + AUC trên test set. Lý do: Pseudo-R² cho biết model fit so với null model; AUC cho biết discriminative power — 2 góc nhìn khác nhau.
14. Quyết định dùng Spearman ρ thay vì Pearson r để so sánh ranking giữa heuristic vs logit. Lý do: chỉ quan tâm thứ tự (rank), không phải giá trị tuyệt đối — Spearman robust với outlier.

### Evaluation, Visualization & Reporting
15. Quyết định 3 scenarios cho simulation RQ3: S0 equal split (baseline), S1 conversion-rate weighted, S2 linear-attribution weighted. Loại bỏ scenarios khác (first-touch weighted, last-touch weighted) — lý do: paper plan PDF chỉ define 3 scenarios này.
16. Quyết định constants simulation: $100/conversion (uniform), TOTAL_BUDGET = $100,000, COST_PER_TOUCH = $10 (= 100000/10000 touchpoints). Lý do: $100/conversion là spec của plan PDF; cost/touch derive từ budget/touchpoints để match data scale.
17. Quyết định sensitivity analysis ±20% trên revenue/conversion (factors [0.8, 1.0, 1.2]). Lý do: range plausible cho marketing scenarios, cho thấy ranking giữa scenarios có robust hay không.
18. Quyết định waterfall chart 2-panel (absolute revenue + delta % vs S0) thay vì single panel. Lý do: paper cần cả số tuyệt đối và relative improvement — 1 chart không thể hiện được cả 2 rõ ràng.
19. Quyết định save mỗi notebook 3-7 output CSV files riêng thay vì 1 file tổng. Lý do: paper Results section cần data tabular riêng cho từng RQ — tách file giúp re-export dễ hơn.

## CÁC HALLUCINATION CASES TÔI ĐÃ PHÁT HIỆN (HOẶC GIẢ LẬP NẾU CHƯA ĐỦ 3)

Tôi đã có thể gặp các tình huống sau khi làm việc với AI (ChatGPT/Claude/Copilot). Bạn (Gemini) hãy expand thành entries hoàn chỉnh cho Sheet 3 — Hallucination Detection. Nếu thiếu, hãy đề xuất 2-3 hallucination plausible mà sinh viên DAP391m thường gặp (Fabrication paper / Logic error / Outdated API).

- **Case 1 (Fabrication):** AI từng trích dẫn paper "Shao & Li (2011) — Data-driven multi-touch attribution models" như là nguồn cho Markov Chain attribution. Tôi search Google Scholar → paper có thật, nhưng AI nhớ sai authors hoặc năm publication → cần verify lại đúng metadata.
- **Case 2 (Logic Error / Oversimplification):** AI gợi ý "Logistic Regression luôn cho AUC > 0.7 với dummy features" — nhưng thực tế trên dataset của tôi AUC ~0.5 vì signal yếu. AI đã oversimplify, không xét trường hợp dataset gần independent.
- **Case 3 (Context Misunderstanding):** AI gợi ý dùng `class_weight='balanced'` cho logistic regression vì "imbalanced data". Tôi check tỷ lệ: 83.6% converted vs 16.4% non-converted → mild imbalance, không cần class weight. AI assumed imbalance level severe hơn thực tế.

# YÊU CẦU OUTPUT

## Format
Output dưới dạng **markdown table** dễ copy-paste vào file xlsx, chia thành 4 phần tương ứng 4 sheets:

### Phần 1 — Sheet "1. Metadata & Summary"
Điền các trường:
- Student Name: Nguyễn Trọng Nhân
- Student ID: (để placeholder `[ID của Nhân]`)
- Course: DAP391m
- Assignment: Multi-Channel Attribution Modeling Project
- Total Prompts Used (all AI tools): đề xuất con số plausible (~120-180)
- Core Prompts Logged: 18 (giá trị nằm giữa range 15-20)
- Selection Ratio: tự tính
- Hallucination Detected: 3
- AI Tools Used table: liệt kê ChatGPT, Claude, GitHub Copilot, Gemini với purpose phù hợp work tôi đã làm
- Core Prompts Distribution: 18 = 3 (Business) + 4 (Data Prep) + 3 (EDA) + 5 (Modeling) + 3 (Evaluation) — vừa đủ min cho mỗi component

### Phần 2 — Sheet "2. Detailed Audit Log" (QUAN TRỌNG NHẤT)
**18 entries**, mỗi entry là 1 row với 8 cột: Entry # | Prompt Type | Stage/Component | Problem/Context | Prompt to AI | AI Response (Summary) | Human Delta & Reflection | Evidence

**Rule cứng cho mỗi entry:**
- `Prompt Type`: chỉ 1 trong 3 — DECISION / PROBLEM-SOLVING / VERIFICATION (in HOA)
- `Stage/Component`: 1 trong 5 — Business & Problem Understanding / Data Understanding & Preparation / Exploratory Data Analysis (EDA) / Modeling & Regression Analysis / Evaluation, Visualization & Reporting
- `Problem/Context`: 1-2 câu mô tả ngắn gọn vấn đề tôi gặp phải tại thời điểm đó
- `Prompt to AI`: viết NGUYÊN VĂN prompt thực tế (in tiếng Việt hoặc Anh — tự nhiên như cách sinh viên gõ), độ dài 1-3 câu, có context cụ thể (số liệu/tên dataset/library), KHÔNG ghi prompt trivial dạng "How to declare DataFrame in Pandas"
- `AI Response (Summary)`: 2-4 câu tóm tắt AI trả lời gì
- `Human Delta & Reflection`: BẮT BUỘC có 4 phần label rõ ràng:
  - **Critical Thinking:** AI đúng/sai chỗ nào? Phát hiện edge case AI miss?
  - **Contextualization:** Bối cảnh dataset/business/timeline mà AI không biết?
  - **Creative Synthesis:** Tôi đã modify/combine/extend AI's suggestion ra sao?
  - **Decision Ownership:** Quyết định cuối cùng + lý do (không được "AI gợi ý nên tôi làm theo")
- `Evidence`: 1 câu mô tả minh chứng cụ thể (e.g., "Screenshot logit_summary.csv với p-value cột Channel_Social Media = 0.74", "Diff giữa code trước/sau khi thêm `stratify=y`", "Plot ranking_comparison.png cho thấy 4 model gần như identical")

**Phân bố 18 entries:**
- 3 entries Business & Problem Understanding (dùng material #1, #2, #3 ở trên)
- 4 entries Data Prep (material #4, #5, #6, #7)
- 3 entries EDA (material #8, #9 + tự đề xuất thêm 1)
- 5 entries Modeling (material #10, #11, #12, #13, #14)
- 3 entries Evaluation (material #15, #17, #18 hoặc #16, #19, #18)

**Tỷ lệ Prompt Type:** mục tiêu ~8-10 DECISION, ~5-6 PROBLEM-SOLVING, ~3-4 VERIFICATION. 3 entries VERIFICATION phải match với 3 hallucination cases ở Sheet 3.

### Phần 3 — Sheet "3. Hallucination Detection"
3 rows tương ứng 3 hallucination cases. Mỗi row 6 cột: Entry # (from Sheet 2) | Hallucination Type | AI's Claim | Reality Check | How Detected | Corrective Action

Hallucination Type chỉ chọn từ: Fabrication / Oversimplification / Logic Error / Outdated Info / Context Misunderstanding

### Phần 4 — Sheet "4. Self-Assessment Checklist"
Tick (☑) tất cả checkbox đạt, để (☐) cho cái chưa chắc. Mục C (Oral Vivas prep) — chọn 3 entries quan trọng nhất (Decision-Making), điền sẵn lý do tôi sẽ trả lời được.

# QUY TẮC NGHIÊM NGẶT

1. **KHÔNG fabricate dataset stats khác với 10,000 / 2,847 / 2,381 / χ²=1.92.** Đây là số thật của project tôi.
2. **KHÔNG tạo entry trivial** (syntax/formatting/boilerplate). Mỗi entry phải pass quiz: "Nếu không có prompt này, project có khác về bản chất không?" — nếu trả lời "không" → bỏ.
3. **KHÔNG copy nguyên ví dụ trong guideline PDF** (Telco Customer Churn / XGBoost / drone telemetry / Smith et al. 2023 / Jones et al. 2022). Phải tailor toàn bộ về context project Attribution của tôi.
4. **Human Delta KHÔNG được viết sáo rỗng** dạng "AI helped me a lot", "I learned something". Phải có lập luận technical cụ thể có thể defend trong oral vivas.
5. **Evidence phải reference file/cell/output có thật trong project** — ví dụ: `outputs/logit_summary.csv`, `notebook_header.py:line 30`, `02_logistic_benchmark.ipynb cell 11`, `simulation_results.csv row S2`.
6. **Prompt to AI viết bằng tone tự nhiên** như sinh viên Việt Nam thực sự gõ (mix Việt-Anh OK, không cần quá formal). Độ dài 1-3 câu, không quá ngắn (trivial) và không quá dài (không realistic).
7. **Verification prompts phải link với hallucination ở Sheet 3** — Sheet 3 row "Entry #" phải tham chiếu đúng entry trong Sheet 2.

# OUTPUT FINAL

Format trả lời:
1. Bắt đầu bằng tóm tắt 1 đoạn (3-4 câu): bạn đã hiểu context project chưa, bạn approach output ra sao
2. Phần 1: Metadata (bảng markdown)
3. Phần 2: Detailed Audit Log (bảng markdown 18 rows × 8 cols)
4. Phần 3: Hallucination Detection (bảng markdown 3 rows × 6 cols)
5. Phần 4: Self-Assessment Checklist (markdown với ☑/☐)
6. Kết bằng: 3-5 câu hỏi mà giảng viên có thể hỏi tôi trong Oral Vivas + gợi ý cách tôi nên trả lời cho mỗi câu

Nếu bạn cần clarify gì về project trước khi viết, hãy hỏi tôi TRƯỚC khi sinh output. Đừng đoán.
```

---

## Sau khi nhận output từ Gemini

1. **Đọc lại 18 entries** — entry nào không "ring true" (tôi không nhớ thực sự đã làm) → sửa hoặc xoá
2. **Copy table Phần 2 sang sheet "2. Detailed Audit Log"** của file xlsx (paste special → text)
3. **Tương tự cho Sheet 1, 3, 4**
4. **Replace `[ID của Nhân]`** bằng mã SV thật
5. **Đọc 3-5 entries quan trọng + practice trả lời theo gợi ý Oral Vivas** Gemini đưa ra

## Nguy cơ Gemini có thể mắc

- **Bịa số liệu khác** (e.g., n=5000 thay vì 10000) — verify ngay khi đọc
- **Dùng lại ví dụ Telco/XGBoost** trong guideline thay vì context attribution của tôi
- **Reflection sáo rỗng** — nếu thấy "AI helped me improve" → loại
- **Evidence vague** ("comparison table") — yêu cầu cụ thể file/cell

Nếu Gemini sinh kém ở mục nào → reply ngắn: "Phần [X] chưa đạt vì [Y], làm lại với [Z]"
