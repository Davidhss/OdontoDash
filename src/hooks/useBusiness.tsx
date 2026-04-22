import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Business } from '../types';
import { useAuth } from './useAuth';
import { toast } from 'react-hot-toast';

export type BusinessRole = 'owner' | 'admin' | 'member' | 'dentist';

interface BusinessContextType {
  activeBusiness: Business | null;
  setActiveBusiness: (business: Business | null) => void;
  businesses: Business[];
  userRole: BusinessRole | null;
  loading: boolean;
  refreshBusinesses: () => Promise<void>;
  createBusiness: (nome: string, regiao: string) => Promise<Business | null>;
  joinBusiness: (code: string) => Promise<Business | null>;
  createDentistInvite: (businessId: string, dentistName: string, dentistEmail: string) => Promise<string | null>;
  getBusinessRole: (businessId: string) => BusinessRole | null;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isDemo } = useAuth();
  const [activeBusiness, setActiveBusinessState] = useState<Business | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [memberRoles, setMemberRoles] = useState<Record<string, BusinessRole>>({});
  const [loading, setLoading] = useState(true);

  const setActiveBusiness = (business: Business | null) => {
    setActiveBusinessState(business);
    if (business) {
      localStorage.setItem('activeBusinessId', business.id);
    }
  };

  const getBusinessRole = (businessId: string): BusinessRole | null => {
    return memberRoles[businessId] || null;
  };

  const userRole = activeBusiness ? (memberRoles[activeBusiness.id] || null) : null;

  const refreshBusinesses = async () => {
    if (!user) {
      setBusinesses([]);
      setActiveBusinessState(null);
      setLoading(false);
      return;
    }

    if (isDemo) {
      const demoBiz: Business = {
        id: 'demo-biz-1',
        nome: 'Clínica Sorriso Demo',
        regiao: 'São Paulo - SP',
        user_id: user.id,
        invite_code: 'DEMO12',
        created_at: new Date().toISOString()
      };
      setBusinesses([demoBiz]);
      setActiveBusinessState(demoBiz);
      setMemberRoles({ 'demo-biz-1': 'owner' });
      setLoading(false);
      return;
    }

    try {
      // Fetch memberships with role
      const { data: memberships, error: memError } = await supabase
        .from('business_members')
        .select('business_id, role')
        .eq('user_id', user.id);

      if (memError) throw memError;

      if (memberships && memberships.length > 0) {
        const businessIds = memberships.map(m => m.business_id);
        
        // Build role map
        const roles: Record<string, BusinessRole> = {};
        memberships.forEach(m => {
          roles[m.business_id] = m.role as BusinessRole;
        });
        setMemberRoles(roles);

        const { data: bizData, error: bizError } = await supabase
          .from('businesses')
          .select('*')
          .in('id', businessIds)
          .order('created_at', { ascending: true });

        if (bizError) throw bizError;

        if (bizData && bizData.length > 0) {
          setBusinesses(bizData);

          const savedBusinessId = localStorage.getItem('activeBusinessId');
          const savedBusiness = bizData.find(b => b.id === savedBusinessId);
          
          setActiveBusinessState(prev => {
            if (prev && bizData.find(b => b.id === prev.id)) return prev;
            return savedBusiness || bizData[0];
          });
        }
      } else {
        setBusinesses([]);
        setActiveBusinessState(null);
      }
    } catch (err) {
      console.error('Erro ao buscar negócios:', err);
    } finally {
      setLoading(false);
    }
  };

  const createBusiness = async (nome: string, regiao: string) => {
    if (!user) return null;

    if (isDemo) {
      const newBiz: Business = {
        id: `demo-biz-${Date.now()}`,
        nome,
        regiao,
        user_id: user.id,
        invite_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        created_at: new Date().toISOString()
      };
      setBusinesses(prev => [...prev, newBiz]);
      setActiveBusinessState(newBiz);
      return newBiz;
    }

    try {
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data: newBusiness, error: createError } = await supabase
        .from('businesses')
        .insert({
          nome,
          regiao,
          user_id: user.id,
          invite_code: inviteCode
        })
        .select()
        .single();

      if (createError) throw createError;

      // Add user as owner
      const { error: memError } = await supabase
        .from('business_members')
        .insert({
          business_id: newBusiness.id,
          user_id: user.id,
          role: 'owner'
        });

      if (memError) throw memError;

      setActiveBusinessState(newBusiness as Business);
      setMemberRoles(prev => ({ ...prev, [newBusiness.id]: 'owner' }));

      // Refresh to get all businesses (no mock data seeding)
      await refreshBusinesses();
      toast.success(`Negócio "${nome}" criado com sucesso!`);
      return newBusiness as Business;
    } catch (err: any) {
      console.error('Erro ao criar negócio:', err);
      toast.error(err?.message || 'Erro ao criar negócio');
      return null;
    }
  };

  const joinBusiness = async (code: string) => {
    if (!user) return null;

    if (isDemo) {
      toast.error('Não é possível entrar em negócios reais no modo demonstração.');
      return null;
    }

    try {
      // Check if it's a dentist invite code (format: DENT-XXXXXX)
      const isDentistInvite = code.startsWith('DENT-');
      const actualCode = isDentistInvite ? code.replace('DENT-', '') : code;

      const { data: business, error: bizError } = await supabase
        .from('businesses')
        .select('*')
        .eq('invite_code', actualCode.toUpperCase())
        .single();

      if (bizError) throw new Error('Código de convite inválido');

      const role = isDentistInvite ? 'dentist' : 'member';

      const { error: memError } = await supabase
        .from('business_members')
        .insert({
          business_id: business.id,
          user_id: user.id,
          role
        });

      if (memError) {
        if (memError.code === '23505') {
          toast.error('Você já faz parte deste negócio');
        } else {
          throw memError;
        }
      }

      await refreshBusinesses();
      setActiveBusinessState(business);
      toast.success(`Você entrou em ${business.nome} como ${role === 'dentist' ? 'Dentista' : 'Membro'}`);
      return business;
    } catch (err: any) {
      console.error('Erro ao entrar no negócio:', err);
      toast.error(err.message || 'Erro ao entrar no negócio');
      return null;
    }
  };

  const createDentistInvite = async (businessId: string, dentistName: string, dentistEmail: string): Promise<string | null> => {
    if (!user) return null;

    try {
      // Get the business invite code
      const business = businesses.find(b => b.id === businessId);
      if (!business?.invite_code) return null;

      // The dentist invite uses the prefix DENT- + business invite code
      const dentistCode = `DENT-${business.invite_code}`;
      
      // Generate a shareable link
      const baseUrl = window.location.origin;
      const inviteLink = `${baseUrl}?invite=${dentistCode}&name=${encodeURIComponent(dentistName)}&email=${encodeURIComponent(dentistEmail)}&business=${encodeURIComponent(business.nome)}`;
      
      toast.success(`Link de convite gerado para ${dentistName}!`);
      return inviteLink;
    } catch (err: any) {
      console.error('Erro ao criar convite de dentista:', err);
      toast.error('Erro ao gerar convite');
      return null;
    }
  };

  useEffect(() => {
    refreshBusinesses();
  }, [user?.id]);

  return (
    <BusinessContext.Provider value={{
      activeBusiness,
      setActiveBusiness,
      businesses,
      userRole,
      loading,
      refreshBusinesses,
      createBusiness,
      joinBusiness,
      createDentistInvite,
      getBusinessRole
    }}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};
