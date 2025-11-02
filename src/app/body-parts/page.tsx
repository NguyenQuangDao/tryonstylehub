import BodyPartsComposer from '@/components/forms/BodyPartsComposer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BodyPartsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold mb-4">
              Body Parts Composer
            </CardTitle>
            <CardDescription className="text-lg max-w-2xl mx-auto">
              Tạo mô hình người tùy chỉnh bằng cách ghép các bộ phận cơ thể khác nhau. 
              Hệ thống này nhanh chóng và hiệu quả với khả năng tùy chỉnh pixel-perfect.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BodyPartsComposer />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
