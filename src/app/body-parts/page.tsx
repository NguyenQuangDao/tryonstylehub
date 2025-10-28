import BodyPartsComposer from '@/components/forms/BodyPartsComposer';

export default function BodyPartsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Body Parts Composer
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tạo mô hình người tùy chỉnh bằng cách ghép các bộ phận cơ thể khác nhau. 
            Hệ thống này nhanh chóng và hiệu quả với khả năng tùy chỉnh pixel-perfect.
          </p>
        </div>
        
        <BodyPartsComposer />
      </div>
    </div>
  );
}
