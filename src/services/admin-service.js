const { Op } = require('sequelize')
const { User } = require('../db/models')
const adminService = {
  getUsers: async (req, next) => {
    let currentPage = req.query.page || 1
    const { search } = req.query || null
    const USER_PER_PAGE = 7

    const amount = await User.count({
      where: search ? { name: { [Op.substring]: `${search}` } } : null
    })

    const totalPage = Math.ceil(amount / USER_PER_PAGE)
    if (currentPage > totalPage) currentPage = totalPage
    if (currentPage < 1) currentPage = 1
    const offset = (currentPage - 1) * USER_PER_PAGE
    return User.findAll({
      where: search ? { name: { [Op.substring]: `${search}` } } : null,
      limit: USER_PER_PAGE,
      offset
    })
      .then(users => {
        return next(null, {
          status: 'success',
          users,
          totalAmount: amount
        })
      })
  }
}

module.exports = adminService
