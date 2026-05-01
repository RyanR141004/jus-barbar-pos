'use client';

import { useState } from 'react';
import { Pencil, Check, X, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface EditableGreetingProps {
  initialName: string;
  role: string;
}

export default function EditableGreeting({ initialName, role }: EditableGreetingProps) {
  const [name, setName] = useState(initialName);
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState(initialName);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!tempName.trim()) return;
    setSaving(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from('profiles')
        .update({ full_name: tempName.trim() })
        .eq('id', user.id);
    }

    setName(tempName.trim());
    setEditing(false);
    setSaving(false);
  };

  const handleCancel = () => {
    setTempName(name);
    setEditing(false);
  };

  const greeting = `Selamat Datang${name ? `, ${name}` : ''}`;

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Selamat Datang,
        </span>
        <input
          type="text"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          className="input-field py-1 px-2 text-2xl font-bold w-48"
          autoFocus
          maxLength={30}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
        />
        <button
          onClick={handleSave}
          disabled={saving || !tempName.trim()}
          className="w-8 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Check className="w-4 h-4 text-white" />}
        </button>
        <button
          onClick={handleCancel}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)' }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
        {greeting} 👋
      </h2>
      {role === 'admin' && (
        <button
          onClick={() => { setTempName(name); setEditing(true); }}
          className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
          style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)' }}
          title="Ubah nama sapaan"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
