"use strict";
const db = require('../database/rdms');
const _ = require('lodash');
const DBError = require('../exceptions/errors').DatabaseError;


module.exports = class SQL {

    static async findAllBy(tableName, key, value) {
        if (!tableName) {
            throw "Not a model"
        }


        if (!key) {
            throw "Not a valid ID"
        }

        try {

            let statement = new SQL(tableName)
                .select()
                .where(key, value)
                .build();
            return db.queryObject(statement.query, statement.params);
        } catch (e) {
            throw e
        }

    };

    static async insert(tableName, values, createdBy = "ADMIN") {


        values.createdAt = new Date();
        values.createdBy = createdBy;
        let bind = "";
        let columns = "";
        Object.keys(values).forEach((key, i) => {
            if (i < Object.keys(values).length - 1) {
                bind += ' :' + key + ',';
                columns += ' ' + key + ','
            } else {
                bind += ' :' + key;
                columns += ' ' + key;
            }
        });

        let insertQuery = "INSERT INTO " + tableName + " ( " + columns + ")  VALUES (" + bind + ")";
         console.log(insertQuery);
        try {
            return db(insertQuery, values, {autoCommit: true});
        } catch (e) {
            throw new DBError(e.toString());
        }


    }

    static async findOneBy(tableName, key, value) {
        if (!tableName) {
            throw "Not a model"
        }

        if (!key) {
            throw "Not a valid ID"
        }
        try {
            let SQL = `SELECT * FROM ${tableName} WHERE ${key} = :${key}`
            let result = await db.queryObject(SQL, {[key]: value});

            if (result && result.length > 0) {
                return result[0];
            } else {
                return null;
            }
        } catch (e) {
            throw e
        }

    }

    static async execute(statement, params) {
        try {
            return await db(statement, params, {autoCommit: true});
        } catch (e) {
            throw e;
        }
    }

    static async query(statement, params) {
        try {
            return await db.queryObject(statement, params);
        } catch (e) {
            throw e;
        }
    }

    constructor(tablename) {
        this.SPACE = " ";
        this._select = [];
        this._distinct = "";
        this._where = [];
        this._options = {};
        this.tableName = tablename;
        this._setOptions = [];
        this._type = ""
    }

    table(tablename) {
        this.tableName = tablename
    }

    select(value, as = false) {

        this._type = "SELECT";

        if (!value) {
            this._select = ["*"]
        } else {
            this._select.push(value + ((as !== false) ? this.SPACE + 'AS' + this.SPACE + '"' + as + '"' : ''))
        }

        return this;
    }

    update() {
        this._type = "UPDATE";
        return this;
    }

    distinct() {
        if (this._type !== "SELECT") {
            throw "Distinct only works with SELECT statement."
        }
        this._distinct = " DISTINCT "
    }

    where(field, value) {
        if (!field) {
            this._where.push("");
            return this;
        }
        this._where.push(`${field} = :${field} `);
        this._options[field] = value;
        return this;
    }

    set(values) {

        if (this._type !== "UPDATE") {
            throw "set() needs update() to call first.";
        }

        this._set = "";
        this._setOptions = [];

        let bind = "";
        Object.keys(values).forEach((key, i) => {
            if (i < Object.keys(values).length - 1) {
                bind += ' ' + key + ' = :' + key + ',';
            } else {
                bind += ' ' + key + ' = :' + key;
            }
            this._setOptions = values;

        });

        this._set = bind;
        return this;
    }


    and() {
        this._where.push("AND");
        return this;
    }

    or() {
        this._where.push("OR");
        return this;
    }

    limit() {

    }

    build() {

        console.log(this._select);

        let params = {};

        let query = "";

        switch (this._type) {
            case 'SELECT':
                query = 'SELECT' +
                    this.SPACE +
                    this._distinct + this.SPACE +
                    ((this._select.length > 1) ? this._select.join() : this._select.join(" ")) + this.SPACE +
                    "FROM" + this.SPACE +
                    this.tableName;
                break;
            case 'UPDATE':
                query = 'UPDATE' +
                    this.SPACE +
                    this.tableName +
                    this.SPACE +
                    "SET" +
                    this._set;
                params = _.extend(params, this._setOptions);

        }


        if (this._where.length > 0) {

            query +=
                this.SPACE +
                "WHERE" + this.SPACE +
                this._where.join(this.SPACE);

            params = _.extend(params, this._options)
        }

        return {query: query, params: params}

    }


};


