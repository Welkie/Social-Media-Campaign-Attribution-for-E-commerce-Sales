# BƯỚC 1: TẢI VÀ KHÁM PHÁ DỮ LIỆU (Data Loading & Exploration)

## Kết quả

- Tải thành công dataset 12,330 hàng × 18 cột từ `online_shoppers_intention.csv`
- Không có dữ liệu thiếu (Missing Values)
- Các cột chính:
  - Administrative
  - Informational
  - ProductRelated
  - BounceRates
  - ExitRates
  - PageValues
  - TrafficType
  - VisitorType
  - Revenue
  - etc.

---

# BƯỚC 2: HIỂU DỮ LIỆU (Data Understanding)

## Phân tích chuyển đổi

- Tỷ lệ chuyển đổi chung: 15.47%
  - 1,908 phiên chuyển đổi / 12,330 tổng cộng

---

## Theo Traffic Type (Loại lưu lượng)

| TrafficType | Tỷ lệ chuyển đổi |
|---|---|
| 7, 8, 20 | 27-30% |
| 2, 5 | 21-22% |
| 3, 13 | 5-8% |

---

## Theo Visitor Type (Loại khách truy cập)

| VisitorType | Tỷ lệ chuyển đổi |
|---|---|
| New_Visitor | 24.91% |
| Other | 18.82% |
| Returning_Visitor | 13.93% |

---

## Theo Tháng

| Tháng | Tỷ lệ chuyển đổi |
|---|---|
| Nov | 25.35% |
| May | 1.63% |
| Feb | 10.85% |

---

# BƯỚC 3: LÀM SẠCH DỮ LIỆU (Data Cleaning)

## 1. Xóa bản sao

- Tìm thấy 125 bản sao
- Loại bỏ → Dataset còn 12,205 hàng

---

## 2. Chuẩn hóa dữ liệu

- BounceRates & ExitRates: Chuẩn hóa vào khoảng `[0, 1]`

| Giá trị | Kết quả |
|---|---|
| Min | 0.0000 |
| Max | 0.2000 |

---

## 3. Chuyển đổi kiểu dữ liệu

| Cột | Kiểu mới |
|---|---|
| Month | Category |
| VisitorType | Category |
| TrafficType | Category |
| Revenue | Boolean |
| Weekend | Boolean |

---

# BƯỚC 4: CHUẨN BỊ DỮ LIỆU (Data Preparation)

## 1. Tạo SessionID

- Tạo định danh duy nhất cho mỗi phiên (1 đến 12,205)

---

## 2. Tạo Traffic Segments (Channel)

Ánh xạ TrafficType thành các kênh marketing có ý nghĩa:

| Channel | Số phiên | Tỷ lệ |
|---|---|---|
| Referral | 3,911 | 32% |
| Other | 2,567 | 21% |
| Direct/Organic | 2,388 | 20% |
| Social Media | 2,013 | 17% |
| Display Ads | 1,066 | 9% |
| Paid Search | 260 | 2% |

---

## 3. Tính năng Bounce Session

- Tạo cột `IsBounceSession` để xác định phiên bounce (tỷ lệ bounce = 1.0)

---

## 4. Phân tích PageValues

| Chỉ số | Giá trị |
|---|---|
| Min | 0.00 |
| Mean | 5.95 |
| Max | 361.76 |

---

## 5. Sắp xếp dữ liệu

- Sắp xếp theo thứ tự thời gian (`Month → SessionID`)

---

# KIỂM TRA CHẤT LƯỢNG (Sanity Checks)

| Kiểm tra | Kết quả |
|---|---|
| Không có NaN | True |
| Không có Infinity | True |
| SessionID duy nhất | True |
| Revenue chỉ True/False | True |

---

# Ý nghĩa từng cột trong `data_cleaned.csv`

| STT | Cột | Kiểu | Ý nghĩa | Ví dụ |
|---|---|---|---|---|
| 1 | SessionID | Integer | Định danh duy nhất của mỗi phiên người dùng | 1, 2, 3, ... 12,205 |
| 2 | Administrative | Integer | Số lần truy cập trang hành chính | 0, 2, 5 |
| 3 | Administrative_Duration | Float | Tổng thời gian (giây) trên trang hành chính | 0.0, 123.45 |
| 4 | Informational | Integer | Số lần truy cập trang thông tin | 0, 1, 3 |
| 5 | Informational_Duration | Float | Tổng thời gian (giây) trên trang thông tin | 0.0, 45.67 |
| 6 | ProductRelated | Integer | Số lần truy cập trang sản phẩm | 1, 5, 20 |
| 7 | ProductRelated_Duration | Float | Tổng thời gian (giây) xem sản phẩm | 0.0, 456.78 |
| 8 | BounceRates | Float | Tỷ lệ bounce trung bình của trang | 0.0, 0.5, 1.0 |
| 9 | ExitRates | Float | Tỷ lệ thoát từ trang | 0.0, 0.2, 1.0 |
| 10 | PageValues | Float | Tổng giá trị của các trang được xem | 0.0, 5.95, 361.76 |
| 11 | SpecialDay | Float | Ngày lễ/sự kiện đặc biệt (0=không) | 0.0, 1.0 (Valentine), 2.0 (Mother's Day) |
| 12 | Month | Category | Tháng phiên diễn ra | Jan, Feb, Mar, ... Dec |
| 13 | OperatingSystems | Integer | Mã hệ điều hành | 1, 2, 3, ... |
| 14 | Browser | Integer | Mã trình duyệt | 1, 2, 3, ... |
| 15 | Region | Integer | Mã vùng địa lý | 1, 2, 3, ... |
| 16 | TrafficType | Category | Mã loại lưu lượng (gốc, chưa ánh xạ) | 1, 2, 3, ... 20 |
| 17 | VisitorType | Category | Loại khách truy cập | New_Visitor, Returning_Visitor, Other |
| 18 | Weekend | Boolean | Phiên có phải vào cuối tuần? | True, False |
| 19 | Revenue | Boolean | Phiên có chuyển đổi/mua hàng? | True, False |
| 20 | Channel | String | Tên kênh marketing (đã ánh xạ) | Direct/Organic, Referral, Social Media, ... |
| 21 | IsBounceSession | Boolean | Phiên bounce 100%? | True, False |