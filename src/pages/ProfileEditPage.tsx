import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { meWithAvatarQuery, updateUserMutation, updateAvatarMutation, type UserAvatarDetails } from '../lib/graphql/users';
import { AuthFormField } from '../enums/auth-form-field.enum';
import { AvatarFormField } from '../enums/avatar-form-field.enum';
import { UploadPurpose } from '../enums/upload-purpose.enum';
import { paths } from '../lib/paths';
import { cardClassName } from '../components/Card';
import { TextField } from '../components/TextField';
import { AddressAutocompleteField } from '../components/AddressAutocompleteField';
import { ImageUploadField } from '../components/ImageUploadField';
import { Button, buttonStyles } from '../components/Button';
import type { UserEntity } from '../lib/types';

export default function ProfileEditPage() {
  const { token, refetchUser } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<(UserEntity & { avatar?: UserAvatarDetails | null }) | null>(null);
  const [pending, setPending] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!token) return;
    meWithAvatarQuery(token).then(setUser);
  }, [token]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !user) return;

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get(AuthFormField.Name) ?? '');
    const email = String(formData.get(AuthFormField.Email) ?? '');
    const ageRaw = String(formData.get(AuthFormField.Age) ?? '');
    const age = ageRaw ? Number(ageRaw) : undefined;
    const cityRaw = String(formData.get(AuthFormField.City) ?? '').trim();
    const latRaw = String(formData.get(AuthFormField.Lat) ?? '').trim();
    const lonRaw = String(formData.get(AuthFormField.Lon) ?? '').trim();
    const password = String(formData.get(AuthFormField.Password) ?? '');
    const avatarKey = String(formData.get(AvatarFormField.AvatarKey) ?? '').trim();

    setPending(true);
    setError(undefined);
    try {
      await updateUserMutation(token, {
        id: user.id,
        name,
        email,
        age,
        city: cityRaw || undefined,
        ...(latRaw && lonRaw ? { latitude: Number(latRaw), longitude: Number(lonRaw) } : {}),
        ...(password ? { password } : {}),
      });

      if (avatarKey) {
        await updateAvatarMutation(token, {
          key: avatarKey,
          url: String(formData.get(AvatarFormField.AvatarUrl) ?? '').trim(),
          mimeType: String(formData.get(AvatarFormField.AvatarMimeType) ?? '').trim(),
          sizeBytes: Number(formData.get(AvatarFormField.AvatarSizeBytes) ?? 0),
          originalFileName: String(formData.get(AvatarFormField.AvatarOriginalFileName) ?? '').trim(),
        });
      }

      await refetchUser();
      navigate(paths.profile());
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not update your profile.');
    } finally {
      setPending(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Edit Profile</h1>
        <p className="text-slate-500 mt-1">Update your account information.</p>
      </div>

      <form onSubmit={handleSubmit} className={`${cardClassName} p-6 sm:p-8 space-y-5`}>
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>}

        <TextField id="name" label="Name" name={AuthFormField.Name} type="text" required defaultValue={user.name} />

        <TextField
          id="email"
          label="Email"
          name={AuthFormField.Email}
          type="email"
          required
          defaultValue={user.email}
        />

        <TextField id="age" label="Age" name={AuthFormField.Age} type="number" min={0} defaultValue={user.age ?? ''} />

        <AddressAutocompleteField
          label="City"
          cityFieldName={AuthFormField.City}
          latFieldName={AuthFormField.Lat}
          lonFieldName={AuthFormField.Lon}
          defaultCity={user.city ?? ''}
          defaultLat={user.latitude}
          defaultLon={user.longitude}
          hint="Search your city to enable location-based search when finding other users."
        />

        <TextField
          id="password"
          label="New Password"
          labelSuffix={<span className="text-slate-400 font-normal">(leave blank to keep current)</span>}
          name={AuthFormField.Password}
          type="password"
          autoComplete="new-password"
        />

        <ImageUploadField
          purpose={UploadPurpose.UserAvatar}
          label="Profile photo"
          hint="JPEG, PNG, WebP or GIF, up to 5MB."
          shape="circle"
          fieldNames={{
            key: AvatarFormField.AvatarKey,
            url: AvatarFormField.AvatarUrl,
            mimeType: AvatarFormField.AvatarMimeType,
            sizeBytes: AvatarFormField.AvatarSizeBytes,
            originalFileName: AvatarFormField.AvatarOriginalFileName,
          }}
          defaultValue={
            user.avatar
              ? {
                  key: user.avatar.key,
                  url: user.avatar.url,
                  mimeType: user.avatar.mimeType,
                  sizeBytes: user.avatar.sizeBytes,
                  originalFileName: user.avatar.originalFileName,
                }
              : undefined
          }
          onUploadingChange={setAvatarUploading}
        />

        <div className="flex items-center justify-end space-x-3 pt-2">
          <Link to={paths.profile()} className={buttonStyles({ variant: 'secondary' })}>
            Cancel
          </Link>
          <Button type="submit" disabled={pending || avatarUploading} size="lg">
            {pending ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
