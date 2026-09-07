import React from 'react'
import PriceFormat from './PriceFormat'


interface  Props {
  price: number | undefined;
  discount: number | undefined;
  className?: string;
}

const PriceView = ({ price, discount, className }: Props) => {
  return (
    
      <div className="flex items-center gap-2">
        <PriceFormat amount={price} className="text-shop-dark-green" />
        {price && discount && (<PriceFormat amount={price + (discount * price)/100} className="line-through text-xs font-normal text-shop-light-text" />)}
      </div>
      
  )
}

export default PriceView
