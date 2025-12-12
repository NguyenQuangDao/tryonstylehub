'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  parent?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface MultiCategorySelectProps {
  categories: Category[];
  selectedCategories: string[];
  onChange: (selectedIds: string[]) => void;
}

export function MultiCategorySelect({
  categories,
  selectedCategories,
  onChange,
}: MultiCategorySelectProps) {
  const [open, setOpen] = useState(false);

  const handleCategoryToggle = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onChange(selectedCategories.filter(id => id !== categoryId));
    } else {
      onChange([...selectedCategories, categoryId]);
    }
  };

  const selectedNames = categories
    .filter(cat => selectedCategories.includes(cat.id))
    .map(cat => cat.name);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <span className="truncate">
            {selectedNames.length > 0
              ? selectedNames.join(', ')
              : 'Chọn danh mục'}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Chọn danh mục sản phẩm</DialogTitle>
          <DialogDescription>
            Chọn một hoặc nhiều danh mục cho sản phẩm của bạn
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={category.id}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => handleCategoryToggle(category.id)}
              />
              <Label
                htmlFor={category.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {category.name}
                {category.parent && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({category.parent.name})
                  </span>
                )}
              </Label>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onChange([])}>
            Bỏ chọn tất cả
          </Button>
          <Button onClick={() => setOpen(false)}>
            Xong
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}