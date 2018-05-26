import Errors from '../errors'
import Users from './models/Users'
import UserOauthIntegrations from './models/UserOauthIntegrations'
import LoginHandler from './LoginHandler'

export function flatten(ary) {
  const nestedFlattened = ary.map(v => {
    if (v instanceof Array)
      return flatten(v)
    return v
  })
  return [].concat.apply([], nestedFlattened)
}

export function createNestedArrays(ary, length=10) {
  const aryCopy   = ary.slice(0)
  let nestedArys  = []

  while (aryCopy.length > 0) {
    nestedArys.push(aryCopy.splice(0, length))
  }
  return nestedArys
}

export function sleep(timeoutMs=1000) {
  return new Promise(resolve => setTimeout(resolve, timeoutMs))
}

export function paginateArray(ary, perPage=9e7, pageNumber=1) {
  const start = perPage * (pageNumber-1)

  if (ary instanceof Array) {
    const size = ary.length
    return {
      data: ary.slice(start,start+perPage),
      number_of_pages: Math.ceil(size/perPage),
      current_page: pageNumber,
      data_length: size
    }
  } else if (typeof ary === "object" && ary != null) {
    const obj = ary
    const keys = Object.keys(obj).sort()
    const size = keys.length
    const filteredKeys = keys.slice(start,start+perPage)
    let filteredObj = {}
    for (var _i=0; _i<filteredKeys.length; _i++) {
      filteredObj[filteredKeys[_i]] = obj[filteredKeys[_i]];
    }

    return {
      data: filteredObj,
      number_of_pages: Math.ceil(size/perPage),
      current_page: pageNumber,
      data_length: size
    }
  }

  return ary
}

export async function passportOauthLoginHandler({
  req,
  accessToken,
  refreshToken,
  profile,
  postgres,
  emailAddress,
  type,
  name,
  firstName,
  lastName,
  done
}) {
  const users   = Users(postgres, req.session)
  const userInt = UserOauthIntegrations(postgres)
  const login   = LoginHandler(postgres, req.session)

  if (!emailAddress)
    throw new Errors.NoEmailAddress('No email address found for this user.')

  const intInfo = Object.assign({}, profile, {
    type:           type,
    unique_id:      profile.id,
    name:           name,
    first_name:     firstName,
    last_name:      lastName,
    email:          emailAddress,
    access_token:   accessToken,
    refresh_token:  refreshToken
  }, { id: undefined })

  const userRecord = await users.findOrCreateBy({ username_email: emailAddress })
  users.setRecord(
    Object.assign({}, intInfo, {
      first_name: userRecord.first_name || intInfo.first_name,
      last_name:  userRecord.last_name || intInfo.last_name,
      last_login: new Date(),
      last_session_refresh: new Date(),
      num_logins: (userRecord.num_logins || 0) + 1
    }, { id: userRecord.id })
  )
  await users.save()

  const intRecord = await userInt.findOrCreateBy({ user_id: userRecord.id, type: type, unique_id: profile.id })
  userInt.setRecord(Object.assign(intInfo, { id: intRecord.id, refresh_token: refreshToken || intRecord.refresh_token }))
  await userInt.save()

  await login.standardLogin(userRecord)
  return done(null, intInfo.unique_id)
}
