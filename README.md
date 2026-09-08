# Portfolio Studio

Portfolio Next.js 16 (App Router), React 19, TypeScript. Giao diện tiếng Việt, responsive, hiệu ứng cuộn và reduced-motion. Nội dung ban đầu là hồ sơ mẫu; thay bằng thông tin thật trước khi chia sẻ.

## Chạy dự án
- Node.js >= 20.19.
- npm install
- npm run dev
- npm run build (xuất website tĩnh ra out/)
- node tests/sharing.cjs

## Sử dụng
1. Chọn Chỉnh sửa để cập nhật thông tin, dự án, kinh nghiệm, kỹ năng, email và link CV.
2. Lưu thay đổi: bản nháp nằm trong localStorage của trình duyệt trên thiết bị hiện tại.
3. Tab Liên kết cho phép xuất/nhập bản sao JSON khi đổi thiết bị.
4. Xem trước để xem giao diện không có thanh quản lý.
5. Gửi HR tạo một link chứa bản hồ sơ đã nén trong URL fragment. Link giữ nguyên nội dung tại thời điểm tạo; HR không thấy công cụ chỉnh sửa.
6. Sau khi thay đổi nội dung, tạo và gửi link mới.

## Quyền truy cập và giới hạn
- Bản nháp không đồng bộ giữa các thiết bị hay tên miền; không có cơ sở dữ liệu hoặc tài khoản quản trị.
- Mỗi người chỉ chỉnh sửa bản nháp trong trình duyệt của mình. Chế độ HR là giao diện chỉ xem, không phải chữ ký xác thực danh tính.
- Ai nhận được link đầy đủ đều có thể đọc nội dung khi được phép truy cập website. Link chứa toàn bộ hồ sơ, không phải một mã truy cập bí mật.
- Sites được triển khai riêng tư cho chủ sở hữu. Phải cấp quyền truy cập hoặc bật công khai trước khi gửi cho HR bên ngoài.
- Hãy gửi nguyên link; giới hạn độ dài của nền tảng nhắn tin có thể ảnh hưởng link chứa hồ sơ dài.
- CV sử dụng URL do người sở hữu cung cấp. Đảm bảo người nhận có quyền xem tệp.
- Các trường bị giới hạn kích thước, tối đa 12 dự án và 12 kinh nghiệm.
- Nội dung trong link cũ không thể thu hồi riêng; không đưa dữ liệu nhạy cảm vào hồ sơ.

## Kiểm tra
Production build và TypeScript thành công. Kiểm tra tự động cho Unicode, vòng nén/giải nén, URL không an toàn, email sai, payload lỗi, giới hạn danh sách và tính độc lập của bản chia sẻ. HTTP preview trả 200.
Không thực hiện kiểm thử tương tác trình duyệt. WebMCP start_portfolio_editing được bật khi trình duyệt hỗ trợ; chưa có môi trường WebMCP để kiểm chứng hợp đồng runtime.
