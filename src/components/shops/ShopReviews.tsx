'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string;
  images: any[];
  createdAt: string;
  user: {
    name: string;
    avatarUrl?: string;
  };
}

interface ShopReviewsProps {
  shopId: string;
}

export function ShopReviews({ shopId }: ShopReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/shop-reviews?shopId=${shopId}`);
        const data = await response.json();
        
        if (response.ok) {
          setReviews(data.reviews || []);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [shopId]);

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Đánh giá</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Đang tải đánh giá...</div>
        </CardContent>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Đánh giá</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Chưa có đánh giá nào</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đánh giá ({reviews.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-4 last:border-b-0">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  {review.user.avatarUrl && (
                    <AvatarImage src={review.user.avatarUrl} alt={review.user.name} />
                  )}
                  <AvatarFallback>
                    {review.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{review.user.name}</span>
                    <StarRating rating={review.rating} />
                  </div>
                  
                  {review.comment && (
                    <p className="text-sm text-gray-700 mb-2">{review.comment}</p>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}