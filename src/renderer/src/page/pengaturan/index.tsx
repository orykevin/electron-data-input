import { LinkButtonIcon } from '@/components/ui/link-button'
import { Printer } from 'lucide-react'

const PengaturanPage = () => {
  return (
    <div>
      <LinkButtonIcon to="/pengaturan-print" icon={<Printer />}>
        Pengaturan Print
      </LinkButtonIcon>
    </div>
  )
}

export default PengaturanPage
