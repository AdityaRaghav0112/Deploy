
import Spline from '@splinetool/react-spline/next';
import { ArrowRight } from 'lucide-react';
import { div } from 'motion/react-client';
import Elements from '@/components/3D/elements';

const page = () => {

  return (

    <div className='grid grid-cols-4 place-items-stretch'>
      <div className="item1 col-span-2"></div>
      <div className="model col-span-2">
        <Elements/>
      </div>
    </div>
  )
}

export default page
