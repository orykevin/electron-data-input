import bcrypt from 'bcryptjs'
import { database } from '@/db'
import { user } from '../../../db/schema'
import { eq, InferSelectModel } from 'drizzle-orm'

export type UserData = InferSelectModel<typeof user>
export type AllUser = Awaited<ReturnType<typeof getAllUser>>

export const getAllUser = async () => {
  return await database.query.user.findMany({ columns: { password: false } })
}

export const createUser = async (
  username: string,
  password: string,
  isAdmin?: boolean,
  isSuperAdmin?: boolean
) => {
  const hashedPassword = await bcrypt.hashSync(password, 10)

  const createdUser = await database
    .insert(user)
    .values({ username, password: hashedPassword, isAdmin, isSuperAdmin })
    .returning()
  console.log('user ' + username + ' has created')
  return createdUser[0]
}

export const updateUser = async (
  id: number,
  data: { username: string; password?: string; isAdmin?: boolean }
) => {
  const hashedPassword = data.password ? await bcrypt.hashSync(data.password, 10) : null

  const updatedUser = await database
    .update(user)
    .set({
      username: data.username,
      isAdmin: data.isAdmin,
      ...(hashedPassword ? { password: hashedPassword } : {})
    })
    .where(eq(user.id, id))
    .returning()
  console.log('user ' + data.username + ' has Updated')
  return updatedUser[0]
}

export const deleteUser = async (id: number) => {
  const userData = await database.select().from(user).where(eq(user.id, id)).get()
  if (!userData) throw new Error('User tidak ditemukan')
  if (userData.isSuperAdmin) throw new Error('Super admin tidak bisa di hapus')

  await database.delete(user).where(eq(user.id, id))
  return 'Success'
}

export const loginWithPassword = async (username: string, password: string) => {
  console.log(username, password, 'db')
  const userData = await database.select().from(user).where(eq(user.username, username)).get()
  console.log(userData, 'userData')
  if (!userData || !userData.id) throw new Error('Tidak ada user ditemukan')

  const isValidPassword = await bcrypt.compareSync(password, userData.password)

  if (!isValidPassword) throw new Error('Password salah')

  return userData
}
