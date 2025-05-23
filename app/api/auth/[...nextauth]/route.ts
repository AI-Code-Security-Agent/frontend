import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          login: profile.login,
          // Add any additional GitHub profile data you need
          repos_url: profile.repos_url,
          html_url: profile.html_url,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        return {
          ...token,
          githubToken: account.access_token,
          login: user.login,
          repos_url: user.repos_url,
          html_url: user.html_url,
        }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        githubToken: token.githubToken,
        user: {
          ...session.user,
          login: token.login,
          repos_url: token.repos_url,
          html_url: token.html_url,
        },
      }
    },
  },
})

export { handler as GET, handler as POST }
