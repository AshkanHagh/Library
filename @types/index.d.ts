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