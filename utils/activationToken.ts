import jwt, { type Secret } from 'jsonwebtoken';
import type { TActivationCode, TInferSelect } from '../@types';

export const createActivationToken = (user : TInferSelect) : TActivationCode => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = jwt.sign({user, activationCode}, process.env.ACTIVATION_TOKEN as Secret, {expiresIn : '5m'});

    return {token, activationCode}
}