const redis = require('redis');

const redisClient = redis.createClient({
    url: "redis://n9748792-n10658327-a2-cache.km2jzi.ng.0001.apse2.cache.amazonaws.com:6379"
});

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
