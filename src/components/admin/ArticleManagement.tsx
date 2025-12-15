'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth-context';
import {
  Edit,
  FileText,
  Loader2,
  Plus,
  Search,
  Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  category?: string;
  tags?: string[];
  featuredImage?: string;
  createdAt: string;
  author: {
    name: string;
    email: string;
  };
}

export default function ArticleManagement() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Partial<Article>>({});
  const [formLoading, setFormLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('DRAFT');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState(''); // Comma separated

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        status: statusFilter,
      });
      const response = await fetch(`/api/admin/articles?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setArticles(data.articles);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
          setTotalArticles(data.pagination.total);
        }
      } else {
        console.error('Failed to fetch articles:', data.error);
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
        router.push('/auth/login?callbackUrl=/admin'); 
        return;
    }
    const timer = setTimeout(() => {
        fetchArticles();
    }, 500);
    return () => clearTimeout(timer);
  }, [authLoading, user, router, fetchArticles]);

  const resetForm = () => {
    setTitle('');
    setSlug('');
    setContent('');
    setExcerpt('');
    setStatus('DRAFT');
    setCategory('');
    setTags('');
    setIsEditing(false);
    setCurrentArticle({});
  };

  const handleOpenDialog = (article?: Article) => {
    if (article) {
      setIsEditing(true);
      setCurrentArticle(article);
      setTitle(article.title);
      setSlug(article.slug);
      setContent(article.content);
      setExcerpt(article.excerpt || '');
      setStatus(article.status);
      setCategory(article.category || '');
      setTags(article.tags ? article.tags.join(', ') : '');
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setFormLoading(true);
      const url = isEditing 
        ? `/api/admin/articles/${currentArticle.id}` 
        : '/api/admin/articles';
      
      const method = isEditing ? 'PATCH' : 'POST';

      const body = {
        title,
        slug,
        content,
        excerpt,
        status,
        category,
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        setIsDialogOpen(false);
        fetchArticles();
        resetForm();
      } else {
        alert(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Có lỗi xảy ra khi lưu bài viết');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;

    try {
      const response = await fetch(`/api/admin/articles/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchArticles();
      } else {
        alert('Có lỗi xảy ra khi xóa bài viết');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Có lỗi xảy ra khi xóa bài viết');
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/([^0-9a-z-\s])/g, "")
      .replace(/(\s+)/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (!isEditing) {
      setSlug(generateSlug(e.target.value));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge className="bg-green-500 hover:bg-green-600">Đã xuất bản</Badge>;
      case 'DRAFT':
        return <Badge variant="secondary">Bản nháp</Badge>;
      case 'ARCHIVED':
        return <Badge variant="destructive">Lưu trữ</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading && !articles.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Quản lý bài viết</h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Thêm bài viết
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Tìm kiếm bài viết..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                <SelectItem value="PUBLISHED">Đã xuất bản</SelectItem>
                <SelectItem value="DRAFT">Bản nháp</SelectItem>
                <SelectItem value="ARCHIVED">Lưu trữ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách bài viết ({totalArticles})</CardTitle>
        </CardHeader>
        <CardContent>
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'ALL' ? 'Không tìm thấy bài viết nào phù hợp' : 'Chưa có bài viết nào'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Tác giả</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium">
                        <div>{article.title}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[300px]">{article.slug}</div>
                      </TableCell>
                      <TableCell>{article.author.name}</TableCell>
                      <TableCell>{getStatusBadge(article.status)}</TableCell>
                      <TableCell>{new Date(article.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(article)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(article.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <div className="text-sm font-medium">
                Trang {currentPage} / {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Cập nhật bài viết' : 'Thêm bài viết mới'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Chỉnh sửa thông tin bài viết.' : 'Tạo bài viết mới cho hệ thống.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Tiêu đề</Label>
              <Input id="title" value={title} onChange={handleTitleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="slug" className="text-right">Slug</Label>
              <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Danh mục</Label>
              <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tags" className="text-right">Tags</Label>
              <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Cách nhau bởi dấu phẩy" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Trạng thái</Label>
              <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Bản nháp</SelectItem>
                  <SelectItem value="PUBLISHED">Đã xuất bản</SelectItem>
                  <SelectItem value="ARCHIVED">Lưu trữ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <Label htmlFor="excerpt" className="text-right mt-2">Tóm tắt</Label>
              <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <Label htmlFor="content" className="text-right mt-2">Nội dung</Label>
              <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} className="col-span-3 min-h-[200px]" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={formLoading}>Hủy</Button>
            <Button onClick={handleSave} disabled={formLoading}>
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
