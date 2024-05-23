import { Redis } from 'ioredis';

const client = () => {
    if(process.env.REDIS_URL) {
        console.log('Redis connected');
        return process.env.REDIS_URL
    }

    throw new Error('Redis connection failed');
}

const redis = new Redis(client());
export default redis;