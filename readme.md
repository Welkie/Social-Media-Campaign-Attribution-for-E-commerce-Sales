## KỸ THUẬT LÀM SẠCH VÀ CHUẨN BỊ DỮ LIỆU

### Bước 1: Load & Clean (Tải & Làm Sạch)

* Tải 10,000 touchpoints từ CSV
* Kiểm tra missing values: **0 NaN**
* Xóa duplicate rows: **0 duplicate tìm thấy**
* Convert Timestamp → datetime format
* Khoảng thời gian: 10/02/2025 → 11/02/2025

### Bước 2: Reconstruct Journeys (Tái Tạo Hành Trình)

* Sắp xếp by User ID + Timestamp (chronological order)
* Tái tạo **2,847 user journeys** từ 10,000 touchpoints
* Journey length: 1-12 touchpoints, **avg = 3.51**
* Converted users: **2,381 (83.6% conversion rate)**

### Bước 3: Data Understanding (Khám Phá)

#### 3.1 Channel Performance (Hiệu suất từng kênh)

| Channel        | Conversion Rate       |
| -------------- | --------------------- |
| Email          | **50.18%** (Cao nhất) |
| Referral       | 49.91%                |
| Display Ads    | 49.61%                |
| Direct Traffic | 49.56%                |
| Social Media   | 49.34%                |
| Search Ads     | 47.98% (Thấp nhất)    |

#### 3.2 First-Touch Attribution (Kênh phát hiện)

* **Display Ads** dẫn đầu: 86.99% conversion rate khi là first touch
* Direct Traffic: 84.05%
* Search Ads yếu nhất: 80.48%

#### 3.3 Last-Touch Attribution (Kênh chuyển đổi)

* **Display Ads** dẫn đầu lần nữa: 85.68%
* Referral: 84.40%
* Search Ads: 82.29% (thấp nhất)

#### 3.4 Campaign Performance

| Campaign           | Conversion Rate |
| ------------------ | --------------- |
| Brand Awareness    | **50.65%**      |
| Discount Offer     | 50.45%          |
| Retargeting        | 49.53%          |
| Winter Sale        | 48.62%          |
| New Product Launch | 47.74%          |

#### 3.5 Journey Length Distribution

* **343 users**: 1 touchpoint (direct conversion)
* **584 users**: 2 touchpoints
* **595 users**: 3 touchpoints (mode)
* **3 users**: 12 touchpoints (longest journey)

### Bước 4: Data Preparation (Chuẩn Bị)

#### 4.1 One-Hot Encoding

* Tạo **6 dummy variables** cho Channel:

  * Channel_Direct Traffic
  * Channel_Display Ads
  * Channel_Email
  * Channel_Referral
  * Channel_Search Ads
  * Channel_Social Media
* Dùng cho: Logistic Regression model (vì regression không xử lý categorical)

#### 4.2 Attribution Preparation

* Thêm cột `Is_First_Touch` (binary): 1 nếu là first touch
* Thêm cột `Is_Last_Touch` (binary): 1 nếu là last touch
* Thêm cột `Linear_Weight = 1/N_Touchpoints`:

  * User có 4 touchpoints → mỗi touchpoint được 0.25 credit
  * User có 2 touchpoints → mỗi touchpoint được 0.50 credit
* Thêm `Touchpoint_Rank`: vị trí trong hành trình
* Thêm `User_Converted`: flag nếu user đã convert

### Bước 5: Sanity Checks (Kiểm Tra Tính Hợp Lệ)

* **0 NaN values** trong tất cả DataFrames
* **Linear weights = 1.0** cho mỗi user (perfect)
* Touchpoints match: 10,000 rows
* Converted users: 2,381 users
* **Random seed = 42** cho reproducibility

### Bước 6: Export Data (Xuất Dữ Liệu)

Tạo **3 file CSV** chuẩn bị cho phân tích tiếp theo:

| File | Mục Đích | Rows |
|---|---|---|
| **data_journeys.csv** | Dữ liệu được gộp lại theo cấp độ Người dùng (mỗi dòng là toàn bộ hành trình của 1 khách).<br><br><strong>Mục đích:</strong> Dùng để vẽ các Sơ đồ luồng (Sankey Diagram), tìm hiểu khách hàng thường đi theo trình tự nào trước khi trả tiền. | 2,847 |
| **data_touchpoints.csv** | Dữ liệu chi tiết từng điểm chạm nhưng được tính sẵn điểm tín dụng dùng cho First-touch, Last-touch, và Linear trọng số.<br><br><strong>Mục đích:</strong> Là nguồn Data chính dùng để vẽ Biểu đồ Attribution (Attribution Bar Chart) nhằm phân bổ phần trăm ngân sách. | 10,000 |
| **data_encoded.csv** | Dữ liệu điểm chạm đã được số hóa mã nhị phân (One-hot Encoding). Nhằm biến chữ (tên kênh) thành các con số 1 và 0.<br><br><strong>Mục đích:</strong> Dùng riêng để huấn luyện mô hình Logistic Regression (trả lời cho bộ câu hỏi RQ2) do thuật toán Data Science chỉ có thể hiểu những con số. | 10,000 |

