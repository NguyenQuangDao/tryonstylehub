'use client';

import { ProfileSettings } from '@/components';
import { Button, Separator } from '@/components/ui';

export default function ProfileSettingsPage() {
  return (
    <div className="mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-1/4">
          <nav className="flex flex-col gap-1">
            <Button
              variant="ghost"
              className="h-9 justify-start hover:bg-muted bg-muted font-medium"
            >
              Hồ sơ
            </Button>
            <Button variant="ghost" className="h-9 justify-start hover:bg-muted">
              Tài khoản
            </Button>
            <Button variant="ghost" className="h-9 justify-start hover:bg-muted">
              Bảo mật
            </Button>
            <Button variant="ghost" className="h-9 justify-start hover:bg-muted">
              Thông báo
            </Button>
          </nav>
        </aside>

        <div className="w-full md:w-3/4">
          <div className="mb-4">
            <h1 className="text-lg font-medium">Cài đặt hồ sơ</h1>
            <p className="text-sm text-muted-foreground">Cập nhật thông tin cá nhân và cách người khác nhìn thấy bạn.</p>
          </div>
          <Separator className="mb-6" />
          <ProfileSettings />
        </div>
      </div>
    </div>
  );
}
