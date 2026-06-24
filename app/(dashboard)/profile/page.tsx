"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import {
  Award,
  Link2,
  Code2,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { GlowCard } from "@/components/ui/GlowCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MILESTONE_DEFINITIONS } from "@/lib/progress-metrics";

interface ProfileUser {
  name: string;
  email: string;
  profilePicture?: string;
  experienceLevel?: string;
  targetRole?: string;
  skills: string[];
  linkedIn?: string;
  github?: string;
  totalInterviews: number;
  averageScore: number;
}

export default function ProfilePage() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillsInput, setSkillsInput] = useState("");
  const [passwords, setPasswords] = useState({ current: "", new: "" });
  const [deleteEmail, setDeleteEmail] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const loadProfile = async () => {
    const res = await fetch("/api/users/profile");
    const data = await res.json();
    if (data.success) {
      setUser(data.user);
      setSkillsInput(data.user.skills?.join(", ") ?? "");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.name,
          experienceLevel: user.experienceLevel,
          targetRole: user.targetRole,
          skills: skillsInput.split(",").map((s) => s.trim()).filter(Boolean),
          linkedIn: user.linkedIn,
          github: user.github,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Profile updated");
        setUser(data.user);
      } else toast.error(data.error);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatar = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const res = await fetch("/api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "uploadAvatar",
          image: reader.result,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Avatar updated");
        loadProfile();
      } else toast.error(data.error);
    };
    reader.readAsDataURL(file);
  };

  const handlePassword = async () => {
    const res = await fetch("/api/users/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "changePassword",
        currentPassword: passwords.current,
        newPassword: passwords.new,
      }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Password changed");
      setPasswords({ current: "", new: "" });
    } else toast.error(data.error);
  };

  const handleDelete = async () => {
    const res = await fetch("/api/users/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "deleteAccount",
        confirmEmail: deleteEmail,
      }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Account deleted");
      signOut({ callbackUrl: "/" });
    } else toast.error(data.error);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-intelligence-primary" />
      </div>
    );
  }

  if (!user) {
    return <p className="text-text-secondary">Failed to load profile.</p>;
  }

  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const milestones = MILESTONE_DEFINITIONS.map((m) => ({
    ...m,
    achieved:
      ("minInterviews" in m && user.totalInterviews >= (m.minInterviews ?? 0)) ||
      ("minCoding" in m && false),
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-display text-3xl font-bold gradient-text">Profile</h1>

      <GlowCard>
        <div className="flex flex-wrap items-center gap-6">
          <div className="relative">
            <Avatar className="size-20">
              {user.profilePicture && (
                <AvatarImage src={user.profilePicture} alt={user.name} />
              )}
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-intelligence-primary text-white"
            >
              <Upload className="size-4" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAvatar(file);
              }}
            />
          </div>
          <div>
            <p className="font-display text-xl font-semibold text-text-primary">
              {user.name}
            </p>
            <p className="text-sm text-text-secondary">{user.email}</p>
            <p className="mt-1 font-mono text-sm text-intelligence-primary">
              {user.averageScore} avg · {user.totalInterviews} interviews
            </p>
          </div>
        </div>
      </GlowCard>

      <GlowCard className="space-y-6">
        <h2 className="font-display text-lg font-semibold">Personal Info</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField label="Name">
            <Input
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
            />
          </FormField>
          <FormField label="Experience Level">
            <Select
              value={user.experienceLevel ?? "junior"}
              onValueChange={(v) =>
                setUser({ ...user, experienceLevel: v ?? "junior" })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fresher">Fresher</SelectItem>
                <SelectItem value="junior">Junior</SelectItem>
                <SelectItem value="mid">Mid</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
        <FormField label="Target Role">
          <Input
            value={user.targetRole ?? ""}
            onChange={(e) => setUser({ ...user, targetRole: e.target.value })}
          />
        </FormField>
        <FormField label="Skills (comma-separated)">
          <Input
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
          />
        </FormField>
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            label={
              <Label className="flex items-center gap-1">
                <Link2 className="size-4" /> LinkedIn
              </Label>
            }
          >
            <Input
              value={user.linkedIn ?? ""}
              onChange={(e) => setUser({ ...user, linkedIn: e.target.value })}
            />
          </FormField>
          <FormField
            label={
              <Label className="flex items-center gap-1">
                <Code2 className="size-4" /> GitHub
              </Label>
            }
          >
            <Input
              value={user.github ?? ""}
              onChange={(e) => setUser({ ...user, github: e.target.value })}
            />
          </FormField>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="mt-2 border-0 bg-intelligence-primary text-white"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : "Save Changes"}
        </Button>
      </GlowCard>

      <GlowCard className="space-y-6">
        <h2 className="font-display text-lg font-semibold">Change Password</h2>
        <div className="space-y-5">
          <Input
            type="password"
            placeholder="Current password"
            value={passwords.current}
            onChange={(e) =>
              setPasswords({ ...passwords, current: e.target.value })
            }
          />
          <Input
            type="password"
            placeholder="New password (8+ chars)"
            value={passwords.new}
            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
          />
        </div>
        <Button variant="outline" onClick={handlePassword} className="border-deep-border">
          Update Password
        </Button>
      </GlowCard>

      <GlowCard>
        <h2 className="mb-3 font-display text-lg font-semibold">Achievements</h2>
        <div className="flex flex-wrap gap-2">
          {milestones.map((m) => (
            <Badge
              key={m.id}
              className={
                m.achieved
                  ? "border-0 bg-intelligence-primary/15 text-intelligence-primary"
                  : "border-0 bg-deep-border text-text-secondary opacity-50"
              }
            >
              <Award className="size-3" />
              {m.title}
            </Badge>
          ))}
        </div>
      </GlowCard>

      <GlowCard className="border-danger/30">
        <h2 className="font-display text-lg font-semibold text-danger">
          Danger Zone
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Permanently delete your account and all data.
        </p>
        <Dialog>
          <DialogTrigger
            render={
              <Button variant="outline" className="mt-4 border-danger text-danger" />
            }
          >
            <Trash2 className="size-4" />
            Delete Account
          </DialogTrigger>
          <DialogContent className="border-deep-border bg-deep-bg">
            <DialogHeader>
              <DialogTitle>Confirm Account Deletion</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-text-secondary">
              Type your email <strong>{user.email}</strong> to confirm.
            </p>
            <FormField label="Confirm deletion" spacing="sm">
              <Input
                value={deleteEmail}
                onChange={(e) => setDeleteEmail(e.target.value)}
                placeholder="Type your email to confirm"
              />
            </FormField>
            <Button onClick={handleDelete} className="bg-danger text-white">
              Delete Forever
            </Button>
          </DialogContent>
        </Dialog>
      </GlowCard>
    </div>
  );
}
