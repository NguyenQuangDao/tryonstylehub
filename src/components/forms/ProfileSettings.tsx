"use client";

import { useState } from "react";
import {
  Button,
  Input,
  Label,
  Textarea,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Separator,
} from "@/components/ui";

export default function ProfileSettings() {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("name@example.com");
  const [bio, setBio] = useState("");
  const isEmailVerified = true;

  const handleUpdate = () => {
    console.log({ displayName, username, email, bio });
  };

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src="" alt="Ảnh đại diện" />
          <AvatarFallback>US</AvatarFallback>
        </Avatar>
        <Button variant="outline" className="h-8">Thay đổi</Button>
      </div>

      <form className="space-y-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="displayName" className="text-sm font-medium">Tên hiển thị</Label>
          <Input
            id="displayName"
            className="h-9"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Tên hiển thị của bạn"
          />
          <p className="text-[12px] text-muted-foreground">Hiển thị trên hồ sơ của bạn.</p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="username" className="text-sm font-medium">Tên người dùng</Label>
          <Input
            id="username"
            className="h-9"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Chọn tên người dùng"
          />
          <p className="text-[12px] text-muted-foreground">3–20 ký tự; chữ, số, gạch dưới.</p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <Input
            id="email"
            type="email"
            className="h-9"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isEmailVerified}
          />
          <p className="text-[12px] text-muted-foreground">
            {isEmailVerified ? "Email của bạn đã được xác minh." : "Chúng tôi sẽ gửi thông báo đến địa chỉ này."}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="bio" className="text-sm font-medium">Giới thiệu</Label>
          <Textarea
            id="bio"
            className="min-h-[80px]"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Hãy giới thiệu đôi chút về bạn"
          />
          <p className="text-[12px] text-muted-foreground">Bạn có thể viết một phần giới thiệu ngắn.</p>
        </div>

        <Separator className="my-2" />

        <div className="flex justify-end">
          <Button type="button" className="h-9" onClick={handleUpdate}>
            Cập nhật hồ sơ
          </Button>
        </div>
      </form>
    </div>
  );
}
