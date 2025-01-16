import { useState } from 'react'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Store } from 'lucide-react'
import useUser from '@/store/useUserStore'
import { createUser } from '@/dbFunctions/user'

const LoginForm = () => {
  const [username, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const { login, error } = useUser()

  const handleCrateUser = () => {
    createUser('admin', 'admin', true, true).then(() => {
      console.log('success')
    })
  }

  const handleLogin = async () => {
    console.log(username, password)
    login(username, password)
  }

  return (
    <div
      className="w-screen h-screen"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          login(username, password)
        }
      }}
    >
      <div className="py-8 px-14 border-2 border-gray-200 shadow-md rounded-md w-max absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 space-y-4">
        <div className="w-max mx-auto flex justify-center items-center flex-col gap-3 !mb-8">
          <Store />
          <p className="text-2xl font-semibold">Rio Jaya Motor</p>
        </div>
        <div>
          <Label>Username</Label>
          <Input className="my-2" onChange={(e) => setUserName(e.target.value)} value={username} />
        </div>
        <div>
          <Label>Password</Label>
          <Input className="my-2" onChange={(e) => setPassword(e.target.value)} value={password} />
        </div>
        {error && <p className="text-red-500 text-lg font-semibold">{error}</p>}
        <Button onClick={handleCrateUser}>Create User</Button>

        <Button className="w-full !mt-8" onClick={handleLogin}>
          Login
        </Button>
      </div>
    </div>
  )
}

export default LoginForm
