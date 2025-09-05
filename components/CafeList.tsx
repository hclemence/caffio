import React from 'react'
import { Card, CardTitle } from './ui/card'
import CafeListCard from './CafeListCard'

type Props = {}

const CafeList = (props: Props) => {
  return (
    <div className='flex flex-col gap-4'>
      <CafeListCard title="Cafe 1" rating={4.5} />
      <CafeListCard title="Cafe 2" rating={3.0} />
      <CafeListCard title="Cafe 3" rating={5.0} />
    </div>
  )
}

export default CafeList