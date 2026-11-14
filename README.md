# Bộ Khung Render Hoạt Hình 2D Canvas 60FPS Trên GitHub Actions

## 1. Cách đẩy lên GitHub để Render Đám Mây (0% tải cho laptop)
1. Giải nén thư mục này vào một repo GitHub mới (nên để **Public** để được miễn phí không giới hạn số phút chạy GitHub Actions).
2. Chạy lệnh đẩy code lên:
   ```bash
   git init
   git add .
   git commit -m "Test 1m 2D Canvas Cloud Render"
   git branch -M main
   git remote add origin https://github.com/<username-cua-ban>/<ten-repo>.git
   git push -u origin main
   ```
3. Vào tab **Actions** trên GitHub -> Workflow **Render 2D Canvas Animation (60FPS Cloud Matrix)** sẽ tự động chia 4 máy chủ chạy song song (mỗi máy render 15 giây = 900 frames), ghép giọng đọc `edge-tts` (`vi-VN-NamMinhNeural`) và xuất file `but_bi_bien_mat_1080p60.mp4` trong mục **Artifacts** sau khoảng 1,5 - 2 phút.

## 2. Cách chạy thử trực tiếp trên Asus ZenBook 8GB RAM (nếu muốn test offline)
```bash
npm install
npx playwright install chromium
npm run render:local
```
Script `scripts/render_chunk.mjs` dùng cơ chế truyền thẳng luồng ảnh qua `image2pipe` vào `ffmpeg` (không ghi hàng nghìn file ảnh tạm ra SSD) và khóa 1 tab duy nhất nên chỉ tốn ~1.1GB RAM.
