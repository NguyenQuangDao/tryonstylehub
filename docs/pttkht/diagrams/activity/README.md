# Mapping Use Case ↔ Activity

- UC_Auth_EmailPwd → `activity/Auth_EmailPwd.puml`
- UC_Upload_Image → `activity/Upload_Image.puml`
- UC_TryOn_Upload → `activity/TryOn_Upload.puml`
- UC_TryOn_Select → `activity/TryOn_Select.puml`
- UC_TryOn_AI → `activity/TryOn_AI.puml`
- UC_TryOn_Render → `activity/TryOn_Render.puml`
- UC_TryOn_Save → `activity/TryOn_Save.puml`
- UC_Rec_Feed → `activity/Rec_Feed.puml`
- UC_Tokens_Purchase → `activity/Tokens_Purchase.puml`
- UC_Payment_Webhook → `activity/Payment_Webhook.puml`
 - UC_Blog_List → `activity/Blog_Public_List_View.puml`
 - UC_Blog_View → `activity/Blog_Public_List_View.puml`
 - UC_Blog_Search → `activity/Blog_Public_List_View.puml`
 - UC_Blog_Post_Create → `activity/Blog_Posts_Manage.puml`
 - UC_Blog_Post_Update → `activity/Blog_Posts_Manage.puml`
 - UC_Blog_Post_Delete → `activity/Blog_Posts_Manage.puml`
 - UC_Blog_Post_PublishToggle → `activity/Blog_Posts_Manage.puml`
 - UC_Blog_Comment_Create → `activity/Blog_Comments_Manage.puml`
 - UC_Blog_Comment_Moderate → `activity/Blog_Comments_Manage.puml`

## Endpoints trọng yếu ↔ Activity
- `/api/auth/register` → `activity/Auth_Register.puml`
- `/api/tryon/status/[jobId]` → `activity/TryOn_Status.puml`
- `/api/virtual-models` (GET) → `activity/VirtualModels_List.puml`
- `/api/virtual-models` (POST) → `activity/VirtualModels_Create.puml`

## Khi nào cập nhật
- Thêm/đổi logic kiểm tra đầu vào, bảo mật, hoặc xử lý lỗi.
- Thay đổi nhà cung cấp thanh toán hoặc cấu hình token.
- Điều chỉnh pipeline Try-On, upload/encode ảnh, hoặc quy tắc Virtual Models.

## Ý nghĩa từng file
- `TryOn_Full.puml`: Sơ đồ tổng hợp pipeline Try-On từ upload → chọn item → AI/polling → render/encode → upload S3 → lưu gallery → cung cấp trạng thái job.
- `Auth_EmailPwd.puml`: Luồng đăng nhập bằng email/mật khẩu; validate, tra cứu user, so khớp mật khẩu băm, tạo JWT/cookie, các nhánh lỗi 400/401/503/500.
- `Auth_Register.puml`: Luồng đăng ký user; kiểm tra định dạng, hash mật khẩu, tạo bản ghi, xử lý email tồn tại và lỗi DB.
- `Tokens_Purchase.puml`: Mua token; tìm gói trong cấu hình, khởi tạo thanh toán (trả `paymentUrl` hoặc `clientSecret`), cập nhật `tokenBalance` khi success, các nhánh failed.
- `Payment_Webhook.puml`: Webhook Stripe; xác thực chữ ký, đọc `metadata`, idempotency, tăng tokenBalance/ghi purchase, phản hồi 200/400 cho các trường hợp.
- `Upload_Image.puml`: Upload ảnh sản phẩm; kiểm tra MIME/kích thước, tải lên S3 thư mục `products`, trả về danh sách URL, lỗi input/upload.
- `TryOn_Upload.puml`: Tải ảnh người dùng cho Try-On; validate, làm sạch EXIF/quét virus, phát sinh `imageId`/URL tạm thời.
- `TryOn_Select.puml`: Chọn item/biến thể/size; kiểm tra tồn kho/hợp lệ, ánh xạ size theo brand, trả cấu hình lựa chọn, lỗi 409.
- `TryOn_AI.puml`: Pipeline AI Try-On; kiểm tra API key và token, build payload, gọi prediction, polling trạng thái, hậu xử lý/encode, upload S3, charge tokens, nhánh lỗi/timeout.
- `TryOn_Render.puml`: Render/encode ảnh kết quả; resize theo ngưỡng, encode PNG/JPEG, upload S3, cấp URL hoặc presigned, lỗi CDN upload.
- `TryOn_Save.puml`: Lưu ảnh Try-On vào gallery; ghép entries, `putJSON`, trả thành công/TTL chia sẻ.
- `TryOn_Status.puml`: Truy vấn trạng thái job; trả completed/failed/pending hoặc 404 nếu không tồn tại.
- `Rec_Feed.puml`: Tạo feed gợi ý trang phục; validate với Zod, cache, tải/enrich sản phẩm, chọn theo IDs, fallback semantic, set cache và trả payload.
- `VirtualModels_List.puml`: Liệt kê virtual models của người dùng; xác thực token, truy vấn DB, trả danh sách.
- `VirtualModels_Create.puml`: Tạo virtual model mới; validate input, upload ảnh S3, tạo bản ghi DB, trả model, lỗi thiếu quyền/thiếu dữ liệu.
- `VirtualModels_Manage.puml`: Quản lý Virtual Models tổng hợp (List/Create/Update/Delete/Set default).
 - `Blog_Public_List_View.puml`: Luồng public danh sách/xem bài viết; cache, tìm kiếm, enrich, hiển thị bình luận.
 - `Blog_Posts_Manage.puml`: Quản lý bài viết (tạo/sửa/xoá/xuất bản, danh sách quản trị) với phân quyền Author/Admin.
 - `Blog_Comments_Manage.puml`: Quản lý bình luận (tạo, kiểm duyệt, xoá) với phân quyền.

# Mapping Use Case ↔ Activity

## Mục đích
- Ghi lại quy trình nghiệp vụ chi tiết cho các tính năng cốt lõi (Auth, Tokens/Payment, Try-On, Upload, Virtual Models, Feed) để đội ngũ phát triển, QA và liên quan nắm cùng một bức tranh.
- Làm cầu nối giữa Use Case ở mức chức năng và triển khai thực tế (endpoint/API, services), giúp truy vết và đối soát.
- Hỗ trợ thiết kế test case: từ mỗi nhánh activity suy ra các trường hợp thành công, lỗi, ngoại lệ.

## Cách dùng
- Mỗi sơ đồ activity tương ứng một luồng nghiệp vụ hoặc endpoint trọng yếu. Xem ánh xạ bên dưới để mở nhanh.
- Khi thay đổi API/logic, cập nhật sơ đồ tương ứng: thêm nhánh cho lỗi/ngoại lệ, điều kiện tiền đề/hậu quả.
- Quy ước trình bày: dùng `skinparam linetype ortho` để luồng dọc, tránh đường nối chéo. Không dùng `top to bottom direction` vì gây lỗi cú pháp trong activity.
- Render PlantUML: có thể dùng plugin VS Code hoặc CLI `plantuml -tsvg <file.puml>` để xuất ảnh.
