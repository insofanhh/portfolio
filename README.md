# Portfolio Studio

Next.js 16 (App Router), React 19, TypeScript. Portfolio tiếng Việt, responsive, logo SVG, toolkit tự cuộn và section fade-in. Nội dung ban đầu là hồ sơ mẫu.

## Chạy local

1. npm install
2. npm run dev
3. Chỉnh sửa → Lưu thay đổi → Gửi HR. Website lưu bản sao trên server và trả link /?s=<mã 22 ký tự>.

Bản nháp vẫn ở localStorage. Bản chia sẻ nằm trong .data/shares/, không được commit lên Git. Link dùng được giữa các trình duyệt kết nối cùng server; link localhost không mở được từ máy HR bên ngoài.

Cùng nội dung tạo cùng link. Sửa nội dung tạo link mới; bản chia sẻ cũ giữ nguyên. Các link #p=... cũ vẫn hoạt động. Có thể nhập/xuất bản nháp JSON trong tab Liên kết.

## Chạy production

- Link ngắn cần API server: npm run build, sau đó npm start.
- Đặt SHARE_STORAGE_DIR thành đường dẫn tuyệt đối trên **ổ đĩa bền vững**, giữ lại qua restart/redeploy; các instance phải dùng chung thư mục này.
- Không dùng ổ tạm của serverless hoặc thư mục build để lưu hồ sơ. API production trả 503 khi chưa cấu hình nơi lưu, thay vì tạo link sẽ mất dữ liệu.
- Sao lưu và bảo vệ thư mục lưu trữ. Khôi phục đúng thư mục để giữ link cũ.
- Host phải phục vụ cả trang web và /api/shares cùng origin.
- Cấu hình mẫu: .env.example. Không commit .env.local hoặc dữ liệu hồ sơ.
- Đây là Next.js Node server, không còn là static export. Bản Sites đã xuất bản trước đây vẫn là bản tĩnh cũ; không đóng gói thư mục out/ cũ để phát hành thay đổi này. Muốn chạy trên Cloudflare/Sites/serverless cần chuyển kho bản chia sẻ sang lưu trữ bền vững của nền tảng và adapter phù hợp.
- Người nhận phải có quyền truy cập website nếu hosting đang riêng tư.

## API

- POST /api/shares: nhận hồ sơ hợp lệ, lưu snapshot bất biến, trả {id,path}.
- GET /api/shares/:id: trả {profile}; 400 cho mã sai, 404 khi không tồn tại, 503 khi kho lưu trữ lỗi.
- Không có API liệt kê, chỉnh sửa hay xóa snapshot. ID là 22 ký tự từ SHA-256 của nội dung; không coi ID là cơ chế xác thực.
- Người có link và quyền truy cập website có thể xem toàn bộ snapshot. Không có tài khoản quản trị riêng; API tạo snapshot phục vụ người có quyền truy cập website.
- Giới hạn request 160 KB, hồ sơ 40.000 ký tự, 12 dự án và 12 kinh nghiệm.

## Kiểm tra

- node tests/sharing.cjs: tương thích link dài, Unicode và validation.
- node tests/share-store.cjs: lưu bền qua process mới, snapshot bất biến, ghi đồng thời, cấu hình production.
- node tests/share-api.cjs http://127.0.0.1:3000: kiểm tra API trên server đang chạy bằng hồ sơ mẫu tổng hợp (tạo hai bản ghi thử trong kho).
- npm run build: compile và TypeScript.
- Chưa kiểm thử tương tác trình duyệt. WebMCP start_portfolio_editing chỉ bật trên trình duyệt hỗ trợ.
