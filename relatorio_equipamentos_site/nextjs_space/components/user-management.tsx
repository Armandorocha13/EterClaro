'use client';

import { useState, useEffect } from 'react';
import { Users, Shield, ShieldAlert, Loader2, Search, Check, ChevronLeft, X } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export function UserManagement({ onBack }: { onBack: () => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Falha ao carregar usuários');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    setUpdatingId(userId);
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (!res.ok) throw new Error('Falha ao atualizar permissão');
      
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success('Permissão atualizada!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    (u.name?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl shadow-2xl border border-black/5 overflow-hidden">
        {/* Header */}
        <div className="bg-[#020617] p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Gerenciar Permissões</h2>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Controle de acesso ao sistema</p>
              </div>
            </div>
            <button 
              onClick={onBack}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-black uppercase tracking-widest transition-all"
            >
              Fechar
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/20" />
            <input 
              type="text"
              placeholder="PESQUISAR USUÁRIO POR E-MAIL..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold uppercase tracking-wider focus:ring-2 focus:ring-[#ee1111] focus:border-transparent outline-none transition-all"
            />
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 text-[#ee1111] animate-spin mb-4" />
              <p className="text-xs font-black text-black/40 uppercase tracking-[0.2em]">Carregando Usuários...</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="group flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-transparent hover:border-black/5 hover:bg-white hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all ${user.role === 'admin' ? 'bg-red-100 text-[#ee1111]' : 'bg-blue-100 text-[#020617]'}`}>
                      {user.role === 'admin' ? <ShieldAlert className="h-6 w-6" /> : <Users className="h-6 w-6" />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#020617] tracking-tight">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-[#ee1111] text-white' : 'bg-slate-200 text-slate-500'}`}>
                          {user.role === 'admin' ? 'Administrador' : 'Visualizador'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleRole(user.id, user.role)}
                      disabled={updatingId === user.id || user.email === 'thiagosouza@ffainfraestrutura.com.br'}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        user.role === 'admin' 
                          ? 'bg-slate-100 text-slate-400 hover:bg-slate-200 cursor-not-allowed' 
                          : 'bg-[#020617] text-white hover:bg-black shadow-md'
                      } ${user.email === 'thiagosouza@ffainfraestrutura.com.br' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {user.role === 'admin' ? 'Rebaixar para Usuário' : 'Promover a Admin'}
                    </button>
                    
                    {user.email !== 'thiagosouza@ffainfraestrutura.com.br' && (
                      <button
                        onClick={async () => {
                          if (confirm(`Deseja realmente excluir o acesso de ${user.email}?`)) {
                            try {
                              const res = await fetch('/api/users', {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ userId: user.id }),
                              });
                              if (!res.ok) throw new Error('Falha ao excluir');
                              setUsers(users.filter(u => u.id !== user.id));
                              toast.success('Acesso removido!');
                            } catch (err: any) {
                              toast.error(err.message);
                            }
                          }
                        }}
                        className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Excluir Usuário"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button 
        onClick={onBack}
        className="mt-8 flex items-center gap-2 mx-auto text-[10px] font-black text-black/40 uppercase tracking-[0.2em] hover:text-[#ee1111] transition-colors"
      >
        <ChevronLeft className="h-3 w-3" />
        Voltar ao Dashboard
      </button>
    </div>
  );
}
