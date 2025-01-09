import React from 'react'
import { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';

const LatestCollection = () => {

    const { products } = useContext(ShopContext);
    
  return (
    <div className='my-10'>
      <div className='text-corner py-8 text-3xl text-center'>
        <Title text1={'LATEST '} text2={'COLLECTIONS'} />
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex tempora ipsa harum magnam dolores ad tenetur hic. Dolorum ducimus aliquam ullam fuga quam. Error earum reprehenderit molestias incidunt odio architecto.
        </p>
      </div>
      
    </div>
  )
}

export default LatestCollection
