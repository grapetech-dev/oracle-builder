"use strict";
const appRoot = require('app-root-path');
const winston = require('winston');
require('winston-daily-rotate-file');

const options = {

    console: {
        level: 'debug',
        json: false,
        colorize: true
    },
    daily: {
        prepend: true,
        level: 'info',
        filename: `${appRoot}/logs/application-%DATE%.log`,
        datePattern: 'DD-MM-YY-HH',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '1d',
        colorize: false
    }
};


const {combine, timestamp, printf, colorize, splat} = winston.format;

const logger = winston.createLogger({
    format: combine(
        splat(),
        timestamp(),
        printf(info => {
            return `${info.timestamp} [${info.level}] ${(info.message)}`;
        })
    ),
    transports: [
        new winston.transports.Console(options.console),
        new winston.transports.DailyRotateFile(options.daily)
    ],
    exitOnError: false, // do not exit on handled exceptions
});

logger.stream = {
    write: (message, encoding) => {
        logger.info("[Winston]: " + message);
    },
};


module.exports = logger;
