/* eslint-disable arrow-body-style */
import models from '../../sequelize/models';

/**
 * @class
 */
export default class comments {
  /**
  * @description - Users should create comment
  * @param {Object} req - Request Object
  * @param {Object} res  - Response Object
  * @returns {Object} - Response object
  */
  static async createComment(req, res) {
    const { comment } = req.body;
    const { slug } = req.params;
    const { id, firstName, lastName } = req.user;
    const data = await models.Article.findAll({
      where: {
        slug
      }
    });
    const commentAdded = await models.Comment.create({
      comment,
      userId: id,
      articleId: data[0].dataValues.id,
      slug
    });
    const Id = commentAdded.dataValues.id;
    return res.status(201).json({
      message: `Dear ${firstName}, Thank you for contributing to this article`,
      data: {
        Id,
        firstName,
        lastName,
        comment
      }
    });
  }

  /**
  * @description - Users should be able to comment a comment
  * @param {Object} req - Request Object
  * @param {Object} res  - Response Object
  * @returns {Object} - Response object
  */
  static async commentAcomment(req, res) {
    const { comment } = req.body;
    const { slug, commentId } = req.params;
    const { id, firstName, lastName } = req.user;
    const data = await models.Article.findAll({
      where: {
        slug
      }
    });
    const commentAdded = await models.Comment.create({
      comment,
      userId: id,
      articleId: data[0].dataValues.id,
      slug,
      commentId
    });
    const Id = commentAdded.dataValues.id;
    return res.status(201).json({
      message: `Dear ${firstName}, Thank you for contributing to this comment`,
      data: {
        Id,
        firstName,
        lastName,
        comment
      }
    });
  }

  /**
  * @description - Users should be able to edit a comment
  * @param {Object} req - Request Object
  * @param {Object} res  - Response Object
  * @returns {Object} - Response object
  */
  static async editComment(req, res) {
    const { comment } = req.body;
    const { commentId } = req.params;
    const findComment = await models.Comment.findAll({
      where: {
        id: commentId
      }
    });
    const { userId } = findComment[0].dataValues;
    const { id, firstName } = req.user;
    if (userId === id) {
      await models.Comment.update(
        {
          comment
        },
        { where: { id: commentId } }
      ).then(() => {
        return res.status(200).json({
          message: 'Your comment has been edited',
          data: {
            comment
          }
        });
      });
    } else {
      return res.status(403).json({
        message: `Dear ${firstName}, You do not have the right to edit this comment!`
      });
    }
  }

  /**
  * @description - Users should be able to delete a comment
  * @param {Object} req - Request Object
  * @param {Object} res  - Response Object
  * @returns {Object} - Response object
  */
  static async deleteComment(req, res) {
    const { id, firstName } = req.user;
    const findUser = await models.User.findAll({
      where: {
        id
      }
    });
    const { commentId } = req.params;
    const findComment = await models.Comment.findAll({
      where: {
        id: commentId
      }
    });
    const nestedComments = await models.Comment.findAll({
      where: {
        commentId
      }
    });
    const { isAdmin } = findUser[0].dataValues;
    const { userId } = findComment[0].dataValues;
    if (nestedComments[0]) {
      await models.Comment.update(
        {
          comment: 'This comment has been deleted!'
        },
        { where: { id: commentId } }
      ).then(() => {
        return res.status(200).json({
          message: 'Comment deleted',
        });
      });
    } else if (userId === id || isAdmin === true) {
      await models.Comment.destroy({
        where: {
          id: commentId
        }
      }).then(() => {
        return res.status(200).json({
          message: 'Comment deleted!'
        });
      });
    }
    return res.status(403).json({
      message: `Dear ${firstName}, You do not have the right to delete this comment!`
    });
  }

  /**
  * @description - Users should be able to get an article with its comments
  * @param {Object} req - Request Object
  * @param {Object} res  - Response Object
  * @returns {Object} - Response object
  */
  static async getComment(req, res) {
    const { slug } = req.params;
    const findSlug = await models.Article.findAll({
      attributes: ['id'],
      where: {
        slug
      }
    });
    if (findSlug.length === 0) {
      return res.status(404).json({
        message: 'Not found!'
      });
    }
    await models.Article
      .findAll({
        attributes: [
          'title',
          'description',
          'body'
        ],
        where: {
          slug
        },
        include: [
          {
            model: models.Comment,
            attributes: ['comment'],
            where: {
              articleId: findSlug[0].dataValues.id
            },
            include: [
              {
                model: models.Comment,
                attributes: ['comment']
              }
            ]
          }
        ]
      })
      .then((data) => {
        if (data) {
          return res.status(200).json({
            data
          });
        }
      });
  }
}