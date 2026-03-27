const { Op, fn, col, literal } = require('sequelize');
const { Book, Category, Member, Borrow } = require('../models');

// GET /api/stats/books
const getBooksStats = async (req, res) => {
  try {
    // Nombre total de livres
    const totalBooks = await Book.count();

    // Somme de tous les available_quantity
    const totalAvailableResult = await Book.sum('available_quantity');
    const totalAvailable = totalAvailableResult || 0;

    // Nombre d'emprunts actifs
    const totalBorrowed = await Borrow.count({
      where: { status: 'borrowed' },
    });

    // Répartition par catégorie
    const byCategory = await Book.findAll({
      attributes: [
        'category_id',
        [fn('COUNT', col('Book.id')), 'count'],
      ],
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name'],
      }],
      group: ['category_id', 'Category.id'],
    });

    return res.status(200).json({
      totalBooks,
      totalAvailable,
      totalBorrowed,
      byCategory,
    });

  } catch (error) {
    console.error('Erreur getBooksStats :', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

// GET /api/stats/members
const getMembersStats = async (req, res) => {
  try {
    const totalMembers = await Member.count();

    const activeMembers = await Member.count({
      where: { status: 'active' },
    });

    const inactiveMembers = await Member.count({
      where: { status: 'inactive' },
    });

    return res.status(200).json({
      totalMembers,
      activeMembers,
      inactiveMembers,
    });

  } catch (error) {
    console.error('Erreur getMembersStats :', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

// GET /api/stats/borrows
const getBorrowsStats = async (req, res) => {
  try {
    // Totaux par statut
    const totalBorrows = await Borrow.count();

    const activeBorrows = await Borrow.count({
      where: { status: 'borrowed' },
    });

    const returnedBorrows = await Borrow.count({
      where: { status: 'returned' },
    });

    // Emprunts en retard : status=borrowed ET due_date dépassée
    const today = new Date().toISOString().split('T')[0];
    const overdueBorrows = await Borrow.count({
      where: {
        status:   'borrowed',
        due_date: { [Op.lt]: today },
      },
    });

    // Top 5 livres les plus empruntés
    const mostBorrowed = await Borrow.findAll({
      attributes: [
        'book_id',
        [fn('COUNT', col('Borrow.id')), 'borrow_count'],
      ],
      include: [{
        model: Book,
        attributes: ['title', 'author'],
      }],
      group:  ['book_id', 'Book.id'],
      order:  [[literal('borrow_count'), 'DESC']],
      limit:  5,
    });

    return res.status(200).json({
      totalBorrows,
      activeBorrows,
      returnedBorrows,
      overdueBorrows,
      mostBorrowed,
    });

  } catch (error) {
    console.error('Erreur getBorrowsStats :', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

module.exports = { getBooksStats, getMembersStats, getBorrowsStats };
