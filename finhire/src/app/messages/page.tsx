'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Message = {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  application_id: string;
};

type Application = {
  id: string;
  status: string;
  jobs: { id: string; title: string };
  candidates: { profiles: { full_name: string | null } };
};

export default function MessagesPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: cand }: { data: any } = await (supabase as any)
        .from('candidates').select('id').eq('profile_id', user.id).single();

      if (cand) {
        const { data: apps }: { data: any } = await (supabase as any)
          .from('applications')
          .select('*, jobs(id, title), candidates(profiles(full_name))')
          .eq('candidate_id', cand.id)
          .order('applied_at', { ascending: false });

        setApplications(apps ?? []);
        if (apps?.length > 0) setSelectedApp(apps[0].id);
      }
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!selectedApp || !userId) return;
    const supabase = createClient();

    const fetchMessages = async () => {
      const { data: rows }: { data: any[] } = await (supabase as any)
        .from('messages').select('*').eq('application_id', selectedApp)
        .order('created_at', { ascending: true });
      setMsgs(rows ?? []);
    };
    fetchMessages();

    const channel = supabase
      .channel(`messages:${selectedApp}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `application_id=eq.${selectedApp}`,
      }, (payload: any) => setMsgs((p) => [...p, payload.new]))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedApp, userId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedApp || !userId) return;
    const supabase = createClient();
    const { error } = await (supabase as any).from('messages').insert({
      application_id: selectedApp, sender_id: userId, content: newMessage.trim(),
    });
    if (!error) setNewMessage('');
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-slate-500">Loading messages…</div>;
  }

  if (applications.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Messages</h1>
        <Card><p className="text-slate-500 text-center py-8">Apply to jobs to start conversations with employers.</p></Card>
      </div>
    );
  }

  const currentApp = applications.find((a) => a.id === selectedApp);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Messages</h1>
      <div className="flex flex-col md:flex-row gap-6 h-[60vh]">
        <div className="w-full md:w-64 shrink-0 border-r border-slate-200">
          {applications.map((app) => (
            <button key={app.id} onClick={() => setSelectedApp(app.id)}
              className={`w-full text-left px-3 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors ${selectedApp === app.id ? 'bg-teal-50' : ''}`}>
              <p className="text-sm font-medium text-slate-900 truncate">{app.jobs?.title}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{app.status}</p>
            </button>
          ))}
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {currentApp && (
            <>
              <div className="pb-3 border-b border-slate-200">
                <h2 className="font-medium text-slate-900">{currentApp.jobs?.title}</h2>
                <p className="text-xs text-slate-500">Application &middot; {currentApp.status}</p>
              </div>
              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                {msgs.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center">No messages yet. Start the conversation.</p>
                ) : msgs.map((msg) => (
                  <div key={msg.id}
                    className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${msg.sender_id === userId ? 'bg-teal-600 text-white ml-auto' : 'bg-slate-100 text-slate-900'}`}>
                    {msg.content}
                  </div>
                ))}
              </div>
              <form onSubmit={handleSend} className="mt-3 flex gap-2">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message…" className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                <Button type="submit" disabled={!newMessage.trim()}>Send</Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
