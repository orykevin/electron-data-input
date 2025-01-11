import FormInput from '@/components/form-input'
import HeaderBase from '@/components/header-base'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AllUser, createUser, deleteUser, getAllUser, updateUser } from '@/dbFunctions/user'
import useUser from '@/store/useUserStore'
import { zodResolver } from '@hookform/resolvers/zod'
import { Delete, Pencil, Save, User, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import z from 'zod'

const formSchema = z.object({
  username: z.string().min(1, { message: 'Password harus di isi' }),
  password: z.string().min(1, { message: 'Password harus di isi' }),
  isAdmin: z.boolean()
})

type FormData = z.infer<typeof formSchema>

const PengaturanAkun = () => {
  const { data: userData } = useUser()
  const [listAkun, setListAkun] = useState<AllUser>([])
  const [editId, setEditId] = useState<null | number>(null)
  const [changePassword, setChangePassword] = useState(false)
  const [editUsername, setEditUsername] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editAdmin, setEditAdmin] = useState(false)

  useEffect(() => {
    if (editId === null) {
      setEditUsername('')
      setEditPassword('')
      setChangePassword(false)
    } else {
      const akun = listAkun.find((akun) => akun.id === editId)
      setEditUsername(akun?.username || '')
      setEditAdmin(akun?.isAdmin || false)
    }
  }, [editId])

  const form = useForm({
    defaultValues: { username: '', password: '', isAdmin: false },
    resolver: zodResolver(formSchema)
  })

  useEffect(() => {
    getAllUser().then((res) => {
      setListAkun(res)
    })
  }, [])

  const onSubmit = async (value: FormData) => {
    console.log(value)
    createUser(value.username, value.password, value.isAdmin).then(({ password, ...rest }) => {
      setListAkun((prev) => [...prev, rest])
    })
    form.reset()
  }

  const saveHandler = () => {
    const data = {
      username: editUsername,
      isAdmin: editAdmin,
      ...(editPassword !== '' ? { password: editPassword } : {})
    }
    if (editId)
      updateUser(editId, data).then(({ password, ...rest }) => {
        setListAkun((prev) => {
          const dataIdx = prev.findIndex((data) => data.id === editId)
          let prevData = [...prev]
          prevData[dataIdx] = rest
          return prevData
        })
        setEditId(null)
      })
  }

  return (
    <div>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <HeaderBase>Buat Akun Baru</HeaderBase>
          <div className="flex gap-3 justify-start items-end">
            <FormInput name="username" label="Username" fieldClassName="max-w-[240px]" />
            <FormInput name="password" label="Password" fieldClassName="max-w-[240px]" />
            <div>
              <label className="text-lg font-semibold cursor-pointer">
                <input type="checkbox" className="scale-150 mx-2" {...form.register('isAdmin')} />{' '}
                Peran Admin
              </label>
            </div>
            <Button type="submit">Buat Akun</Button>
          </div>
        </form>
      </FormProvider>
      <HeaderBase className="mt-6">List Akun</HeaderBase>
      {listAkun.map((akun) => {
        const isEdit = akun.id === editId
        return (
          <div className="w-full flex gap-3 justify-between items-center py-3 px-8 pl-3 border-2 border-gray-200 shadow-sm rounded-md">
            <div className="flex gap-2 items-center">
              <User />
              <p>Username : </p>
              {isEdit ? (
                <>
                  <Input
                    className="w-[240px]"
                    onChange={(e) => setEditUsername(e.target.value)}
                    value={editUsername}
                  />
                  <p>Password</p>
                  {changePassword ? (
                    <Input
                      className="w-[240px]"
                      onChange={(e) => setEditPassword(e.target.value)}
                      value={editPassword}
                    />
                  ) : (
                    <Button onClick={() => setChangePassword(true)}>Ubah Password</Button>
                  )}
                </>
              ) : (
                <p>
                  <b>{akun.username}</b>
                </p>
              )}
            </div>
            <div className="flex gap-3 items-center">
              <label>
                <input
                  type="checkbox"
                  className="scale-150 mx-2"
                  disabled={akun.id !== editId || akun.isSuperAdmin || false}
                  defaultChecked={akun?.isAdmin || akun?.isSuperAdmin || false}
                  checked={isEdit ? editAdmin : akun?.isAdmin || false}
                  onChange={(e) => setEditAdmin(e.target.checked)}
                />
                Admin
              </label>
              {isEdit ? (
                <>
                  <Button className="w-[124px]" onClick={saveHandler}>
                    <Save />
                    Simpan
                  </Button>
                  <Button onClick={() => setEditId(null)} className="w-[124px]">
                    <X />
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setEditId(akun.id)}
                    className="w-[124px]"
                    disabled={
                      (!userData?.isAdmin && !userData?.isSuperAdmin) ||
                      (!userData.isSuperAdmin && userData.isAdmin && akun.isSuperAdmin) ||
                      false
                    }
                  >
                    <Pencil />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-[124px]"
                    disabled={
                      userData?.id === akun.id ||
                      !userData?.isSuperAdmin ||
                      (!userData.isAdmin && akun.isAdmin) ||
                      false
                    }
                    onClick={() =>
                      deleteUser(akun.id).then(() =>
                        setListAkun((prevData) => prevData.filter((data) => data.id !== akun.id))
                      )
                    }
                  >
                    <Delete />
                    Hapus
                  </Button>
                </>
              )}
            </div>
          </div>
        )
      })}
      <div></div>
    </div>
  )
}

export default PengaturanAkun
