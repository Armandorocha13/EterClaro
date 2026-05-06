import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase().trim() },
          });
          if (!user) return null;
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;
          
          // Somente este e-mail tem permissão de admin
          const adminEmail = 'thiagosouza@ffainfraestrutura.com.br';
          const finalRole = user.email.toLowerCase().trim() === adminEmail ? 'admin' : 'user';

          return { 
            id: user.id, 
            email: user.email, 
            name: user.name ?? user.email,
            role: finalRole 
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        
        // Reforçar a verificação de admin por e-mail na sessão
        const adminEmail = 'thiagosouza@ffainfraestrutura.com.br';
        (session.user as any).role = session.user.email?.toLowerCase().trim() === adminEmail ? 'admin' : 'user';
        
        session.user.email = token.email as string;
      }
      return session;
    },
  },
};
