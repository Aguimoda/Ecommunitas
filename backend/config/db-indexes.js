/**
 * Database Indexes Configuration
 * This file manages the creation and maintenance of MongoDB indexes
 * for optimizing query performance in the Ecommunitas application.
 */

const mongoose = require('mongoose');
const { createLogger, format, transports } = require('winston');

// Create logger for index operations
const indexLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ level, message, timestamp }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message, timestamp }) => {
          return `${timestamp} ${level}: ${message}`;
        })
      )
    }),
    new transports.File({ filename: 'logs/db-indexes.log' })
  ]
});

/**
 * Creates and verifies indexes for all collections
 * This ensures optimal query performance for frequently accessed data
 */
const setupIndexes = async () => {
  try {
    // User collection indexes
    const User = mongoose.model('User');
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    indexLogger.info('User indexes created/verified');

    // Item collection indexes
    const Item = mongoose.model('Item');
    await Item.collection.createIndex({ user: 1 }); // Find items by user
    await Item.collection.createIndex({ category: 1 }); // Find items by category
    await Item.collection.createIndex({ available: 1 }); // Find available items
    await Item.collection.createIndex({ createdAt: -1 }); // Sort by newest
    // Text index already defined in schema
    indexLogger.info('Item indexes created/verified');

    // ItemGeo collection indexes (if using geospatial queries)
    try {
      const ItemGeo = mongoose.model('ItemGeo');
      await ItemGeo.collection.createIndex({ location: '2dsphere' }); // Geospatial index
      indexLogger.info('ItemGeo indexes created/verified');
    } catch (err) {
      // ItemGeo model might not be loaded yet, which is fine
      indexLogger.warn('ItemGeo model not available for indexing');
    }

    // Message collection indexes
    try {
      const Message = mongoose.model('Message');
      await Message.collection.createIndex({ sender: 1, receiver: 1 }); // Find conversations
      await Message.collection.createIndex({ createdAt: -1 }); // Sort by newest
      indexLogger.info('Message indexes created/verified');
    } catch (err) {
      // Message model might not be loaded yet, which is fine
      indexLogger.warn('Message model not available for indexing');
    }

    indexLogger.info('All database indexes successfully created/verified');
  } catch (err) {
    indexLogger.error(`Error creating indexes: ${err.message}`);
    throw err; // Propagate error to caller
  }
};

module.exports = setupIndexes;