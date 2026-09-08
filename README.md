# Portfolio Studio

Next.js 16 (App Router), React 19, TypeScript. Portfolio tiếng Việt, responsive, logo SVG, toolkit tự cuộn và section fade-in. Nội dung ban đầu là hồ sơ mẫu.

## Chạy local

1. npm install
2. npm run dev
3. Chỉnh sửa → Lưu thay đổi → Gửi HR. Website lưu bản sao trên server và trả link /?s=<mã 22 ký tự>.

Bản nháp vẫn ở localStorage. Bản chia sẻ nằm trong .data/shares/, không được commit lên Git. Link dùng được giữa các trình duyệt kết nối cùng server; link localhost không mở được từ máy HR bên ngoài.

Cùng nội dung tạo cùng link. Sửa nội dung tạo link mới; bản chia sẻ cũ giữ nguyên. Các link #p=... cũ vẫn hoạt động. Có thể nhập/xuất bản nháp JSON trong tab Liên kết.

## Chạy production trên máy chủ Node riêng

- Link ngắn cần API server: npm run build, sau đó npm start.
- Đặt SHARE_STORAGE_DIR thành đường dẫn tuyệt đối trên **ổ đĩa bền vững**, giữ lại qua restart/redeploy; các instance phải dùng chung thư mục này.
- Không dùng ổ tạm của serverless hoặc thư mục build để lưu hồ sơ. API production trả 503 khi chưa cấu hình nơi lưu, thay vì tạo link sẽ mất dữ liệu.
- Sao lưu và bảo vệ thư mục lưu trữ. Khôi phục đúng thư mục để giữ link cũ.
- Host phải phục vụ cả trang web và /api/shares cùng origin.
- Cấu hình mẫu: .env.example. Không commit .env.local hoặc dữ liệu hồ sơ.
- Đây là Next.js Node server, không còn là static export. Bản Sites đã xuất bản trước đây vẫn là bản tĩnh cũ; không đóng gói thư mục out/ cũ để phát hành thay đổi này. Vercel được hỗ trợ qua Blob theo hướng dẫn bên dưới; Cloudflare/Sites vẫn cần adapter và kho lưu trữ phù hợp.
- Người nhận phải có quyền truy cập website nếu hosting đang riêng tư.


## Production trên Vercel

1. Deploy phiên bản code có tích hợp @vercel/blob.
2. Vào Vercel Dashboard → project portfolio → Storage → Create Database → Blob.
3. Chọn access **Private**, tạo kho và kết nối đúng project cho môi trường **Production** (thêm Preview nếu cần).
4. Giữ tên biến môi trường mặc định. SDK dùng BLOB_STORE_ID với OIDC do Vercel quản lý, hoặc BLOB_READ_WRITE_TOKEN khi dùng token tĩnh. Không đặt tiền tố NEXT_PUBLIC_.
5. Redeploy để deployment nhận kết nối/biến môi trường mới.
6. Mở website production → Gửi HR → tạo link → mở link trong cửa sổ riêng tư.

Không đặt SHARE_STORAGE_DIR=/tmp trên Vercel: dữ liệu tạm không phải kho bền vững. Khi có kết nối Blob, API tự ưu tiên Blob; local không có kết nối vẫn lưu file như trước. Không tự chuyển sang disk khi Blob lỗi.

Hồ sơ lưu trong kho Private ở portfolio-shares/v1/<id>.json. Website chỉ trả hồ sơ qua API cho người có link; không đưa token hoặc URL kho ra trình duyệt. Các bản local chưa tự chuyển lên Blob; hãy tạo lại link bằng đúng hồ sơ trên website production. Không xóa hoặc đổi kho nếu muốn giữ các link đã gửi.

Tài liệu chính thức: https://vercel.com/docs/vercel-blob/using-blob-sdk
Kiểm tra adapter: node tests/share-blob.cjs (mock SDK; không upload dữ liệu). Cần kiểm tra thật sau khi kết nối kho trên Vercel.
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
