'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/', () => {
  return { greeting: 'Hello world in JSON' }
})


Route.group(() => {
  //get all soal
  Route.get('/soal','TkmController.getSoal').middleware('auth')
  //get latest result from userId
  Route.get('/result/:userId','TkmController.getResult').middleware('auth')
  //submit jawaban
  //data needed
  // object "user_id"
  // array jawaban

  //post jawaban sekaligus menghitung nilai
  Route.post('/answers','TkmController.store').middleware('auth')

  //login, ada validasi check 10 hari
  Route.post('/auth/login','AuthController.login')

  //get refresh token
  // input : Json Object isi variabel "refresh_token"
  Route.get('auth/refreshToken','AuthController.refreshToken')

  // input : JSON isi variabel "token"
  // ex : {"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjE0MywiaWF0IjoxNTgxNDkxNTY3fQ.TRZijerUKoTASO1uPDBKpuo1VAhoAEZlKZPAHg8vshI"}
  Route.post('auth/checkToken','AuthController.checkToken')

  //simpan informasi2 tambahan
  Route.post('/user/register','AuthController.register')

  Route.get('sheet','SheetController.write')
})
.prefix('api/v0/tkm')


// Route.post('/dummy','DummyController.post')


Route.get('/capital-case','DummyController.capitalCase')
