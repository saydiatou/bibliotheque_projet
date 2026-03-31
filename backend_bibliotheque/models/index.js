const sequelize = require('../config/database'); // Importe l'instance Sequelize

const User     = require('./User'); // Importe le modèle User
const Category = require('./Category'); // Importe le modèle Category
const Book     = require('./Book'); // Importe le modèle Book
const Member   = require('./Member'); // Importe le modèle Member
const Borrow   = require('./Borrow'); // Importe le modèle Borrow

// --- Associations ---

// Une catégorie a plusieurs livres (avec alias 'books')
Category.hasMany(Book, { foreignKey: 'category_id', as: 'books' }); // Relation 1:N : Category -> Books
Book.belongsTo(Category, { foreignKey: 'category_id', as: 'category' }); // Relation inverse : Book -> Category

// Un membre a plusieurs emprunts (avec alias 'borrows')
Member.hasMany(Borrow, { foreignKey: 'member_id', as: 'borrows' }); // Relation 1:N : Member -> Borrows
Borrow.belongsTo(Member, { foreignKey: 'member_id', as: 'member' }); // Relation inverse : Borrow -> Member

// Un livre a plusieurs emprunts
Book.hasMany(Borrow, { foreignKey: 'book_id', as: 'borrows' }); // Relation 1:N : Book -> Borrows
Borrow.belongsTo(Book, { foreignKey: 'book_id', as: 'book' }); // Relation inverse : Borrow -> Book

module.exports = { sequelize, User, Category, Book, Member, Borrow }; // Exporte tout pour utilisation ailleurs
