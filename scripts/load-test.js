import { check, sleep } from 'k6';
import http from 'k6/http';

// Cấu hình kịch bản test
export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Tăng dần lên 20 người dùng trong 30s (Ramp-up)
    { duration: '1m', target: 20 },  // Duy trì 20 người dùng trong 1 phút (Stress test nhẹ)
    { duration: '30s', target: 0 },  // Giảm dần về 0 (Ramp-down)
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% request phải phản hồi dưới 500ms
    http_req_failed: ['rate<0.01'],   // Tỷ lệ lỗi phải dưới 1%
  },
};

export default function () {
  // 1. Giả lập truy cập trang chủ
  const res = http.get('http://localhost:3000');

  // 2. Kiểm tra phản hồi
  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  // 3. Nghỉ ngẫu nhiên 1-3 giây giữa các lần click (giả lập hành vi người dùng thật)
  sleep(Math.random() * 2 + 1);
}
