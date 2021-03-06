'use strict'
const User = use('App/Models/User')
const Database = use('Database')
const moment = use('moment')
const {validate } = use('Validator')
const {rule} = use('indicative')

class AuthController {


  async login({ request, auth, response }){

    let data = request.all()


    const userData = {
      email: data.email,
      image: data.avatar,
      name: data.name,
      roleId: '2'
    }

    //find user by field 'EMAIL'
    const user = await User.findBy('email', userData.email)

    // membuat user baru
    if (user == null) {

      let newUser = new User()
      newUser.email = userData.email
      newUser.image = userData.image
      newUser.name = userData.name
      newUser.roleId = '2'
      await newUser.save()

      let token = await auth
        // .withRefreshToken()
        .generate(newUser)


      let newUserId = {
        user_id: newUser.id,
        registered : false,
        allow : 1
      }

      // Append token to user
      Object.assign(newUserId, token)

      return response.json(newUserId)
    }

    //User sudah ada
    else {
      const user_id = user.id

      //get latest result
      let latestResult = await Database //return array of object
        .select('*')
        .from('tkm_results')
        .where('user_id', '=', user_id)
        .orderBy('created_at', 'desc')
        .limit(1)

      if (Array.isArray(latestResult) && latestResult.length) {

        let resultDate = moment(latestResult[0].created_at)
        let nowDate = moment()
        let daysDifference = nowDate.diff(resultDate, 'days') + 1
        var registered = this.checkUser(user)

        //apabila jarak test kurang dari 10 hari
        if (daysDifference <= 10) {
          let token = await auth.withRefreshToken().generate(user)

          let payload = {
            user_id : user.id,
            allow: 0,
            messages: 'Difference between test is less than 10 days',
            registered : registered
          }
          Object.assign(payload, token)
          return response.status(402).send(payload)
        }
        //jarak test lebih dari 10 hari (dibolehkan login)
        else {
          let token = await auth.withRefreshToken().generate(user)
          let packet = {
            user_id: user_id,
            registered : registered,
            allow: 1
          }
          console.log("lebih 10 hari")
          // Append token to user
          Object.assign(packet, token)
          return response.json(packet)
        }
      }
      //User sudah ada, belum pernah tes tkm
      else {

        let token = await auth.withRefreshToken().generate(user)

        var registered = this.checkUser(user)
        console.log(`registered : ${registered}`)
        let packet = {
          user_id: user.id,
          registered : registered,
          allow : 1
        }

        console.log("belum tes")
        // Append token to user
        Object.assign(packet, token)

        return response.json(packet)
      }
    }
  }

  checkUser(user) {

    if (user == null) { //apabila tidak ada user
      var registered = false
    } else { //apabila ada user

      if (user.bornday == null) {
        var registered = false
      } else if (user.bornday != null) {
        var registered = true
      }
      // console.log(`registered : ${registered}`)
      return registered
    }
  }



    async register({request, response}){

      let payload = request.all()
      const rules = {
        user_id: [
            rule('required'),
            rule('integer')
        ],
        provinsi: [
          rule('required')
        ],
        kabupaten: [
          rule('required')
        ],
        kecamatan: [
          rule('required')
        ],
        alamat: [
          rule('required')
        ],
        name: [
          rule('required')
        ],
        nik: [
          rule('required')
        ],
        phone: [
          rule('required')
        ],
        gender: [
          rule('required')
        ],
        birthdate: [
          rule('required'),
          rule('date')
        ]
      }
      //date di navicat = YYYY/MM/DD
      //Format date yang dibutuhkan fungsi ini = YYYY/MM/DD
      const validation = await validate(payload, rules)

      if (validation.fails()) {
        return response.badRequest(validation.messages())
      } else {
        let user = await User.find(payload.user_id)

        //bila ga ada user
        if (user == null) {
          return response.badRequest('User not found')
        } else {

          // let address = payload.provinsi + ';' + payload.kabupaten+ ';' + payload.kecamatan + ';' + payload.alamat

          user.address = this.titleCase(payload.alamat)
          user.provinsi = this.titleCase(payload.provinsi)
          user.kabupaten = this.titleCase(payload.kabupaten)
          user.kecamatan = this.titleCase(payload.kecamatan)

          user.name = payload.name
          user.nik = payload.nik
          user.phone = payload.phone
          user.gender = payload.gender
          user.bornday = payload.birthdate //paket masih bernama 'birthdate'

          await user.save()
          return response.json({
            user_id: payload.user_id,
            messages: 'Request success'
          })
        }
      }

    }

    async refreshToken({response, request, auth}){

      const refreshToken = request.input('refresh_token')
      console.log(refreshToken)
      const newRefreshToken =  await auth.generateForRefreshToken(refreshToken)

      return response.json(newRefreshToken)
    }

    async checkToken({response,auth}){

      //check token di body response
      try {
        // const result = await auth.getUser()
        const result = await auth.check()

        return response.json(result)

      } catch (error) {
        response.status(403).send('Missing or invalid jwt token')
      }
    }

  // This should work in node.js and other ES5 compliant implementations.
  isEmptyObject(obj) {
  return !Object.keys(obj).length;
  }

  titleCase(str){

     // Step 1. Lowercase the string
    str = str.toLowerCase();
    // str = "I'm a little tea pot".toLowerCase();
    // str = "i'm a little tea pot";

    // Step 2. Split the string into an array of strings
    str = str.split(' ');
    // str = "i'm a little tea pot".split(' ');
    // str = ["i'm", "a", "little", "tea", "pot"];

    // Step 3. Create the FOR loop
    for (var i = 0; i < str.length; i++) {
      str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);

    }

    // Step 4. Return the output
    return str.join(' ');

  }


}

module.exports = AuthController
