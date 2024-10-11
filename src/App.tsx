import { useState } from 'react'
import questions from './assets/data/questions.json'
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"


function App() {

  const [questionList, setQuestionList] = useState(questions);

  return (
    <div className="max-w-[620px] mx-auto">
      <Carousel className="w-full">
        <CarouselContent>

          {questionList.map((_, index) => {
            const question = questionList.find(q => q.order - 1 === index)
            return (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center p-6">
                      <div className="flex flex-col gap-6">
                        <span className="text-4xl font-semibold">{question?.label}</span>
                        <RadioGroup defaultValue="option-one">
                          {
                            question?.values.map((value, index) => (
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="option-one" id="option-one" />
                                <Label htmlFor="option-one">{value.label}</Label>
                              </div>
                            ))
                          }
                        </RadioGroup>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            )
          })}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}

export default App
