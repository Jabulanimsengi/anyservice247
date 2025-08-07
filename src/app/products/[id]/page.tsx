// src/app/products/[id]/page.tsx
import { createClient } from '@/lib/utils/supabase/server'
import { notFound } from 'next/navigation'
import BackButton from '@/components/BackButton'
import ImageGallery from '@/components/ImageGallery'
import { Button } from '@/components/ui/Button'

interface ProductPageProps {
  params: { id: string }
}

const ProductPage = async ({ params }: ProductPageProps) => {
  const { id } = params;
  if (!id) {
    notFound()
  }

  const supabase = await createClient()
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !product) {
    notFound()
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <BackButton />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mt-4">
          <ImageGallery imageUrls={product.image_urls} itemName={product.name} />
          <div className="flex flex-col">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">{product.name}</h1>
            <div className="my-6 border-t"></div>
            <div className="mb-6 rounded-lg border bg-gray-50 p-4">
              <div className="flex justify-between items-baseline">
                <span className="text-gray-600">Price</span>
                <span className="text-2xl font-bold text-gray-900">
                  R{Number(product.price).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="prose max-w-none mb-4">
              <h2 className="text-xl font-semibold">About this product</h2>
              <p>{product.description || 'No description provided.'}</p>
            </div>
            <a href={product.link} target="_blank" rel="noopener noreferrer">
              <Button className="w-full">View Product</Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductPage