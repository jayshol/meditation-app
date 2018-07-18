'use strict';

exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/meditation-app';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-meditation-app';
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET || 'mysecret';
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';