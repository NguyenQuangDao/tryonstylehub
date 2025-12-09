"use client";

import {
  Avatar,
  AvatarImage,
  Button,
  Input,
  Label,
  Separator,
  Textarea
} from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";

interface ProfileSettingsProps {
  initialDisplayName?: string;
  initialUsername?: string;
  initialEmail?: string;
  initialBio?: string;
  avatarUrl?: string | null;
  isEmailVerified?: boolean;
}

export default function ProfileSettings({
  initialDisplayName = "",
  initialUsername = "",
  initialEmail = "",
  initialBio = "",
  avatarUrl = null,
  isEmailVerified = true,
}: ProfileSettingsProps) {
  const { refetchUser } = useAuth();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [username, setUsername] = useState(initialUsername);
  const [email, setEmail] = useState(initialEmail || "name@example.com");
  const [bio, setBio] = useState(initialBio);
  const [gender, setGender] = useState<'male' | 'female' | 'non-binary'>('male')
  const [height, setHeight] = useState<number>(170)
  const [weight, setWeight] = useState<number>(65)
  const [skinTone, setSkinTone] = useState<string>('medium')
  const [eyeColor, setEyeColor] = useState<string>('brown')
  const [hairColor, setHairColor] = useState<string>('black')
  const [hairStyle, setHairStyle] = useState<string>('short')

  useEffect(() => {
    setDisplayName(initialDisplayName);
  }, [initialDisplayName]);
  useEffect(() => {
    setUsername(initialUsername);
  }, [initialUsername]);
  useEffect(() => {
    setEmail(initialEmail || "name@example.com");
  }, [initialEmail]);
  useEffect(() => {
    setBio(initialBio);
  }, [initialBio]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('avatarDefaults')
      if (raw) {
        const d = JSON.parse(raw)
        if (d.gender) setGender(d.gender)
        if (typeof d.height === 'number') setHeight(d.height)
        if (typeof d.weight === 'number') setWeight(d.weight)
        if (d.skinTone) setSkinTone(d.skinTone)
        if (d.eyeColor) setEyeColor(d.eyeColor)
        if (d.hairColor) setHairColor(d.hairColor)
        if (d.hairStyle) setHairStyle(d.hairStyle)
      }
    } catch {}
  }, [])

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveOk, setSaveOk] = useState(false)

  const handleUpdate = async () => {
    setSaving(true)
    setSaveError(null)
    setSaveOk(false)
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          gender,
          height,
          weight,
          skinTone,
          eyeColor,
          hairColor,
          hairStyle,
        })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setSaveError(data.error || 'Cập nhật hồ sơ thất bại')
        setSaving(false)
        return
      }
      await refetchUser()
      setSaveOk(true)
    } catch {
      setSaveError('Lỗi mạng khi cập nhật hồ sơ')
    } finally {
      setSaving(false)
    }
  };

  const handleSaveDefaults = () => {
    const d = { gender, height, weight, skinTone, eyeColor, hairColor, hairStyle }
    try { localStorage.setItem('avatarDefaults', JSON.stringify(d)) } catch {}
  }

  return (
    <div className="w-full space-y-6">
      {avatarUrl && <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={avatarUrl || undefined} alt="Ảnh đại diện" />
        </Avatar>
        <Button variant="outline" className="h-8">Thay đổi</Button>
      </div>}

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

        {/* <div className="flex flex-col gap-2">
          <Label htmlFor="username" className="text-sm font-medium">Tên người dùng</Label>
          <Input
            id="username"
            className="h-9"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Chọn tên người dùng"
          />
          <p className="text-[12px] text-muted-foreground">3–20 ký tự; chữ, số, gạch dưới.</p>
        </div> */}

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

        <div className="space-y-3">
          <h3 className="text-base font-semibold">Mặc định cho Avatar</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-sm font-medium">Giới tính</Label>
              <select value={gender} onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'non-binary')} className="h-9 rounded-md border px-2 text-sm w-full mt-1">
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="non-binary">Khác</option>
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium">Chiều cao (cm)</Label>
              <Input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="h-9 mt-1" />
            </div>
            <div>
              <Label className="text-sm font-medium">Cân nặng (kg)</Label>
              <Input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="h-9 mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-sm font-medium">Màu da</Label>
              <select value={skinTone} onChange={(e) => setSkinTone(e.target.value)} className="h-9 rounded-md border px-2 text-sm w-full mt-1">
                <option value="very-light">Rất sáng</option>
                <option value="light">Sáng</option>
                <option value="medium">Trung bình</option>
                <option value="tan">Nâu nhạt</option>
                <option value="brown">Nâu</option>
                <option value="dark">Tối</option>
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium">Màu mắt</Label>
              <select value={eyeColor} onChange={(e) => setEyeColor(e.target.value)} className="h-9 rounded-md border px-2 text-sm w-full mt-1">
                <option value="brown">Nâu</option>
                <option value="black">Đen</option>
                <option value="blue">Xanh dương</option>
                <option value="green">Xanh lá</option>
                <option value="gray">Xám</option>
                <option value="amber">Hổ phách</option>
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium">Màu tóc</Label>
              <select value={hairColor} onChange={(e) => setHairColor(e.target.value)} className="h-9 rounded-md border px-2 text-sm w-full mt-1">
                <option value="black">Đen</option>
                <option value="brown">Nâu</option>
                <option value="blonde">Vàng</option>
                <option value="red">Đỏ</option>
                <option value="white">Trắng</option>
                <option value="gray">Xám</option>
                <option value="other">Khác</option>
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium">Kiểu tóc</Label>
              <select value={hairStyle} onChange={(e) => setHairStyle(e.target.value)} className="h-9 rounded-md border px-2 text-sm w-full mt-1">
                <option value="short">Ngắn</option>
                <option value="long">Dài</option>
                <option value="curly">Xoăn</option>
                <option value="straight">Thẳng</option>
                <option value="wavy">Gợn sóng</option>
                <option value="bald">Hói</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          {saveError && <span className="text-[12px] text-destructive">{saveError}</span>}
          {saveOk && !saveError && <span className="text-[12px] text-emerald-600">Đã lưu</span>}
          <Button type="button" className="h-9" onClick={handleUpdate} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Cập nhật hồ sơ'}
          </Button>
        </div>
      </form>
    </div>
  );
}
