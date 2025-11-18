'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Check, Eye, Loader2, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Application {
  id: number;
  businessName: string;
  businessDescription: string;
  website: string | null;
  socialMedia: string[] | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    createdAt: string;
  };
}

export default function SellerApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/admin/seller-applications');
      return;
    }

    if (status === 'authenticated' && session.user.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    if (status === 'authenticated' && session.user.role === 'ADMIN') {
      fetchApplications();
    }
  }, [status, session, router]);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/seller-applications');
      const data = await response.json();

      if (response.ok) {
        setApplications(data.applications);
      } else {
        alert(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      alert('Có lỗi xảy ra khi tải danh sách đơn đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId: number) => {
    if (!confirm('Bạn có chắc chắn muốn duyệt đơn đăng ký này?')) {
      return;
    }

    setProcessing(applicationId);

    try {
      const response = await fetch('/api/admin/seller-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          action: 'approve',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        fetchApplications(); // Refresh the list
      } else {
        alert(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Có lỗi xảy ra khi duyệt đơn');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (applicationId: number) => {
    setSelectedApplication(applications.find(app => app.id === applicationId) || null);
    setRejectDialogOpen(true);
  };

  const confirmReject = async () => {
    if (!selectedApplication || !rejectionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    setProcessing(selectedApplication.id);

    try {
      const response = await fetch('/api/admin/seller-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: selectedApplication.id,
          action: 'reject',
          rejectionReason: rejectionReason.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setRejectDialogOpen(false);
        setRejectionReason('');
        fetchApplications(); // Refresh the list
      } else {
        alert(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Có lỗi xảy ra khi từ chối đơn');
    } finally {
      setProcessing(null);
      setSelectedApplication(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary">Đang chờ duyệt</Badge>;
      case 'APPROVED':
        return <Badge variant="success">Đã duyệt</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Đã từ chối</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Quản lý đơn đăng ký người bán</h1>
        <p className="text-gray-600">Xem xét và duyệt các đơn đăng ký trở thành người bán</p>
      </div>

      <div className="grid gap-6">
        {applications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Không có đơn đăng ký nào</p>
            </CardContent>
          </Card>
        ) : (
          applications.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{application.businessName}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Người nộp: {application.user.name} ({application.user.email})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(application.status)}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedApplication(application)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Mô tả doanh nghiệp</Label>
                    <p className="text-sm text-gray-700 mt-1">{application.businessDescription}</p>
                  </div>

                  {application.website && (
                    <div>
                      <Label>Website</Label>
                      <a 
                        href={application.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {application.website}
                      </a>
                    </div>
                  )}

                  {application.socialMedia && application.socialMedia.length > 0 && (
                    <div>
                      <Label>Mạng xã hội</Label>
                      <div className="space-y-1">
                        {application.socialMedia.map((url, index) => (
                          <a 
                            key={index}
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm block"
                          >
                            {url}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Ngày nộp: {new Date(application.createdAt).toLocaleDateString('vi-VN')}</span>
                    {application.reviewedAt && (
                      <span>Ngày duyệt: {new Date(application.reviewedAt).toLocaleDateString('vi-VN')}</span>
                    )}
                  </div>

                  {application.status === 'PENDING' && (
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={() => handleApprove(application.id)}
                        disabled={processing === application.id}
                        className="flex items-center gap-2"
                      >
                        {processing === application.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        Duyệt
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleReject(application.id)}
                        disabled={processing === application.id}
                        className="flex items-center gap-2"
                      >
                        {processing === application.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                        Từ chối
                      </Button>
                    </div>
                  )}

                  {application.status === 'REJECTED' && application.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <Label>Lý do từ chối</Label>
                      <p className="text-red-700 text-sm mt-1">{application.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedApplication?.businessName}</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div>
                <Label>Người nộp</Label>
                <p className="text-sm text-gray-700">{selectedApplication.user.name} ({selectedApplication.user.email})</p>
              </div>
              
              <div>
                <Label>Mô tả doanh nghiệp</Label>
                <p className="text-sm text-gray-700">{selectedApplication.businessDescription}</p>
              </div>

              {selectedApplication.website && (
                <div>
                  <Label>Website</Label>
                  <a 
                    href={selectedApplication.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {selectedApplication.website}
                  </a>
                </div>
              )}

              {selectedApplication.socialMedia && selectedApplication.socialMedia.length > 0 && (
                <div>
                  <Label>Mạng xã hội</Label>
                  <div className="space-y-1">
                    {selectedApplication.socialMedia.map((url, index) => (
                      <a 
                        key={index}
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm block"
                      >
                        {url}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Ngày nộp: {new Date(selectedApplication.createdAt).toLocaleDateString('vi-VN')}</span>
                {selectedApplication.reviewedAt && (
                  <span>Ngày duyệt: {new Date(selectedApplication.reviewedAt).toLocaleDateString('vi-VN')}</span>
                )}
              </div>

              {selectedApplication.status === 'REJECTED' && selectedApplication.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <Label>Lý do từ chối</Label>
                  <p className="text-red-700 text-sm mt-1">{selectedApplication.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối đơn đăng ký</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="rejectionReason">Lý do từ chối *</Label>
            <Textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Vui lòng cung cấp lý do từ chối đơn đăng ký này..."
              rows={4}
              required
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Hủy
            </Button>
            <Button 
              onClick={confirmReject}
              disabled={!rejectionReason.trim() || processing !== null}
              variant="destructive"
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Từ chối'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}