import { Card, CardContent, CardFooter } from "@/components/ui/card"

export default function InvestigadoresLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="space-y-2">
          <div className="h-8 bg-blue-100 rounded w-1/3 animate-pulse"></div>
          <div className="h-4 bg-blue-100 rounded w-2/3 animate-pulse"></div>
        </div>

        {/* Filters skeleton */}
        <Card className="bg-white border-blue-100">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="h-10 bg-blue-100 rounded animate-pulse"></div>
              </div>
              <div className="h-10 bg-blue-100 rounded animate-pulse"></div>
              <div className="h-10 bg-blue-100 rounded animate-pulse"></div>
              <div className="h-10 bg-blue-100 rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        {/* Results header skeleton */}
        <div className="flex justify-between items-center">
          <div className="h-4 bg-blue-100 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-blue-100 rounded w-32 animate-pulse"></div>
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-full bg-white border-blue-100">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center animate-pulse">
                  <div className="h-24 w-24 bg-blue-100 rounded-full mb-4"></div>
                  <div className="h-4 bg-blue-100 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-blue-100 rounded w-1/2 mb-4"></div>
                  <div className="h-6 bg-blue-100 rounded w-1/3 mb-4"></div>
                  <div className="w-full space-y-2">
                    <div className="h-3 bg-blue-100 rounded w-full"></div>
                    <div className="h-3 bg-blue-100 rounded w-2/3"></div>
                  </div>
                  <div className="flex gap-1 mt-4">
                    <div className="h-5 bg-blue-100 rounded w-16"></div>
                    <div className="h-5 bg-blue-100 rounded w-20"></div>
                    <div className="h-5 bg-blue-100 rounded w-12"></div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-blue-100 flex justify-around py-3">
                <div className="text-center">
                  <div className="h-4 bg-blue-100 rounded w-8 mb-1 animate-pulse"></div>
                  <div className="h-3 bg-blue-100 rounded w-12 animate-pulse"></div>
                </div>
                <div className="text-center">
                  <div className="h-4 bg-blue-100 rounded w-8 mb-1 animate-pulse"></div>
                  <div className="h-3 bg-blue-100 rounded w-16 animate-pulse"></div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
