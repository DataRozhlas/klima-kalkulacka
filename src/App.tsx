import { useState, useEffect } from 'react'
import questions from './assets/data/questions.json'
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  // CarouselNext,
  // CarouselPrevious,
} from "@/components/ui/carousel"
import { type CarouselApi } from "@/components/ui/carousel"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"


function App() {

  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  const [result, setResult] = useState<(undefined | number)[]>(new Array(questions.length).fill(undefined));
  const [group, setGroup] = useState<string>('');

  useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  const evaluateData = async (data: (undefined | number)[]): Promise<string> => {
    if (data === undefined) {
      return "Něco se pokazilo"
    }
    // @ts-ignore
    const result = await fetch(`https://d3puw5tik2fxlx.cloudfront.net/?${btoa(data)}`)
      .then((response) => response.json())
    setGroup(result)
    return result;
  }

  useEffect(() => {
    if (!result.includes(undefined)) {
      evaluateData(result)
    }
  }, [result])

  return (
    <div className="max-w-[620px] mx-auto">
      <Carousel setApi={setApi} className="w-full" opts={{ duration: 0 }}>
        <CarouselContent>

          {questions.map((_, index) => {
            const question = questions.find(q => q.order - 1 === index)
            const questionIndex = questions.findIndex(q => q.order - 1 === index)
            return (
              <CarouselItem key={index}>
                <div className="p-1 h-full">
                  <Card className="h-full">
                    <CardContent className="p-6 h-full">
                      <div className="h-full flex flex-col items-center justify-between gap-6">
                        <div className="text-4xl font-semibold text-center">{question?.label}</div>
                        <RadioGroup value={result[questionIndex]?.toString()} onValueChange={(v) => {
                          setResult((prev) => {
                            const newResult = [...prev]
                            newResult[questionIndex] = parseInt(v)
                            return newResult
                          })
                        }
                        }>
                          {
                            question?.values.map((value, index) => {
                              const uid = crypto.randomUUID()
                              return (
                                <div key={`q-${uid}`} className="flex items-center space-x-2 pt-1">
                                  <RadioGroupItem value={value.value.toString()} id={`option-${index}-${uid}`} />
                                  <Label htmlFor={`option-${index}-${uid}`}>{value.label}</Label>
                                </div>
                              )
                            })
                          }
                        </RadioGroup>
                        <div>
                          <Button disabled={result[questionIndex] === undefined} onClick={() => api?.scrollNext()}>{current === count ? "Vyhodnotit" : "Další otázka"}</Button>
                          <div className="text-sm text-center pt-4">{current} z {count}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            )
          })}
          {
            !result.includes(undefined) && <CarouselItem>
              <div className="p-1 h-full">
                <Card className="h-full">
                  <CardContent className="p-6 h-full">
                    <div className="h-full flex flex-col items-center justify-between gap-6">
                      <div className="text-4xl font-semibold text-center">Patříte do skupiny {group}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          }
        </CarouselContent>
        {/* <CarouselPrevious />
        <CarouselNext /> */}
      </Carousel>
      <div>{JSON.stringify(result)}</div>
    </div>
  )
}

export default App
