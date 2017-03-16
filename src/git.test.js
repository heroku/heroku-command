// @flow

import Git from './git'
import childProcess from 'child_process'

test('gets the remotes', () => {
  const git = new Git()
  // flow$ignore
  git.exec = jest.fn()
  git.exec.mockReturnValueOnce(`origin\thttps://github.com/foo/bar  (fetch)
origin\thttps://github.com/foo/bar  (pull)
heroku\thttps://git.heroku.com/myapp.git  (fetch)
heroku\thttps://git.heroku.com/myapp.git  (pull)
`)
  expect(git.remotes).toEqual([
    {name: 'origin', url: 'https://github.com/foo/bar'},
    {name: 'heroku', url: 'https://git.heroku.com/myapp.git'}
  ])
})

test('runs git', () => {
  childProcess.execSync = jest.fn()
  const git = new Git()
  git.exec('version')
  expect(childProcess.execSync).toBeCalledWith('version', {encoding: 'utf8'})
})
