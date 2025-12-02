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
          <AvatarImage src="" alt="Avatar" />
          <AvatarFallback>US</AvatarFallback>
        </Avatar>
        <Button variant="outline" className="h-8">Change</Button>
      </div>

      <form className="space-y-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="displayName" className="text-sm font-medium">Display Name</Label>
          <Input
            id="displayName"
            className="h-9"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your display name"
          />
          <p className="text-[12px] text-muted-foreground">Shown on your profile.</p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="username" className="text-sm font-medium">Username</Label>
          <Input
            id="username"
            className="h-9"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
          />
          <p className="text-[12px] text-muted-foreground">3–20 characters; letters, numbers, underscores.</p>
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
            {isEmailVerified ? "Your email is verified." : "We’ll send notifications to this address."}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
          <Textarea
            id="bio"
            className="min-h-[80px]"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us a bit about yourself"
          />
          <p className="text-[12px] text-muted-foreground">You can write a short introduction.</p>
        </div>

        <Separator className="my-2" />

        <div className="flex justify-end">
          <Button type="button" className="h-9" onClick={handleUpdate}>
            Update Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