---

## GIẢI THÍCH Ý NGHĨA CỦA 3 FILE CSV

## File `data_journeys.csv` (Dữ liệu theo Khách hàng)

- **User ID**: Mã định danh ẩn danh của khách hàng.

- **N_Touchpoints**: Độ dài hành trình  
  (số lần người đó nhấp quảng cáo trước khi chấm dứt tương tác).

- **Channel_Sequence**: Con đường di chuyển.  
  Ví dụ:
  ```text
  Email -> Social Media -> Referral
  ```

- **First_Touch_Channel / First_Touch_Campaign**:  
  Nơi đầu tiên khách lạc vào phễu marketing  
  (Kênh và Chiến dịch đầu tiên).

- **Last_Touch_Channel / Last_Touch_Campaign**:  
  Nơi cuối cùng khách tương tác  
  (nơi xảy ra hoặc không xảy ra việc mua hàng).

- **Converted**: Boolean (`True/False`) xác nhận rằng xét theo toàn bộ hành trình, khách này có mua hàng hay không.

- **All_Campaigns**: Danh sách tất cả chiến dịch mà người này đã thấy qua.

## File `data_touchpoints.csv`  
(Dữ liệu Điểm chạm chuẩn bị tính Attribution)

Bao gồm các cột gốc:

- `User ID`
- `Timestamp`
- `Channel`
- `Campaign`
- `Conversion`

Ngoài ra còn có các cột mới:

- **Is_Conversion**:  
  Chuyển giá trị `Conversion = Yes/No` thành `1/0` để việc tính toán bằng số diễn ra nhanh hơn.

- **User_Converted**:  
  Đánh dấu `True/False` xem khách hàng của điểm chạm hiện tại cuối cùng có chốt đơn hay không.

- **Touchpoint_Rank / Touchpoint_Rank_Reverse**:  
  Thứ tự của điểm chạm trong hành trình.

  Ví dụ:
  - Điểm chạm là lần click thứ 2 → `Rank = 2`
  - Đồng thời là lần thứ 3 nếu đếm từ cuối lên → `Reverse = 3`

- **Is_First_Touch / Is_Last_Touch**:  
  Đánh dấu `1` nếu đây là điểm đầu tiên hoặc cuối cùng trong hành trình  
  (nếu không phải sẽ là `0`).

- **Linear_Weight**:  
  Điểm chia đều dùng cho mô hình **Linear Attribution**.

  Công thức:

  ```text
  Linear_Weight = 1 / Tổng số hành động
  ```

  Ví dụ:
  - Nếu hành trình có 4 cú click:
    ```text
    1 / 4 = 0.25
    ```
  - Mỗi điểm chạm sẽ nhận mức đóng góp bằng nhau là `0.25`.

## File `data_encoded.csv`  
(Dữ liệu dành cho Mô hình Hồi quy Logistic)

File này tương tự file gốc, nhưng thay vì có một cột `Channel` chứa chữ như:

```text
Email
Referral
Social Media
```

thì hệ thống sẽ tự động tách thành nhiều cột riêng:

- `Channel_Direct Traffic`
- `Channel_Display Ads`
- `Channel_Email`
- `Channel_Referral`
- `Channel_Search Ads`
- `Channel_Social Media`

Ví dụ:

Nếu điểm chạm xuất phát từ `Email`:

| Channel_Email | Channel_Referral | Channel_Search Ads |
|---|---|---|
| 1 | 0 | 0 |

Điều này giúp mô hình **Logistic Regression** có thể xử lý dữ liệu dạng phân loại (categorical data).

---

## KEY INSIGHTS

| Metric                 | Giá Trị                      |
| ---------------------- | ---------------------------- |
| Total Touchpoints      | **10,000**                   |
| Unique Users           | **2,847**                    |
| Converted Users        | **2,381 (83.6%)**            |
| Avg Touchpoints/User   | **3.51**                     |
| Most Common Journey    | **1-touchpoint (343 users)** |
| Best Converter Channel | **Display Ads: 85.68%**      |
| Best Awareness Channel | **Brand Awareness: 50.65%**  |

---

Dữ liệu đã sẵn sàng cho các bước phân tích tiếp theo:

* **RQ1**: So sánh Social Media vs các kênh khác
* **RQ2**: So sánh 3 attribution models (First/Last/Linear)
* **RQ3**: Mô phỏng tái phân bổ ngân sách

