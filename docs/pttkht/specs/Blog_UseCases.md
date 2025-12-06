# Bảng đặc tả Use Case Blog

| ID | Tên | Actor | Tiền đề | Dòng chính | Ngoại lệ/Lỗi | Hậu điều kiện |
|---|---|---|---|---|---|---|
| UC_Blog_List | Xem danh sách bài viết | Visitor/User | Có bài viết trạng thái `published` | Nhận tham số phân trang/lọc → truy vấn bài viết `published` → sắp xếp → trả danh sách | 400 tham số không hợp lệ; 200 danh sách rỗng nếu không có dữ liệu | Payload danh sách bài viết theo trang |
| UC_Blog_View | Xem chi tiết bài viết | Visitor/User | Post `published` tồn tại | Nhận `slug/postId` → truy vấn → enrich nội dung/ảnh → tải bình luận đã duyệt → trả chi tiết | 404 không tồn tại; 410 bài viết bị unpublish | Payload chi tiết bài viết |
| UC_Blog_Search | Tìm kiếm bài viết | Visitor/User | Có dữ liệu bài viết | Nhận `q`/filter → chuẩn hóa → tìm kiếm theo tiêu đề/nội dung/tags → sắp xếp điểm phù hợp → trả kết quả | 400 query không hợp lệ | Danh sách kết quả tìm kiếm |
| UC_Blog_Comment_Create | Bình luận bài viết | User | Đăng nhập; bài viết tồn tại | Parse body → validate → tạo comment trạng thái `pending/approved` tuỳ chính sách → trả thành công | 401 chưa đăng nhập; 404 post không tồn tại; 400 nội dung không hợp lệ | Comment mới được lưu |
| UC_Blog_Comment_Moderate | Kiểm duyệt bình luận | Admin | Đăng nhập Admin; comment tồn tại | Nhận `approve/reject` → cập nhật trạng thái → trả kết quả | 403 không đủ quyền; 404 không tồn tại | Trạng thái comment cập nhật |
| UC_Blog_Post_Create | Tạo bài viết | Author/Admin | Đăng nhập; dữ liệu hợp lệ | Parse JSON/FormData → validate → upload ảnh bìa S3 (nếu có) → tạo bài viết trạng thái `draft/published` → trả model | 401; 400; 503 lỗi upload | Bài viết mới lưu vào DB |
| UC_Blog_Post_Update | Chỉnh sửa bài viết | Author/Admin | Đăng nhập; sở hữu hoặc Admin | Tìm bài viết → validate cập nhật → upload ảnh mới (nếu có) → cập nhật → trả model | 403 không đủ quyền; 404 không tồn tại | Bài viết được cập nhật |
| UC_Blog_Post_Delete | Xoá bài viết | Author/Admin | Đăng nhập; sở hữu hoặc Admin | Tìm bài viết → xoá mềm/ cứng theo chính sách → trả success | 403; 404 | Bài viết bị xoá |
| UC_Blog_Post_PublishToggle | Xuất bản/Hủy xuất bản | Author/Admin | Đăng nhập; sở hữu hoặc Admin | Tìm bài viết → chuyển `status` `draft↔published` → trả success | 403; 404 | Trạng thái bài viết thay đổi |

