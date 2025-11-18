'use client';

export const dynamic = 'force-dynamic';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ApplicationData {
  businessName: string;
  businessDescription: string;
  website: string;
  socialMedia: string[];
}

interface ExistingApplication {
  id: number;
  businessName: string;
  businessDescription: string;
  website: string | null;
  socialMedia: string[] | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason: string | null;
  createdAt: string;
}

export default function SellerApplicationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(true);
  const [existingApplication, setExistingApplication] = useState<ExistingApplication | null>(null);
  const [formData, setFormData] = useState<ApplicationData>({
    businessName: '',
    businessDescription: '',
    website: '',
    socialMedia: [''],
  });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/auth/login?callbackUrl=/seller/apply');
      return;
    }
    checkExistingApplication();
  }, [loading, user, router]);

  const checkExistingApplication = async () => {
    try {
      const response = await fetch('/api/seller/apply');
      const data = await response.json();

      if (data.hasApplication) {
        setExistingApplication(data.application);
      }
    } catch (error) {
      console.error('Error checking application:', error);
    } finally {
      setCheckingApplication(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/seller/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          socialMedia: formData.socialMedia.filter(url => url.trim() !== ''),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        router.push('/seller/dashboard');
      } else {
        alert(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Có lỗi xảy ra khi nộp đơn');
    } finally {
      setSubmitting(false);
    }
  };

  const addSocialMedia = () => {
    setFormData(prev => ({
      ...prev,
      socialMedia: [...prev.socialMedia, ''],
    }));
  };

  const removeSocialMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: prev.socialMedia.filter((_, i) => i !== index),
    }));
  };

  const updateSocialMedia = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: prev.socialMedia.map((url, i) => i === index ? value : url),
    }));
  };

  if (loading || checkingApplication) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (existingApplication) {
    return (
      <div className="container max-w-2xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái đơn đăng ký</CardTitle>
            <CardDescription>Thông tin về đơn đăng ký trở thành người bán của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tên doanh nghiệp</Label>
              <p className="text-sm text-gray-600 mt-1">{existingApplication.businessName}</p>
            </div>
            
            <div>
              <Label>Mô tả doanh nghiệp</Label>
              <p className="text-sm text-gray-600 mt-1">{existingApplication.businessDescription}</p>
            </div>

            {existingApplication.website && (
              <div>
                <Label>Website</Label>
                <p className="text-sm text-gray-600 mt-1">{existingApplication.website}</p>
              </div>
            )}

            {existingApplication.socialMedia && existingApplication.socialMedia.length > 0 && (
              <div>
                <Label>Mạng xã hội</Label>
                <div className="space-y-1 mt-1">
                  {existingApplication.socialMedia.map((url, index) => (
                    <p key={index} className="text-sm text-gray-600">{url}</p>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label>Trạng thái</Label>
              <div className="mt-1">
                <Badge 
                  variant={
                    existingApplication.status === 'APPROVED' ? 'default' :
                    existingApplication.status === 'REJECTED' ? 'destructive' :
                    'secondary'
                  }
                >
                  {existingApplication.status === 'PENDING' && 'Đang chờ duyệt'}
                  {existingApplication.status === 'APPROVED' && 'Đã được duyệt'}
                  {existingApplication.status === 'REJECTED' && 'Bị từ chối'}
                </Badge>
              </div>
            </div>

            {existingApplication.rejectionReason && (
              <div>
                <Label>Lý do từ chối</Label>
                <p className="text-sm text-red-600 mt-1">{existingApplication.rejectionReason}</p>
              </div>
            )}

            <div>
              <Label>Ngày nộp đơn</Label>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(existingApplication.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>

            {existingApplication.status === 'APPROVED' && (
              <Button 
                onClick={() => router.push('/seller/dashboard')}
                className="w-full"
              >
                Đến trang quản lý người bán
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Đăng ký trở thành người bán</CardTitle>
          <CardDescription>
            Hoàn thành biểu mẫu dưới đây để nộp đơn trở thành người bán trên AIStyleHub
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="businessName">Tên doanh nghiệp *</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                required
                placeholder="Nhập tên doanh nghiệp của bạn"
              />
            </div>

            <div>
              <Label htmlFor="businessDescription">Mô tả doanh nghiệp *</Label>
              <Textarea
                id="businessDescription"
                value={formData.businessDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, businessDescription: e.target.value }))}
                required
                placeholder="Mô tả chi tiết về doanh nghiệp, sản phẩm và dịch vụ của bạn (ít nhất 50 ký tự)"
                rows={4}
                minLength={50}
                maxLength={2000}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.businessDescription.length}/2000 ký tự
              </p>
            </div>

            <div>
              <Label htmlFor="website">Website (tùy chọn)</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://example.com"
              />
            </div>

            <div>
              <Label>Mạng xã hội (tùy chọn)</Label>
              {formData.socialMedia.map((url, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    type="url"
                    value={url}
                    onChange={(e) => updateSocialMedia(index, e.target.value)}
                    placeholder="https://instagram.com/yourprofile"
                  />
                  {formData.socialMedia.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeSocialMedia(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSocialMedia}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm mạng xã hội
              </Button>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                'Nộp đơn'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}