//const config = require('config');
const oracledb = require('oracledb');


const logger = require('../helpers/logger');
const DatabaseError = require('../exceptions/errors').DatabaseError;

const loggerName = '[enableRDMS]: ';

const connectOptions = {
    "driver": "oracle",
    "config": {
        "user": "username",
        "password": "password",
        "connectString": "[DATABASE_IP]/XE",
        "poolMax": 44,
        "poolMin": 2,
        "poolIncrement": 5,
        "poolTimeout": 4
    }
};


let pool = null;

const connectPool = (cb) => {

    oracledb.createPool(connectOptions.config, (err, poolCreated) => {
        if (err) {
            logger.error(loggerName, "connectPool(): " + err.message);
            return;
        }

        pool = poolCreated;
        logger.info(loggerName, " Pool created" + poolCreated);

        cb();
    });
};


const oracleDbRelease = (conn) => {
    conn.release((err) => {
        if (err)
            console.log(err.message);
    });
};

const exec = async (sql, bindParams, options = {}) => {
    const metodName = "[exec]: ";
    options.isAutoCommit = false;
    try {

        if (typeof pool !== "undefined") {

            console.log("INFO: Connections open: " + pool.connectionsOpen);
            console.log("INFO: Connections in use: " + pool.connectionsInUse);
        }

        let connection = await pool.getConnection();
        try {
            const result = await connection.execute(sql, bindParams, options);

            logger.info(metodName + sql + " " + JSON.stringify(bindParams));
            return result;
        } catch (e) {
            throw e;
        } finally {
            process.nextTick(function () {
                oracleDbRelease(connection);
            });
        }
    } catch (e) {
        console.error(e);
        throw e;
    }

};

const queryRow = (sql, bindParams, options = {}) => {
    return exec(sql, bindParams, options);
};

const queryObject = async (sql, bindParams, options = {}) => {
    options['outFormat'] = oracledb.OBJECT; // default is oracledb.ARRAY
    try {
        const result = await exec(sql, bindParams, options);

        if (result && result['rows']) {
            return result['rows']
        }
        return result;

    } catch (e) {
        throw e;
    }
};


module.exports = exec;
module.exports.queryArray = queryRow;
module.exports.queryObject = queryObject;
module.exports.connect = connectPool;



