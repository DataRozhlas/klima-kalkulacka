import { useState, useEffect } from 'react'
import questions from './assets/data/questions.json'
import summaries from './assets/data/summaries.json'
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
import { LoadingSpinner } from './components/ui/spinner'
import { ArrowRight, ArrowLeftToLine } from 'lucide-react'


function App() {

  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  const [result, setResult] = useState<(undefined | number)[]>(new Array(questions.length).fill(undefined));
  const [group, setGroup] = useState<null | number>(null);
  const [summary, setSummary] = useState<{ title: string, share: string, code: null | number, summary: string, points: string[] }>({ title: "", share: "", code: null, summary: "", points: [] });

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

  useEffect(() => {
    if (group !== null) {
      const sum = summaries.find(s => s.code === group)
      if (sum) {
        setSummary(sum)
      }
    }
  }, [group])

  const evaluateData = async (data: (undefined | number)[]): Promise<string> => {
    if (data === undefined) {
      return "Něco se pokazilo"
    }
    // @ts-ignore
    const result = await fetch(`https://d3puw5tik2fxlx.cloudfront.net/?${encodeURIComponent(btoa(data))}`)
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
      <Carousel setApi={setApi} className="w-full" /* opts={{ duration: 0 }} */>
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
                        <RadioGroup value={result[questionIndex]?.toString() || ""} onValueChange={(v) => {
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
                        <div className="w-full">
                          <Button className="w-full" disabled={result[questionIndex] === undefined} onClick={() => api?.scrollNext()}>{current === count ? "Vyhodnotit" : <>Další otázka <ArrowRight className={"ml-2 h-5 w-5"} /></>}</Button>
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
                    {

                      group === null ? <LoadingSpinner size={48} className='h-full mx-auto' /> :
                        <div className="h-full flex flex-col justify-between gap-6">
                          <div className="self-center">
                            <div className="text-xs text-center">Pravděpodobně patříte mezi</div>
                            <div className="text-4xl font-semibold text-center">{summary.title}</div>
                            <div className="text-xs text-center">to je {summary.share}</div>
                          </div>
                          <div className="text-left mx-6">
                            <ul className="list-disc">
                              {
                                summary.points.map((point, index) => {
                                  return <li key={index} className="text-sm">{point}</li>
                                })
                              }
                            </ul>
                          </div>
                          <Button
                            onClick={
                              () => {
                                setResult(new Array(questions.length).fill(undefined))
                                setGroup(null)
                                setSummary({ title: "", share: "", code: null, summary: "", points: [] })
                                setCount(questions.length)
                                api?.scrollTo(0)
                              }
                            }>Začít znovu <ArrowLeftToLine className={"ml-2 w-5 h-5"} /></Button>
                        </div>
                    }


                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          }
        </CarouselContent>
        {/* <CarouselPrevious />
        <CarouselNext /> */}
      </Carousel>
      <div className="pt-8">
        {JSON.stringify(result)}
      </div>
    </div>
  )
}

export default App
