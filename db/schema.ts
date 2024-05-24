import { pgEnum, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';


export const UserRole = pgEnum('role', ['admin', 'user']);

export const UserTable = pgTable('UserTable', {
    id : uuid('id').primaryKey().defaultRandom(),
    fullName : varchar('fullName', {length : 255}).notNull(),
    phone : varchar('phone', {length : 255}).notNull(),
    email : varchar('email', {length : 255}).notNull(),
    role : UserRole('role').notNull().default('user'),
    password : varchar('password', {length : 255}).notNull(),
    createdAt : timestamp('createdAt').defaultNow(),
    updatedAt : timestamp('updatedAt').defaultNow()
}, table => {
    return { emailIndex : uniqueIndex('emailIndex').on(table.email) }
});