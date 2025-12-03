"use client"

import { useForm } from "react-hook-form"
import { useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

type FormValues = {
  name: string
  description: string
  logo: FileList
}

export default function RegisterShopForm() {
  const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm<FormValues>({
    defaultValues: { name: "", description: "" }
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const router = useRouter()

  const logoFiles = watch("logo")

  const onSelectFile = () => fileInputRef.current?.click()

  const onChangeFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const onSubmit = async (data: FormValues) => {
    const fd = new FormData()
    fd.append("name", data.name)
    fd.append("description", data.description || "")
    const file = data.logo?.[0]
    if (file) fd.append("logo", file)
    try {
      const res = await fetch('/api/seller/register-shop', { method: 'POST', body: fd })
      const json = await res.json()
      if (res.ok && json?.redirect) {
        router.push(json.redirect)
      } else {
        alert(json?.error || 'Có lỗi xảy ra')
      }
    } catch (e) {
      alert('Không thể gửi đăng ký. Vui lòng thử lại.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="name">Tên cửa hàng</Label>
        <Input id="name" className="h-9" placeholder="Tên cửa hàng của bạn" {...register("name", { required: true })} />
      </div>

      <div>
        <Label htmlFor="description">Mô tả</Label>
        <Textarea id="description" rows={4} placeholder="Mô tả cửa hàng của bạn" {...register("description", { required: true })} />
      </div>

      <div>
        <Label>Logo cửa hàng</Label>
        <div
          onClick={onSelectFile}
          className="mt-2 flex items-center gap-4 rounded-lg border border-dashed p-4 cursor-pointer"
        >
          <input
            type="file"
            accept="image/*"
            className="hidden"
            {...register("logo")}
            ref={fileInputRef}
            onChange={onChangeFile}
          />
          {previewUrl || (logoFiles && logoFiles[0]) ? (
            <img src={previewUrl || (logoFiles && URL.createObjectURL(logoFiles[0])) || ""} alt="Xem trước" className="size-24 rounded-full object-cover" />
          ) : (
            <div className="text-sm text-muted-foreground">Nhấn để tải lên logo cửa hàng</div>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Đang gửi..." : "Đăng ký cửa hàng"}
      </Button>
    </form>
  )
}
