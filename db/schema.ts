import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';


export const UserTable = pgTable('UserTable', {
    id : uuid('id').primaryKey().defaultRandom(),
    fullName : varchar('fullName', {length : 255}).notNull(),
    phone : varchar('phone', {length : 255}).notNull(),
    email : varchar('phone', {length : 255}).notNull(),
    createdAt : timestamp('createdAt').defaultNow(),
    updatedAt : timestamp('updatedAt').defaultNow()
});