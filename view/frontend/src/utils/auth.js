export const getStoredUser = () => {
  try {
    const user = localStorage.getItem('mehrgamUser') || localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  } catch {
    return null
  }
}

export const getAccessToken = () => localStorage.getItem('accessToken')

export const saveSession = ({ accessToken, user }) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken)
  }

  if (user) {
    localStorage.setItem('mehrgamUser', JSON.stringify(user))
    localStorage.setItem('user', JSON.stringify(user))
  }
}

export const clearSession = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('mehrgamUser')
  localStorage.removeItem('user')
}
