const express = require('express');
const router = express.Router();

const CommentModel = require('../models/comments');
const checkLogin = require('../middlewares/check').checkLogin;

// 创建一条留言
router.post('/', checkLogin, function (req, res, next) {
  const author = req.session.user._id;
  const postId = req.fields.postId;
  const content = req.fields.content;

  // 校验参数
  try {
    if (!content.length) {
      throw new Error('请填写留言内容');
    }
  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('back');
  }

  const comment = {
    author: author,
    postId: postId,
    content: content
  };

  CommentModel.create(comment).then(function () {
    req.flash('succss', '留言成功');
    res.redirect('back');
  }).catch(next);
});

// 删除一条留言
router.get('/:commentId/remove', checkLogin, function (req, res, next) {
  const commentId = req.params.commentId;
  const author = req.session.user._id;

  CommentModel.getCommentById(commentId).then(function (comment) {
    if (!comment) {
      throw new Error('留言不存在');
    }
    if (comment.author.toString() !== author.toString()) {
      throw new Error('没有权限删除留言');
    }

    CommentModel.delCommentById(commentId).then(function () {
      req.flash('success', '删除留言成功');
      res.redirect('back');
    });
  });
});

module.exports = router;