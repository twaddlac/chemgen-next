#!/usr/bin/env bash

NODE_ENV='dev'

### ArrayScan MSSQL DB
export ARRAYSCAN_CONNECTOR="mysql"
export ARRAYSCAN_DB="arrayscan"
export ARRAYSCAN_USER="root"
export ARRAYSCAN_PASS="password"
export ARRAYSCAN_HOST="localhost"
export ARRAYSCAN_PORT="3307"

### ChemgenDB Mysql - Main Experimental DB
export CHEMGEN_CONNECTOR="mysql"
export CHEMGEN_DB="chemgen-next-dev"
export CHEMGEN_USER="root"
export CHEMGEN_PASS="password"
export CHEMGEN_HOST="localhost"
export CHEMGEN_PORT="3308"

## Wordpress DB Mysql
export WP_CONNECTOR="mysql"
export WP_HOST="localhost"
export WP_SITE="http://localhost"
export WP_DB="wordpress"
export WP_USER="wordpress"
export WP_PASS="password"
export WP_PORT="3309"

export MONGO_CONNECTOR="mongodb"
export MONGO_HOST="localhost"
export MONGO_URL="mongodb://root:password@localhost:27017/chemgen?authSource=admin"
export MONGO_DB="chemgen"
export MONGO_USER="root"
export MONGO_PASS="password"
