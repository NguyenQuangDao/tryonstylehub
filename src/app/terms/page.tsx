
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Điều khoản dịch vụ</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none space-y-4">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Giới thiệu</h2>
            <p>
              Chào mừng bạn đến với AIStyleHub. Khi sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu dưới đây.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Tài khoản người dùng</h2>
            <p>
              Bạn chịu trách nhiệm bảo mật thông tin tài khoản và mật khẩu của mình. Bạn đồng ý thông báo ngay cho chúng tôi nếu phát hiện bất kỳ việc sử dụng trái phép nào đối với tài khoản của bạn.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Quyền riêng tư</h2>
            <p>
              Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn. Vui lòng tham khảo Chính sách bảo mật của chúng tôi để hiểu rõ hơn về cách chúng tôi thu thập và sử dụng thông tin của bạn.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Hành vi bị cấm</h2>
            <p>
              Bạn không được sử dụng dịch vụ của chúng tôi để thực hiện các hành vi vi phạm pháp luật, lừa đảo, hoặc gây hại cho người khác.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Thay đổi điều khoản</h2>
            <p>
              Chúng tôi có quyền thay đổi các điều khoản này bất kỳ lúc nào. Những thay đổi sẽ có hiệu lực ngay khi được đăng tải trên trang web.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
