import type { UserTable } from '../db/schema'

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

type TInferSelect = typeof UserTable.$inferInsert
type TInferInsert = typeof UserTable.$inferSelect

declare global {
    namespace Express {
        interface Request {
            user? : TInferSelect
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