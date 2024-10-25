import { useState, useEffect } from 'react'
import questions from './assets/data/questions.json'
import summaries from './assets/data/summaries.json'
import details from './assets/data/details.json'
import detailsQuestions from './assets/data/detailsQuestions.json'
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
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
import { LoadingSpinner } from '@/components/ui/spinner'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { ArrowRight, Info } from 'lucide-react'

import { usePostMessageWithHeight } from './hooks/usePostHeightMessage'


function App() {

  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  const [result, setResult] = useState<(undefined | number)[]>(new Array(questions.length).fill(undefined));
  const [group, setGroup] = useState<null | number>(null);
  const [summary, setSummary] = useState<{ title: string, share: string, code: null | number, summary: string, points: string[] }>({ title: "", share: "", code: null, summary: "", points: [] });
  const [vyhodnotit, setVyhodnotit] = useState(false)
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [accordionVisible, setAccordionVisible] = useState(false)
  const [detailsData, setDetailsData] = useState(details.find(d => d.code === group))

  const { containerRef, postHeightMessage } = usePostMessageWithHeight(`klima-kalkulacka-24`)

  useEffect(() => {
    postHeightMessage()
  }, [current, vyhodnotit, group, accordionVisible])


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

  useEffect(() => {
    if (group !== null) {
      setDetailsData(details.find(d => d.code === group))
    }
  }, [group])

  return (
    <div ref={containerRef} className="max-w-[620px] mx-auto py-4">
      {(vyhodnotit === false || group === null) &&
        < Carousel setApi={setApi} className="w-full" /* opts={{ duration: 0 }} */>
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
                          {vyhodnotit === true && group === null && <LoadingSpinner size={48} className='h-full min-h-96 mx-auto' />}
                          {vyhodnotit === false && <>
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
                              <Button className="w-full" disabled={result[questionIndex] === undefined} onClick={() => {
                                if (current === count) { setVyhodnotit(true) }
                                api?.scrollNext()
                              }}>{current === count ? "Vyhodnotit" : <>Další otázka <ArrowRight className={"ml-2 h-5 w-5"} /></>}</Button>
                              <div className="text-sm text-center pt-4">{current} z {count}</div>
                            </div></>}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              )
            })}
          </CarouselContent>
          {/* <CarouselPrevious />
        <CarouselNext /> */}
        </Carousel>}

      {vyhodnotit === true && group !== null &&
        <div className="p-1 h-full">
          <Card className="h-full">
            <CardContent className="p-6 h-full">
              {<div className="h-full flex flex-col justify-between gap-6">
                <div className="self-center">
                  <CardDescription className={"text-center"}>Vaše odpovědi jsou nejblíže tomu,<br />jak na otázky o ochraně klimatu odpovídali lidé ze skupiny</CardDescription>
                  <CardTitle className={"text-3xl text-center pb-2"}>{summary.title}</CardTitle>
                  <CardDescription className={"text-center font-bold text-black"}>{summary.summary}.</CardDescription>
                  <CardDescription className={"text-center  text-black"}>Tvoří {summary.share}.</CardDescription>
                </div>
                <div>
                  <figure>
                    <img src={"img/" + summary.code?.toString() + ".png"} alt={summary.title} className="mx-auto" />
                    <figcaption className="text-xs text-right text-zinc-500">Ilustrace: Marcel Otruba</figcaption>
                  </figure>
                </div>
                <div className="flex justify-between">
                  <div className="text-left mx-6">
                    <CardDescription className={"text-center  text-black font-bold pb-4"}>Jak tito lidé odpověděli v dalších otázkách výzkumu?</CardDescription>
                    <ul className="list-disc">
                      {
                        summary.points.map((point, index) => {
                          return <li key={index} className="text-sm" dangerouslySetInnerHTML={{ __html: point }}></li>
                        })
                      }
                    </ul>


                  </div>

                  <div className="self-start">
                    <TooltipProvider>
                      <Tooltip open={tooltipVisible} onOpenChange={setTooltipVisible}>

                        <TooltipTrigger onClick={() => setTooltipVisible(!tooltipVisible)}
                          onMouseEnter={() => setTooltipVisible(true)}
                          onMouseLeave={() => setTooltipVisible(false)}
                        >
                          <Info className="h-8 w-8" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">Profily jednotlivých postav ukazují vždy určitého typického představitele či představitelku dané skupiny. Vycházejí z analýzy rozsáhlých reprezentativních dat a zároveň hledají způsoby, jak v grafické zkratce představit komplexní data pro širší publikum. Je však přirozené, že typický představitel či představitelka se nikdy neshoduje se všemi, kteří jsou statisticky do dané skuipiny zařazeni. Jako vždy, společenská realita je pestřejší než dokáže vystihnout sedm kategorií.</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                {accordionVisible}
                <div>
                  <Accordion type="single" collapsible onClick={() => (setAccordionVisible(!accordionVisible))}>
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Více informací o této skupině</AccordionTrigger>
                      <AccordionContent>
                        <div>
                          <div className="flex justify-between">
                            <div className="text-center">
                              <div className="text-xl font-bold text-zinc-400">{detailsData?.age} let</div>
                              <div className="font-semibold">věkový průměr</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-zinc-400">{100 - (detailsData?.females ?? 0)} %</div>
                              <div className="font-semibold">muži</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-zinc-400">{detailsData?.education} %</div>
                              <div className="font-semibold">vzdělání s maturitou</div>
                            </div>
                          </div>
                          <div>
                            <div className="mb-3 mt-6 py-1 rounded-md font-semibold text-center bg-zinc-200">Souhlasí s tvrzením</div>
                            {detailsQuestions.map((question, index) => {
                              return (
                                <div key={index} className="flex py-2 gap-4 items-center">
                                  <div className="min-w-20 h-[1rem] rounded-md border-black border-solid border-2">
                                    <div className={"h-full bg-black"} style={{ width: `${detailsData?.opinions[index]}%` }} ></div>
                                  </div>
                                  <div className="text-sm font-semibold text-nowrap">{detailsData?.opinions[index]} %</div>
                                  <div className="">{question}</div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
                <Button
                  onClick={
                    () => {
                      setResult(new Array(questions.length).fill(undefined))
                      setGroup(null)
                      setSummary({ title: "", share: "", code: null, summary: "", points: [] })
                      setCount(questions.length)
                      setVyhodnotit(false)
                      api?.scrollTo(0)
                    }
                  }>Začít znovu</Button>
              </div>
              }


            </CardContent>
          </Card >
        </div >
      }
    </div >
  )
}

export default App
