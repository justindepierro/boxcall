import React, { useState, useEffect } from "react";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Typography } from "../../components/design-system/Typography";

type ProfileFormData = {
  display_name: string;
  full_name: string;
  phone: string;
  bio: string;
  address: string;
};

interface ProfileFormProps {
  profile: ProfileFormData;
  loading: boolean;
  onSave: (formData: ProfileFormData) => Promise<void>;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  profile,
  loading,
  onSave,
}) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    display_name: "",
    full_name: "",
    phone: "",
    bio: "",
    address: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || "",
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        address: profile.address || "",
      });
    }
  }, [profile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error updating profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Typography variant="headline-md">Edit Profile</Typography>
      <Input
        name="display_name"
        label="Display Name"
        value={formData.display_name}
        onChange={handleChange}
        disabled={loading || saving}
      />
      <Input
        name="full_name"
        label="Full Name"
        value={formData.full_name}
        onChange={handleChange}
        disabled={loading || saving}
      />
      <Input
        name="phone"
        label="Phone"
        value={formData.phone}
        onChange={handleChange}
        disabled={loading || saving}
      />
      <Input
        name="bio"
        label="Bio"
        value={formData.bio}
        onChange={handleChange}
        disabled={loading || saving}
      />
      <Input
        name="address"
        label="Address"
        value={formData.address}
        onChange={handleChange}
        disabled={loading || saving}
      />
      <Button type="submit" disabled={loading || saving}>
        {saving ? "Saving..." : "Save Changes"}
      </Button>
      {message && (
        <Typography
          variant="body-sm"
          color={message.type === "success" ? "success" : "error"}
        >
          {message.text}
        </Typography>
      )}
    </form>
  );
};
