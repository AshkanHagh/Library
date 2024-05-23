import jwt, { type Secret } from 'jsonwebtoken';

export const createActivationToken = (user : any) : TActivationCode => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = jwt.sign({user, activationCode}, process.env.ACTIVATION_TOKEN as Secret, {expiresIn : '5m'});

    return {token, activationCode}
}