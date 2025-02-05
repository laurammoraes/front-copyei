import LandingPageView from '@/layouts/LandingPageView'
import { redirect } from 'next/navigation'

// export default function Home() {
//   redirect('/admin')
// }

export default function Home() {
  return <LandingPageView/>
}