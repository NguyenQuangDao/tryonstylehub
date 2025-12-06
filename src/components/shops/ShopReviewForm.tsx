'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useState } from 'react';

interface ShopReviewFormProps {
  shopId: string;
}

export function ShopReviewForm({ shopId }: ShopReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (rating === 0) {
      setError('Vui lòng chọn số sao');
      return;
    }

    if (!comment.trim()) {
      setError('Vui lòng nhập nội dung đánh giá');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/shop-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shopId,
          rating,
          comment: comment.trim(),
          images: []
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Đánh giá đã được gửi. Cảm ơn bạn đã đánh giá shop!');
        setRating(0);
        setComment('');
        // Refresh the page to show the new review
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setError(data.error || 'Không thể gửi đánh giá');
      }
    } catch {
      setError('Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = () => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`p-1 transition-colors ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400`}
          >
            <Star className={`h-6 w-6 ${star <= rating ? 'fill-current' : ''}`} />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đánh giá shop</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 text-sm text-green-700 bg-green-100 border border-green-200 rounded-lg">
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Chọn số sao</label>
            <StarRating />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Nội dung đánh giá</label>
            <Textarea
              placeholder="Chia sẻ trải nghiệm của bạn về shop này..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
