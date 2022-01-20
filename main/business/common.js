/*
 * @Author: 谢树宏
 * @Date: 2022-01-14 09:56:10
 * @LastEditors: 谢树宏
 * @LastEditTime: 2022-01-19 10:59:15
 * @FilePath: /electron-mp-ci/main/business/common.js
 */
const path = require('path')
const fs = require('fs')
const db = require('../../db/db-cjs')
const git = require('isomorphic-git')
const Response = require('../utils/response')
const { SUCCESS, FAIL } = require('../constrant.js')

async function excuteCommon(event, arg) {
  const { type, params = {} } = arg
  console.log('-----')
  switch (type) {
    // 项目信息刷新 更新当前git的HEAD分支和分支列表
    case 'refresh':
      console.log('进行刷洗操作')
      const gitDirPath = path.join(params.path, '/.git/HEAD')
      const existGitDir = fs.existsSync(gitDirPath)
      if (existGitDir) {
        // 获取当前项目下的所有分支
        const branches = await git.listBranches({ fs, dir: params.path })
        // 获取当前项目下的当前分支
        const currentBranch = await git.currentBranch({
          fs,
          dir: params.path,
          fullname: false
        })
        // 插入数据
        db.read()
          .get('list')
          .find({ id: params.id })
          .assign({
            branches,
            currentBranch
          })
          .write()
      } else {
        // 插入数据
        db.read()
          .get('list')
          .find({ id: params.id })
          .assign({
            branches: '',
            currentBranch: []
          })
          .write()
      }
      return new Response(SUCCESS, {
        // 返回值往往带有其他信息 这里用正则去掉
        message: '刷新成功'
      })
      break
  }
}

module.exports = excuteCommon
