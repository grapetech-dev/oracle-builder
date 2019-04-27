"use strict";
const logger = require('../helpers/logger');

class DatabaseError extends Error {
    constructor(message) {
        super(message);
        this.status = 500;
        this.code = "ORAC";
        this.error = "Database";
        this.msg = message;
    }
}


module.exports = {
    res: res,
    DatabaseError: DatabaseError,
};
