
import Spline from '@splinetool/react-spline/next';

const page = () => {

  return (
    <div className="flex justify-between items-center ml-20 gap-4">
      <div>
        <h1 className='font-bold text-[4vw]'>Deploy</h1>
        <button>Play Now</button>
      </div>
      <div className='h-screen ml-20'>
      <Spline
        scene="https://prod.spline.design/0hZoWDDiXJs5SOTU/scene.splinecode" 
      />
    </div>
    </div>
  )
}

export default page
