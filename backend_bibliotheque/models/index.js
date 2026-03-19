const sequelize = require('../config/database');

const User     = require('./User');
const Category = require('./Category');
const Book     = require('./Book');
const Member   = require('./Member');
const Borrow   = require('./Borrow');

// --- Associations ---

// Une catégorie a plusieurs livres
Category.hasMany(Book, { foreignKey: 'category_id' });
Book.belongsTo(Category, { foreignKey: 'category_id' });

// Un membre a plusieurs emprunts
Member.hasMany(Borrow, { foreignKey: 'member_id' });
Borrow.belongsTo(Member, { foreignKey: 'member_id' });

// Un livre a plusieurs emprunts
Book.hasMany(Borrow, { foreignKey: 'book_id' });
Borrow.belongsTo(Book, { foreignKey: 'book_id' });

module.exports = { sequelize, User, Category, Book, Member, Borrow };
