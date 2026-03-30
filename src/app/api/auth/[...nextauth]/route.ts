import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        try {
          // Consulta o seu PostgREST local
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users?email=eq.${credentials.email}`, {
            cache: 'no-store'
          });
          const users = await res.json();
          const user = users[0];

          // Verifica se achou e se a senha bate
          if (user && user.password === credentials.password) {
            return { 
              id: user.id, 
              email: user.email, 
              name: user.display_name || user.email 
            };
          }
          return null;
        } catch (e) {
          console.error("Erro no login local:", e);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
});

export { handler as GET, handler as POST };