import { z } from 'zod'
import { hash, compare } from 'bcryptjs'
import User from '../database/models/User'
import { router, publicProcedure } from './base'
import { TRPCError } from '@trpc/server'

const registerInput = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(8),
  password: z.string().min(6),
})

const loginInput = z.object({
  username: z.string().min(1),
  password: z.string().min(6),
})

const changePasswordInput = z.object({
  identifier: z.string().min(1, "Username/Email/Phone is required"),
  oldPassword: z.string().min(6, "Old password must be at least 6 characters"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmNewPassword: z.string().min(6, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords do not match",
  path: ["confirmNewPassword"],
})

export const authRouter = router({
  register: publicProcedure
    .input(registerInput)
    .mutation(async (opts) => {
      const input = opts.input
      const existingUsername = await User.findOne({ username: input.username })
      if (existingUsername) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Username already exists',
          cause: { field: 'username' },
        })
      }

      const existingEmail = await User.findOne({ email: input.email })
      if (existingEmail) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Email has already been registered',
          cause: { field: 'email' },
        })
      }

      const existingPhone = await User.findOne({ phone: input.phone })
      if (existingPhone) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Phone number has already been registered',
          cause: { field: 'phone' },
        })
      }
      
      const hashedPassword = await hash(input.password, 10)

      const newUser = await User.create({
        username: input.username,
        email: input.email,
        phone: input.phone,
        hashedPassword,
      })

      return { message: 'User registered', userId: newUser._id }
    }),

  login: publicProcedure
    .input(loginInput)
    .mutation(async (opts) => {
      const input = opts.input
      const user = await User.findOne({ username: input.username })
      if (!user) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User not found',
          cause: { field: 'username' },
        })
      }
      const passwordMatch = await compare(input.password, user.hashedPassword)
      if (!passwordMatch) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid password',
          cause: { field: 'password' },
        })
      }

      return {
        message: 'Login successful',
        userId: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
      }
    }),

  changePassword: publicProcedure
    .input(changePasswordInput)
    .mutation(async ({ input }) => {
      const { identifier, oldPassword, newPassword } = input

      const user = await User.findOne({
        $or: [
          { username: identifier },
          { email: identifier },
          { phone: identifier }
        ]
      })

      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User not found with provided identifier",
          cause: { field: "identifier" },
        })
      }

      const isOldPasswordCorrect = await compare(oldPassword, user.hashedPassword)
      if (!isOldPasswordCorrect) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Old password is incorrect",
          cause: { field: "oldPassword" },
        })
      }
      user.hashedPassword = await hash(newPassword, 10)
      await user.save()

      return { message: "Password changed successfully" }
    }),
})
