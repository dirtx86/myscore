// frontend/src/pages/ProfilePage.tsx
import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { matchesApi } from '../api/matches';
import { profileApi } from '../api/profile';
import { useAuth } from '../hooks/useAuth';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../hooks/useToast';
import type { Tournament } from '../types';

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nickname: profile?.nickname ?? '',
    bio: profile?.bio ?? '',
    department: profile?.department ?? '',
    favouriteTeamId: profile?.favouriteTeamId ?? '',
  });

  // Sync form when profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        nickname: profile.nickname ?? '',
        bio: profile.bio ?? '',
        department: profile.department ?? '',
        favouriteTeamId: profile.favouriteTeamId ?? '',
      });
    }
  }, [profile]);

  const { data: tournament } = useQuery<Tournament>({
    queryKey: ['tournament', 'active'],
    queryFn: () => matchesApi.getActiveTournament(),
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams', tournament?.id],
    queryFn: () => matchesApi.getTeams(tournament!.id),
    enabled: !!tournament?.id,
  });

  const profileMutation = useMutation({
    mutationFn: () => profileApi.updateProfile({
      nickname: form.nickname.trim() || undefined,
      bio: form.bio.trim() || undefined,
      department: form.department.trim() || undefined,
      favouriteTeamId: form.favouriteTeamId || null,
    }),
    onSuccess: async () => {
      await refreshProfile();
      toast('Profile saved', 'success');
    },
    onError: () => toast('Failed to save profile', 'error'),
  });

  const avatarMutation = useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
    onSuccess: async () => {
      await refreshProfile();
      toast('Avatar updated', 'success');
    },
    onError: () => toast('Failed to upload avatar', 'error'),
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) avatarMutation.mutate(file);
    e.target.value = '';
  }

  const selStyle = {
    background: 'var(--bg-2)', color: 'var(--text)',
    border: '1px solid var(--line)', borderRadius: 'var(--r-sm)',
    padding: '10px 12px', width: '100%', fontSize: 14,
  };

  const fieldStyle = {
    display: 'flex', flexDirection: 'column' as const, gap: 6,
  };

  const labelStyle = {
    fontSize: 12, color: 'var(--text-mute)', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.06em',
  };

  if (!profile) return null;

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>My Profile</h1>

      {/* Avatar section */}
      <div style={{
        background: 'var(--bg-1)', border: '1px solid var(--line)',
        borderRadius: 'var(--r)', padding: '24px',
        display: 'flex', alignItems: 'center', gap: 20,
      }}>
        <div
          style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}
          onClick={() => fileInputRef.current?.click()}
        >
          <Avatar displayName={profile.displayName} avatarUrl={profile.avatarUrl} size={80} />
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0, transition: 'opacity 0.15s',
            fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.04em',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
          >
            {avatarMutation.isPending ? '…' : 'EDIT'}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{profile.displayName}</div>
          <div style={{ fontSize: 13, color: 'var(--text-mute)', marginTop: 2 }}>{profile.email}</div>
          <div style={{ fontSize: 12, color: 'var(--text-mute)', marginTop: 8 }}>
            Click the photo to upload a new one (JPEG · max 2 MB)
          </div>
        </div>
      </div>

      {/* Profile form */}
      <div style={{
        background: 'var(--bg-1)', border: '1px solid var(--line)',
        borderRadius: 'var(--r)', padding: '24px',
        display: 'flex', flexDirection: 'column', gap: 18,
      }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Nickname</label>
          <Input
            type="text"
            placeholder="How you appear in the leaderboard"
            maxLength={30}
            value={form.nickname}
            onChange={e => setForm(f => ({ ...f, nickname: e.target.value }))}
          />
          <span style={{ fontSize: 11, color: 'var(--text-mute)' }}>
            Replaces your full name in the UI. Leave blank to use your full name.
          </span>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Bio</label>
          <Input
            type="text"
            placeholder="Forever a Chelsea fan…"
            maxLength={160}
            value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Department / Team</label>
          <Input
            type="text"
            placeholder="e.g. Engineering"
            maxLength={100}
            value={form.department}
            onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Favourite Team</label>
          <select
            value={form.favouriteTeamId}
            onChange={e => setForm(f => ({ ...f, favouriteTeamId: e.target.value }))}
            style={selStyle}
          >
            <option value="">No favourite team</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.fifaCode} — {t.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="primary"
            onClick={() => profileMutation.mutate()}
            disabled={profileMutation.isPending}
          >
            {profileMutation.isPending ? 'Saving…' : 'Save Profile'}
          </Button>
        </div>
      </div>
    </div>
  );
}
