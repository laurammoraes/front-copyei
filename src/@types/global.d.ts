export declare global {
  interface JWT_User {
    name: string
    email: string
    role: 'USER' | 'ADMIN'
  }
}
