import { useState } from 'react'
import questions from './assets/data/variables.json'
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"



function App() {

  const [questionList, setQuestionList] = useState(questions);



  return (
    <div className="max-w-[620px] mx-auto">
      <Carousel className="w-full">
        <CarouselContent>
          {questionList.map((q, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-6">
                    <span className="text-4xl font-semibold">{q.label}</span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}

export default App
