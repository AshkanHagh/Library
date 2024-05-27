import type { BookCategoryTable, BookTable, CategoryTable, InventoryTable, UserTable } from '../db/schema'

type TMailOption = {
    subject : string
    text : string
    email : string
    html : string
}

type TErrorHandler = {
    statusCode : Number
    message : string
}

type TInferSelectUser = typeof UserTable.$inferInsert
type TInferInsertUser = typeof UserTable.$inferSelect

type TInferInsertBook = typeof BookTable.$inferInsert
type TInferSelectBook = typeof BookTable.$inferSelect

type TInferInsertCategory = typeof CategoryTable.$inferInsert
type TInferSelectCategory = typeof CategoryTable.$inferSelect

type TInferInsertInventory = typeof InventoryTable.$inferInsert
type TInferSelectInventory = typeof InventoryTable.$inferSelect

type TInferInsertBookCategory = typeof BookCategoryTable.$inferInsert
type TInferSelectBookCategory = typeof BookCategoryTable.$inferSelect

declare global {
    namespace Express {
        interface Request {
            user? : TInferSelectUser
        }
    }
}

type TActivationCode = {
    token : string
    activationCode : string
}

type TActivationRequest = {
    activationToken : string
    activationCode : string
}

type TCookieOption = {
    expires : Date
    maxAge : number
    httpOnly : boolean
    sameSite : 'lax' | 'strict' | 'none' | undefined
    secure? : boolean
}