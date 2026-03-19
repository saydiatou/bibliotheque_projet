const sequelize = require('../config/database');

const User     = require('./User');
const Category = require('./Category');
const Book     = require('./Book');
const Member   = require('./Member');
const Borrow   = require('./Borrow');

// --- Associations ---

// Une catégorie a plusieurs livres (avec alias 'books')
Category.hasMany(Book, { foreignKey: 'category_id', as: 'books' });
Book.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Un membre a plusieurs emprunts (avec alias 'borrows')
Member.hasMany(Borrow, { foreignKey: 'member_id', as: 'borrows' });
Borrow.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

// Un livre a plusieurs emprunts
Book.hasMany(Borrow, { foreignKey: 'book_id', as: 'borrows' });
Borrow.belongsTo(Book, { foreignKey: 'book_id', as: 'book' });

module.exports = { sequelize, User, Category, Book, Member, Borrow };
