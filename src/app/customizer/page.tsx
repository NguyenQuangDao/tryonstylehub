import BodyCustomizer from '@/components/forms/BodyCustomizer';

export default function CustomizerPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Body Customizer</h1>
      <p className="text-sm text-gray-600">Chọn và xếp lớp các bộ phận để xem trước (Imaging of parts).</p>
      <BodyCustomizer />
    </div>
  );
}