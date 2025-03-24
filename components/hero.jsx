import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Mockup, MockupFrame } from "@/components/ui/mockup"

const Hero = React.forwardRef(({
  className,
  title,
  subtitle,
  eyebrow,
  ctaText,
  ctaLink,
  mockupImage,
  ...props
}, ref) => {
  return (
    <div ref={ref} className={cn("flex flex-col items-center bg-[#f3f1ea]", className)} {...props}>
      {eyebrow && (
        <p className="font-sans uppercase tracking-[0.51em] leading-[133%] text-center text-[19px] mt-[120px] md:mt-[180px] lg:mt-[249px] mb-8 text-[#000000] animate-appear opacity-0">
          {eyebrow}
        </p>
      )}

      <h1 className="text-[40px] md:text-[52px] lg:text-[64px] leading-[1.2] md:leading-[1.3] lg:leading-[83px] text-center px-4 md:px-20 lg:px-[314px] text-[#000000] animate-appear opacity-0 delay-100">
        {title}
      </h1>

      {subtitle && (
        <p className="text-[20px] md:text-[24px] lg:text-[28px] text-center font-light px-4 md:px-20 lg:px-[314px] mt-[25px] mb-[48px] leading-[133%] text-[#000000] animate-appear opacity-0 delay-300">
          {subtitle}
        </p>
      )}

      {ctaText && ctaLink && (
        <Link href={ctaLink}>
          <div className="inline-flex items-center bg-[#A91827] text-[#ffffff] rounded-[10px] hover:bg-[#A91827]/90 transition-colors w-[227px] h-[49px] animate-appear opacity-0 delay-500">
            <div className="flex items-center justify-between w-full pl-[22px] pr-[17px]">
              <span className="text-[19px] whitespace-nowrap">{ctaText}</span>
              <div className="flex items-center gap-[14px]">
                <svg width="36" height="15" viewBox="0 0 36 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M35.7071 8.20711C36.0976 7.81658 36.0976 7.18342 35.7071 6.79289L29.3431 0.428932C28.9526 0.0384078 28.3195 0.0384078 27.9289 0.428932C27.5384 0.819457 27.5384 1.45262 27.9289 1.84315L33.5858 7.5L27.9289 13.1569C27.5384 13.5474 27.5384 14.1805 27.9289 14.5711C28.3195 14.9616 28.9526 14.9616 29.3431 14.5711L35.7071 8.20711ZM0 8.5H35V6.5H0V8.5Z"
                    fill="white"
                  />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Original Image styling for demo video */}
      {/* {mockupImage && (
        <div className="mt-20 w-full relative animate-appear opacity-0 delay-700">
          <MockupFrame>
            <Mockup type="responsive">
              <Image
                src={mockupImage.src || "/placeholder.svg"}
                alt={mockupImage.alt}
                width={mockupImage.width}
                height={mockupImage.height}
                className="w-full"
                priority
              />
            </Mockup>
          </MockupFrame>
          <div
            className="absolute bottom-0 left-0 right-0 w-full h-[303px]"
            style={{
              background: "linear-gradient(to top, #DCD5C1 0%, rgba(217, 217, 217, 0) 100%)",
              zIndex: 10,
            }}
          />
        </div>
      )} */}

      {/* Image styling for mockup video */}
      {mockupImage && (
        <div className="mt-20 w-full max-w-screen-2xl mx-auto relative animate-appear opacity-0 delay-700">
          <MockupFrame className="w-full">
            <Mockup type="responsive" className="w-full">
              <Image
                src={mockupImage.src || "/placeholder.svg"}
                alt={mockupImage.alt}
                width={mockupImage.width}
                height={mockupImage.height}
                className="w-full h-auto object-cover"
                priority
                style={{
                  width: '100%',
                  height: 'auto',
                }}
              />
            </Mockup>
          </MockupFrame>
          <div
            className="absolute bottom-0 left-0 right-0 w-full h-[303px]"
            style={{
              background: "linear-gradient(to top, #DCD5C1 0%, rgba(217, 217, 217, 0) 100%)",
              zIndex: 10,
            }}
          />
        </div>
      )}

    </div>
  )
})
Hero.displayName = "Hero"

export { Hero }