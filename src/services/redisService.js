const redis = require('redis');

const redisClient = redis.createClient();

(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.log(err);
    }
})();

const getURLRedis = async (key) => {
    console.log(`Getting ${key} from redis`)
    return await redisClient.get(key);
}

const storeURLRedis = async (key, data) => {
    console.log(`Storing ${key} url in redis`)
    redisClient.setEx (
        key,
        60*30,
        data
    )
}

module.exports = { getURLRedis, storeURLRedis };
